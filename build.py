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
# swap inline pencil SVGs for pre-rendered images (made by mksketches.js) so every browser shows them
def swap_sketches(html, cls, name_of):
    out=[]; pos=0
    while True:
        i=html.find(f'<svg class="{cls}"',pos)
        if i<0: break
        j=html.index('</svg>',i)+6; svg=html[i:j]
        name=name_of(svg)
        d=os.path.join(here,'docs','sketches')
        if not (os.path.exists(os.path.join(d,name+'-dark.webp')) and os.path.exists(os.path.join(d,name+'-light.webp'))):
            out.append(html[pos:j]); pos=j; continue
        m=re.search(r'<title[^>]*>(.*?)</title>',svg,re.S); m2=re.search(r'<desc[^>]*>(.*?)</desc>',svg,re.S)
        alt=(m2.group(1) if m2 else (m.group(1) if m else 'Pencil sketch')).replace('"','&quot;')
        vb=re.search(r'viewBox="0 0 (\d+) (\d+)"',svg); w,h=vb.group(1),vb.group(2)
        rel=prefix_for[0]
        img=(f'<img class="{cls} skimg" src="{rel}sketches/{name}-dark.webp" data-dark="{rel}sketches/{name}-dark.webp" data-light="{rel}sketches/{name}-light.webp" width="{w}" height="{h}" alt="{alt}" loading="lazy" decoding="async">')
        out.append(html[pos:i]+img); pos=j
    out.append(html[pos:]); return ''.join(out)
SKCSS='<style>.skimg{width:100%;height:auto;display:block}</style>\n</head>'
SKJS='<script>(function(){var r=document.documentElement;function s(){var l=r.getAttribute("data-theme")==="light";document.querySelectorAll("img.skimg").forEach(function(i){var u=l?i.dataset.light:i.dataset.dark;if(i.getAttribute("src")!==u)i.setAttribute("src",u)})}s();new MutationObserver(s).observe(r,{attributes:true,attributeFilter:["data-theme"]})})();</script>\n</body>'
prefix_for=['']
if not os.environ.get('NOIMG'):
    p=os.path.join(here,'docs','index.html'); H=open(p).read()
    prefix_for[0]=''; H2=swap_sketches(H,'pfdsk',lambda s:'pfd-dosa')
    if H2!=H: H2=H2.replace('</head>',SKCSS,1).replace('</body>',SKJS,1); open(p,'w').write(H2)
    p=os.path.join(here,'docs','cheme','index.html'); H=open(p).read()
    prefix_for[0]='../'; H2=swap_sketches(H,'sk',lambda s:'ck-'+re.search(r'<title id="([^"]+)"',s).group(1))
    if H2!=H: H2=H2.replace('</head>',SKCSS,1).replace('</body>',SKJS,1); open(p,'w').write(H2)
