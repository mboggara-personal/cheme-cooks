import os, glob
os.chdir(os.path.dirname(os.path.abspath(__file__)))
def cat(pat): return "\n".join(open(f).read() for f in sorted(glob.glob(pat)))
h=open('app.html').read()
h=h.replace('/*DATA*/',open('data.js').read()+"\n"+cat('data-b*.js')).replace('/*HIST*/',open('history.js').read()+"\n"+cat('history-b*.js')+"\n"+open('meta.js').read()+"\n"+cat('meta-b*.js')).replace('/*TOPO*/',open('india.topo.json').read()).replace('/*SOI*/',open('india-soi.topo.json').read()).replace('const IMAGES = {};',open('images.js').read()).replace('/*APP*/',open('tags.js').read()+'\n'+open('variants.js').read()+'\n'+open('app.js').read().replace('/*PLANNER*/',open('planner.js').read()+'\n'+open('ingredients.js').read()+'\n'+open('pantry.js').read()+'\n'+open('labs2.js').read()+'\n'+open('kids.js').read()+'\n'+open('tour.js').read()))
import os, shutil
here=os.path.dirname(os.path.abspath(__file__))
open(os.path.join(here,'cheme-cooks-atlas.html'),'w').write(h)
os.makedirs(os.path.join(here,'docs'),exist_ok=True)
os.makedirs(os.path.join(here,'docs','atlas'),exist_ok=True)
# standalone page: the artifact host adds charset/viewport; GitHub Pages needs them in the file
open(os.path.join(here,'docs','atlas','index.html'),'w').write('<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'+h)
open(os.path.join(here,'docs','.nojekyll'),'w').write('')
if os.path.isdir(os.path.join(here,'images')):
    shutil.copytree(os.path.join(here,'images'),os.path.join(here,'docs','atlas','images'),dirs_exist_ok=True,ignore=shutil.ignore_patterns('src'))
# landing page: map + live counts come from mklanding.js output (landing-map.svg, landing-stats.json)
import json, re
L=open('landing.html').read()
st=json.load(open('landing-stats.json')) if os.path.exists('landing-stats.json') else {}
n_d=len(re.findall(r'\{id:"', open('data.js').read()+cat('data-b*.js')))
n_s=st.get('states',33)
L=L.replace('/*MAP*/',open('landing-map.svg').read()).replace('{{DISHES}}',str(n_d)).replace('{{STATES}}',str(n_s))
open(os.path.join(here,'docs','index.html'),'w').write(L)
print(len(h))
# concept explainer page: shares fonts, colour tokens and the theme switch with the landing page
C=open('cheme.html').read()
LS=open('landing.html').read()
fonts=re.search(r'<link rel="preconnect"[^>]*>\s*<link rel="stylesheet" href="https://fonts[^>]*>',LS).group(0)
tokens=LS[LS.index(':root{'):LS.index('*{box-sizing')]
i=LS.index('<script>(function(){var r=document.documentElement'); toggle=LS[i:LS.index('</script>',i)+9]
C=C.replace('/*FONTS*/',fonts).replace('/*TOKENS*/',tokens).replace('/*TOGGLE*/',toggle)
os.makedirs(os.path.join(here,'docs','cheme'),exist_ok=True)
open(os.path.join(here,'docs','cheme','index.html'),'w').write(C)
