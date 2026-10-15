#!/usr/bin/env python3
"""Rovei: guarded, source-READ-ONLY encrypted Supabase backup launcher.

Prepared for Supabase CLI 2.121.0. Requires human approval at local terminal.
Does NOT perform hosted migrations, restore, Auth writes, or Storage writes.
Execution depends on verifying actual CLI templates and PostgreSQL 17 Docker
client in the user's Codespace; absent here, no live backup claim is made.
"""
import datetime as dt
import getpass
import hashlib
import json
import os
from pathlib import Path
import re
import resource
import shutil
import subprocess
import sys
import tarfile
import tempfile
from urllib.parse import urlparse

REF = 'errzsgncbygxwwmwndha'
HOST = 'aws-0-eu-west-1.pooler.supabase.com'
PORT = '5432'
USER = 'postgres.' + REF
EXPECTED_CLI = '2.121.0'
RUNNER_SHA = '700895ba5110a86590e9aabeaa4c8ac5e80d88af340f91bd9831decc73cc1d1c'
REPO = Path('/workspaces/Rovei-3-')
RUNNER = Path.home() / '.rovei-recovery-runner.py'
ROOT = Path.home() / 'rovei-private-recovery'
HASHES = {
 '202610110001_subscription_access.sql':'233d0b3f1447f282b6fa48117e1bb90367e1816da1c17dd5d7e6746c83385b82',
 '202610120001_support_requests.sql':'b84c33de0bf483a561268123ae4edf53586b723511ca602361858981c5a3b340',
 '20261014155715_launch_billing_hardening.sql':'863a33f89573459fd793efbba78bc431da415d2e5ff728ece7b19d85adac78c2',
 '20261014160018_atomic_studio_and_pack_saves.sql':'57050c46d958cc49c9c19ba991a0ac145516b439a216dd793a11747460a086b2',
 '20261014182409_persistent_studio_workflows.sql':'e696d941e5a4f53da4a2f5c9480922aa6d0a27869e830cd6e80acf101920b5a1',
}
DUMPS = (
 ('roles.sql', ('--role-only',)),
 ('schema.sql', ()),
 ('data.sql', ('--data-only','--use-copy','--schema','public,auth,storage','-x','storage.buckets_vectors','-x','storage.vector_indexes','-x','auth.schema_migrations','-x','storage.migrations')),
 ('history_schema.sql', ('--schema','supabase_migrations')),
 ('history_data.sql', ('--data-only','--use-copy','--schema','supabase_migrations')),
)
FAKE_URL = 'postgresql://synthetic:synthetic@127.0.0.1:54322/postgres'

class Stop(Exception): pass

def stop(message): raise Stop(message)

def sha(path):
    h = hashlib.sha256()
    with Path(path).open('rb') as f:
        for b in iter(lambda: f.read(1024*1024), b''): h.update(b)
    return h.hexdigest()

def check_dir(path):
    if path.is_symlink(): stop('A recovery path is a symlink; STOP.')
    path.mkdir(mode=0o700, parents=True, exist_ok=True)
    if path.resolve().is_relative_to(REPO.resolve()): stop('Backup path overlaps the repository; STOP.')
    os.chmod(path, 0o700)
    return path

def clean_env():
    return {k: v for k,v in os.environ.items() if not (k.startswith('PG') or k.startswith('SUPABASE_') or k in ('BASH_ENV','ENV','PS4','SHELLOPTS','BASHOPTS'))}

def template_from_cli(cli, flags, work):
    cp = subprocess.run([cli,'db','dump','--dry-run','--db-url',FAKE_URL,
                         '-f', str(work/'synthetic-output.sql'),*flags],
                        cwd=work, env=clean_env(), stdin=subprocess.DEVNULL,
                        stdout=subprocess.PIPE, stderr=subprocess.PIPE,timeout=50)
    if cp.returncode or not cp.stdout: stop('Synthetic CLI dry-run failed; no source access attempted.')
    return cp.stdout.decode('utf-8')

def transform_template(text, name):
    """Only remove connection-credential exports from official CLI 2.121.0 scripts.

    NEVER run an unrecognized template. Not an arbitrary shell-script sanitizer.
    """
    if not text.startswith('#!/usr/bin/env bash\nset -euo pipefail\n'):
        stop('Unknown official CLI template header; STOP.')
    if len(text) > 16000 or '\0' in text or '\r' in text: stop('Unusual dump template; STOP.')
    required={'PGHOST','PGPORT','PGUSER','PGPASSWORD','PGDATABASE'}
    removed=set(); lines=[]
    for line in text.splitlines(keepends=True):
        m=re.fullmatch(r'export (PG[A-Z_]+)="([^"\n]*)"\n?',line)
        if m and m.group(1) in required:
            k=m.group(1)
            if k in removed: stop('Duplicate connection variable; STOP.')
            removed.add(k)
        else: lines.append(line)
    if removed != required: stop('CLI connection assignments differ from reviewed source; STOP.')
    result=''.join(lines)
    if re.search(r'\bPGPASSWORD\b',result): stop('Template contains an unexpected password reference; STOP.')
    if re.search(r'(?m)^\s*(?:export\s+)?PG(?:HOST|PORT|USER|DATABASE|PASSFILE|OPTIONS)\s*=',result):
        stop('Template overrides a connection field; STOP.')
    if re.search(r'(?m)^\s*set\s+[^\n]*(?:-x|xtrace)\b',result): stop('Shell tracing forbidden; STOP.')
    if re.search(r'(?i)postgres(?:ql)?://', result): stop('URI embedded in template; STOP.')
    for line in result.splitlines():
        command=line.lstrip()
        if command.startswith('#'): continue
        if re.match(r'(?:curl|wget|supabase|docker|psql|rm\s+(?:-rf|--recursive))\b',command):
            stop('Unexpected executable operation in dump template; STOP.')
    if name == 'roles.sql':
        if result.count('\npg_dumpall ') != 1 or '--roles-only' not in result or '--no-role-passwords' not in result:
            stop('Unknown role dump command; STOP.')
    else:
        if result.count('\npg_dump ') != 1: stop('Unknown schema/data dump command; STOP.')
        if 'data.sql' == name:
            for token in ('--data-only', 'public|auth|storage','--exclude-table','buckets_vectors','schema_migrations'):
                if token not in result: stop('Data dump missing required Supabase coverage/exclusion; STOP.')
        elif name == 'history_data.sql':
            for token in ('--data-only','--schema "supabase_migrations"'):
                if token not in result: stop('History data dump unexpected; STOP.')
        elif name == 'history_schema.sql':
            for token in ('--schema-only','--schema=supabase_migrations'):
                if token not in result: stop('History schema dump unexpected; STOP.')
        elif name == 'schema.sql':
            if '--schema-only' not in result or '--exclude-schema ' not in result:
                stop('Schema dump missing CLI filtering; STOP.')
    return result

def escape_pgpass(value):
    if not isinstance(value,str) or not value or any(c in value for c in '\r\n\0'):
        stop('Unsupported password characters; no password reset is required. STOP.')
    return value.replace('\\','\\\\').replace(':','\\:')

def docker_image():
    cp = subprocess.run(['docker','image','inspect','postgres:17','--format','{{json .RepoDigests}}'],
                        capture_output=True,text=True,timeout=20)
    if cp.returncode: stop('Pinned PostgreSQL 17 image not found; STOP, no pull performed.')
    digests=json.loads(cp.stdout)
    for image in digests:
        if re.fullmatch(r'postgres@sha256:[0-9a-f]{64}',image): return image
        if re.fullmatch(r'docker.io/library/postgres@sha256:[0-9a-f]{64}',image): return image
    stop('No pinned official postgres:17 digest available; STOP.')

def docker_argv(image,passdir,program):
    if program not in ('bash','psql'): stop('Unapproved client.')
    values={
       'PGHOST':HOST,'PGPORT':PORT,'PGDATABASE':'postgres','PGUSER':USER,
       'PGSSLMODE':'require','PGCONNECT_TIMEOUT':'20',
       'PGOPTIONS':'-c default_transaction_read_only=on -c statement_timeout=300000',
       'PGPASSFILE':'/run/rovei-credentials/pgpass',
    }
    if not re.fullmatch(r'(?:docker.io/library/)?postgres@sha256:[a-f0-9]{64}',image): stop('Bad image pin.')
    path=str(passdir.resolve())
    if ',' in path or '\n' in path or ':' in path: stop('Unsafe credentials mount location.')
    argv=['docker','run','--rm','--network','host','--read-only','--pull','never',
          '--user',f'{os.getuid()}:{os.getgid()}',
          '--mount',f'type=bind,src={path},dst=/run/rovei-credentials,readonly',
          '--tmpfs','/tmp:rw,nosuid,nodev,mode=1777','-i']
    for k,v in sorted(values.items()): argv+=['--env', k+'='+v]
    argv+=['--entrypoint','/bin/bash' if program=='bash' else 'psql',image]
    return argv

def client_query(image,passdir,query,work):
    argv=docker_argv(image,passdir,'psql')+['-X','-qAt','-v','ON_ERROR_STOP=1',
                                     '-c',"set search_path=pg_catalog; set timezone='UTC'; "+query]
    with (work/'private-commands.log').open('ab') as log:
        r=subprocess.run(argv,stdin=subprocess.DEVNULL,stdout=subprocess.PIPE,stderr=log,
                         env=clean_env(),timeout=300)
    if r.returncode: stop('Private read-only catalog check failed; STOP. Do not share logs.')
    return r.stdout.decode().strip()

def run_dump(image,passdir,script,path,work):
    argv=docker_argv(image,passdir,'bash')+['--noprofile','--norc','-s']
    with path.open('xb') as out,(work/'private-commands.log').open('ab') as log:
        cp=subprocess.run(argv,input=script.encode(),stdout=out,stderr=log,
                          env=clean_env(),timeout=900)
    if cp.returncode or path.stat().st_size==0:
        path.rename(path.with_suffix('.INCOMPLETE'))
        stop('Dump failed or empty; no backup is verified. Private details retained; STOP.')
    os.chmod(path,0o600)

def gpg_with_passphrase(passphrase,args):
    reader,writer=os.pipe()
    try:
        os.write(writer,passphrase.encode('utf-8')+b'\n')
        os.close(writer);writer=-1
        cp=subprocess.run(['gpg','--batch','--yes','--no-symkey-cache','--pinentry-mode','loopback',
                           '--passphrase-fd',str(reader),*args],
                          stdin=subprocess.DEVNULL,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,
                          env=clean_env(),pass_fds=(reader,),timeout=300)
        return cp.returncode==0
    finally:
        os.close(reader)
        if writer!=-1:os.close(writer)

def self_test():
    from urllib.parse import quote,unquote,urlparse
    for password in ('test','colon:backslash\\','special%#/?','unicode-雪'):
        assert unquote(urlparse('postgresql://u:'+quote(password,safe='')+'@example.com/postgres').password)==password
        assert escape_pgpass(password)
    base = '#!/usr/bin/env bash\nset -euo pipefail\n\n'+''.join(f'export {k}="synthetic"\n' for k in ('PGHOST','PGPORT','PGUSER','PGPASSWORD','PGDATABASE'))
    roles=base+'\npg_dumpall --roles-only --no-role-passwords | sed -E "x"\n'
    assert 'PGPASSWORD' not in transform_template(roles,'roles.sql')
    for text in (roles.replace('pg_dumpall','curl'),roles.replace('PGPASSWORD="synthetic"','PGPASSWORD="secret"\nexport PGPASSWORD="secret"'),roles+'\npsql -c "drop table"'):
        try: transform_template(text,'roles.sql')
        except Stop: pass
        else: raise AssertionError('Rejected template unexpectedly passed')
    print('OFFLINE_SAFETY_SELF_TEST=PASS')
    print('No hosted connection, password request or source writes.')

def main():
    os.umask(0o077)
    resource.setrlimit(resource.RLIMIT_CORE,(0,0))
    if len(sys.argv)!=2 or sys.argv[1] not in ('--self-test','--backup'):
        stop('Usage: python3 ROVEI-SAFE-BACKUP-LAUNCHER.py --self-test OR --backup')
    if sys.argv[1]=='--self-test':self_test();return
    if not sys.stdin.isatty():stop('Use an interactive private Codespaces terminal, not AI execution.')
    check_dir(ROOT)
    if subprocess.run(['git','-C',str(REPO),'branch','--show-current'],capture_output=True,text=True).stdout.strip()!='frontend/exact-locked-shell':
        stop('Original protected branch not active; STOP.')
    if not RUNNER.is_file() or sha(RUNNER)!=RUNNER_SHA:stop('Reviewed recovery runner hash mismatch; STOP.')
    for name,digest in HASHES.items():
        p=REPO/'supabase/migrations'/name
        if not p.is_file() or sha(p)!=digest:stop('Installed reviewed migration differs; STOP: '+name)
    cli=shutil.which('supabase')
    for program in ('git','docker','gpg'):
        if not shutil.which(program):stop('Missing '+program+'; STOP.')
    if not cli:stop('Supabase CLI missing; STOP.')
    version=subprocess.run([cli,'--version'],capture_output=True,text=True,timeout=15)
    if version.returncode or version.stdout.strip()!=EXPECTED_CLI:stop('Installed CLI version differs from reviewed 2.121.0; STOP.')
    image=docker_image()
    work=Path(tempfile.mkdtemp(prefix='safe-backup-',dir=ROOT))
    os.chmod(work,0o700)
    print('Reviewing five official CLI templates with FAKE credentials only...')
    scripts={}
    for name,flags in DUMPS:
        scripts[name]=transform_template(template_from_cli(cli,flags,work),name)
        print('TEMPLATE_'+name.upper().replace('.','_')+'=PASS')
    print('PASSWORD_TRANSPORT=PRIVATE_PGPASSFILE; NO_REAL_PASSWORD_IN_PROCESS_ARGS')
    print('SOURCE='+REF+' (READ-ONLY backup only; no migration or hosted restore)')
    if input('Approve read-only EXPORT to this database? Type EXPORT_READ_ONLY: ').strip()!='EXPORT_READ_ONLY':
        stop('Not approved; no database access occurred.')
    if input('All database writers paused/coordinated? Type QUIET: ').strip()!='QUIET':
        stop('Quiet export window not confirmed; STOP.')
    password=getpass.getpass('Database password ONLY (hidden, never send to chat): ')
    if not password:stop('Empty password, no access attempted.')
    # Prefer a protected directory outside backup/archive. Never write credentials to the repository.
    credentials=Path(tempfile.mkdtemp(prefix='secret-pass-',dir=ROOT));os.chmod(credentials,0o700)
    passfile=credentials/'pgpass'
    try:
        fd=os.open(passfile,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
        with os.fdopen(fd,'w',encoding='utf-8',newline='') as f:
            f.write(':'.join((HOST,PORT,'postgres',USER,escape_pgpass(password)))+'\n')
        del password
        # A real client connection, without URL or secret in argv/env.
        if client_query(image,credentials,'select 1',work)!='1':stop('Read-only authentication failed; STOP.')
        # Import only the verified static functions, not the reviewed original backup executable.
        import importlib.util
        spec=importlib.util.spec_from_file_location('rovei_unchanged_reviewed_runner',RUNNER)
        runner=importlib.util.module_from_spec(spec);spec.loader.exec_module(runner)
        if client_query(image,credentials,'select count(*) from storage.objects',work)!='0':
            stop('Storage objects now exist; separate byte-level backup required. STOP.')
        if client_query(image,credentials,'select count(*) from vault.secrets',work)!='0':
            stop('Vault contains secrets; encryption root-key recovery required. STOP.')
        def sql(query):return client_query(image,credentials,query,work)
        # Fail closed if the Rovei database has application schemas not covered
        # by the five reviewed CLI modes. Platform/extension schemas are not app data.
        builtins={'public','auth','storage','supabase_migrations',
          'information_schema','extensions','realtime','_realtime','_analytics',
          '_supavisor','supabase_functions','etl','pgbouncer','cron','dbdev',
          'graphql','graphql_public','net','pgmq','pgsodium','pgsodium_masks',
          'pgtle','repack','tiger','tiger_data','topology','vault'}
        schemas=sql('select nspname from pg_namespace order by 1').splitlines()
        unknown=[name for name in schemas if name not in builtins and
                 not name.startswith(('pg_','timescaledb_','_timescaledb_'))]
        if unknown:stop('Unreviewed application schemas may not be covered; STOP.')
        before={}
        for name in sql(runner.TABLES).splitlines():
            schema,table=name.split('.',1)
            rel=runner.quote_ident(schema)+'.'+runner.quote_ident(table)
            before[name]=json.loads(sql("select jsonb_build_array(count(*),md5(coalesce(string_agg(row_text,'' order by row_text),''))) from (select to_jsonb(t)::text as row_text from "+rel+' t) q'))
        catalog=json.loads(sql(runner.CATALOG))
        (work/'expected-rows.json').write_text(json.dumps(before,indent=2))
        (work/'expected-catalog.json').write_text(json.dumps(catalog,indent=2))
        if sql("select count(*) from pg_policies where schemaname in ('auth','storage')")!='0':
            stop('Managed-schema custom policies require review; STOP.')
        managed=sql("select pg_get_triggerdef(t.oid)||';' from pg_trigger t join pg_class c on c.oid=t.tgrelid join pg_namespace n on n.oid=c.relnamespace join pg_proc p on p.oid=t.tgfoid join pg_namespace f on f.oid=p.pronamespace where not t.tgisinternal and n.nspname in ('auth','storage') and f.nspname='public' order by t.tgname")
        (work/'managed-customizations.sql').write_text(managed+'\n')
        platform="select jsonb_build_object('server_version',current_setting('server_version'),'extensions',(select jsonb_agg(jsonb_build_array(extname,extversion) order by extname) from pg_extension),'managed_columns',(select jsonb_agg(to_jsonb(c) order by table_schema,table_name,ordinal_position) from information_schema.columns c where table_schema in ('auth','storage')),'auth_managed_history',(select jsonb_agg(to_jsonb(m)) from auth.schema_migrations m),'storage_managed_history',(select jsonb_agg(to_jsonb(m)) from storage.migrations m))"
        (work/'source-platform.json').write_text(sql(platform))
        src=work/'source-migrations';src.mkdir(mode=0o700)
        for p in (REPO/'supabase/migrations').glob('*.sql'):
            shutil.copy2(p,src/p.name);os.chmod(src/p.name,0o600)
        (work/'cli-version.txt').write_text(EXPECTED_CLI+'\n')
        for name in scripts:
            print('Exporting:',name,'(read-only; private output)')
            run_dump(image,credentials,scripts[name],work/name,work)
        after={}
        for name in before:
            schema,table=name.split('.',1)
            rel=runner.quote_ident(schema)+'.'+runner.quote_ident(table)
            after[name]=json.loads(sql("select jsonb_build_array(count(*),md5(coalesce(string_agg(row_text,'' order by row_text),''))) from (select to_jsonb(t)::text as row_text from "+rel+' t) q'))
        if before!=after or catalog!=json.loads(sql(runner.CATALOG)):
            stop('Source changed during export; no verified backup. STOP.')
        if sql('select count(*) from storage.objects')!='0':stop('New Storage objects detected. STOP.')
        counts=runner.copy_counts(work/'data.sql') | runner.copy_counts(work/'history_data.sql')
        for table,(n,_) in before.items():
            if counts.get(table,0)!=n: stop('COPY row-count mismatch for '+table+'; STOP.')
        for required in ('auth.users','auth.identities','storage.buckets','storage.objects'):
            if required not in before:stop('Required Auth/Storage table missing; STOP.')
    finally:
        passfile.unlink(missing_ok=True)
        try:credentials.rmdir()
        except OSError:pass
    (work/'backup-status.txt').write_text('SOURCE_EXPORT_CHECKS_PASSED\nDATABASE_RESTORE_PENDING\nOFFSITE_COPY_PENDING\nSTORAGE_OBJECTS=0\nVAULT_ENTRIES=0\nproject='+REF+'\ncompleted='+dt.datetime.now(dt.timezone.utc).isoformat()+'\n')
    # Archive only explicit allowlisted files, never incidental private diagnostic logs.
    whitelist=['roles.sql','schema.sql','data.sql','history_schema.sql','history_data.sql','expected-rows.json','expected-catalog.json','managed-customizations.sql','source-platform.json','cli-version.txt','backup-status.txt']
    required=[work/name for name in whitelist]
    if any(not p.is_file() or p.stat().st_size==0 for p in required):stop('Incomplete backup component; STOP.')
    files=required+sorted((work/'source-migrations').glob('*.sql'))
    (work/'SHA256.json').write_text(json.dumps({str(p.relative_to(work)):sha(p) for p in files},indent=2))
    files.append(work/'SHA256.json')
    archive=Path(str(work)+'.tar.gz')
    with tarfile.open(archive,'w:gz') as t:
        for p in files:t.add(p,arcname=work.name+'/'+str(p.relative_to(work)),recursive=False)
    print('Source export checks passed. Create a SEPARATE encryption passphrase and save it privately.')
    first=getpass.getpass('NEW backup encryption passphrase (hidden): ')
    second=getpass.getpass('Confirm encryption passphrase (hidden): ')
    if len(first)<16 or first!=second:stop('Encryption passphrase mismatch or too short; retain private plaintext backup.')
    del second
    encrypted=Path(str(archive)+'.gpg')
    if not gpg_with_passphrase(first,['--symmetric','--cipher-algo','AES256','--output',str(encrypted),str(archive)]):
        stop('GPG encryption failed; private plaintext backup retained.')
    check=Path(str(work)+'-decrypt-check.tar.gz')
    if not gpg_with_passphrase(first,['--output',str(check),'--decrypt',str(encrypted)]):
        stop('GPG decrypt-check failed. STOP.')
    del first
    if sha(archive)!=sha(check):stop('Encryption integrity verification failed. STOP.')
    checksum=Path(str(encrypted)+'.sha256')
    checksum.write_text(sha(encrypted)+'  '+encrypted.name+'\n');os.chmod(checksum,0o600)
    print('SOURCE_EXPORT_AND_ENCRYPTION_CHECKS_PASSED; RESTORE_PENDING')
    print('Private encrypted archive:',encrypted)
    print('Private checksum:',checksum)
    print('Required next: verified archive-based local restore and off-Codespace copy.')
    print('No hosted database writes, no migrations, no Git changes.')

if __name__=='__main__':
    try: main()
    except (Stop,Exception,KeyboardInterrupt) as e:
        # NEVER print an exception's raw message other than our explicit sanitized STOP labels.
        msg=str(e) if isinstance(e,Stop) else 'Unexpected private error; STOP; no migration authorized.'
        print('STOP:',msg,file=sys.stderr)
        sys.exit(1)
