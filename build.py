import os, glob
os.chdir(os.path.dirname(os.path.abspath(__file__)))
def cat(pat): return "\n".join(open(f).read() for f in sorted(glob.glob(pat)))
h=open('app.html').read()
h=h.replace('/*DATA*/',open('data.js').read()+"\n"+cat('data-b*.js')).replace('/*HIST*/',open('history.js').read()+"\n"+cat('history-b*.js')+"\n"+open('meta.js').read()+"\n"+cat('meta-b*.js')).replace('/*TOPO*/',open('india.topo.json').read()).replace('/*SOI*/',open('india-soi.topo.json').read()).replace('const IMAGES = {};',open('images.js').read()).replace('/*APP*/',open('tags.js').read()+'\n'+open('variants.js').read()+'\n'+open('app.js').read().replace('/*PLANNER*/',open('planner.js').read()+'\n'+open('ingredients.js').read()+'\n'+open('pantry.js').read()+'\n'+open('labs2.js').read()+'\n'+open('kids.js').read()))
import os, shutil
here=os.path.dirname(os.path.abspath(__file__))
open(os.path.join(here,'cheme-cooks-atlas.html'),'w').write(h)
os.makedirs(os.path.join(here,'docs'),exist_ok=True)
open(os.path.join(here,'docs','index.html'),'w').write(h)
open(os.path.join(here,'docs','.nojekyll'),'w').write('')
if os.path.isdir(os.path.join(here,'images')):
    shutil.copytree(os.path.join(here,'images'),os.path.join(here,'docs','images'),dirs_exist_ok=True,ignore=shutil.ignore_patterns('src'))
print(len(h))
