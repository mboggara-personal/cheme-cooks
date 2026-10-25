# Build images/<id>.webp (960px) and images/t/<id>.webp (480px) from originals in images/src/, and images.js
import os,json,glob
from PIL import Image
os.makedirs('images/t',exist_ok=True); os.makedirs('images/src',exist_ok=True)
for f in sorted(os.listdir('images')):
    if not f.endswith('.webp'): continue
    id=f[:-5]; t='images/t/'+f
    if not os.path.exists(t) or os.path.getmtime(t)<os.path.getmtime('images/'+f):
        im=Image.open('images/'+f); im.thumbnail((480,480)); im.save(t,'WEBP',quality=72)
m={f[:-5]:'images/'+f for f in sorted(os.listdir('images')) if f.endswith('.webp')}
open('images.js','w').write('const IMAGES = '+json.dumps(m)+';')
files={}
for k,v in m.items(): files[v]='/home/claude/geo/'+v; files[v.replace('images/','images/t/')]='/home/claude/geo/'+v.replace('images/','images/t/')
json.dump(files,open('images-files.json','w'))
print(len(m),'images', {k:os.path.getsize('images/t/'+k+'.webp')//1024 for k in m})
