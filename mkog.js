// Renders social-share preview images (Open Graph / X cards) from the landing page's pencil sketch.
// Usage: node mkog.js   → writes docs/og-dosa.png (landing + atlas) and docs/og-cheme.png (primer page)
// Optional: FONTCSS=path/to/fonts.css to supply fonts offline.
const fs=require('fs'),{chromium}=require('playwright');
const L=fs.readFileSync('landing.html','utf8'), C=fs.readFileSync('cheme.html','utf8');
const tokens=L.slice(L.indexOf(':root{'),L.indexOf('@media (prefers-color-scheme'));
const dark=L.slice(L.indexOf(':root[data-theme="dark"]{'),L.indexOf('}',L.indexOf(':root[data-theme="dark"]{'))+1);
const fonts=L.match(/<link rel="stylesheet" href="https:\/\/fonts[^>]*>/)[0];
const pfdCss=L.slice(L.indexOf('.pfdsk{'),L.indexOf('.pfdfig{'));
const svg=L.slice(L.indexOf('<svg class="pfdsk"'),L.indexOf('</svg>',L.indexOf('<svg class="pfdsk"'))+6);
// primer: shared defs + big-picture sketch + its styles
const cDefs=C.slice(C.indexOf('<svg width="0" height="0"'),C.indexOf('</svg>',C.indexOf('<svg width="0" height="0"'))+6);
const cSvg=C.slice(C.indexOf('<svg class="sk" viewBox="0 0 400 260"'),C.indexOf('</svg>',C.indexOf('<svg class="sk" viewBox="0 0 400 260"'))+6);
const cCss=C.slice(C.indexOf('.sk{'),C.indexOf('.together{'));
const brand=`<div class="brand"><svg width="54" height="54" viewBox="0 0 36 36"><circle cx="18" cy="18" r="17" fill="#ebb53e"/><path d="M13 9h10M15 9v6.5L9.5 25a2.5 2.5 0 0 0 2.2 3.8h12.6a2.5 2.5 0 0 0 2.2-3.8L21 15.5V9" fill="none" stroke="#1b1404" stroke-width="1.8" stroke-linejoin="round"/><path d="M11.5 22h13" stroke="#1b1404" stroke-width="1.6"/></svg><span><b>ChemE Cooks</b><small>INDIAN FOOD ATLAS</small></span></div>`;
const base=`*{box-sizing:border-box}html,body{margin:0}body{width:1200px;height:630px;overflow:hidden;background:var(--paper);background-image:linear-gradient(var(--grid) 1px,transparent 1px),linear-gradient(90deg,var(--grid) 1px,transparent 1px);background-size:24px 24px;color:var(--ink);font-family:var(--f-body)}
.brand{display:flex;gap:14px;align-items:center}.brand b{display:block;font-family:var(--f-display);font-weight:400;font-size:34px;line-height:1}.brand small{display:block;font-family:var(--f-mono);font-size:13px;letter-spacing:.18em;color:var(--muted);margin-top:6px}
.url{font-family:var(--f-mono);font-size:15px;color:var(--turmeric-ink);letter-spacing:.04em}`;
const page=(css,body)=>`<!doctype html><html data-theme="dark"><head><meta charset="utf-8">${fonts}<style>${tokens}${dark}${base}${css}${process.env.FONTCSS?fs.readFileSync(process.env.FONTCSS,'utf8'):''}</style></head><body>${body}</body></html>`;
const dosa=page(`.top{display:flex;justify-content:space-between;align-items:center;padding:26px 40px 0}
.card{margin:12px 64px 0;background:var(--panel);border:1px solid var(--rule);border-radius:22px;padding:6px 10px}
.pfdsk{width:100%;height:auto;display:block}${pfdCss}`,
`<div class="top">${brand}<span class="url">Exploring India's food through a chemical engineer's perspective</span></div><div class="card">${svg}</div>`);
const cheme=page(`.wrap{display:grid;grid-template-columns:470px 1fr;gap:34px;align-items:center;padding:40px 44px}
h1{font-family:var(--f-display);font-weight:400;font-size:64px;line-height:1.02;margin:34px 0 18px}
p{font-size:24px;line-height:1.4;color:var(--ink-2);margin:0 0 22px}.hand{font-family:var(--f-hand);color:var(--chili);font-size:30px}
.card{background:var(--panel);border:1px solid var(--rule);border-radius:22px;padding:14px}${cCss}`,
`${cDefs}<div class="wrap"><div>${brand}<h1>What is chemical engineering?</h1><p>Twelve big ideas, drawn in pencil and explained with your own kitchen.</p><span class="hand">milk → paneer, batter → dosa</span></div><div class="card">${cSvg}</div></div>`);
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1200,height:630}});
for(const [html,out] of [[dosa,'docs/og-dosa.png'],[cheme,'docs/og-cheme.png']]){await p.setContent(html,{waitUntil:'load'});await p.waitForTimeout(500);await p.screenshot({path:out});console.log('wrote',out);}
await b.close()})();
