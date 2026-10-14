#!/usr/bin/env python3
"""Mission 1: isolated, credential-free QA before applying the immutable Sprint 2 patch."""
import hashlib,json,os,re,shlex,socket,stat,subprocess,sys,tempfile,zipfile
from pathlib import Path,PurePosixPath

ARCHIVE_SHA='17296a666e4148a0fd665a8cd5d2b40bc777958bb0f13e8a7a960295a423e2fe'
BRANCH='frontend/exact-locked-shell'
REQUIRED=['npm ci','npm run typecheck','npm test','npm run lint','npm run build','NODE_ENV=production npm run test:routes','Chromium installation','npm run test:e2e']
class Stop(Exception):pass
def git(root,*args):
    return subprocess.check_output(['git',*args],cwd=root,stderr=subprocess.PIPE)
def sha(data):return hashlib.sha256(data).hexdigest()
def extract(archive,destination):
    with zipfile.ZipFile(archive) as z:
        if z.testzip() is not None:raise Stop('ZIP integrity check failed.')
        seen=set()
        for info in z.infolist():
            name=PurePosixPath(info.filename)
            if name.is_absolute() or '..' in name.parts or '\\' in info.filename or info.filename in seen or stat.S_ISLNK(info.external_attr>>16):raise Stop('Unsafe or duplicate ZIP entry.')
            if info.file_size>10*1024*1024:raise Stop('Unexpectedly large ZIP entry.')
            seen.add(info.filename)
        z.extractall(destination)
def source_files(root):
    result={}
    names=git(root,'ls-files','--cached','--others','--exclude-standard','-z').split(b'\0')
    for raw in names:
        if not raw:continue
        name=os.fsdecode(raw);relative=Path(name)
        if relative.is_absolute() or '..' in relative.parts:raise Stop('Unsafe source path.')
        if any(p in {'.git','node_modules','.next','test-results','playwright-report','.cache'} or p.startswith('.env') for p in relative.parts):continue
        if relative.name in {'.npmrc','.netrc','.pypirc'} or relative.name.startswith(('ROVEI-MISSION1-','ROVEI-SPRINT2-REVIEW')):continue
        if any('backup' in p.lower() and p.lower().startswith(('.rovei','rovei')) for p in relative.parts):continue
        path=root/relative
        if path.is_symlink() or not path.resolve().is_relative_to(root):raise Stop('Source contains a symlink/escaping path; preserve it and review manually.')
        result[name]=path.read_bytes() if path.is_file() else None
    return result
def server_running(root):
    # Read only process cwd/command names, never process environments or print arguments.
    for folder in Path('/proc').glob('[0-9]*'):
        try:
            cwd=(folder/'cwd').resolve()
            if cwd==root or cwd.is_relative_to(root):
                command=(folder/'cmdline').read_bytes()
                if b'next' in command and (b'dev' in command or b'start' in command or b'server.js' in command):return True
        except (OSError,ValueError):continue
    return False
class Runner:
    def __init__(self,review,batch):
        self.review=review;self.batch=batch;self.results=[]
        self.env={'PATH':os.environ.get('PATH','/usr/bin:/bin'),'HOME':os.environ.get('HOME',''),
          'CI':'1','FORCE_COLOR':'0','NEXT_TELEMETRY_DISABLED':'1','TMPDIR':str(batch/'tmp'),
          'npm_config_cache':str(batch/'npm-cache'),'npm_config_userconfig':str(batch/'npm-user.rc'),
          'npm_config_globalconfig':str(batch/'npm-global.rc'),'PLAYWRIGHT_BROWSERS_PATH':str(batch/'browsers')}
        for name in ['tmp','npm-cache','logs','browsers','browser-artifacts']:(batch/name).mkdir(mode=0o700,exist_ok=True)
        for name in ['npm-user.rc','npm-global.rc']:(batch/name).write_text('registry=https://registry.npmjs.org/\n')
    def execute(self,label,args,extra=None):
        log=self.batch/'logs'/f'{len(self.results)+1:02d}.log'
        print('RUN '+label,flush=True)
        with log.open('wb') as stream:
            result=subprocess.run(args,cwd=self.review,env={**self.env,**(extra or {})},stdout=stream,stderr=subprocess.STDOUT)
        self.results.append({'command':label,'exit_code':result.returncode,'log':str(log)})
        (self.batch/'results.json').write_text(json.dumps(self.results,indent=2)+'\n')
        if result.returncode:raise Stop(label+' failed. Log: '+str(log))
        print('PASS '+label,flush=True)
        return log
def main(root,archive,runner_type=Runner):
    root=root.resolve();archive=archive.resolve();batch=None;installed=False
    try:
        if not (root/'.git').exists():raise Stop('Original repository is unavailable.')
        if git(root,'branch','--show-current').decode().strip()!=BRANCH:raise Stop('Existing branch is not '+BRANCH+'. No branch was changed.')
        if sha(archive.read_bytes())!=ARCHIVE_SHA:raise Stop('Sprint 2 ZIP checksum differs. Do not force or use another archive.')
        if server_running(root):raise Stop('Stop the original Next dev/start terminal with Ctrl+C first. Its schema is not migrated.')
        batch=Path(tempfile.mkdtemp(prefix='rovei-mission1-private-',dir=root.parent));os.chmod(batch,0o700)
        print('Private review/backup/log directory: '+str(batch),flush=True)
        package=batch/'package';package.mkdir(mode=0o700);extract(archive,package)
        # Use the exact delivered helper and manifests, before any original-source write.
        subprocess.run([sys.executable,str(package/'apply-sprint2.py'),str(root)],check=True)
        files=source_files(root);fingerprint={name:{'sha256':sha(data),'mode':stat.S_IMODE((root/name).stat().st_mode)} if data is not None else None for name,data in files.items()}
        backup=batch/'original-source-backup';backup.mkdir(mode=0o700)
        for name,data in files.items():
            if data is not None:
                target=backup/name;target.parent.mkdir(parents=True,exist_ok=True,mode=0o700);target.write_bytes(data);os.chmod(target,0o600)
        (batch/'original-source-hashes.json').write_text(json.dumps(fingerprint,indent=2)+'\n')
        (batch/'original-git-status.bin').write_bytes(git(root,'status','--porcelain','-z'))
        original_head=git(root,'rev-parse','HEAD');original_index=git(root,'ls-files','--stage','-z')
        review=batch/'review'
        with (batch/'clone.log').open('wb') as log:
            subprocess.run(['git','clone','--no-hardlinks','--no-checkout',str(root),str(review)],check=True,stdout=log,stderr=subprocess.STDOUT)
        # No GitHub tree is substituted: populate the no-checkout clone solely from current source bytes.
        for name,data in files.items():
            if data is not None:
                target=review/name;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(data)
                os.chmod(target,(root/name).stat().st_mode & 0o777)
        subprocess.run([sys.executable,str(package/'apply-sprint2.py'),str(review),'--apply'],check=True)
        runner=runner_type(review,batch)
        node_log=runner.execute('Node runtime',['node','--version'])
        version=node_log.read_text().strip();match=re.match(r'v(\d+)\.(\d+)',version)
        if not match or (int(match[1]),int(match[2]))<(22,18):raise Stop('Use Node 22.18+ for this changeset; no runtime was changed automatically.')
        for label,args in [('npm ci',['npm','ci']),('npm run typecheck',['npm','run','typecheck']),('npm test',['npm','test']),('npm run lint',['npm','run','lint']),('npm run build',['npm','run','build'])]:
            log=runner.execute(label,args)
            if label=='npm test':
                text=re.sub(r'\x1b\[[0-9;]*m','',log.read_text(errors='replace'))
                if not all(re.search(r'\b'+key+r'\s+'+value+r'\b',text) for key,value in [('tests','95'),('pass','95'),('fail','0')]):raise Stop('Automated suite did not report exactly 95 passed and zero failed tests.')
        runner.execute('NODE_ENV=production npm run test:routes',['npm','run','test:routes'],{'NODE_ENV':'production'})
        # Only review QA configuration is added; the delivered app/config files stay unchanged.
        qa=review/'tests/e2e/mission1-visual.spec.ts'
        if qa.exists():raise Stop('Review QA filename already exists.')
        qa.write_bytes((Path(__file__).parent/'mission1-visual.spec.ts').read_bytes())
        with socket.socket() as sock:sock.bind(('127.0.0.1',0));port=sock.getsockname()[1]
        fixture={'PADDLE_ENVIRONMENT':'sandbox','PADDLE_API_KEY':'sandbox-api-fixture','PADDLE_WEBHOOK_SECRET':'webhook-fixture',
          'NEXT_PUBLIC_PADDLE_CLIENT_TOKEN':'test_client-fixture','PADDLE_PRICE_ID_MONTHLY':'pri_'+'a'*26,'PADDLE_PRICE_ID_ANNUAL':'pri_'+'b'*26,'NEXT_TELEMETRY_DISABLED':'1'}
        config={'testDir':str(review/'tests/e2e'),'testMatch':['**/checkout.spec.ts','**/records.spec.ts','**/mission1-visual.spec.ts'],'fullyParallel':False,'workers':1,'timeout':60000,
          'use':{'baseURL':f'http://127.0.0.1:{port}','browserName':'chromium','timezoneId':'UTC','locale':'en-US'},
          'webServer':{'command':'npm run dev -- --port '+str(port),'cwd':str(review),'url':f'http://127.0.0.1:{port}/activate/checkout','reuseExistingServer':False,'timeout':180000,'env':fixture},
          'outputDir':str(batch/'browser-artifacts'),'snapshotDir':str(batch/'visual-baselines'),
          'reporter':[['list'],['json',{'outputFile':str(batch/'logs/e2e-results.json')}]]}
        config_path=review/'playwright.mission1.config.cjs';config_path.write_text('module.exports = '+json.dumps(config)+';\n')
        runner.execute('Chromium installation',['npx','--no-install','playwright','install','--with-deps','chromium'])
        runner.execute('npm run test:e2e',['npm','run','test:e2e','--','--config',str(config_path)])
        stats=json.loads((batch/'logs/e2e-results.json').read_text())['stats']
        if stats.get('expected')!=25 or any(stats.get(k,0) for k in ['unexpected','skipped','flaky']):raise Stop('Chromium report did not show all 25 required checks passed without skips or flakiness.')
        # Standard Next build/dev may regenerate this declaration; preserve its installed source bytes.
        if files.get('next-env.d.ts') is not None:(review/'next-env.d.ts').write_bytes(files['next-env.d.ts'])
        subprocess.run([sys.executable,str(package/'apply-sprint2.py'),str(review)],check=True)
        current={name:{'sha256':sha(data),'mode':stat.S_IMODE((root/name).stat().st_mode)} if data is not None else None for name,data in source_files(root).items()}
        if current!=fingerprint or git(root,'rev-parse','HEAD')!=original_head or git(root,'ls-files','--stage','-z')!=original_index:raise Stop('Original source or Git state changed while QA ran; keep those changes and rerun from a fresh review.')
        if server_running(root):raise Stop('Stop the original Next dev/start terminal before installation; do not run the new source against the old schema.')
        subprocess.run([sys.executable,str(package/'apply-sprint2.py'),str(root),'--apply'],check=True)
        subprocess.run([sys.executable,str(package/'apply-sprint2.py'),str(root)],check=True)
        if git(root,'branch','--show-current').decode().strip()!=BRANCH or git(root,'rev-parse','HEAD')!=original_head or git(root,'ls-files','--stage','-z')!=original_index:raise Stop('Unexpected Git-state change; stop and inspect the private backup.')
        installed=True
        if getattr(runner,'simulated',False):print('ORCHESTRATION FIXTURE PASS: CLI results were simulated; no build/browser/Codespace verification is certified.')
        else:print('MISSION 1 PASS: Sprint 2 installed/verified; 95 tests, standard build and Chromium checks passed.')
        print('Screenshots: '+str(batch/'browser-artifacts'))
        print('Keep the original authenticated app stopped until Mission 2 supplies the hosted migrations.')
        print('No hosted migrations, provider transactions/cancellations, deployment, commit, merge or push occurred.')
        (batch/'mission1-result.json').write_text(json.dumps({'installed_or_already_verified':True,'simulated_cli_outcomes':bool(getattr(runner,'simulated',False)),'archive_sha256':ARCHIVE_SHA,'commands':runner.results,'original_branch':BRANCH,'original_head':original_head.decode().strip()},indent=2)+'\n')
        return 0
    except (Stop,OSError,subprocess.SubprocessError) as error:
        print('STOP: '+str(error),file=sys.stderr)
        print('No automatic reset, force application or cleanup will run. Retain the private review/backup/logs.',file=sys.stderr)
        if batch:print('Private directory: '+str(batch),file=sys.stderr)
        if not installed:print('Installation is NOT certified. Original source is written only after all review gates pass.',file=sys.stderr)
        return 1
if __name__=='__main__':
    if len(sys.argv)!=2:sys.exit('Usage: mission1-install.py /workspaces/Rovei-3-')
    sys.exit(main(Path(sys.argv[1]),Path(__file__).parent/'ROVEI-SPRINT2-REVIEW.zip'))
