#!/usr/bin/env python3
"""Private Rovei logical backup and LOCAL-ONLY restore rehearsal. No hosted writes."""
import argparse
import datetime as dt
import getpass
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tarfile
import tempfile
from urllib.parse import urlparse, parse_qsl, urlencode, urlunparse, unquote

REF = 'errzsgncbygxwwmwndha'
HASHES = {
 '202610110001_subscription_access.sql':'233d0b3f1447f282b6fa48117e1bb90367e1816da1c17dd5d7e6746c83385b82',
 '202610120001_support_requests.sql':'b84c33de0bf483a561268123ae4edf53586b723511ca602361858981c5a3b340',
 '20261014155715_launch_billing_hardening.sql':'863a33f89573459fd793efbba78bc431da415d2e5ff728ece7b19d85adac78c2',
 '20261014160018_atomic_studio_and_pack_saves.sql':'57050c46d958cc49c9c19ba991a0ac145516b439a216dd793a11747460a086b2',
 '20261014182409_persistent_studio_workflows.sql':'e696d941e5a4f53da4a2f5c9480922aa6d0a27869e830cd6e80acf101920b5a1',
}
SCHEMAS = "'public','auth','storage','supabase_migrations'"
TABLES = f"""select n.nspname||'.'||c.relname from pg_class c join pg_namespace n on n.oid=c.relnamespace
 where n.nspname in ({SCHEMAS}) and c.relkind='r'
 and (n.nspname,c.relname) not in (('auth','schema_migrations'),('storage','migrations')) order by 1"""
CATALOG = """select jsonb_build_object(
 'policies',(select coalesce(jsonb_agg(to_jsonb(p) order by schemaname,tablename,policyname),'[]') from pg_policies p where schemaname in ('public','auth','storage')),
 'functions',(select coalesce(jsonb_agg(pg_get_functiondef(p.oid) order by p.oid::regprocedure::text),'[]') from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.prokind='f' and not exists(select 1 from pg_depend d where d.classid='pg_proc'::regclass and d.objid=p.oid and d.deptype='e')),
 'grants',(select coalesce(jsonb_agg(jsonb_build_array(table_name,grantee,privilege_type,is_grantable) order by table_name,grantee,privilege_type),'[]') from information_schema.role_table_grants where table_schema='public' and grantee in ('anon','authenticated','service_role','PUBLIC')),
 'rls',(select coalesce(jsonb_agg(jsonb_build_array(relname,relrowsecurity,relforcerowsecurity) order by relname),'[]') from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r'),
 'triggers',(select coalesce(jsonb_agg(pg_get_triggerdef(t.oid) order by pg_get_triggerdef(t.oid)),'[]') from pg_trigger t join pg_class c on c.oid=t.tgrelid join pg_namespace n on n.oid=c.relnamespace join pg_proc p on p.oid=t.tgfoid join pg_namespace f on f.oid=p.pronamespace where not t.tgisinternal and n.nspname in ('public','auth','storage') and f.nspname='public')
 )"""

def fail(message):
    raise RuntimeError(message)

def sha(path):
    h=hashlib.sha256()
    with open(path,'rb') as f:
        for b in iter(lambda:f.read(1048576),b''): h.update(b)
    return h.hexdigest()

def private_dir(path):
    path=Path(path).expanduser().resolve()
    path.mkdir(mode=0o700,parents=True,exist_ok=True)
    os.chmod(path,0o700)
    if subprocess.run(['git','-C',str(path),'rev-parse','--show-toplevel'],capture_output=True).returncode==0:
        fail('Recovery location is inside a Git working tree; choose a private location outside Git.')
    return path

def run(args,cwd,log,env=None):
    with open(log,'ab') as f:
        result=subprocess.run(args,cwd=cwd,env=env,stdout=subprocess.PIPE,stderr=f)
    if result.returncode:
        fail('Command failed. STOP. Details are private in '+str(log)+'; do not paste that log into chat.')
    return result.stdout

def connect_env(url,local=False):
    u=urlparse(url)
    if u.scheme not in ('postgres','postgresql') or not u.username or not u.password or u.path!='/postgres':
        fail('Use the full percent-encoded PostgreSQL connection string, with its existing database password.')
    if local:
        if u.hostname not in ('127.0.0.1','localhost','::1') or u.port!=54322:
            fail('Restore is restricted to loopback port 54322. Hosted targets are rejected.')
    elif not ((u.hostname=='db.'+REF+'.supabase.co' and unquote(u.username)=='postgres') or
              ((u.hostname or '').endswith('.pooler.supabase.com') and unquote(u.username)=='postgres.'+REF)) or (not local and u.port not in (None,5432)):
        fail('Source must be the confirmed project, using direct port 5432 or the SESSION pooler on 5432.')
    env=os.environ.copy()
    for k in list(env):
        if k.startswith('PG') or k.startswith('SUPABASE_'): env.pop(k,None)
    env.update(PGHOST=u.hostname,PGPORT=str(u.port or 5432),PGDATABASE='postgres',
               PGUSER=unquote(u.username),PGPASSWORD=unquote(u.password),
               PGSSLMODE='disable' if local else 'require',PGCONNECT_TIMEOUT='20')
    if not local: env['PGOPTIONS']='-c default_transaction_read_only=on -c statement_timeout=300000'
    return env

def sql(query,env,work):
    out=run(['psql','-X','-qAt','-v','ON_ERROR_STOP=1','-c',"set search_path=pg_catalog; set timezone='UTC'; "+query],work,work/'private-commands.log',env)
    return out.decode().strip()

def quote_ident(s):
    return '"'+s.replace('"','""')+'"'

def fingerprint(env,work):
    values={}
    for name in sql(TABLES,env,work).splitlines():
        schema,table=name.split('.',1)
        relation=quote_ident(schema)+'.'+quote_ident(table)
        values[name]=json.loads(sql("select jsonb_build_array(count(*),md5(coalesce(string_agg(row_text,'' order by row_text),''))) from (select to_jsonb(t)::text as row_text from "+relation+" t) q",env,work))
    return values

def require_empty_objects(env,work):
    if sql('select count(*) from storage.objects',env,work)!='0':
        fail('Storage objects exist. A paginated private file export and verified file restore are required before continuing.')
    if sql('select count(*) from vault.secrets',env,work)!='0':
        fail('Vault contains encrypted entries. Stop for a separate encryption-key recovery review.')

def copy_counts(path):
    counts={}
    current=None
    with open(path,encoding='utf-8') as f:
        for line in f:
            if current is not None:
                if line.rstrip('\n')=='\\.': current=None
                else: counts[current]+=1
            elif line.startswith('COPY '):
                m=re.match(r'COPY ("?[A-Za-z_][A-Za-z_0-9]*"?)\.("?[A-Za-z_][A-Za-z_0-9]*"?) \(',line)
                if not m: fail('Unexpected COPY format. Stop for review rather than guessing export coverage.')
                current='.'.join(x.strip('"') for x in m.groups())
                if current in counts: fail('Duplicate COPY section in export.')
                counts[current]=0
    if current is not None: fail('Truncated COPY export.')
    return counts

def dump(cli,url,path,flags,work):
    # Official CLI takes the URL as an argument. Hidden prompt prevents shell-history exposure.
    # CLI output (which can include credentials on errors) stays in a private directory.
    u=urlparse(url); q=dict(parse_qsl(u.query)); q['sslmode']='require'
    url=urlunparse(u._replace(query=urlencode(q)))
    output=run([cli,'db','dump','--db-url',url,'-f',str(path),*flags],work,work/'private-commands.log')
    with open(work/'private-commands.log','ab') as f: f.write(output)
    if not path.is_file() or path.stat().st_size==0: fail('Missing or empty export: '+path.name)
    os.chmod(path,0o600)

def backup(root,repo):
    work=Path(tempfile.mkdtemp(prefix='backup-',dir=root)); os.chmod(work,0o700)
    print('Private backup directory:',work)
    repo=Path(repo).resolve()
    for name,expected in HASHES.items():
        path=repo/'supabase/migrations'/name
        if not path.is_file() or sha(path)!=expected: fail('Installed migration does not match reviewed bytes: '+name)
    source=work/'source-migrations'; source.mkdir(mode=0o700)
    for path in (repo/'supabase/migrations').glob('*.sql'):
        shutil.copy2(path,source/path.name)
        os.chmod(source/path.name,0o600)
    for name,expected in HASHES.items():
        if sha(source/name)!=expected: fail('Migration changed while copying; stop.')
    cli=shutil.which('supabase')
    for cmd in ([cli,'--help'],[cli,'db','--help'],[cli,'db','dump','--help']):
        out=run(cmd,work,work/'private-commands.log')
    for flag in (b'--role-only',b'--schema',b'--data-only',b'--use-copy'):
        if flag not in out: fail('Installed CLI lacks a required dump flag; use a current official stable CLI.')
    (work/'cli-version.txt').write_bytes(run([cli,'--version'],work,work/'private-commands.log'))
    print('Use a quiet window: no app writes, sign-ins, intake submissions or provider events during export.')
    if input('Have all writers been paused/coordinated without changing hosted settings? Type QUIET: ')!='QUIET': fail('A consistent backup window has not been confirmed.')
    url=getpass.getpass('SOURCE session-pooler/direct connection URL (hidden; never paste into chat): ')
    env=connect_env(url)
    require_empty_objects(env,work)
    before=fingerprint(env,work)
    catalog=json.loads(sql(CATALOG,env,work))
    (work/'expected-rows.json').write_text(json.dumps(before,indent=2))
    (work/'expected-catalog.json').write_text(json.dumps(catalog,indent=2))
    triggers=sql("select pg_get_triggerdef(t.oid)||';' from pg_trigger t join pg_class c on c.oid=t.tgrelid join pg_namespace n on n.oid=c.relnamespace join pg_proc p on p.oid=t.tgfoid join pg_namespace f on f.oid=p.pronamespace where not t.tgisinternal and n.nspname in ('auth','storage') and f.nspname='public' order by t.tgname",env,work)
    if sql("select count(*) from pg_policies where schemaname in ('auth','storage')",env,work)!='0':
        fail('Managed-schema policies changed. Capture and review their recreation before backing up for approval.')
    (work/'managed-customizations.sql').write_text(triggers+'\n')
    (work/'source-platform.json').write_text(sql("select jsonb_build_object('server_version',current_setting('server_version'),'extensions',(select jsonb_agg(jsonb_build_array(extname,extversion) order by extname) from pg_extension),'managed_columns',(select jsonb_agg(to_jsonb(c) order by table_schema,table_name,ordinal_position) from information_schema.columns c where table_schema in ('auth','storage')),'auth_managed_history',(select jsonb_agg(to_jsonb(m)) from auth.schema_migrations m),'storage_managed_history',(select jsonb_agg(to_jsonb(m)) from storage.migrations m))",env,work))
    dump(cli,url,work/'roles.sql',['--role-only'],work)
    dump(cli,url,work/'schema.sql',[],work)
    dump(cli,url,work/'data.sql',['--data-only','--use-copy','--schema','public,auth,storage','-x','storage.buckets_vectors','-x','storage.vector_indexes','-x','auth.schema_migrations','-x','storage.migrations'],work)
    dump(cli,url,work/'history_schema.sql',['--schema','supabase_migrations'],work)
    dump(cli,url,work/'history_data.sql',['--data-only','--use-copy','--schema','supabase_migrations'],work)
    after=fingerprint(env,work)
    require_empty_objects(env,work)
    if before!=after or catalog!=json.loads(sql(CATALOG,env,work)): fail('Source changed during export. Backup is NOT verified; retry in a quiet window.')
    counts=copy_counts(work/'data.sql') | copy_counts(work/'history_data.sql')
    for table,(count,_) in before.items():
        if counts.get(table,0)!=count: fail('Export row coverage differs for '+table+'. Stop; never omit rows to make restore pass.')
    for required in ('auth.users','auth.identities','storage.buckets','storage.objects'):
        if required not in before: fail('Required Auth/Storage table missing: '+required)
    (work/'backup-status.txt').write_text('SOURCE_EXPORT_CHECKS_PASSED\nDATABASE_RESTORE_NOT_YET_VERIFIED\nSTORAGE_OBJECTS=0\nVAULT_ENTRIES=0\nproject='+REF+'\nexport_completed_utc='+dt.datetime.now(dt.timezone.utc).isoformat()+'\n')
    manifest={str(p.relative_to(work)):sha(p) for p in sorted(work.rglob('*')) if p.is_file()}
    (work/'SHA256.json').write_text(json.dumps(manifest,indent=2))
    archive=work.with_suffix('.tar.gz')
    with tarfile.open(archive,'w:gz') as tar: tar.add(work,arcname=work.name)
    print('GnuPG will ask for a NEW backup encryption passphrase. Save it in your password manager.')
    encrypted=Path(str(archive)+'.gpg')
    subprocess.run(['gpg','--symmetric','--cipher-algo','AES256','--pinentry-mode','loopback','--output',str(encrypted),str(archive)],check=True)
    decrypted=work.parent/(work.name+'-decrypt-check.tar.gz')
    print('Now decrypt-check the encrypted archive; GnuPG may reuse its local passphrase cache.')
    subprocess.run(['gpg','--pinentry-mode','loopback','--output',str(decrypted),'--decrypt',str(encrypted)],check=True)
    if sha(archive)!=sha(decrypted): fail('Encrypted archive round-trip failed.')
    checksum=sha(encrypted)
    Path(str(encrypted)+'.sha256').write_text(checksum+'  '+encrypted.name+'\n')
    print('SOURCE_EXPORT_AND_ENCRYPTION_CHECKS_PASSED; RESTORE_PENDING')
    print('Download privately:',encrypted,'and its .sha256 file. Retain the private original folder.')
    print('Never upload SQL, private logs, account data, or the encrypted backup to chat or GitHub.')

def rehearse(root,backup_path):
    backup_path=Path(backup_path).expanduser().resolve()
    if 'SOURCE_EXPORT_CHECKS_PASSED' not in (backup_path/'backup-status.txt').read_text(): fail('Source export has not passed.')
    manifest=json.loads((backup_path/'SHA256.json').read_text())
    for name,expected in manifest.items():
        path=(backup_path/name).resolve()
        if not path.is_relative_to(backup_path) or sha(path)!=expected: fail('Private backup file hash mismatch; stop.')
    local=Path(tempfile.mkdtemp(prefix='restore-',dir=root)); os.chmod(local,0o700)
    cli=shutil.which('supabase')
    for sub in ('init','start','status'):
        run([cli,sub,'--help'],local,local/'private-local.log')
    out=run([cli,'init','--yes'],local,local/'private-local.log')
    project='rovei_recovery_'+local.name.replace('-','_')
    config=local/'supabase/config.toml'
    content=config.read_text()
    content=re.sub(r'^project_id\s*=.*$', 'project_id = "'+project+'"',content,flags=re.M)
    content=re.sub(r'^major_version\s*=.*$', 'major_version = 17',content,flags=re.M)
    config.write_text(content)
    print('Starting a fresh LOCAL Supabase stack. Keep all Codespaces ports PRIVATE. No hosted link is used.')
    out=run([cli,'start'],local,local/'private-local.log')
    with open(local/'private-local.log','ab') as f: f.write(out)
    status=json.loads(run([cli,'status','-o','json'],local,local/'private-local.log'))
    env=connect_env(status['DB_URL'],local=True)
    # Stop only containers belonging to THIS newly generated project, keeping its DB.
    containers=run(['docker','ps','--format','{{.ID}}\t{{.Names}}'],local,local/'private-local.log').decode().splitlines()
    for line in containers:
        cid,name=line.split('\t',1)
        if name.startswith('supabase_') and name.endswith('_'+project) and name!='supabase_db_'+project:
            run(['docker','stop',cid],local,local/'private-local.log')
    if sql("select count(*) from pg_tables where schemaname='public'",env,local)!='0' or sql('select count(*) from auth.users',env,local)!='0' or sql('select count(*) from storage.buckets',env,local)!='0':
        fail('Local restore target is not empty. Nothing has been imported; never reset an existing database.')
    args=['psql','-X','-q','--single-transaction','-v','ON_ERROR_STOP=1',
          '-f',str(backup_path/'roles.sql'),
          '-c','ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated',
          '-f',str(backup_path/'schema.sql'),'-f',str(backup_path/'managed-customizations.sql'),
          '-c','SET session_replication_role = replica',
          '-f',str(backup_path/'data.sql'),'-f',str(backup_path/'history_schema.sql'),'-f',str(backup_path/'history_data.sql')]
    out=run(args,local,local/'private-local.log',env)
    with open(local/'private-local.log','ab') as f: f.write(out)
    expected=json.loads((backup_path/'expected-rows.json').read_text())
    actual=fingerprint(env,local)
    for table,value in expected.items():
        if table in ('storage.buckets_vectors','storage.vector_indexes') and value[0]==0:
            continue
        if actual.get(table)!=value: fail('Restored row count/content fingerprint differs for '+table+'. Recovery remains unverified.')
    if json.loads((backup_path/'expected-catalog.json').read_text())!=json.loads(sql(CATALOG,env,local)):
        fail('Restored functions, grants, policies, RLS or triggers differ. Recovery remains unverified.')
    report={'project':REF,'database_restore':'LOCAL_DATABASE_RESTORE_VERIFIED','row_and_catalog_comparison':'PASS','storage_objects':0,'auth_configuration':'MANUAL_CHECK_REQUIRED','offsite_copy':'MANUAL_CHECK_REQUIRED','local_workdir':str(local),'hosted_writes':False}
    (local/'safe-summary.json').write_text(json.dumps(report,indent=2))
    run(['docker','stop','supabase_db_'+project],local,local/'private-local.log')
    print(json.dumps(report,indent=2))
    print('Only safe-summary.json may be shared. Local database container stopped; private volumes retained.')

def main():
    os.umask(0o077)
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('mode',choices=['backup','rehearse'])
    parser.add_argument('--root',default=str(Path.home()/'rovei-private-recovery'))
    parser.add_argument('--repo',default='/workspaces/Rovei-3-')
    parser.add_argument('--backup')
    args=parser.parse_args()
    for tool in ('git','supabase','docker','psql','gpg'):
        if not shutil.which(tool): fail('Missing prerequisite: '+tool+'. See PLAN.md; no hosted action was taken.')
    root=private_dir(args.root)
    if args.mode=='backup': backup(root,args.repo)
    else:
        if not args.backup: fail('--backup must name your private backup folder.')
        rehearse(root,args.backup)

if __name__=='__main__':
    try: main()
    except (Exception,KeyboardInterrupt) as e:
        # Never print arbitrary exception messages: they may include a connection URL or data.
        print('STOP: '+(str(e) if isinstance(e,RuntimeError) else 'Operation failed or interrupted. Keep logs private; no hosted migration is authorized.'),file=sys.stderr)
        sys.exit(1)
