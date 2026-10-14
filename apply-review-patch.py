#!/usr/bin/env python3
"""Check exact snapshot preimages before applying the Rovei review patch."""
import argparse,hashlib,json,subprocess,sys
from pathlib import Path
parser=argparse.ArgumentParser()
parser.add_argument('repository',type=Path)
parser.add_argument('--apply',action='store_true',help='Apply only after every preimage and git apply --check passes.')
args=parser.parse_args()
root=args.repository.resolve()
artifact=Path(__file__).resolve().parent
manifest=json.loads((artifact/'patch-manifest.json').read_text())
errors=[]
for name,hashes in manifest.items():
 relative=Path(name)
 if relative.is_absolute() or '..' in relative.parts:sys.exit('Unsafe manifest path.')
 target=root/relative
 if target.is_symlink(): errors.append(name+' is a symlink');continue
 actual=hashlib.sha256(target.read_bytes()).hexdigest() if target.is_file() else None
 if actual!=hashes['before_sha256']:errors.append(name+' differs from the supplied snapshot')
if errors:
 print('STOP: no changes applied. Resolve these differences in a separate review workspace:')
 for error in errors:print(error)
 sys.exit(1)
patch=artifact/'rovei-launch-sprint.patch'
check=subprocess.run(['git','apply','--check',str(patch)],cwd=root)
if check.returncode:sys.exit(check.returncode)
print('PASS: all 37 source preimages match and git apply --check succeeded.')
if args.apply:
 result=subprocess.run(['git','apply',str(patch)],cwd=root)
 if result.returncode:sys.exit(result.returncode)
 for name,hashes in manifest.items():
  if hashlib.sha256((root/name).read_bytes()).hexdigest()!=hashes['after_sha256']:sys.exit('Applied-file verification failed: '+name)
 print('PASS: patch applied and all resulting file hashes verified. No commit, push, merge, database change or deployment performed.')
else:print('Check only: no changes applied.')
