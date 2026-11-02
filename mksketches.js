// Pre-renders the pencil sketches (landing dosa plant + the 13 sketches on /cheme/) to images, in both themes.
// Why: some phone browsers (iOS Safari) fail to draw the SVG pencil filter, leaving the sketches blank.
// Images look identical everywhere. build.py swaps each inline <svg> for these images when they exist.
// Usage: node mksketches.js      (optional FONTCSS=path/to/fonts.css for offline fonts)
const fs=require('fs'),path=require('path'),http=require('http'),{execSync}=require('child_process'),{chromium}=require('playwright');
process.chdir(__dirname);
execSync('python3 build.py',{env:{...process.env,NOIMG:'1'},stdio:'inherit'});
const root=path.join(__dirname,'docs'), out=path.join(root,'sketches'); fs.mkdirSync(out,{recursive:true});
const types={'.html':'text/html; charset=utf-8','.png':'image/png','.json':'application/json','.js':'text/javascript','.webp':'image/webp'};
const srv=http.createServer((q,r)=>{let f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream'});r.end(d);});}).listen(0);
const port=srv.address().port, fontcss=process.env.FONTCSS?fs.readFileSync(process.env.FONTCSS,'utf8'):null;
const jobs=[['/','svg.pfdsk',()=> 'pfd-dosa',2],['/cheme/','svg.sk',null,2.5]];
(async()=>{const b=await chromium.launch(); const made=[];
for(const theme of ['dark','light']) for(const [url,sel,nameFn,dpr] of jobs){
  const p=await b.newPage({viewport:{width:1280,height:900},deviceScaleFactor:dpr});
  if(fontcss) await p.route(/fonts.googleapis/,r=>r.fulfill({contentType:'text/css',body:fontcss}));
  await p.addInitScript(t=>{try{localStorage.setItem('cc-theme',t)}catch(e){}},theme);
  await p.goto(`http://localhost:${port}${url}`); await p.evaluate(()=>document.fonts.ready);
  await p.addStyleTag({content:'html,body,.card,.pfdfig,.pfdscroll,.sk,.pfdsk{background:transparent!important;background-image:none!important;border-color:transparent!important;box-shadow:none!important}.rv{opacity:1!important;transform:none!important}'});
  await p.waitForTimeout(400);
  const els=await p.$$(sel);
  for(const el of els){ const id=await el.evaluate(e=>{const t=e.querySelector('title');return t&&t.id?t.id:''});
    const name=nameFn?nameFn():'ck-'+id; await el.scrollIntoViewIfNeeded();
    const tmp=path.join(out,`${name}-${theme}.png`); await el.screenshot({path:tmp,omitBackground:true}); made.push(tmp); }
  await p.close(); }
await b.close(); srv.close();
execSync(`python3 -c "import sys;from PIL import Image\nfor f in sys.argv[1:]:\n  Image.open(f).save(f[:-4]+'.webp','WEBP',quality=88,method=6)\n  import os;os.remove(f)" ${made.map(f=>JSON.stringify(f)).join(' ')}`);
console.log('rendered',made.length,'sketches');
execSync('python3 build.py',{stdio:'inherit'});
})();
