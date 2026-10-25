import glob
def cat(pat): return "\n".join(open(f).read() for f in sorted(glob.glob(pat)))
h=open('app.html').read()
h=h.replace('/*DATA*/',open('data.js').read()+"\n"+cat('data-b*.js')).replace('/*HIST*/',open('history.js').read()+"\n"+cat('history-b*.js')+"\n"+open('meta.js').read()+"\n"+cat('meta-b*.js')).replace('/*TOPO*/',open('india.topo.json').read()).replace('const IMAGES = {};',open('images.js').read()).replace('/*APP*/',open('tags.js').read()+'\n'+open('variants.js').read()+'\n'+open('app.js').read().replace('/*PLANNER*/',open('planner.js').read()))
open('/home/claude/geo/food-atlas.html','w').write(h)
open('/home/claude/geo/cheme-cooks-atlas.html','w').write(h)
print(len(h))
