(() => {
"use strict";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
DISHES.forEach(d => { const m = META[d.id]||{}; d.k = m.k||[]; d.f = m.f||[]; d.link = m.link||null; });
DISHES.forEach(d => { const h = HIST[d.id]; if (h) { d.hist = h; if (h.story) d.story = h.story; } });
const byId = Object.fromEntries(DISHES.map(d => [d.id, d]));
const MEALS = ["breakfast","lunch","dinner","snack","sweets","drinks"];
const REGIONS = ["North","Central","West","East","Northeast","South"];
const DOSHA = {v:["Vata","air + space · movement"],p:["Pitta","fire · transformation"],k:["Kapha","water + earth · structure"]};
const RASA = ["sweet","sour","salty","pungent","bitter","astringent"];
const STATE_REGION = {"Jammu & Kashmir":"North","Ladakh":"North","Himachal Pradesh":"North","Punjab":"North","Chandigarh":"North","Haryana":"North","Delhi":"North","Uttarakhand":"North","Uttar Pradesh":"North","Rajasthan":"North",
  "Gujarat":"West","Maharashtra":"West","Goa":"West","Dadra and Nagar Haveli and Daman and Diu":"West","Madhya Pradesh":"Central","Chhattisgarh":"Central",
  "Bihar":"East","Jharkhand":"East","West Bengal":"East","Odisha":"East",
  "Assam":"Northeast","Arunachal Pradesh":"Northeast","Nagaland":"Northeast","Manipur":"Northeast","Mizoram":"Northeast","Tripura":"Northeast","Meghalaya":"Northeast","Sikkim":"Northeast",
  "Karnataka":"South","Kerala":"South","Tamil Nadu":"South","Andhra Pradesh":"South","Telangana":"South","Puducherry":"South","Lakshadweep":"South","Andaman & Nicobar":"South"};

/* ================= persistence ================= */
const KEY = "chemecooks.atlas.v1";
const store = (() => { let s = {}; try { s = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) {}
  return Object.assign({ view:"map", pass:{}, thali:[], best:0, gamexp:0, sort:"geo", ticks:{}, serv:{} }, s); })();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {} };

/* ================= nutrition: Nutri-Score 2017 ================= */
const pts = (v, th) => th.reduce((s, x) => s + (v > x ? 1 : 0), 0);
function nutrition(d) {
  const t = [0,0,0,0,0,0]; let fvlG = 0, rawG = 0;
  for (const r of d.ing) { if (r[0] === "#") continue;
    for (const [k, g] of Object.entries(r[2] || {})) { const n = NUT[k]; if (!n) continue;
      for (let i = 0; i < 6; i++) t[i] += n[i] * g / 100; rawG += g; if (n[6]) fvlG += g; } }
  const p = t.map(x => x / d.yield * 100), s = t.map(x => x / d.serves);
  const fvl = rawG ? Math.min(100, fvlG / rawG * 100) : 0;
  const kj = p[0] * 4.184;
  const N = { energy: pts(kj,[335,670,1005,1340,1675,2010,2345,2680,3015,3350]), sugar: pts(p[3],[4.5,9,13.5,18,22.5,27,31,36,40,45]),
    satfat: pts(p[2],[1,2,3,4,5,6,7,8,9,10]), sodium: pts(p[5],[90,180,270,360,450,540,630,720,810,900]) };
  const P = { fvl: fvl > 80 ? 5 : fvl > 60 ? 2 : fvl > 40 ? 1 : 0, fibre: pts(p[4],[0.7,1.4,2.1,2.8,3.5]), protein: pts(p[1],[1.6,3.2,4.8,6.4,8]) };
  const nTot = N.energy + N.sugar + N.satfat + N.sodium;
  const protCounts = !(nTot >= 11 && P.fvl < 5);
  const score = nTot - P.fvl - P.fibre - (protCounts ? P.protein : 0);
  let grade = score <= -1 ? "A" : score <= 2 ? "B" : score <= 10 ? "C" : score <= 18 ? "D" : "E";
  if (d.bev) { // 2017 beverage rules (per 100 ml)
    const bp = (v,th) => v<=0 ? 0 : 1 + th.reduce((a,x)=>a+(v>x?1:0),0);
    N.energy = Math.min(10,bp(kj,[30,60,90,120,150,180,210,240,270])); N.sugar = Math.min(10,bp(p[3],[1.5,3,4.5,6,7.5,9,10.5,12,13.5]));
    P.fvl = fvl > 80 ? 10 : fvl > 60 ? 4 : fvl > 40 ? 2 : 0;
    const nT = N.energy + N.sugar + N.satfat + N.sodium, pc = !(nT >= 11 && P.fvl < 10);
    const sc = nT - P.fvl - P.fibre - (pc ? P.protein : 0);
    grade = sc <= 1 ? "B" : sc <= 5 ? "C" : sc <= 9 ? "D" : "E";
    return { per100:p, serv:s, kj, fvl, N, P, nTot:nT, protCounts:pc, score:sc, grade, bev:true };
  }
  return { per100:p, serv:s, kj, fvl, N, P, nTot, protCounts, score, grade };
}
/* Nutri-Score 2017: milk and drinks that are more than 80% milk are scored as foods; other drinks use the beverage table (computed here so every drink follows the same rule) */
const DAIRY_K=["milk","yogurt","cream","condensedmilk","icecream","milkpowder"];
DISHES.forEach(d => { if(!d.meals.includes("drinks")) return; let dairy=0, liq=0; d.ing.forEach(r=>{ if(r[0]==="#") return; for(const [k,g] of Object.entries(r[2]||{})){ if(DAIRY_K.includes(k)){ dairy+=g; liq+=g; } else if(k==="water"||k==="coconutmilk") liq+=g; } }); d.bev = !(liq && dairy/liq>0.8); d.dairyDrink = !d.bev; });
DISHES.forEach(d => { d.nut = nutrition(d); d.grade = d.nut.grade; d.tags = deriveTags(d); snackify(d); d.vars = (VARIANTS[d.id]||[]).map(v=>({name:v[0],note:v[1],url:v[2]||("https://www.google.com/search?q="+encodeURIComponent(v[0]+" recipe"))})); });

/* ================= pencil sketch engine ================= */
function mulberry(a){ return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hashStr(s){ let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
let CLIP = 0;
const f1 = n => n.toFixed(1);
class Pencil {
  constructor(seed){ this.r = mulberry(seed); this.o = []; this.defs = []; }
  j(a){ return (this.r() - .5) * 2 * a; }
  smooth(pts, closed){
    if (pts.length < 2) return "";
    const P = closed ? [pts[pts.length-1], ...pts, pts[0], pts[1]] : [pts[0], ...pts, pts[pts.length-1]];
    let d = `M${f1(P[1][0])},${f1(P[1][1])}`;
    for (let i = 1; i < P.length - 2; i++) {
      const [p0,p1,p2,p3] = [P[i-1],P[i],P[i+1],P[i+2]];
      d += `C${f1(p1[0]+(p2[0]-p0[0])/6)},${f1(p1[1]+(p2[1]-p0[1])/6)} ${f1(p2[0]-(p3[0]-p1[0])/6)},${f1(p2[1]-(p3[1]-p1[1])/6)} ${f1(p2[0])},${f1(p2[1])}`;
    }
    return closed ? d + "Z" : d;
  }
  add(s){ this.o.push(s); }
  stroke(d, cls="pl"){ this.add(`<path d="${d}" class="${cls}"/>`); }
  ellPts(cx,cy,rx,ry,a0=0,span=Math.PI*2,n=28,jit=.025){ const p=[]; for(let i=0;i<=n;i++){const a=a0+span*i/n,k=1+this.j(jit);p.push([cx+Math.cos(a)*rx*k,cy+Math.sin(a)*ry*k]);} return p; }
  ellipse(cx,cy,rx,ry,{passes=2,cls="pl",over=.1,jit=.025}={}){
    for(let i=0;i<passes;i++){ const a0=this.r()*Math.PI*2; this.stroke(this.smooth(this.ellPts(cx+this.j(.6),cy+this.j(.6),rx,ry,a0,Math.PI*2*(1+over*this.r()),30,jit),false),i?"pl2":cls); }
  }
  arc(cx,cy,rx,ry,a0,a1,{passes=2,cls="pl"}={}){ for(let i=0;i<passes;i++) this.stroke(this.smooth(this.ellPts(cx,cy,rx,ry,a0+this.j(.05),a1-a0+this.j(.05),18,.02),false),i?"pl2":cls); }
  line(pts,{passes=2,cls="pl",jit=.7}={}){
    for(let i=0;i<passes;i++){ const q=[]; for(let k=0;k<pts.length-1;k++){const [a,b]=[pts[k],pts[k+1]];const m=Math.max(2,Math.round(Math.hypot(b[0]-a[0],b[1]-a[1])/14));for(let t=0;t<m;t++){const u=t/m;q.push([a[0]+(b[0]-a[0])*u+this.j(jit),a[1]+(b[1]-a[1])*u+this.j(jit)]);}} const L=pts[pts.length-1]; q.push([L[0]+this.j(jit),L[1]+this.j(jit)]); this.stroke(this.smooth(q,false),i?"pl2":cls); }
  }
  closed(pts,{passes=2,cls="pl"}={}){ for(let i=0;i<passes;i++) this.stroke(this.smooth(pts.map(([x,y])=>[x+this.j(.8),y+this.j(.8)]),true),i?"pl2":cls); }
  wash(d,color,op=.42){ this.add(`<path d="${d}" class="wash" style="fill:${color};opacity:${op}"/>`); }
  washEll(cx,cy,rx,ry,color,op){ this.wash(this.smooth(this.ellPts(cx,cy,rx,ry,0,Math.PI*2,24,.04),true),color,op); }
  hatch(clipD,[x0,y0,x1,y1],gap=4,ang=-.6,cls="ht"){
    const id="hc"+(++CLIP); this.defs.push(`<clipPath id="${id}"><path d="${clipD}"/></clipPath>`);
    const L=[]; const w=x1-x0,h=y1-y0,dx=Math.cos(ang),dy=Math.sin(ang),diag=Math.hypot(w,h);
    for(let s=-diag;s<diag;s+=gap+this.j(gap*.25)){ const cx=(x0+x1)/2+(-dy)*s, cy=(y0+y1)/2+dx*s; L.push(`M${f1(cx-dx*diag)},${f1(cy-dy*diag)}L${f1(cx+dx*diag+this.j(1))},${f1(cy+dy*diag+this.j(1))}`); }
    this.add(`<g clip-path="url(#${id})"><path d="${L.join("")}" class="${cls}"/></g>`);
  }
  dots(n,fn,r=.9){ let s=""; for(let i=0;i<n;i++){const [x,y]=fn(i);s+=`<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r*(.6+this.r()*.8))}" class="dot"/>`;} this.add(s); }
  svg(){ return `<svg viewBox="0 0 240 170" class="sketch" aria-hidden="true"><defs>${this.defs.join("")}</defs><g filter="url(#pencil)">${this.o.join("")}</g></svg>`; }
}
const ellD = (P,cx,cy,rx,ry) => P.smooth(P.ellPts(cx,cy,rx,ry,0,Math.PI*2,24,.0),true);

function shadow(P,cx,cy,rx,ry){ const d=ellD(P,cx,cy,rx,ry); P.hatch(d,[cx-rx,cy-ry,cx+rx,cy+ry],3.2,-.5); }
function plate(P,cx,cy,rx,ry){ shadow(P,cx+6,cy+5,rx*.98,ry*.9); P.washEll(cx,cy,rx,ry,"var(--sketch-paper)",1); P.ellipse(cx,cy,rx,ry); P.ellipse(cx,cy-1,rx*.78,ry*.74,{passes:1,cls:"pl2"}); }
function steam(P,x,y){ for(let i=0;i<3;i++){ const x0=x+i*12+P.j(3); P.line([[x0,y],[x0+5,y-9],[x0-3,y-18],[x0+3,y-28]],{passes:1,cls:"pl2",jit:.4}); } }
function leaves(P,cx,cy,n,spread){ for(let i=0;i<n;i++){ const x=cx+P.j(spread),y=cy+P.j(spread*.35),a=P.r()*6.28; for(let k=0;k<3;k++){const b=a+k*2.1;P.closed([[x,y],[x+Math.cos(b-.4)*4,y+Math.sin(b-.4)*3],[x+Math.cos(b)*6,y+Math.sin(b)*4.5],[x+Math.cos(b+.4)*4,y+Math.sin(b+.4)*3]],{passes:1,cls:"pl2"});} } }
function blob(P,x,y,r,tint,op=.5){ const n=7,pts=[]; for(let i=0;i<n;i++){const a=i/n*6.28;const k=r*(.7+P.r()*.45);pts.push([x+Math.cos(a)*k,y+Math.sin(a)*k*.7]);} const d=P.smooth(pts,true); P.wash(d,tint,op); P.closed(pts,{passes:1}); P.hatch(d,[x-r,y-r,x+r,y+r],2.6,.8); }

function garnish(P,g,cx,cy,rx,ry,tint){
  const inE=()=>{for(;;){const x=P.j(1),y=P.j(1);if(x*x+y*y<.7)return[cx+x*rx,cy+y*ry];}};
  if(g==="pieces"||g==="roast"){ for(let i=0;i<5;i++){const[x,y]=inE();blob(P,x,y,9+P.r()*4,tint,g==="roast"?.75:.55);} leaves(P,cx+rx*.3,cy-ry*.2,2,10); }
  else if(g==="beans"){ for(let i=0;i<13;i++){const[x,y]=inE();const a=P.r()*3.14;P.closed(P.ellPts(x,y,4.6,2.6,a,6.28,10,.05).map(([px,py])=>{const dx=px-x,dy=py-y;return[x+dx*Math.cos(a)-dy*Math.sin(a),y+dx*Math.sin(a)+dy*Math.cos(a)]}),{passes:1});} leaves(P,cx,cy,1,6); }
  else if(g==="fish"){ for(const s of [-1,1]){const x=cx+s*rx*.38,y=cy+P.j(3);const pts=[[x-15,y-5],[x-4,y-9],[x+13,y-6],[x+16,y+3],[x+4,y+9],[x-13,y+6]];P.wash(P.smooth(pts,true),tint,.6);P.closed(pts);P.ellipse(x,y,3,2.2,{passes:1,cls:"pl2"});P.line([[x-12,y],[x+12,y+1]],{passes:1,cls:"pl2"});} leaves(P,cx,cy-ry*.4,2,8); }
  else if(g==="cream"){ const p=[];for(let a=0;a<12;a+=.35){const r=2+a*2.4;p.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r*.42]);} P.stroke(P.smooth(p,false),"pl"); P.stroke(P.smooth(p.map(([x,y])=>[x+1.5,y+.8]),false),"hl"); for(let i=0;i<3;i++){const[x,y]=inE();blob(P,x,y,7,tint,.7);} leaves(P,cx-rx*.4,cy,2,6); }
  else if(g==="veg"||g==="drumstick"){ for(let i=0;i<6;i++){const[x,y]=inE();const a=P.r()*3.14,l=g==="drumstick"?22:14;P.line([[x-Math.cos(a)*l/2,y-Math.sin(a)*l/2*.5],[x+Math.cos(a)*l/2,y+Math.sin(a)*l/2*.5]],{passes:2});if(g==="drumstick"){for(let k=-1;k<=1;k++)P.dots(1,()=>[x+Math.cos(a)*k*6,y+Math.sin(a)*k*3],1.1);}} leaves(P,cx,cy,3,rx*.6); }
  else if(g==="kheer"){ P.dots(18,()=>inE(),.8); for(let i=0;i<5;i++){const[x,y]=inE();P.arc(x,y,5,3,.2,3,{passes:1});} }
}
function katori(P,cx,cy,w,d){
  const rx=w/2, ry=w*.17, h=w*.4;
  shadow(P,cx+8,cy+h+4,rx*.85,ry*.7);
  const body=[[cx-rx,cy],[cx-rx*.92,cy+h*.55],[cx-rx*.55,cy+h*.93],[cx,cy+h],[cx+rx*.55,cy+h*.93],[cx+rx*.92,cy+h*.55],[cx+rx,cy]];
  const bd=P.smooth(body,false)+`L${cx-rx},${cy}Z`;
  P.wash(bd,"var(--sketch-paper)",1);
  P.hatch(P.smooth([[cx+rx*.1,cy+ry],...body.slice(3)],false)+"Z",[cx,cy,cx+rx,cy+h],3,-.9);
  P.line(body);
  P.ellipse(cx,cy+h+1,rx*.3,ry*.28,{passes:1,cls:"pl2"});
  P.washEll(cx,cy+2,rx*.9,ry*.78,d.tint,.6);
  P.ellipse(cx,cy,rx,ry); P.ellipse(cx,cy+2,rx*.9,ry*.76,{passes:1,cls:"pl2"});
  garnish(P,d.garnish||"pieces",cx,cy+2,rx*.82,ry*.66,d.tint);
}
function stack(P,cx,cy,d){
  plate(P,cx,cy+18,92,30);
  for(let i=3;i>=0;i--){const y=cy+10-i*6,x=cx+P.j(4);P.washEll(x,y,62,20,d.tint,.35+.1*(3-i));P.ellipse(x,y,62,20,{passes:i?1:2});}
  const y=cy-8; P.dots(22,()=>[cx+P.j(48),y+P.j(12)],1.4);
  P.arc(cx,y,62,20,.1,3.0,{passes:1});
  if(d.side==="butter"){ const bx=cx+8,by=y-6; P.closed([[bx-9,by],[bx+9,by-3],[bx+11,by+5],[bx-7,by+8]]); P.wash(P.smooth([[bx-9,by],[bx+9,by-3],[bx+11,by+5],[bx-7,by+8]],true),"#f3e3a0",.7); }
  if(d.side==="bowl"||d.side==="ghee"){ katori(P,cx+70,cy-14,48,{tint:d.side==="ghee"?"#f2d27a":"#557a2e",garnish:d.side==="ghee"?"kheer":"veg"}); }
}
function dosa(P,cx,cy,d){
  plate(P,cx,cy+16,104,34);
  const top=[[34,cy-4],[80,cy-14],[150,cy-16],[206,cy-6]], bot=[[38,cy+14],[90,cy+12],[150,cy+8],[208,cy+2]];
  const sh=P.smooth([...top,...bot.reverse()],true); bot.reverse();
  P.wash(sh,d.tint,.5); P.line(top); P.line(bot);
  P.ellipse(36,cy+5,6,10,{passes:2}); P.line([[206,cy-6],[214,cy-2],[208,cy+2]],{passes:1});
  P.hatch(sh,[30,cy-20,215,cy+16],5,1.2);
  for(let i=0;i<12;i++){const x=50+i*13+P.j(3);P.arc(x,cy+P.j(3),4,3,3.4,5.6,{passes:1});}
  if(d.garnish==="green"){ P.dots(14,()=>[60+P.r()*130,cy-6+P.j(6)],1.2); }
  else { blob(P,40,cy+4,6,"#e1b640",.8); }
  katori(P,64,cy+30,34,{tint:"#f4f0e6",garnish:"kheer"}); katori(P,104,cy+34,34,{tint:"#d0702b",garnish:"veg"});
}
function puffed(P,cx,cy,d){
  plate(P,cx,cy+22,104,32);
  const bx=cx-36,by=cy-4; shadow(P,bx+6,by+28,46,9);
  P.washEll(bx,by,50,36,d.tint,.4); P.ellipse(bx,by,50,36); P.arc(bx-6,by-6,36,22,3.6,4.6,{passes:1,cls:"hl"});
  P.hatch(ellD(P,bx+10,by+8,44,30),[bx-50,by-36,bx+50,by+36],3.5,-.6);
  P.dots(14,()=>[bx+P.j(36),by+P.j(22)],1.3);
  katori(P,cx+50,cy-6,62,{tint:"#9b5a28",garnish:"beans"});
  leaves(P,cx+20,cy+30,2,6);
}
function handi(P,cx,cy,d){
  shadow(P,cx+10,cy+52,70,12);
  const body=[[cx-50,cy-8],[cx-66,cy+18],[cx-50,cy+46],[cx,cy+54],[cx+50,cy+46],[cx+66,cy+18],[cx+50,cy-8]];
  const bd=P.smooth(body,false)+"Z"; P.wash(bd,d.garnish==="veg"?"#b8734a":"#9a9a92",.35); P.hatch(P.smooth(body.slice(3),false)+`L${cx},${cy}Z`,[cx,cy-8,cx+66,cy+54],3.2,-.9); P.line(body);
  P.arc(cx,cy+18,64,10,.2,2.9,{passes:1,cls:"pl2"});
  P.ellipse(cx,cy-10,52,10);
  const mound=[]; for(let i=0;i<=12;i++){const x=cx-48+i*8;mound.push([x,cy-12-Math.sin(i/12*Math.PI)*24+P.j(2)]);}
  P.wash(P.smooth([...mound,[cx+48,cy-8],[cx-48,cy-8]],true),d.tint,.45); P.line(mound,{passes:1});
  if(d.garnish==="veg"){ for(let i=0;i<7;i++)blob(P,cx-36+i*12,cy-18-Math.sin((i+.5)/7*Math.PI)*16,6,i%2?"#6c8b3a":"#a8542f",.6); }
  else { for(let i=0;i<70;i++){const u=P.r();const x=cx-44+u*88;const top=cy-12-Math.sin(u*Math.PI)*22;const y=top+P.r()*(cy-10-top);const a=P.r()*3.14;P.stroke(`M${f1(x)},${f1(y)}l${f1(Math.cos(a)*3.4)},${f1(Math.sin(a)*1.6)}`,"pl2");} for(let i=0;i<4;i++)P.washEll(cx-30+P.r()*60,cy-22+P.r()*10,7,3,"#e08a1e",.6); leaves(P,cx+10,cy-30,3,14); }
  steam(P,cx-14,cy-40);
}
function balls(P,cx,cy,d){
  const rx=70,ry=20,h=30; shadow(P,cx+8,cy+h+6,rx*.85,12);
  const body=[[cx-rx,cy],[cx-rx*.85,cy+h*.7],[cx,cy+h],[cx+rx*.85,cy+h*.7],[cx+rx,cy]];
  P.wash(P.smooth(body,false)+"Z","var(--sketch-paper)",1); P.line(body); P.hatch(P.smooth(body.slice(2),false)+`L${cx},${cy}Z`,[cx,cy,cx+rx,cy+h],3,-.9);
  P.washEll(cx,cy+2,rx*.9,ry*.8,"#e9d9a8",.45); P.ellipse(cx,cy,rx,ry);
  [[-34,-6],[0,-12],[34,-6],[-16,6],[18,6]].forEach(([dx,dy])=>{const x=cx+dx,y=cy+dy;P.washEll(x,y-6,17,15,d.tint,.9);P.ellipse(x,y-6,17,15);P.arc(x-5,y-11,8,6,3.5,4.6,{passes:1,cls:"pl2"});P.hatch(ellD(P,x+5,y-2,14,12),[x-17,y-21,x+17,y+9],2.6,-.6);});
  for(let i=0;i<3;i++)P.arc(cx,cy+4,rx*.6+i*6,ry*.4,.3,2.8,{passes:1,cls:"pl2"});
}
function squares(P,cx,cy,d){
  plate(P,cx,cy+18,100,32);
  const cubes=[[-46,4],[0,-6],[46,4],[-22,18],[24,20]].slice(0,d.garnish==="glassy"?4:5);
  cubes.forEach(([dx,dy],i)=>{
    const x=cx+dx,y=cy+dy,s=d.garnish==="seeds"?17:15,hh=d.garnish==="seeds"?12:14;
    const T=[[x,y-s*.5],[x+s,y],[x,y+s*.5],[x-s,y]], Lf=[[x-s,y],[x,y+s*.5],[x,y+s*.5+hh],[x-s,y+hh]], R=[[x,y+s*.5],[x+s,y],[x+s,y+hh],[x,y+s*.5+hh]];
    const pd=a=>"M"+a.map(p=>p.map(f1).join(",")).join("L")+"Z";
    P.wash(pd(T),d.tint,.65); P.wash(pd(Lf),d.tint,.5); P.wash(pd(R),d.tint,.4);
    P.hatch(pd(R),[x,y-s,x+s,y+hh+s],2.4,-1.1); if(d.garnish!=="glassy")P.hatch(pd(Lf),[x-s,y,x,y+hh+s],4,.9);
    [T,Lf,R].forEach(a=>P.closed(a.map(p=>p),{passes:1}));
    P.line([T[3],T[0],T[1]],{passes:1});
    if(d.garnish==="porous"){P.dots(6,()=>[x-s*.6+P.r()*s*.55,y+3+P.r()*hh],1.1);P.dots(4,()=>[x+P.j(s*.5),y+P.j(s*.18)],1);}
    if(d.garnish==="seeds"){P.dots(5,()=>[x+P.j(s*.55),y+P.j(s*.2)],.9);}
    if(d.garnish==="glassy"){P.line([[x-s*.4,y-1],[x+s*.1,y-s*.3]],{passes:1,cls:"hl"});}
  });
  if(d.garnish==="seeds"){ leaves(P,cx,cy-8,4,40); P.line([[cx+60,cy-14],[cx+80,cy-22]],{passes:2}); }
}
function bun(P,cx,cy,d){
  plate(P,cx,cy+22,96,30);
  const x=cx-6,y=cy+4;
  P.washEll(x,y+10,58,14,"#d9a861",.5); P.ellipse(x,y+10,58,14);
  P.washEll(x+2,y-4,46,16,"#e3b443",.7); P.arc(x+2,y-4,46,16,0,3.14,{passes:2}); P.dots(12,()=>[x+P.j(36),y-4+P.j(6)],1.3);
  const top=[[x-58,y-6],[x-44,y-30],[x,y-38],[x+44,y-30],[x+58,y-6]]; P.wash(P.smooth(top,false)+"Z","#d9a861",.55); P.line(top); P.line([[x-58,y-6],[x+58,y-6]],{passes:1});
  P.hatch(P.smooth(top.slice(2),false)+`L${x},${y-6}Z`,[x,y-40,x+58,y-6],3.4,-.8);
  P.dots(10,()=>[x+P.j(30),y-26+P.j(6)],.9);
  P.line([[cx+60,cy+8],[cx+80,cy-2],[cx+92,cy-10]],{passes:2}); P.washEll(cx+78,cy-2,14,3.5,"#4f7a2a",.6);
  steam(P,cx-16,cy-46);
}
function bunbowl(P,cx,cy,d){
  plate(P,cx,cy+22,104,32);
  katori(P,cx-34,cy-12,84,d);
  for(let i=0;i<2;i++){const x=cx+50+i*8,y=cy+16-i*14;P.washEll(x,y,28,12,"#d9a861",.6);P.ellipse(x,y,28,12);P.arc(x,y-3,24,9,3.4,6,{passes:1,cls:"pl2"});P.hatch(ellD(P,x+6,y+3,24,10),[x-28,y-12,x+28,y+12],3,-.7);}
  leaves(P,cx-40,cy-10,1,4); steam(P,cx-50,cy-36);
}
function steamer(P,cx,cy,d){
  shadow(P,cx+8,cy+42,76,12);
  const rx=74,ry=22,h=34;
  P.wash(`M${cx-rx},${cy}L${cx-rx},${cy+h}A${rx},${ry} 0 0 0 ${cx+rx},${cy+h}L${cx+rx},${cy}Z`,"#c9a66b",.35);
  P.line([[cx-rx,cy],[cx-rx,cy+h]]); P.line([[cx+rx,cy],[cx+rx,cy+h]]); P.arc(cx,cy+h,rx,ry,0,3.14);
  for(let i=1;i<12;i++){const x=cx-rx+i*rx*2/12;const yb=cy+h+Math.sqrt(Math.max(0,1-((x-cx)/rx)**2))*ry;P.line([[x,cy+Math.sqrt(Math.max(0,1-((x-cx)/rx)**2))*ry],[x,yb]],{passes:1,cls:"pl2"});}
  P.washEll(cx,cy,rx,ry,"#f4eee0",.8); P.ellipse(cx,cy,rx,ry); P.ellipse(cx,cy,rx*.9,ry*.85,{passes:1,cls:"pl2"});
  [[-38,-2],[-8,-8],[24,-6],[50,2],[-22,10],[14,10]].forEach(([dx,dy])=>{const x=cx+dx,y=cy+dy-6;const p=[[x-13,y+6],[x-11,y-2],[x-4,y-9],[x,y-12],[x+4,y-9],[x+11,y-2],[x+13,y+6],[x,y+9]];P.wash(P.smooth(p,true),d.tint,.9);P.closed(p,{passes:1});for(let k=-2;k<=2;k++)P.line([[x+k*3.2,y-8+Math.abs(k)],[x+k*2,y-1]],{passes:1,cls:"pl2"});});
  katori(P,cx+92,cy+34,30,{tint:"#c43a1c",garnish:"kheer"});
  steam(P,cx-14,cy-34);
}
function kebab(P,cx,cy,d){
  plate(P,cx,cy+14,100,34);
  [[-40,0],[6,-10],[44,6],[-6,18]].forEach(([dx,dy])=>{const x=cx+dx,y=cy+dy;P.washEll(x,y+3,24,10,"#5a2f17",.45);P.ellipse(x,y+3,24,10,{passes:1});P.washEll(x,y,24,10,d.tint,.75);P.ellipse(x,y,24,10);P.hatch(ellD(P,x,y,24,10),[x-24,y-10,x+24,y+10],2.4,.4);P.dots(5,()=>[x+P.j(14),y+P.j(4)],1);});
  for(let i=0;i<3;i++)P.ellipse(cx+64+i*3,cy+20-i*4,11-i*2,5-i,{passes:1});
  const lx=cx-70,ly=cy+28; P.wash(`M${lx-12},${ly}A12,8 0 0 0 ${lx+12},${ly}Z`,"#e9d550",.8); P.arc(lx,ly,12,8,0,3.14); P.line([[lx-12,ly],[lx+12,ly]],{passes:1}); for(let k=-1;k<=1;k++)P.line([[lx,ly],[lx+k*8,ly+6]],{passes:1,cls:"pl2"});
  leaves(P,cx+40,cy-12,3,8);
}
function rounds(P,cx,cy,d){
  plate(P,cx,cy+18,100,32);
  const kach=d.garnish==="kachori";
  const pos=kach?[[-40,4],[6,-6],[0,18]]:[[-48,6],[-14,-4],[18,8],[-24,20]];
  pos.forEach(([dx,dy])=>{const x=cx+dx,y=cy+dy;
    if(kach){P.washEll(x,y,30,16,d.tint,.6);P.ellipse(x,y,30,16);P.arc(x,y+3,30,16,0,3.14,{passes:1,cls:"pl2"});P.dots(10,()=>[x+P.j(20),y+P.j(8)],1.4);P.hatch(ellD(P,x+8,y+5,24,12),[x-30,y-16,x+30,y+16],3,-.6);}
    else{P.washEll(x,y,18,16,d.tint,.65);P.ellipse(x,y,18,16);P.line([[x-8,y-9],[x-2,y-5],[x+4,y-10],[x+9,y-6]],{passes:1});P.hatch(ellD(P,x+5,y+5,15,12),[x-18,y-16,x+18,y+16],2.6,-.6);P.dots(4,()=>[x+P.j(10),y+P.j(8)],1);}
  });
  katori(P,cx+66,cy-14,50,{tint:kach?"#7a3a1a":d.id==="dal-baati"?"#d9a63a":"#8a6a4a",garnish:kach?"kheer":"veg"});
  if(!kach&&d.id==="dal-baati")P.washEll(cx-20,cy+2,40,8,"#f0d071",.35);
}
function appam(P,cx,cy,d){
  plate(P,cx-10,cy+18,96,32);
  const x=cx-20,y=cy+6; const edge=[]; for(let i=0;i<=40;i++){const a=i/40*6.28;const r=1+Math.sin(a*9)*.05+P.j(.03);edge.push([x+Math.cos(a)*68*r,y+Math.sin(a)*26*r]);}
  P.wash(P.smooth(edge,true),d.tint,.55); P.closed(edge,{passes:2});
  for(let i=0;i<34;i++){const a=P.r()*6.28,r=.55+P.r()*.38;P.ellipse(x+Math.cos(a)*68*r,y+Math.sin(a)*26*r,2+P.r()*2,1.2,{passes:1,cls:"pl2"});}
  P.washEll(x,y,30,11,"#f3ead0",.9); P.ellipse(x,y,30,11); P.dots(26,()=>[x+P.j(24),y+P.j(8)],.8);
  P.hatch(P.smooth(edge.slice(5,22),false)+`L${x},${y}Z`,[x-70,y-28,x+70,y+28],3.6,-.5);
  katori(P,cx+76,cy-8,46,{tint:"#efe6cf",garnish:"veg"});
}
function cake(P,cx,cy,d){
  const lf=[[cx-104,cy+22],[cx-50,cy-2],[cx+40,cy-4],[cx+104,cy+18],[cx+40,cy+44],[cx-50,cy+44]];
  P.wash(P.smooth(lf,true),"#6b8f3a",.35); P.closed(lf); P.line([[cx-100,cy+22],[cx+100,cy+20]],{passes:1,cls:"pl2"});
  for(let i=-3;i<=3;i++)P.line([[cx+i*26,cy+21],[cx+i*26+14,cy+6]],{passes:1,cls:"pl2"});
  const x=cx-4,y=cy+4,s=46,h=26;
  const T=[[x-s,y],[x+s*.2,y-28],[x+s,y+4]], Fr=[[x-s,y],[x+s,y+4],[x+s,y+4+h],[x-s,y+h]], Sd=[[x+s*.2,y-28],[x+s,y+4],[x+s,y+4],[x+s*.2,y-28]];
  const pd=a=>"M"+a.map(p=>p.map(f1).join(",")).join("L")+"Z";
  P.wash(pd(Fr),"#e7cf98",.85); P.wash(pd(T),d.tint,.85);
  P.hatch(pd(T),[x-s,y-30,x+s,y+6],1.8,.3); P.hatch(pd(T),[x-s,y-30,x+s,y+6],2.4,-.9);
  P.closed(T,{passes:2}); P.closed(Fr,{passes:2});
  P.line([[x-s,y+5],[x+s,y+9]],{passes:1,cls:"pl2"});
  P.dots(10,()=>[x+P.j(s*.8),y+12+P.r()*(h-14)],1.6);
  P.hatch(pd([[x-s,y],[x+s,y+4],[x+s,y+10],[x-s,y+6]]),[x-s,y,x+s,y+10],1.6,-.2);
}
function leafmound(P,cx,cy,d){
  const lf=[[cx-110,cy+14],[cx-60,cy-12],[cx+50,cy-14],[cx+112,cy+4],[cx+60,cy+40],[cx-60,cy+42]];
  P.wash(P.smooth(lf,true),"#4f8a3a",.33); P.closed(lf); P.line([[cx-108,cy+14],[cx+110,cy+6]],{passes:1});
  for(let i=-4;i<=4;i++)P.line([[cx+i*24,cy+11-i*.4],[cx+i*24+16,cy-6]],{passes:1,cls:"pl2"}),P.line([[cx+i*24,cy+11-i*.4],[cx+i*24+12,cy+34]],{passes:1,cls:"pl2"});
  const m=[]; for(let i=0;i<=10;i++){const u=i/10;m.push([cx-50+u*100,cy+16-Math.sin(u*Math.PI)*30+P.j(2)]);}
  P.wash(P.smooth([...m,[cx+50,cy+18],[cx-50,cy+18]],true),d.tint,.7); P.line(m);
  P.hatch(P.smooth([...m.slice(5),[cx+50,cy+18],[cx,cy+18]],true),[cx,cy-16,cx+50,cy+18],2.8,-.7);
  if(d.garnish==="veg"){ for(let i=0;i<7;i++){const x=cx-34+i*11,y=cy+4-Math.sin((i+.5)/7*Math.PI)*16;P.line([[x,y],[x+P.j(6),y-14]],{passes:2});} leaves(P,cx,cy-6,3,26); }
  else if(d.garnish==="pongal"){ P.dots(16,()=>[cx+P.j(36),cy+2+P.j(8)],1.3); for(let i=0;i<4;i++){const x=cx-20+i*13,y=cy-6+P.j(4);P.arc(x,y,5,3,3.2,6,{passes:1});} katori(P,cx+84,cy-16,36,{tint:"#c4642c",garnish:"veg"}); }
  else { P.dots(20,()=>[cx+P.j(36),cy+4+P.j(8)],1.6); for(let i=0;i<3;i++){const x=cx-16+i*14,y=cy-8;P.arc(x,y,5,3,3.2,6,{passes:1});} }
  if(!d.meals.includes("sweets"))steam(P,cx-12,cy-26);
}
function mound(P,cx,cy,d){
  plate(P,cx,cy+18,100,32);
  const m=[]; for(let i=0;i<=12;i++){const u=i/12;m.push([cx-60+u*120,cy+18-Math.sin(u*Math.PI)*34+P.j(2)]);}
  P.wash(P.smooth([...m,[cx+60,cy+20],[cx-60,cy+20]],true),d.tint,.55); P.line(m);
  for(let i=0;i<60;i++){const u=P.r();const x=cx-54+u*108;const top=cy+18-Math.sin(u*Math.PI)*32;const y=top+P.r()*(cy+18-top);P.stroke(`M${f1(x)},${f1(y)}q2,-2 4,0`,"pl2");}
  for(let i=0;i<10;i++){const x=cx-40+P.r()*80,y=cy-4+P.j(10);P.stroke(`M${f1(x)},${f1(y)}c3,-3 6,3 9,0 3,-3 6,3 9,0`,"pl");}
  leaves(P,cx+10,cy-10,3,22); P.dots(6,()=>[cx+P.j(40),cy+P.j(10)],1.8);
  const lx=cx+76,ly=cy+20; P.wash(`M${lx-12},${ly}A12,8 0 0 0 ${lx+12},${ly}Z`,"#e9d550",.8); P.arc(lx,ly,12,8,0,3.14); P.line([[lx-12,ly],[lx+12,ly]],{passes:1});
  steam(P,cx-14,cy-30);
}
function triangles(P,cx,cy,d){
  plate(P,cx,cy+18,100,32);
  [[-40,4,-.25],[10,-6,.2],[46,10,-.1],[-6,18,.05]].forEach(([dx,dy,a])=>{const x=cx+dx,y=cy+dy;const T=[[-22,12],[0,-20],[22,12]].map(([u,v])=>[x+u*Math.cos(a)-v*Math.sin(a),y+u*Math.sin(a)+v*Math.cos(a)]);
    P.wash(P.smooth(T,true),d.tint,.75);P.closed(T);P.hatch(P.smooth(T,true),[x-24,y-22,x+24,y+14],2.6,-.6);P.dots(6,()=>[x+P.j(10),y+P.j(6)],1.1);P.line([T[1],[(T[0][0]+T[2][0])/2,(T[0][1]+T[2][1])/2]],{passes:1,cls:"pl2"});});
  katori(P,cx+80,cy-18,36,{tint:"#4f8a3a",garnish:"kheer"});
}
function spirals(P,cx,cy,d){
  plate(P,cx,cy+16,100,32);
  [[-42,2],[2,-8],[44,6],[-6,18]].forEach(([dx,dy])=>{const x=cx+dx,y=cy+dy;const p=[];for(let a=0;a<14;a+=.35){const r=1+a*1.45;p.push([x+Math.cos(a)*r,y+Math.sin(a)*r*.55]);}
    const d1=P.smooth(p,false);P.add(`<path d="${d1}" style="fill:none;stroke:${d.tint};stroke-width:5;stroke-linecap:round;opacity:.75"/>`);P.stroke(d1,"pl");P.stroke(P.smooth(p.map(([a,b])=>[a+1,b-1.5]),false),"hl");});
  P.dots(10,()=>[cx+P.j(60),cy+P.j(14)],.8);
}
function modakSk(P,cx,cy,d){
  plate(P,cx,cy+20,100,32);
  [[-44,6],[0,-4],[44,8],[-20,20],[22,22]].forEach(([dx,dy])=>{const x=cx+dx,y=cy+dy;const s=[[x-15,y+8],[x-14,y-2],[x-7,y-12],[x,y-22],[x+7,y-12],[x+14,y-2],[x+15,y+8],[x,y+12]];
    P.wash(P.smooth(s,true),d.tint,1);P.closed(s);for(let k=-2;k<=2;k++)P.line([[x+k*3,y-18+Math.abs(k)*2],[x+k*5.5,y+8]],{passes:1,cls:"pl2"});P.hatch(P.smooth(s,true),[x,y-22,x+16,y+12],2.6,-.9);});
  blob(P,cx+70,cy-20,8,"#f0d071",.6);
}
function glassSk(P,cx,cy,d){
  const g=d.glass||"glass"; const t=d.tint;
  P.washEll(cx+18,cy+58,62,10,"var(--sketch-paper)",1); shadow(P,cx+22,cy+60,58,8);
  if(g==="kulhar"){ const L=[[cx-30,cy-30],[cx-24,cy+40],[cx+24,cy+40],[cx+30,cy-30]]; P.wash(P.smooth([...L],true),"#b4643c",.55); P.line(L); P.ellipse(cx,cy-30,30,7); P.washEll(cx,cy-29,27,5.5,t,.95); P.hatch(P.smooth([[cx,cy-30],[cx+30,cy-30],[cx+24,cy+40],[cx,cy+40]],true),[cx,cy-30,cx+30,cy+40],3,-.9); P.ellipse(cx,cy+40,24,5,{passes:1,cls:"pl2"}); }
  else if(g==="tumbler"){ const T=[[cx-22,cy-34],[cx-18,cy+30],[cx+18,cy+30],[cx+22,cy-34]]; P.ellipse(cx,cy+36,42,10); P.ellipse(cx,cy+32,30,6,{passes:1,cls:"pl2"}); P.wash(P.smooth(T,true),"#c9ced2",.7); P.line(T); P.ellipse(cx,cy-34,22,5); P.washEll(cx,cy-33,19,4,t,1); P.dots(10,()=>[cx+P.j(14),cy-33+P.j(2)],.8); P.hatch(P.smooth([[cx+4,cy-34],[cx+22,cy-34],[cx+18,cy+30],[cx+4,cy+30]],true),[cx,cy-34,cx+22,cy+30],2.6,-1.2); }
  else { const steel=g==="steel"; const T=[[cx-26,cy-38],[cx-21,cy+40],[cx+21,cy+40],[cx+26,cy-38]]; const lq=[[cx-25,cy-20],[cx-21,cy+40],[cx+21,cy+40],[cx+25,cy-20]];
    P.wash(P.smooth(lq,true),t,steel?.2:.75); if(steel) P.wash(P.smooth(T,true),"#c9ced2",.6); P.line(T); P.ellipse(cx,cy-38,26,6); P.ellipse(cx,cy-20,25,5,{passes:1,cls:"pl2"}); P.ellipse(cx,cy+40,21,5,{passes:1,cls:"pl2"});
    P.line([[cx-18,cy-30],[cx-15,cy+30]],{passes:1,cls:"hl"}); if(steel) P.hatch(P.smooth([[cx+6,cy-38],[cx+26,cy-38],[cx+21,cy+40],[cx+6,cy+40]],true),[cx,cy-38,cx+26,cy+40],2.6,-1.2);
    if(["sol-kadhi","shikanji","aam-panna","chaas"].includes(d.id)) leaves(P,cx+8,cy-40,2,6); }
  if(["masala-chai","filter-coffee"].includes(d.id)) steam(P,cx-12,cy-50);
  if(d.id==="masala-chai"){ P.ellipse(cx+56,cy+30,8,5,{passes:1}); P.ellipse(cx+70,cy+34,6,4,{passes:1}); }
  if(d.id==="lassi"||d.id==="thandai"){ P.dots(8,()=>[cx+P.j(18),cy-28+P.j(3)],1.2); }
}
const SKETCH_CACHE = {};
function sketch(d, big){
  if (IMAGES[d.id]) { const f=IMAGES[d.id]; const src=big?f:f.replace("images/","images/t/"); return `<img src="${esc(src)}" alt="${esc(d.name)}" loading="lazy" decoding="async">`; }
  if (SKETCH_CACHE[d.id]) { const m = {}; return SKETCH_CACHE[d.id].replace(/hc(\d+)/g, (_, n) => "hc" + (m[n] ||= ++CLIP)); }
  const P = new Pencil(hashStr(d.id)); const cx = 120, cy = 82;
  const fn = {katori:(P,d)=>{ katori(P,cx,cy-24,140,d); if(!d.meals.includes("sweets"))steam(P,cx-14,cy-52); }, stack:(P,d)=>stack(P,cx-14,cy+6,d), dosa:(P,d)=>dosa(P,cx,cy,d), puffed:(P,d)=>puffed(P,cx,cy,d),
    handi:(P,d)=>handi(P,cx,cy+16,d), balls:(P,d)=>balls(P,cx,cy+8,d), squares:(P,d)=>squares(P,cx,cy+6,d), bun:(P,d)=>bun(P,cx,cy+8,d), bunbowl:(P,d)=>bunbowl(P,cx,cy+6,d),
    steamer:(P,d)=>steamer(P,cx-14,cy+4,d), kebab:(P,d)=>kebab(P,cx,cy+8,d), rounds:(P,d)=>rounds(P,cx-10,cy+10,d), appam:(P,d)=>appam(P,cx,cy+6,d), cake:(P,d)=>cake(P,cx,cy+8,d),
    leafmound:(P,d)=>leafmound(P,cx,cy+14,d), mound:(P,d)=>mound(P,cx-10,cy+6,d), triangles:(P,d)=>triangles(P,cx-10,cy+8,d), spirals:(P,d)=>spirals(P,cx,cy+6,d), modak:(P,d)=>modakSk(P,cx-8,cy+6,d), glass:(P,d)=>glassSk(P,cx-10,cy,d)}[d.sketch];
  fn(P, d);
  return (SKETCH_CACHE[d.id] = P.svg());
}

/* ================= small UI atoms ================= */
const fs = d => `<svg class="fs" role="img" aria-label="${d.diet==="veg"?"Vegetarian":"Non-vegetarian"}"><use href="#fs-${d.diet}"/></svg>`;
const nsb = d => `<span class="nsb ns-${d.grade}" title="Nutri-Score ${d.grade}">${d.grade}</span>`;
const arrow = v => v < 0 ? "↓" : v > 0 ? "↑" : "=";
const dmini = d => `<span class="dmini" title="Dosha effect: ↓ pacifies, ↑ aggravates">${["v","p","k"].map(k=>`<span class="${d.ay[k]<0?"dn":d.ay[k]>0?"up":""}">${k.toUpperCase()}${arrow(d.ay[k])}</span>`).join("")}</span>`;
const status = id => store.pass[id] || {};
function toast(msg){ const t=$("#toast"); t.textContent=msg; t.classList.add("on"); clearTimeout(toast.t); toast.t=setTimeout(()=>t.classList.remove("on"),2200); }

/* ================= filters ================= */
const F = { q:"", diet:"all", meals:new Set(), regions:new Set(), grades:new Set(), dosha:new Set(), state:null, kit:"", fest:"", trail:"", concept:"", tags:new Set(), snack:new Set() };
function renderFilters(){
  const chip=(attr,val,label,on,extra="")=>`<button class="chip ${extra}" data-${attr}="${val}" aria-pressed="${on}">${label}</button>`;
  const nsStyle=g=>F.grades.has(g)?` style="background:${({A:"#038141",B:"#85bb2f",C:"#c79f00",D:"#ee8100",E:"#e63e11"})[g]}"`:"";
  $("#filters").innerHTML = `
   <div class="fgroup"><span class="flabel">Diet</span>${chip("diet","all","All",F.diet==="all")}${chip("diet","veg",`<svg class="fs"><use href="#fs-veg"/></svg>Veg`,F.diet==="veg")}${chip("diet","nonveg",`<svg class="fs"><use href="#fs-nonveg"/></svg>Non-veg`,F.diet==="nonveg")}${Object.keys(TAGDEF).map(t=>`<button class="chip dtag" data-tag="${t}" aria-pressed="${F.tags.has(t)}" title="${esc(TAGDEF[t][1])}">${TAGDEF[t][0]} <small>${DISHES.filter(d=>d.tags.includes(t)).length}</small></button>`).join("")}</div>
   <span class="vsep"></span>
   <div class="fgroup"><span class="flabel">Meal</span>${MEALS.map(m=>chip("meal",m,cap(m),F.meals.has(m))).join("")}</div>
   ${F.meals.has("snack")?`<div class="fgroup subsnack"><span class="flabel">Snack type</span>${Object.entries(SNACKDEF).map(([k,[l,t]])=>`<button class="chip" data-snack="${k}" aria-pressed="${F.snack.has(k)}" title="${esc(t)}">${l} <small>${DISHES.filter(d=>d.snack===k).length}</small></button>`).join("")}</div>`:""}
   <span class="vsep"></span>
   <div class="fgroup"><span class="flabel">Region</span>${REGIONS.map(r=>chip("region",r,r,F.regions.has(r))).join("")}</div>
   <span class="vsep"></span>
   <div class="fgroup"><span class="flabel">Nutri-Score</span>${"ABCDE".split("").map(g=>`<button class="chip ns" data-grade="${g}" aria-pressed="${F.grades.has(g)}"${nsStyle(g)}>${g}</button>`).join("")}</div>
   <span class="vsep"></span>
   <div class="fgroup"><span class="flabel">Calms</span>${["v","p","k"].map(k=>chip("dosha",k,DOSHA[k][0],F.dosha.has(k))).join("")}</div>
   <span class="vsep"></span>
   <div class="fgroup"><label class="flabel" for="fKit">Kitchen</label><select class="fsel ${F.kit?"on":""}" id="fKit"><option value="">All</option>${Object.entries(KITCHENS).filter(([k])=>DISHES.some(d=>d.k.includes(k))).map(([k,v])=>`<option value="${k}" ${F.kit===k?"selected":""}>${v} (${DISHES.filter(d=>d.k.includes(k)).length})</option>`).join("")}</select></div>
   <div class="fgroup"><label class="flabel" for="fFest">Festival</label><select class="fsel ${F.fest?"on":""}" id="fFest"><option value="">All</option>${[...new Set(DISHES.flatMap(d=>d.f))].sort().map(f=>`<option ${F.fest===f?"selected":""}>${esc(f)}</option>`).join("")}</select></div>
   ${F.state?`<span class="vsep"></span><button class="chip" data-unstate="1" aria-pressed="true">${esc(F.state)} ✕</button>`:""}
   ${F.concept?`<span class="vsep"></span><button class="chip" data-unconcept="1" aria-pressed="true">⚗ ${esc(CHEME[F.concept][0])} ✕</button>`:""}
   ${active()?`<button class="chip clear" data-clear="1">Clear all</button>`:""}`;
}
const active = () => F.q || F.diet!=="all" || F.meals.size || F.regions.size || F.grades.size || F.dosha.size || F.state || F.kit || F.fest || F.concept || F.tags.size || F.snack.size;
function matches(d){
  if (F.diet!=="all" && d.diet!==F.diet) return false;
  if (F.meals.size && !d.meals.some(m=>F.meals.has(m))) return false;
  if (F.regions.size && !F.regions.has(d.region)) return false;
  if (F.grades.size && !F.grades.has(d.grade)) return false;
  if (F.dosha.size && ![...F.dosha].every(k=>d.ay[k]<0)) return false;
  if (F.state && d.state!==F.state) return false;
  if (F.kit && !d.k.includes(F.kit)) return false;
  if (F.fest && !d.f.includes(F.fest)) return false;
  if (F.concept && !d.cheme.includes(F.concept)) return false;
  if (F.tags.size && ![...F.tags].every(t=>d.tags.includes(t))) return false;
  if (F.snack.size && !F.snack.has(d.snack)) return false;
  if (F.trail && !trailById[F.trail].stops.includes(d.id)) return false;
  if (F.q){ const ws=qWords(F.q); const hay=(d.name+" "+d.aka+" "+d.place+" "+d.state+" "+d.region+" "+d.ing.map(r=>r[1]).join(" ")).toLowerCase(); if(!ws.every(w=>w.test(hay)) && !viaVariant(d)) return false; }
  return true;
}
let shown = DISHES.slice();
function qWords(q){ return q.toLowerCase().split(/\s+/).filter(Boolean).map(w=>new RegExp("(^|[^a-z])"+w.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+(w.length<=3?"($|[^a-z])":""))); }
/* search hit on a variant name (not the dish itself) → returns that variant */
function viaVariant(d){ if(!F.q||!d.vars.length) return null; const ws=qWords(F.q); const own=(d.name+" "+d.aka).toLowerCase(); if(ws.every(w=>w.test(own))) return null; return d.vars.find(v=>ws.every(w=>w.test(v.name.toLowerCase())))||null; }
const varHint = d => { const v=viaVariant(d); return v?`<span class="vhint">↳ variant: ${esc(v.name)}</span>`:""; };
function applyFilters(){ shown = DISHES.filter(matches); renderFilters(); renderRail(); renderCards(); updatePins(); }
$("#filters").addEventListener("click", e => {
  const b = e.target.closest("button"); if(!b) return;
  const t = (set,v)=> set.has(v)?set.delete(v):set.add(v);
  if (b.dataset.diet) F.diet=b.dataset.diet;
  else if (b.dataset.meal){ t(F.meals,b.dataset.meal); if(!F.meals.has("snack")) F.snack.clear(); }
  else if (b.dataset.snack) t(F.snack,b.dataset.snack);
  else if (b.dataset.region) t(F.regions,b.dataset.region);
  else if (b.dataset.grade) t(F.grades,b.dataset.grade);
  else if (b.dataset.dosha) t(F.dosha,b.dataset.dosha);
  else if (b.dataset.unstate) setState(null);
  else if (b.dataset.unconcept) F.concept="";
  else if (b.dataset.tag) t(F.tags,b.dataset.tag);
  else if (b.dataset.clear){ clearAll(); return; }
  applyFilters();
});
$("#q").addEventListener("input", e => { F.q=e.target.value.trim(); applyFilters(); });
$("#filters").addEventListener("change", e => { if(e.target.id==="fKit"){F.kit=e.target.value;applyFilters();} else if(e.target.id==="fFest"){F.fest=e.target.value;applyFilters();} });

/* ================= rail + cards ================= */
const geoOrder = (a,b) => b.lat - a.lat;
function renderRail(){
  $("#railCt").textContent = `${shown.length} of ${DISHES.length}`;
  if (!shown.length){ $("#rail").innerHTML = emptyHTML(); return; }
  if (trail){ $("#rail").innerHTML = `<div class="rgroup">${esc(trail.name)} · in order</div>`+trailStops().map((d,i)=>{const s=status(d.id);return `<button class="row" data-open="${d.id}" data-hover="${d.id}"><span class="tnum" style="background:${trail.color}">${i+1}</span><span style="min-width:0"><span class="nm">${esc(d.name)}${s.c?'<span class="st">★ cooked</span>':s.t?'<span class="st">✓ tasted</span>':""}</span><span class="pl">${esc(d.place)}</span></span>${nsb(d)}</button>`;}).join(""); return; }
  let h=""; for (const r of REGIONS){ const L=shown.filter(d=>d.region===r).sort(geoOrder); if(!L.length) continue;
    h+=`<div class="rgroup">${r}</div>`+L.map(d=>{const s=status(d.id);return `<button class="row" data-open="${d.id}" data-hover="${d.id}">${fs(d)}<span style="min-width:0"><span class="nm">${esc(d.name)}${s.c?'<span class="st">★ cooked</span>':s.t?'<span class="st">✓ tasted</span>':""}</span><span class="pl">${varHint(d)||esc(d.place)}</span></span>${nsb(d)}</button>`;}).join(""); }
  $("#rail").innerHTML = h;
}
const emptyHTML = () => `<div class="empty"><b>Nothing on the stove</b>No dish matches these filters.<br><br><button class="btn ghost" data-clearall="1">Clear filters</button></div>`;
function clearAll(){ if(trail){ trail=null; $("#trailbar").hidden=true; trailG.selectAll("*").remove(); } F.trail=""; F.q=""; $("#q").value=""; F.diet="all"; F.kit=""; F.fest=""; F.concept=""; F.tags.clear(); F.snack.clear(); [F.meals,F.regions,F.grades,F.dosha].forEach(s=>s.clear()); setState(null); applyFilters(); }
document.addEventListener("click", e => { if (e.target.closest("[data-clearall]")) clearAll(); });
function sorted(){
  const L = shown.slice(), s = store.sort;
  if (s==="az") L.sort((a,b)=>a.name.localeCompare(b.name));
  else if (s==="ns") L.sort((a,b)=>a.nut.score-b.nut.score);
  else if (s==="time") L.sort((a,b)=>a.mins-b.mins);
  else L.sort(geoOrder);
  return L;
}
function cardHTML(d){
  const s=status(d.id);
  return `<button class="card" data-open="${d.id}"><div class="art">${sketch(d)}</div>${s.c?'<span class="stamp">cooked</span>':s.t?'<span class="stamp t">tasted</span>':""}
   <div class="bd"><h3>${esc(d.name)}</h3><div class="aka">${varHint(d)||esc(d.aka)}</div>
   <div class="meta">${fs(d)}${d.meals.map(m=>`<span class="tag">${m==="snack"&&d.snack?SNACKDEF[d.snack][0]:cap(m)}</span>`).join("")}<span class="tag mono">${d.mins} min</span></div>
   <div class="ft"><span class="pl"><svg width="11" height="13" viewBox="0 0 12 14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 13s5-4.6 5-8A5 5 0 0 0 1 5c0 3.4 5 8 5 8z"/><circle cx="6" cy="5" r="1.6"/></svg>${esc(d.place.split(",")[0])}</span><span style="display:flex;gap:6px;align-items:center">${dmini(d)}${nsb(d)}</span></div></div></button>`;
}
function renderCards(){
  $("#cardCt").textContent = `${shown.length} dishes`;
  $("#grid").innerHTML = shown.length ? sorted().map(cardHTML).join("") : emptyHTML();
}
$("#sort").value = store.sort;
$("#sort").addEventListener("change", e => { store.sort=e.target.value; save(); renderCards(); });
document.addEventListener("click", e => { const o=e.target.closest("[data-open]"); if(o && !e.target.closest(".drawer .dbody [data-open-skip]")) openDish(o.dataset.open); });

/* ================= view toggle ================= */
function setView(v, push=true){
  store.view=v; save();
  $("#vMap").setAttribute("aria-pressed", v==="map"); $("#vCards").setAttribute("aria-pressed", v==="cards"); $("#vPlan").setAttribute("aria-pressed", v==="plan"); $("#vPantry").setAttribute("aria-pressed", v==="pantry");
  $("#mapView").hidden = v!=="map"; $("#cardView").hidden = v!=="cards"; $("#planView").hidden = v!=="plan"; $("#pantryView").hidden = v!=="pantry";
  $("#filters").hidden = v==="plan"||v==="pantry"; if (v==="plan" && typeof renderPlan==="function") renderPlan(); if (v==="pantry" && typeof renderPantry==="function") renderPantry();
  if (v!=="map" && game) endGame(true);
  if (push && !$("#drawer").classList.contains("on")) history.replaceState(null,"","#"+v);
  if (v==="map") requestAnimationFrame(updatePins);
}
$("#vMap").onclick=()=>setView("map"); $("#vCards").onclick=()=>setView("cards"); $("#vPlan").onclick=()=>setView("plan"); $("#vPantry").onclick=()=>setView("pantry");

/* ================= map ================= */
const svg = d3.select("#map"), W=800, H=900;
const india = topojson.feature(INDIA_TOPO, INDIA_TOPO.objects[Object.keys(INDIA_TOPO.objects)[0]]);
/* India's external boundary as per Survey of India (DataMeet's india-soi.geojson); states are clipped to it and it is drawn on top */
const soi = topojson.feature(INDIA_SOI, INDIA_SOI.objects.India);
const proj = d3.geoMercator().fitExtent([[24,24],[W-24,H-24]], soi);
const gpath = d3.geoPath(proj);
const root = svg.append("g");
const RVAR = {North:"--r-north",West:"--r-west",Central:"--r-central",East:"--r-east",Northeast:"--r-northeast",South:"--r-south"};
// graticule
const grat = root.append("g");
for (let lon=70; lon<=95; lon+=5) grat.append("path").attr("class","grat").attr("d",gpath({type:"LineString",coordinates:d3.range(5,38.1,.5).map(l=>[lon,l])}));
for (let lat=10; lat<=35; lat+=5) grat.append("path").attr("class","grat").attr("d",gpath({type:"LineString",coordinates:d3.range(66,99.1,.5).map(l=>[l,lat])}));
const gratL = svg.append("g");
svg.append("defs").append("clipPath").attr("id","indClip").append("path").attr("d",gpath(soi));
root.append("path").attr("class","land").attr("d",gpath(soi));
const states = root.append("g").attr("clip-path","url(#indClip)").selectAll("path").data(india.features).join("path")
  .attr("class","state").attr("d",gpath)
  .attr("class", f => "state reg-" + (STATE_REGION[f.properties.name]||"none"))
  .on("mouseenter",(e,f)=>readout(f.properties.name)).on("mouseleave",()=>readout(null))
  .on("click",(e,f)=>{ if(game) return; const n=f.properties.name; setState(F.state===n?null:n); applyFilters(); });
root.append("path").attr("class","natb").attr("d",gpath(soi));
const pinsG = svg.append("g"), gameG = svg.append("g");
let T = d3.zoomIdentity;
const zoom = d3.zoom().scaleExtent([1,9]).translateExtent([[-100,-100],[W+100,H+100]])
  .on("zoom", e => { T=e.transform; root.attr("transform",T); updatePins(); drawGame(); drawGratLabels(); hidePop(); });
svg.call(zoom).on("dblclick.zoom",null);
$("#zIn").onclick=()=>svg.transition().duration(300).call(zoom.scaleBy,1.6);
$("#zOut").onclick=()=>svg.transition().duration(300).call(zoom.scaleBy,1/1.6);
$("#zReset").onclick=()=>svg.transition().duration(450).call(zoom.transform,d3.zoomIdentity);
function drawGratLabels(){
  const L=[]; for(let lat=10;lat<=35;lat+=5){const[ ,y]=proj([68,lat]);const yy=T.applyY(y);if(yy>20&&yy<H-10)L.push({x:6,y:yy-3,t:lat+"°N"});}
  for(let lon=70;lon<=95;lon+=5){const[x]=proj([lon,20]);const xx=T.applyX(x);if(xx>30&&xx<W-30)L.push({x:xx+3,y:H-8,t:lon+"°E"});}
  gratL.selectAll("text").data(L).join("text").attr("class","grat-l").attr("x",d=>d.x).attr("y",d=>d.y).text(d=>d.t);
}
function setState(n){ F.state=n; states.classed("sel",f=>f.properties.name===n); }
function readout(n){
  const ro=$("#readout");
  if(!n){ ro.innerHTML = F.state?`<b>${esc(F.state)}</b><span>${DISHES.filter(d=>d.state===F.state).length} dishes · tap again to clear</span>`:`<b>India</b><span>${game?"Tap where you think the dish comes from.":"Tap a pin to open a dish. Tap a state to filter."}</span>`; return; }
  const c=DISHES.filter(d=>d.state===n);
  ro.innerHTML=`<b>${esc(n)}</b><span>${c.length?c.length+" dish"+(c.length>1?"es":"")+": "+esc(c.map(d=>d.name).join(", ")):"No dishes yet"}</span>`;
}
function cityOf(d){ const parts=d.place.split(",").map(s=>s.replace(/\s*\(.*\)/,"").trim()); const last=parts[parts.length-1]; return (parts.length>1 && last===d.state) ? parts[0] : last; }
// group dishes by origin point (cities within ~25 km merge)
const cities = []; DISHES.forEach(d => { const c = cities.find(c => Math.hypot(c.lat-d.lat, c.lon-d.lon) < .25); if (c) c.d.push(d); else cities.push({lat:d.lat, lon:d.lon, name:cityOf(d), d:[d]}); });
cities.forEach(c => { const p=proj([c.lon,c.lat]); c.x=p[0]; c.y=p[1]; c.label = c.d.length>1 ? (c.d[0].place.includes("Mumbai")?"Mumbai":c.d[0].place.includes("Kolkata")?"Kolkata":c.d[0].place.includes("Mysuru")?"Mysuru":c.d[0].place.includes("Delhi")?"Delhi":c.d[0].state==="Goa"?"Goa":c.name) : c.name; });
let hotId = null;
function pinColor(L){ const v=L.every(d=>d.diet==="veg"), n=L.every(d=>d.diet==="nonveg"); return v?"var(--veg)":n?"var(--nonveg)":"var(--turmeric)"; }
function clusterCities(ps){
  const vis=new Set(shown.map(d=>d.id)), th=(typeof trail!=="undefined"&&trail)?2:24*ps, out=[];
  const L=cities.map(c=>({...c, sx:T.applyX(c.x), sy:T.applyY(c.y), live:c.d.filter(d=>vis.has(d.id))})).sort((a,b)=>b.d.length-a.d.length);
  for(const c of L){
    const hit=out.find(o=>Math.hypot(o.sx-c.sx,o.sy-c.sy)<th);
    if(hit){ hit.members.push(c); } else out.push({sx:c.sx,sy:c.sy,members:[c]});
  }
  return out.map(o=>{
    if(o.members.length===1){ const c=o.members[0]; return {...c, key:c.label+c.lat, cl:false}; }
    const m=o.members, n=m.length;
    return {cl:true, members:m, key:m.map(x=>x.label).sort().join("|"), sx:m.reduce((a,x)=>a+x.sx,0)/n, sy:m.reduce((a,x)=>a+x.sy,0)/n,
      x:m.reduce((a,x)=>a+x.x,0)/n, y:m.reduce((a,x)=>a+x.y,0)/n, d:m.flatMap(x=>x.d), live:m.flatMap(x=>x.live), label:`${n} places`, lat:0};
  });
}
function updatePins(){
  if ($("#mapView").hidden) return;
  const k=T.k;
  const mr0=$("#map").getBoundingClientRect(); const ps=Math.max(1,Math.min(2.2,.8/(Math.min(mr0.width/W,mr0.height/H)||1)));
  const data=clusterCities(ps);
  const g = pinsG.selectAll("g.pin").data(data, d=>d.key).join(enter => {
    const g=enter.append("g").attr("class","pin").attr("tabindex",0).attr("role","button");
    g.append("circle").attr("class","halo").attr("r",10);
    g.append("circle").attr("class","ring");
    g.append("circle").attr("class","o");
    g.append("text").attr("class","n").attr("text-anchor","middle").attr("dy","3.5");
    g.append("text").attr("class","city").attr("dx",12).attr("dy",4);
    g.on("mouseenter",(e,c)=>{ if(game) return; const L=c.live.length?c.live:c.d; showTip({x:T.invertX(c.sx),y:T.invertY(c.sy)}, c.cl?`<b>${c.members.length} places · ${L.length} dishes</b><br>${c.members.map(m=>esc(m.label)).join(" · ")}<br><i>Tap to zoom in</i>`:`<b>${esc(c.label)}</b><br>${L.map(d=>esc(d.name)).join("<br>")}`); })
     .on("mouseleave",hideTip)
     .on("click",(e,c)=>{ e.stopPropagation(); if(game) return; pinClick(c); })
     .on("keydown",(e,c)=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); pinClick(c);} });
    return g; });
  g.attr("transform",c=>`translate(${c.sx},${c.sy}) scale(${ps})`)
   .classed("dim",c=>!c.live.length).classed("clu",c=>c.cl).classed("on",c=>c.d.some(d=>d.id===hotId))
   .attr("aria-label",c=>c.cl?`${c.members.length} places: ${c.members.map(m=>m.label).join(", ")}. Zoom in`:`${c.label}: ${c.d.map(d=>d.name).join(", ")}`)
   .style("pointer-events",game?"none":null).style("display",game?"none":null);
  g.select("circle.ring").attr("r",c=>c.cl?14:0);
  g.select("circle.o").attr("r",c=>c.cl?11:(c.live.length||c.d.length)>1?9.5:7).style("fill",c=>pinColor(c.live.length?c.live:c.d));
  g.select("text.n").text(c=>{const n=(c.live.length||c.d.length);return c.cl||n>1?n:"";});
  g.select("text.city").text(c=>!c.cl&&(k>=2.2||c.d.some(d=>d.id===hotId))?c.label:"");
  // scale bar
  const a=proj([78,20]),b=proj([78+500/(111.32*Math.cos(20*Math.PI/180)),20]); let px=(b[0]-a[0])*k, km=500;
  const mr = $("#map").getBoundingClientRect(); const vbScale = Math.min(mr.width / W, mr.height / H) || 1;
  while (px*vbScale>110 && km>50){ km/=2; px/=2; }
  $("#sbar").style.width=(px*vbScale).toFixed(0)+"px"; $("#slab").textContent=km+" km";
  if (typeof drawTrail==="function" && trail) drawTrail();
}
function pinClick(c){
  if(c.cl){
    if(T.k>=8.5){ return showPop({x:c.x,y:c.y,label:c.label},c.live.length?c.live:c.d); }
    const xs=c.members.map(m=>m.x), ys=c.members.map(m=>m.y);
    const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
    const kk=Math.min(9,Math.max(T.k*1.8, .5/Math.max((x1-x0)/W,(y1-y0)/H,.01)));
    svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity.translate(W/2-kk*(x0+x1)/2, H/2-kk*(y0+y1)/2).scale(kk));
    return;
  }
  const L=c.live.length?c.live:c.d; if(L.length===1) return openDish(L[0].id); showPop(c,L);
}
function screenXY(c){ const r=$("#map").getBoundingClientRect(), wr=$("#mapwrap").getBoundingClientRect(); const s=Math.min(r.width/W,r.height/H); const ox=(r.width-W*s)/2, oy=(r.height-H*s)/2; return [r.left-wr.left+ox+T.applyX(c.x)*s, r.top-wr.top+oy+T.applyY(c.y)*s]; }
function showTip(c,html){ const t=$("#tip"),[x,y]=screenXY(c); t.innerHTML=html; t.style.left=x+"px"; t.style.top=y+"px"; t.hidden=false; }
function hideTip(){ $("#tip").hidden=true; }
function showPop(c,L){ hideTip(); const p=$("#pop"),[x,y]=screenXY(c); const wr=$("#mapwrap").getBoundingClientRect();
  p.innerHTML=`<h4>${esc(c.label)}</h4>`+L.map(d=>`<button data-open="${d.id}">${fs(d)}<span style="flex:1">${esc(d.name)}</span>${nsb(d)}</button>`).join("");
  p.style.left=Math.max(130,Math.min(wr.width-130,x))+"px"; p.style.top=Math.min(y,wr.height-60-L.length*36)+"px"; p.hidden=false; }
function hidePop(){ $("#pop").hidden=true; }
svg.on("click.pop",()=>hidePop());
function flyTo(d){
  if ($("#mapView").hidden) return;
  const [x,y]=proj([d.lon,d.lat]); const k=Math.max(T.k,2.6);
  svg.transition().duration(650).call(zoom.transform, d3.zoomIdentity.translate(W/2-k*x, H*.45-k*y).scale(k));
}
$("#rail").addEventListener("mouseover",e=>{const r=e.target.closest("[data-hover]");if(!r)return;hotId=r.dataset.hover;updatePins();});
$("#rail").addEventListener("mouseleave",()=>{hotId=$("#drawer").classList.contains("on")?cur?.id:null;updatePins();});

/* ================= detail drawer ================= */
let cur=null, tab="recipe";
function openDish(id, opts={}){
  const d=byId[id]; if(!d || game) return; cur=d; hotId=id; hidePop(); hideTip();
  closeModal(true);
  $("#dh").innerHTML=`<button class="ibtn" id="dPrev" aria-label="Previous dish"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 2L4 7l5 5"/></svg></button><button class="ibtn" id="dNext" aria-label="Next dish"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 2l5 5-5 5"/></svg></button>
   <span class="sp mono" style="font-size:12px;color:var(--muted);padding-left:6px">${d.region.toUpperCase()} · ${esc(d.state)}</span>
   <button class="ibtn" id="dMap" aria-label="Show on map" title="Show on map"><svg width="15" height="15" viewBox="0 0 12 14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 13s5-4.6 5-8A5 5 0 0 0 1 5c0 3.4 5 8 5 8z"/><circle cx="6" cy="5" r="1.6"/></svg></button>
   <button class="ibtn" id="dClose" aria-label="Close"><svg width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" stroke-width="1.8"><path d="M2 2l10 10M12 2L2 12"/></svg></button>`;
  renderDetail();
  $("#drawer").classList.add("on"); $("#drawer").setAttribute("aria-hidden","false"); $("#scrim").classList.add("on");
  $("#dClose").onclick=closeDrawer; $("#dPrev").onclick=()=>step(-1); $("#dNext").onclick=()=>step(1);
  $("#dMap").onclick=()=>{ closeDrawer(); setView("map"); flyTo(d); };
  history.replaceState(null,"","#"+id);
  updatePins(); if(!opts.noFocus) $("#dClose").focus({preventScroll:true});
}
function step(dir){ const L=trail?trailStops():store.view==="cards"?sorted():shown.slice().sort(geoOrder); const list=L.length?L:DISHES; const i=list.findIndex(d=>d.id===cur.id); openDish(list[(i+dir+list.length)%list.length].id,{noFocus:true}); }
function closeDrawer(){ $("#drawer").classList.remove("on"); $("#drawer").setAttribute("aria-hidden","true"); $("#scrim").classList.remove("on"); hotId=null; cur=null; updatePins(); history.replaceState(null,"","#"+store.view); }
$("#scrim").onclick=()=>{ closeDrawer(); closeModal(); };
function renderDetail(){
  const d=cur, s=status(d.id);
  const tabs=[["recipe","Recipe"],["health","Health"],["ayur","Ayurveda"],["history","History"],["cheme",`ChemE${DEEP_BY_DISH[d.id]?' <span class="labdot" title="Interactive lab">LAB</span>':""}`]];
  $("#dbody").innerHTML=`
   <div class="hero"><div class="art">${sketch(d,true)}<span class="cap">${IMAGES[d.id]?"":"pencil study"}</span></div>
    <div style="min-width:0"><h2>${esc(d.name)}</h2><div class="aka">${esc(d.aka)}</div>
     <div class="where"><svg width="12" height="14" viewBox="0 0 12 14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 13s5-4.6 5-8A5 5 0 0 0 1 5c0 3.4 5 8 5 8z"/><circle cx="6" cy="5" r="1.6"/></svg><b>${esc(d.place)}</b><span class="conf ${d.conf}">${d.conf}</span></div>
     <div class="tags">${fs(d)}<span class="tag">${d.diet==="veg"?"Vegetarian":"Non-vegetarian"}</span>${d.tags.map(t=>`<button class="tag dt" data-tagf="${t}" title="${esc(TAGDEF[t][1])}">${TAGDEF[t][0]}</button>`).join("")}${d.meals.map(m=>`<span class="tag">${m==="snack"&&d.snack?"Snack · "+SNACKDEF[d.snack][0]:cap(m)}</span>`).join("")}${nsb(d)}</div>${d.k.length||d.f.length?`<div class="tags">${d.k.map(k=>`<button class="tag kit" data-kit="${k}">${esc(KITCHENS[k])}</button>`).join("")}${d.f.map(f=>`<button class="tag fest" data-fest="${esc(f)}">${esc(f)}</button>`).join("")}</div>`:""}</div></div>
   <div class="acts"><button class="tog" id="tTaste" aria-pressed="${!!s.t}">✓ Tasted</button><button class="tog cook" id="tCook" aria-pressed="${!!s.c}">★ Cooked</button><button class="tog" id="tThali" aria-pressed="${store.thali.includes(d.id)}">${store.thali.includes(d.id)?"In thali":"+ Add to thali"}</button><button class="tog" id="tPlan">+ Meal plan</button></div>
   <div class="tabs" role="tablist">${tabs.map(([k,l])=>`<button role="tab" data-tab="${k}" aria-selected="${tab===k}">${l}</button>`).join("")}</div>
   <div class="pane" id="pane"></div><div class="bigstamp" id="bigstamp">cooked!</div>`;
  $("#dbody").style.position="relative";
  $$(".tabs button").forEach(b=>b.onclick=()=>{ tab=b.dataset.tab; $$(".tabs button").forEach(x=>x.setAttribute("aria-selected",x===b)); renderPane(); });
  $("#tTaste").onclick=()=>{ mark(d.id,"t"); };
  $("#tCook").onclick=()=>{ mark(d.id,"c"); };
  $("#tThali").onclick=()=>{ toggleThali(d.id); renderDetail(); };
  renderPane();
}
function renderPane(){ const d=cur; const P=$("#pane"); P.innerHTML = ({recipe:paneRecipe,health:paneHealth,ayur:paneAyur,history:paneHistory,cheme:paneCheme})[tab](d); wirePane(d); }
/* ---------- cookbook helpers ---------- */
const CAT = {spice:"spice",salt:"salt",soda:"salt",oil:"fat",mustardoil:"fat",sesameoil:"fat",coconutoil:"fat",ghee:"fat",butter:"fat",butterS:"fat",
  cream:"dairy",milk:"dairy",yogurt:"dairy",chhena:"dairy",sugar:"sweet",jaggery:"sweet",raisin:"sweet",
  rice:"grain",blackrice:"grain",poha:"grain",atta:"grain",maida:"grain",semolina:"grain",makki:"grain",pav:"grain",
  urad:"pulse",toor:"pulse",chanadal:"pulse",moong:"pulse",moongwhole:"pulse",kidney:"pulse",chickpea:"pulse",besan:"pulse",sattu:"pulse",sprout:"pulse",
  chicken:"protein",chickenBone:"protein",muttonBone:"protein",mince:"protein",pork:"protein",smokedPork:"protein",fish:"protein",fishRohu:"protein",
  coconut:"nut",drycoconut:"nut",coconutmilk:"nut",peanut:"nut",cashew:"nut",lemon:"sour",tamarind:"sour",vinegar:"sour",soy:"sour",
  potato:"tuber",sweetpotato:"tuber",yam:"tuber"};
const CATCOL = {spice:"#b5651d",salt:"#c9ccd1",fat:"#e6b422",dairy:"#efe6cc",sweet:"#f3eee4",grain:"#d6b574",pulse:"#e1c03e",protein:"#b0432f",nut:"#8c6a43",sour:"#9bbd3c",veg:"#5e9a3a",tuber:"#b98c5a",other:"#9fb4c4"};
const CATNAME = {spice:"Spices",salt:"Salt",fat:"Fats",dairy:"Dairy",sweet:"Sugars",grain:"Grains & breads",pulse:"Pulses",protein:"Meat & fish",nut:"Nuts & coconut",sour:"Souring",veg:"Vegetables & herbs",tuber:"Tubers",other:"Water & other"};
function catOf(r){ const k=Object.keys(r[2]||{})[0]; if(!k) return "other"; return CAT[k] || (NUT[k]&&NUT[k][6]?"veg":"other"); }
function bowlIcon(cat){ const c=CATCOL[cat]; const dots=cat==="spice"?`<circle cx="15" cy="12" r="1.2" fill="#6a3a12"/><circle cx="21" cy="13" r="1" fill="#6a3a12"/><circle cx="18" cy="10.5" r=".9" fill="#6a3a12"/>`:cat==="pulse"||cat==="grain"?`<circle cx="14" cy="12" r="1.4" fill="${c}" stroke="#0003" stroke-width=".5"/><circle cx="19" cy="11" r="1.4" fill="${c}" stroke="#0003" stroke-width=".5"/><circle cx="22" cy="13" r="1.4" fill="${c}" stroke="#0003" stroke-width=".5"/>`:"";
  return `<svg viewBox="0 0 36 26" width="36" height="26" aria-hidden="true"><ellipse cx="18" cy="15" rx="15" ry="7.5" fill="var(--panel)" stroke="var(--ink-2)" stroke-width="1"/><path d="M3 15 Q4 23 18 24 Q32 23 33 15" fill="var(--panel)" stroke="var(--ink-2)" stroke-width="1"/><ellipse cx="18" cy="13.5" rx="12" ry="5" fill="${c}" opacity=".85"/>${dots}</svg>`; }
const EQUIP = [
  [/pressure|whistle/i,"cooker","Pressure cooker"],[/^(marinate|soak|ferment|rest|refrigerate|leave|hang)\b|\bferment|\bmarinate\b/i,"rest","Rest / wait"],
  [/tawa|griddle|appachatti/i,"tawa","Tawa"],[/\bbake|air fryer/i,"oven","Oven"],
  [/\bsteam/i,"steamer","Steamer"],[/deep-fry|\bfry|frying/i,"kadai","Kadai"],[/\bgrind|\bblend|purée|puree|\bmash/i,"grinder","Grind / mash"],
  [/\bsoak\b|\brest\b|refrigerat|\bhang\b|\bchill\b|dry on/i,"rest","Rest / wait"],[/knead|dough|roll|shape|pleat|wrap/i,"pin","Dough work"],
  [/simmer|boil|cook|heat|temper/i,"pot","Stovetop"],[/./,"bowl","Mix"]];
const EQ_SVG = {
  cooker:`<path d="M5 10h14v7a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3z"/><path d="M4 10h16M9 7h6M12 4v3M19 12h3"/>`,
  tawa:`<ellipse cx="11" cy="14" rx="8" ry="3"/><path d="M19 14h4"/><path d="M8 9c0-2 2-2 2-4M13 9c0-2 2-2 2-4" opacity=".6"/>`,
  oven:`<rect x="3" y="4" width="18" height="16" rx="2"/><rect x="6" y="9" width="12" height="8" rx="1"/><path d="M6 6.5h2M10 6.5h2"/>`,
  steamer:`<path d="M4 11h16v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M4 14h16M8 11v8M12 11v8M16 11v8"/><path d="M8 8c0-2 2-2 2-4M14 8c0-2 2-2 2-4" opacity=".6"/>`,
  kadai:`<path d="M3 11h18a9 6 0 0 1-18 0z"/><path d="M1 11h2M21 11h2"/><path d="M8 7c1-1 1-2 0-3M13 7c1-1 1-2 0-3" opacity=".6"/>`,
  grinder:`<path d="M7 3h10l-1 11H8z"/><path d="M6 14h12v3a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z"/><path d="M10 21h4"/>`,
  rest:`<circle cx="12" cy="13" r="8"/><path d="M12 8v5l3 2"/><path d="M9 2h6"/>`,
  pin:`<rect x="4" y="10" width="16" height="4" rx="2"/><path d="M1 12h3M20 12h3"/>`,
  pot:`<path d="M4 9h16v8a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z"/><path d="M2 9h20M9 6h6"/><path d="M8 4c0-1 1-1 1-2M14 4c0-1 1-1 1-2" opacity=".6"/>`,
  bowl:`<path d="M3 11h18a9 7 0 0 1-18 0z"/><path d="M14 4l-3 7"/>`};
const eqIcon = (k,s=22) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${EQ_SVG[k]}</svg>`;
function stepMeta(t){
  const eq = EQUIP.find(e=>e[0].test(t));
  const chips=[]; let m;
  const reT=/(\d+)(?:\s*[–-]\s*(\d+))?\s*(seconds?|minutes?|min|hours?|h)\b/gi;
  while((m=reT.exec(t))){ const u=m[3].toLowerCase(); const mul=u.startsWith("s")?1:u.startsWith("h")?3600:60; const lo=+m[1], hi=m[2]?+m[2]:lo; chips.push({type:"time",label:`${lo}${m[2]?"–"+hi:""} ${u.startsWith("s")?"s":u.startsWith("h")?"h":"min"}`,secs:lo*mul}); }
  const reC=/(\d+)\s*°C/g; while((m=reC.exec(t))) chips.push({type:"temp",label:`${m[1]} °C · ${Math.round(+m[1]*9/5+32)} °F`});
  const reW=/(\d+(?:[–-]\d+)?)\s*whistles?/gi; while((m=reW.exec(t))) chips.push({type:"whistle",label:`${m[1]} whistles`});
  return {eq:eq[1], eqName:eq[2], chips};
}
const STOP = new Set(["with","from","into","about","for","the","and","fresh","finely","chopped","sliced","grated","small","large","whole","split","soaked","boiled","raw","dried","each","pinch","optional","thick","thin","crushed","minced","divided"]);
function needs(d,t){ const T=t.toLowerCase(); const out=[]; d.ing.forEach(r=>{ if(r[0]==="#") return; const w=r[1].toLowerCase().replace(/\(.*?\)/g,"").split(/[^a-z]+/).filter(x=>x.length>3&&!STOP.has(x)); if(w.some(x=>T.includes(x.replace(/s$/,"")))) out.push(r); }); return out.slice(0,6); }
/* ----- servings scaling: numbers in quantity strings are multiplied; "pinch", "for frying" stay ----- */
const servOf = d => store.serv[d.id] || d.serves;
const fac = d => servOf(d)/d.serves;
const FRAC={"½":.5,"¼":.25,"¾":.75,"⅓":1/3,"⅔":2/3,"⅛":.125};
function fmtQ(x){ if(x>=50) return String(Math.round(x/5)*5); if(x>=10) return String(Math.round(x)); const w=Math.floor(x), r=x-w;
  const o=[[0,""],[.125,"⅛"],[.25,"¼"],[1/3,"⅓"],[.5,"½"],[2/3,"⅔"],[.75,"¾"],[1,""]].reduce((b,o)=>Math.abs(r-o[0])<Math.abs(r-b[0])?o:b);
  const ww=o[0]===1?w+1:w; return (ww||o[1]?(ww||"")+o[1]:"⅛"); }
function scaleQty(q,f){ if(Math.abs(f-1)<1e-9) return q; return q.replace(/(\d+(?:\.\d+)?)?([½¼¾⅓⅔⅛])|(\d+(?:\.\d+)?)/g,(m,a,fr,b)=>fmtQ((fr?(+(a||0))+FRAC[fr]:+b)*f)); }
const sq = (d,q) => scaleQty(q,fac(d));
document.addEventListener("click",e=>{ const b=e.target.closest("[data-srv]"); if(!b||!cur) return; const n=Math.max(1,Math.min(16,servOf(cur)+(+b.dataset.srv))); if(n===cur.serves) delete store.serv[cur.id]; else store.serv[cur.id]=n; save(); renderPane(); });
function parseTime(s){ const segs=[]; s.split(/\+|,/).forEach(p=>{ p=p.trim().replace(/(\d*)½\s*h/,(m,x)=>`${(+x||0)*60+30} min`); const h=(p.match(/(\d+)\s*h/)||[])[1], mi=(p.match(/(\d+)\s*min/)||[])[1]; const mins=(+h||0)*60+(+mi||0); if(!mins) return; let lab=p.replace(/\d+\s*h|\d+\s*min/g,"").trim(); segs.push({mins,lab:lab||(segs.length?"wait":"hands-on")}); }); return segs; }
const fmtM = m => m>=60 ? `${Math.floor(m/60)} h${m%60?" "+m%60+" min":""}` : `${m} min`;
const SEGCOL = {"hands-on":"var(--turmeric)",soak:"#5b8fb0",ferment:"#8a6bb8",marinade:"var(--chili)",rest:"#7f9a6a",drying:"#b08c5b"};
function level(d){ const segs=parseTime(d.time); const passive=segs.slice(1).reduce((a,s)=>a+s.mins,0); return passive>=240?"Weekend project":(d.steps.length<=4&&d.mins<=35)?"Easy":"Moderate"; }
const ORDER = DISHES.slice().sort((a,b)=>b.lat-a.lat).map(d=>d.id);
const srcList = L => `<ul class="srcl">${L.map(([t,u])=>`<li><a href="${esc(u)}" target="_blank" rel="noopener">${esc(t)}</a></li>`).join("")}</ul>`;
const howLink = sec => `<button class="linkbtn" data-how="${sec}">How is this worked out? →</button>`;

function paneRecipe(d){
  const tk=store.ticks[d.id]||{i:[],s:[]};
  const segs=parseTime(d.time), tot=segs.reduce((a,s)=>a+s.mins,0);
  const nI=d.ing.filter(r=>r[0]!=="#").length;
  let i=-1; const groups=[]; let g={title:"",items:[]}; groups.push(g);
  d.ing.forEach(r=>{ if(r[0]==="#"){ g={title:r[1],items:[]}; groups.push(g); return;} i++; g.items.push([r,i]); });
  const mise = groups.filter(g=>g.items.length).map(g=>`${g.title?`<div class="misec">${esc(g.title)}</div>`:""}<div class="misegrid">${g.items.map(([r,j])=>{const c=catOf(r);return `<label class="mtile ${tk.i.includes(j)?"done":""}" title="${CATNAME[c]}"><input type="checkbox" data-ti="${j}" ${tk.i.includes(j)?"checked":""}>${bowlIcon(c)}<b>${esc(sq(d,r[0]))}</b><span>${esc(r[1])}</span></label>`;}).join("")}</div>`).join("");
  const ov=overlayFor(d);
  const steps = d.steps.map((s,j)=>{ const m=stepMeta(s); return `<li class="bstep ${tk.s.includes(j)?"done":""}"><label><input type="checkbox" data-ts="${j}" ${tk.s.includes(j)?"checked":""}><span class="bn">${j+1}</span></label>
     <div class="bbody"><div class="beq">${eqIcon(m.eq,18)}<span>${m.eqName}</span>${m.chips.map(c=>c.type==="time"?`<button class="tchip" data-timer="${c.secs}" data-tlabel="Step ${j+1}">${tIcon()} ${c.label}</button>`:`<span class="tchip ${c.type}">${c.type==="temp"?thIcon():wIcon()} ${c.label}</span>`).join("")}</div><p>${esc(s)}</p>${opChip(ov[j])}</div></li>`; }).join("");
  const safety = [/kidney/.test(d.ing.map(r=>r[1]).join(" ").toLowerCase())?SRC.beans:null, d.diet==="nonveg"?SRC.temp:null].filter(Boolean);
  return `<article class="book">
   <header class="bhead"><div class="kick mono">RECIPE № ${String(ORDER.indexOf(d.id)+1).padStart(2,"0")} · ${esc(d.region.toUpperCase())} · ${esc(d.state.toUpperCase())}</div>
    <h2>${esc(d.name)}</h2><p class="headnote">${esc(d.hist?.place||d.story)}</p>${(v=>v?`<button class="vbanner" data-jumpvars="1">You searched for <b>${esc(v.name)}</b>, a variant of this dish. See how it differs ↓</button>`:"")(viaVariant(d))}
    <div class="facts"><div><small>Serves</small><b class="srv"><button class="srvb" data-srv="-1" aria-label="Fewer servings">−</button><span class="mono">${servOf(d)}</span><button class="srvb" data-srv="1" aria-label="More servings">+</button></b></div><div><small>Hands-on</small><b>${fmtM(segs[0]?.mins||d.mins)}</b></div><div><small>Start to finish</small><b>${fmtM(tot||d.mins)}</b></div><div><small>Makes</small><b>≈${Math.round(d.yield*fac(d))} g</b></div><div><small>Level</small><b>${level(d)}</b></div></div>
    ${segs.length>1?`<div class="tline" aria-label="Timeline">${segs.map(s=>`<span style="flex:${Math.max(s.mins/tot,.12)};background:${SEGCOL[s.lab]||SEGCOL[s.lab.split(" ")[0]]||"var(--ink-2)"}" title="${esc(s.lab)} · ${fmtM(s.mins)}"><em>${esc(s.lab)} · ${fmtM(s.mins)}</em></span>`).join("")}</div>`:""}
   </header>
   ${ingrChips(d)}
   <section><div class="bsec"><h3>Mise en place</h3>${fac(d)!==1?`<span class="scaled mono">×${+fac(d).toFixed(2)} · quantities in the steps are for ${d.serves}</span>`:""}<span class="prog mono"><span>${tk.i.length}/${nI}</span><span class="bar"><i style="width:${tk.i.length/nI*100}%"></i></span></span></div>${mise}</section>
   <section><div class="bsec"><h3>Method</h3><span class="prog mono"><span>${tk.s.length}/${d.steps.length}</span><span class="bar"><i style="width:${tk.s.length/d.steps.length*100}%"></i></span></span></div><ol class="bsteps">${steps}</ol></section>
   <div class="cookdone"><button class="btn acc" id="cookMode">${eqIcon("pot",16)} Start cook mode</button><button class="btn ${tk.s.length===d.steps.length?"":"ghost"}" id="cookIt">${status(d.id).c?"Cooked ★ (tap to undo)":"I cooked this"}</button><button class="btn ghost" id="resetTicks">Reset</button></div>
   ${d.vars.length?`<section class="vars" id="vars"><h3>Variants <small>· not written up separately</small></h3><p class="vlead">Well-known forms of ${esc(d.name)}. Start from the recipe above and make these changes.</p><ul>${d.vars.map(v=>`<li class="${viaVariant(d)===v?"hit":""}"><b>${esc(v.name)}</b> <span>${esc(v.note)}</span> <a href="${esc(v.url)}" target="_blank" rel="noopener" class="vlink">recipes on the web ↗</a></li>`).join("")}</ul></section>`:""}
   <p class="note"><b>Original recipe.</b> Written for this atlas from standard home-cooking technique. It isn't copied or adapted from any published recipe. Quantities are scaled to the smallest practical batch.${safety.length?" Food-safety notes in the steps follow:":""}</p>${safety.length?srcList(safety):""}
  </article>`;
}
const thIcon = () => `<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6.5 2.5a1.5 1.5 0 0 1 3 0v7a3 3 0 1 1-3 0z"/><circle cx="8" cy="12" r="1.2" fill="currentColor"/></svg>`;
const wIcon = () => `<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 9h10v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M8 9V4M6 4h4"/></svg>`;
const tIcon = () => `<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="8" cy="9" r="6"/><path d="M8 6v3l2 1.5M6 1.5h4"/></svg>`;

function paneHealth(d){
  const n=d.nut, s=n.serv, salt=s[5]*2.5/1000;
  const ref=[["Energy",s[0],"kcal",2000,"EU reference intake 2000 kcal"],["Protein",s[1],"g",50,"EU reference intake 50 g"],["Sat. fat",s[2],"g",20,"EU reference intake 20 g"],["Sugars",s[3],"g",50,"WHO: free sugars <10% of energy, ≈50 g (total sugars shown)"],["Fibre",s[4],"g",25,"EFSA adequate intake 25 g"],["Salt",salt,"g",5,"WHO: under 5 g a day"]];
  const row=(l,v,u,r,t)=>{const pc=v/r*100;const hi=(l==="Salt"||l==="Sat. fat"||l==="Sugars")&&pc>=40;return `<div class="r" title="${t}"><span>${l}</span><span class="v">${v<10&&u==="g"?v.toFixed(1):Math.round(v)} ${u}</span><span class="bar"><i class="${hi?"hi":""}" style="width:${Math.min(100,pc)}%"></i></span><span class="pc">${Math.round(pc)}%</span></div>`;};
  const pr=n.per100;
  return `<h3>Nutri-Score</h3><div class="nsscale">${"ABCDE".split("").map(g=>`<span class="ns-${g} ${g===d.grade?"on":""}">${g}</span>`).join("")}<span class="lab">score ${n.score} · per 100 ${n.bev?"ml · beverage rules":"g"}</span></div>
   <div class="twocol"><div><table class="pts"><tr><td colspan="3" class="mono" style="font-size:10.5px;letter-spacing:.12em;color:var(--muted)">NEGATIVE POINTS · PER 100 ${n.bev?"ML":"G"}</td></tr>
     <tr><td>Energy</td><td>${Math.round(n.kj)} kJ</td><td class="neg">${n.N.energy}</td></tr><tr><td>Sugars</td><td>${pr[3].toFixed(1)} g</td><td class="neg">${n.N.sugar}</td></tr>
     <tr><td>Saturated fat</td><td>${pr[2].toFixed(1)} g</td><td class="neg">${n.N.satfat}</td></tr><tr><td>Sodium</td><td>${Math.round(pr[5])} mg</td><td class="neg">${n.N.sodium}</td></tr></table></div>
    <div><table class="pts"><tr><td colspan="3" class="mono" style="font-size:10.5px;letter-spacing:.12em;color:var(--muted)">POSITIVE POINTS</td></tr>
     <tr><td>Fruit, veg, legumes, nuts</td><td>${Math.round(n.fvl)} %</td><td class="pos">${n.P.fvl}</td></tr><tr><td>Fibre</td><td>${pr[4].toFixed(1)} g</td><td class="pos">${n.P.fibre}</td></tr>
     <tr><td>Protein${n.protCounts?"":" (not counted)"}</td><td>${pr[1].toFixed(1)} g</td><td class="pos">${n.protCounts?n.P.protein:"–"}</td></tr>
     <tr class="tot"><td>Score = ${n.nTot} − ${n.nTot-n.score}</td><td></td><td>${n.score}</td></tr></table></div></div>
   <h3>Per serving <span class="mono" style="font-size:12px;color:var(--muted)">≈${Math.round(d.yield/d.serves)} g · % of daily reference</span></h3>
   <div class="serv">${ref.map(r=>row(...r)).join("")}</div>
   ${howLink("nutri")}
   <h3>Sources</h3>${srcList([SRC.nutriWiki,SRC.nutriOFF,...(d.bev?[SRC.nutriBev]:[]),SRC.usda,SRC.ifct,SRC.whoSalt,SRC.whoSugar,SRC.euRI,SRC.fibre])}`;
}
function paneAyur(d){
  const a=d.ay; const word=v=>v<0?"Pacifies":v>0?"Aggravates":"Balanced";
  return `<h3>Effect on the doshas</h3><div class="dosha">${["v","p","k"].map(k=>`<div class="r"><div><b>${DOSHA[k][0]}</b></div><div><small>${DOSHA[k][1]}</small><div class="dial" style="margin-top:6px"><i style="left:${50+a[k]*40}%"></i></div></div><div class="eff ${a[k]<0?"dn":a[k]>0?"up":"eq"}">${arrow(a[k])} ${word(a[k])}</div></div>`).join("")}</div>
   <h3>Rasa (taste)</h3><div class="rasa">${RASA.map(r=>`<span class="${a.rasa.includes(r)?"on":""}">${cap(r)}</span>`).join("")}</div>
   <h3>Virya (potency)</h3><span class="virya ${a.virya}">${a.virya==="heating"?"Heating (ushna)":a.virya==="cooling"?"Cooling (shita)":"Neutral"}</span>
   <p class="story" style="margin-top:14px;font-size:15px">${esc(a.note)}</p>
   ${howLink("ayur")}
   <p class="note">These ratings are this atlas's reading of the dish, made by applying the classical rasa and virya rules to its main ingredients and cooking method. They aren't quoted from a text, and they aren't medical or dietary advice.</p>
   <h3>Sources</h3>${srcList([SRC.dosha,SRC.rasa,SRC.guna,SRC.virya])}`;
}
function paneHistory(d){
  const h=d.hist||{}; const cl={documented:"Named place, person or date with a written record.",traditional:"Widely attributed by cooks and writers; little primary documentation.",debated:"Competing claims exist; both are shown."}[d.conf];
  return `<div class="hist">
   <div class="hplace"><div class="kick mono">THE PLACE · ${esc(d.place.toUpperCase())}</div><p>${esc(h.place||"")}</p><div class="kv"><span><b>${d.lat.toFixed(2)}°N, ${d.lon.toFixed(2)}°E</b></span><button class="linkbtn" id="oMap">Show on the map →</button></div></div>
   <h3>The story <span class="conf ${d.conf}">${d.conf}</span></h3><p class="story">${esc(d.story)}</p><p class="note">${cl} The pin marks the city closest to the dish's best-known origin.</p>
   ${h.tl?`<h3>Timeline</h3><ol class="htl">${h.tl.map(([w,t])=>`<li><span class="when mono">${esc(w)}</span><span>${esc(t)}</span></li>`).join("")}</ol>`:""}
   ${d.k.length||d.f.length?`<h3>Kitchen and festivals</h3><div class="rasa">${d.k.map(k=>`<button class="kinb" data-kit="${k}">${esc(KITCHENS[k])} · see all</button>`).join("")}${d.f.map(f=>`<button class="kinb" data-fest="${esc(f)}">${esc(f)} · see all</button>`).join("")}</div>${d.f.some(f=>HINDU_FEST.has(f))?`<p><a class="linkbtn" href="${FEST_ATLAS}" target="_blank" rel="noopener">Open the Hindu Festivals Atlas →</a></p>`:""}`:""}
   ${d.link&&SISTER[d.link]?`<p><a class="linkbtn" href="${SISTER[d.link][1]}" target="_blank" rel="noopener">Explore more in ${SISTER[d.link][0]} →</a></p>`:""}
   ${h.kin?`<h3>Relatives across the subcontinent</h3><div class="rasa">${h.kin.map(k=>{const m=DISHES.find(x=>k.toLowerCase().startsWith(x.name.toLowerCase()));return m&&m.id!==d.id?`<button class="kinb" data-open="${m.id}">${esc(k)} →</button>`:`<span class="on">${esc(k)}</span>`;}).join("")}</div>`:""}
   <h3>Sources</h3>${srcList(h.src||[])}</div>`;
}
function wirePane(d){
  const tk=()=> (store.ticks[d.id] ||= {i:[],s:[]});
  const upd=()=>{ const t=tk(), n=d.ing.filter(r=>r[0]!=="#").length; const p=$$("#pane .prog"); p[0].querySelector("span").textContent=`${t.i.length}/${n}`; p[0].querySelector("i").style.width=t.i.length/n*100+"%"; p[1].querySelector("span").textContent=`${t.s.length}/${d.steps.length}`; p[1].querySelector("i").style.width=t.s.length/d.steps.length*100+"%"; $("#cookIt").classList.toggle("ghost",t.s.length!==d.steps.length); };
  $$("#pane [data-ti]").forEach(c=>c.onchange=()=>{ const t=tk(), i=+c.dataset.ti; t.i=c.checked?[...new Set([...t.i,i])]:t.i.filter(x=>x!==i); c.closest(".mtile").classList.toggle("done",c.checked); save(); upd(); });
  $$("#pane [data-ts]").forEach(c=>c.onchange=()=>{ const t=tk(), j=+c.dataset.ts; t.s=c.checked?[...new Set([...t.s,j])]:t.s.filter(x=>x!==j); c.closest(".bstep").classList.toggle("done",c.checked); save(); upd(); if(t.s.length===d.steps.length && !status(d.id).c) toast("All steps done. Tap “I cooked this” to stamp your passport."); });
  const ck=$("#cookIt"); if(ck) ck.onclick=()=>mark(d.id,"c");
  const cm=$("#cookMode"); if(cm) cm.onclick=()=>openCook(d,0);
  const rt=$("#resetTicks"); if(rt) rt.onclick=()=>{ delete store.ticks[d.id]; save(); renderPane(); };
  const om=$("#oMap"); if(om) om.onclick=()=>{ closeDrawer(); setView("map"); flyTo(d); };
  if(tab==="cheme" && $("#labc")) wireCheme(d);
}

/* ---------- kitchen timer + cook mode ---------- */
let timers=[], tIv=null;
function beep(){ try{ const ac=new (window.AudioContext||window.webkitAudioContext)(); [0,0.35,0.7].forEach(t=>{const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=880;o.connect(g);g.connect(ac.destination);g.gain.setValueAtTime(.0001,ac.currentTime+t);g.gain.exponentialRampToValueAtTime(.3,ac.currentTime+t+.02);g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+t+.3);o.start(ac.currentTime+t);o.stop(ac.currentTime+t+.32);}); }catch(e){} try{ navigator.vibrate&&navigator.vibrate([200,100,200]); }catch(e){} }
/* several timers can run at once (one per pot); the tray stacks them, soonest first */
function startTimer(secs,label){ timers.push({id:Math.random().toString(36).slice(2),end:Date.now()+secs*1000,total:secs,label,paused:false,left:secs,rung:false}); if(!tIv) tIv=setInterval(tickTimer,500); tickTimer(); }
function stopTimer(id){ timers = id==null ? [] : timers.filter(t=>t.id!==id); if(!timers.length && tIv){ clearInterval(tIv); tIv=null; } tickTimer(); }
function tickTimer(){ const k=$("#ktimer"); if(!k) return; if(!timers.length){ k.hidden=true; k.innerHTML=""; return; } k.hidden=false;
  timers.forEach(t=>{ t.left=t.paused?t.left:Math.max(0,Math.round((t.end-Date.now())/1000));
    if(t.left===0&&!t.paused&&!t.rung){ t.rung=true; beep(); toast(`${t.label}: time's up`); setTimeout(()=>stopTimer(t.id),8000); } });
  const L=timers.slice().sort((a,b)=>a.left-b.left);
  k.innerHTML=L.map(t=>{ const mm=String(Math.floor(t.left/60)).padStart(2,"0"), ss=String(t.left%60).padStart(2,"0");
    return `<div class="krow ${t.rung?"ring":""}"><svg width="30" height="30" viewBox="0 0 36 36"><circle cx="18" cy="18" r="15" fill="none" stroke="var(--panel-2)" stroke-width="4"/><circle cx="18" cy="18" r="15" fill="none" stroke="${t.rung?"var(--chili)":"var(--turmeric)"}" stroke-width="4" stroke-dasharray="${(94.2*t.left/t.total).toFixed(1)} 94.2" transform="rotate(-90 18 18)"/></svg><span><small>${esc(t.label)}</small><b class="mono">${mm}:${ss}</b></span><button class="ibtn" data-kp="${t.id}" aria-label="${t.paused?"Resume":"Pause"} timer">${t.paused?"▶":"❚❚"}</button><button class="ibtn" data-ks="${t.id}" aria-label="Stop timer">✕</button></div>`; }).join("");
}
$("#ktimer").addEventListener("click",e=>{ const p=e.target.closest("[data-kp]"), x=e.target.closest("[data-ks]");
  if(p){ const t=timers.find(t=>t.id===p.dataset.kp); if(t){ if(t.paused){ t.end=Date.now()+t.left*1000; t.paused=false; } else t.paused=true; tickTimer(); } }
  if(x) stopTimer(x.dataset.ks); });
document.addEventListener("click",e=>{ const t=e.target.closest("[data-timer]"); if(t){ e.preventDefault(); startTimer(+t.dataset.timer, t.dataset.tfull||`${(cookState&&cookState.d||cur)?(cookState&&cookState.d||cur).name+" · ":""}${t.dataset.tlabel||"Timer"}`); toast(timers.length>1?`${timers.length} timers running`:"Timer started"); } const hw=e.target.closest("[data-how]"); if(hw) openMethods(hw.dataset.how); });
let cookState=null, wake=null;
function openCook(d,i){
  cookState={d,i}; const c=$("#cook"); c.hidden=false; document.body.style.overflow="hidden";
  try{ navigator.wakeLock && navigator.wakeLock.request("screen").then(w=>wake=w).catch(()=>{}); }catch(e){}
  renderCook();
}
function closeCook(){ $("#cook").hidden=true; document.body.style.overflow=""; try{ wake&&wake.release(); }catch(e){} wake=null; cookState=null; if(cur) renderPane(); }
function renderCook(){
  const {d,i}=cookState, n=d.steps.length, done=i>=n;
  const tk=(store.ticks[d.id] ||= {i:[],s:[]});
  let body;
  if(done){ body=`<div class="ckdone"><div class="ckart">${sketch(d)}</div><h2>Plated.</h2><p>${esc(d.name)} for ${d.serves}. Stamp it in your passport?</p><div class="cookdone" style="justify-content:center"><button class="btn acc" id="ckStamp">${status(d.id).c?"Already stamped ★":"Stamp: I cooked this"}</button><button class="btn ghost" id="ckClose">Back to recipe</button></div></div>`; }
  else { const s=d.steps[i], m=stepMeta(s), nd=needs(d,s);
    body=`<div class="ckstep"><div class="ckeq">${eqIcon(m.eq,54)}<span>${m.eqName}</span></div><div class="cknum mono">${String(i+1).padStart(2,"0")}<small>/${String(n).padStart(2,"0")}</small></div>
     <p class="cktext">${esc(s)}</p>
     <div class="ckchips">${m.chips.map(c=>c.type==="time"?`<button class="tchip big" data-timer="${c.secs}" data-tlabel="Step ${i+1}">${tIcon()} Start ${c.label} timer</button>`:`<span class="tchip big ${c.type}">${c.label}</span>`).join("")}</div>
     ${(()=>{const o=overlayFor(d)[i]; return o?`<div class="ckop">${opChip(o,true)}</div>`:"";})()}
     ${nd.length?`<div class="ckneed"><small class="mono">YOU'LL NEED</small>${nd.map(r=>`<span>${bowlIcon(catOf(r))}<b>${esc(sq(d,r[0]))}</b> ${esc(r[1])}</span>`).join("")}</div>`:""}</div>`; }
  $("#cook").innerHTML=`<div class="ckbar"><b>${esc(d.name)}${fac(d)!==1?` <small class="mono">· serves ${servOf(d)}</small>`:""}</b><button class="btn ghost ckingb" id="ckIng" aria-pressed="${!!cookState.ing}">Ingredients</button><span class="ckdots">${d.steps.map((_,j)=>`<i class="${j<i?"p":j===i?"c":""}"></i>`).join("")}</span><button class="ibtn" id="ckX" aria-label="Exit cook mode"><svg width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" stroke-width="1.8"><path d="M2 2l10 10M12 2L2 12"/></svg></button></div>
   ${cookState.ing?`<div class="ckingp">${d.ing.map(r=>r[0]==="#"?`<div class="misec">${esc(r[1])}</div>`:`<div><b>${esc(sq(d,r[0]))}</b> ${esc(r[1])}</div>`).join("")}</div>`:""}
   <div class="ckmain">${body}</div>
   ${done?"":`<div class="cknav"><button class="btn ghost" id="ckPrev" ${i===0?"disabled":""}>← Back</button><button class="btn acc" id="ckNext">${i===n-1?"Finish":"Done, next step →"}</button></div>`}`;
  $("#ckX").onclick=closeCook; $("#ckIng").onclick=()=>{ cookState.ing=!cookState.ing; renderCook(); };
  const p=$("#ckPrev"); if(p) p.onclick=()=>{ cookState.i--; renderCook(); };
  const nx=$("#ckNext"); if(nx) nx.onclick=()=>{ if(!tk.s.includes(i)) tk.s.push(i); save(); cookState.i++; renderCook(); };
  const st=$("#ckStamp"); if(st) st.onclick=()=>{ if(!status(d.id).c) mark(d.id,"c"); closeCook(); };
  const cc=$("#ckClose"); if(cc) cc.onclick=closeCook;
}

/* ---------- methods explainer ---------- */
const NS_T = {energy:[335,670,1005,1340,1675,2010,2345,2680,3015,3350], sugar:[4.5,9,13.5,18,22.5,27,31,36,40,45], satfat:[1,2,3,4,5,6,7,8,9,10], sodium:[90,180,270,360,450,540,630,720,810,900], fibre:[0.7,1.4,2.1,2.8,3.5], protein:[1.6,3.2,4.8,6.4,8]};
function openMethods(sec="nutri"){
  const tabs=[["nutri","Nutri-Score"],["ayur","Ayurveda"],["cheme","ChemE labs"],["data","Recipes & data"],["src","All sources"]];
  openModal(`<h2>How the atlas works</h2>`,`<div class="tabs mtabs" role="tablist">${tabs.map(([k,l])=>`<button role="tab" data-ms="${k}" aria-selected="${k===sec}">${l}</button>`).join("")}</div><div id="mpane" class="mpane"></div>`);
  const show=k=>{ $$("[data-ms]").forEach(b=>b.setAttribute("aria-selected",b.dataset.ms===k)); $("#mpane").innerHTML=({nutri:mNutri,ayur:mAyur,cheme:mCheme,data:mData,src:mSrc})[k](); $("#mb").scrollTop=0; const sel=$("#exDish"); if(sel) sel.onchange=()=>{ $("#ex").innerHTML=example(byId[sel.value]); }; };
  $$("[data-ms]").forEach(b=>b.onclick=()=>show(b.dataset.ms)); show(sec);
}
function example(d){
  const rows=[]; d.ing.forEach(r=>{ if(r[0]==="#") return; for(const [k,g] of Object.entries(r[2]||{})){ const n=NUT[k]; if(!n) continue; rows.push({name:r[1],k,g,kcal:n[0]*g/100,sf:n[2]*g/100,na:n[5]*g/100,f:n[6]}); } });
  rows.sort((a,b)=>b.g-a.g); const T=rows.reduce((a,r)=>({g:a.g+r.g,kcal:a.kcal+r.kcal,sf:a.sf+r.sf,na:a.na+r.na}),{g:0,kcal:0,sf:0,na:0});
  const n=d.nut;
  return `<div class="tblwrap"><table class="pts mb"><tr class="mono" style="font-size:11px;color:var(--muted)"><td>Ingredient (as calculated)</td><td>g in</td><td>kcal</td><td>sat. fat g</td><td>Na mg</td></tr>
   ${rows.map(r=>`<tr><td>${esc(r.name)}${r.f?' <span class="fv">FVL</span>':""}</td><td>${Math.round(r.g)}</td><td>${Math.round(r.kcal)}</td><td>${r.sf.toFixed(1)}</td><td>${Math.round(r.na)}</td></tr>`).join("")}
   <tr class="tot"><td>Σ inputs</td><td>${Math.round(T.g)}</td><td>${Math.round(T.kcal)}</td><td>${T.sf.toFixed(1)}</td><td>${Math.round(T.na)}</td></tr>
   <tr><td>÷ cooked yield ${d.yield} g × 100</td><td>100</td><td>${Math.round(n.per100[0])}</td><td>${n.per100[2].toFixed(1)}</td><td>${Math.round(n.per100[5])}</td></tr></table></div>
   <p class="mono" style="font-size:13px">N = ${n.N.energy} (energy) + ${n.N.sugar} (sugars) + ${n.N.satfat} (sat. fat) + ${n.N.sodium} (sodium) = ${n.nTot}<br>P = ${n.P.fvl} (FVL ${Math.round(n.fvl)}%) + ${n.P.fibre} (fibre)${n.protCounts?` + ${n.P.protein} (protein)`:" (protein not counted: N ≥ 11)"}<br>Score = ${n.score} → <span class="nsb ns-${d.grade}">${d.grade}</span></p>`;
}
const thr = (a,unit) => `<td>${unit}</td>${a.map(x=>`<td>&gt;${x}</td>`).join("")}`;
function mNutri(){
  const d=cur||byId["masala-dosa"];
  return `<p class="lead">Nutri-Score is the front-of-pack label France adopted in 2017 and that several European countries now use. It turns a food's composition per 100 g into one letter, A (most favourable) to E. This atlas uses the original general-food algorithm; an updated version was announced in 2023.</p>
   <h3>From pot to letter: a mass balance</h3>
   <ol class="flow"><li><b>Inputs.</b> Every ingredient's mass (g) is multiplied by its composition per 100 g (energy, protein, saturated fat, sugars, fibre, sodium), from USDA FoodData Central and the Indian Food Composition Tables.</li>
   <li><b>Control volume = the pot.</b> Summing the inputs gives the dish totals. Water added or boiled off changes mass but not nutrients.</li>
   <li><b>Basis: 100 g of product.</b> Totals are divided by the estimated cooked yield (shown on each recipe), so evaporation concentrates and absorbed water dilutes.</li>
   <li><b>Points.</b> Negative points (N) for energy, sugars, saturated fat and sodium; positive points (P) for fruit/vegetables/legumes/nuts, fibre and protein. <span class="mono">Score = N − P</span>. If N ≥ 11 and FVL points are below 5, protein isn't subtracted.</li>
   <li><b>Grade.</b> ≤ −1 A · 0–2 B · 3–10 C · 11–18 D · ≥ 19 E (solid foods).</li></ol>
   <h3>Point thresholds (per 100 g)</h3>
   <div class="tblwrap"><table class="pts thr"><tr class="mono"><td>Points →</td><td></td>${[1,2,3,4,5,6,7,8,9,10].map(x=>`<td>${x}</td>`).join("")}</tr>
    <tr><td>Energy</td>${thr(NS_T.energy,"kJ")}</tr><tr><td>Sugars</td>${thr(NS_T.sugar,"g")}</tr><tr><td>Sat. fat</td>${thr(NS_T.satfat,"g")}</tr><tr><td>Sodium</td>${thr(NS_T.sodium,"mg")}</tr>
    <tr><td>Fibre</td>${thr(NS_T.fibre,"g")}</tr><tr><td>Protein</td>${thr(NS_T.protein,"g")}</tr><tr><td>Fruit/veg/legumes/nuts</td><td>%</td><td>&gt;40</td><td>&gt;60</td><td>–</td><td>–</td><td>&gt;80</td></tr></table></div>
   <h3>Worked example</h3><label class="exsel">Dish <select id="exDish">${DISHES.slice().sort((a,b)=>a.name.localeCompare(b.name)).map(x=>`<option value="${x.id}" ${x.id===d.id?"selected":""}>${esc(x.name)}</option>`).join("")}</select></label><div id="ex">${example(d)}</div>
   <h3>Daily references on the per-serving bars</h3>
   <ul class="plain"><li>Salt: WHO recommends under 5 g a day.</li><li>Sugars: WHO recommends free sugars under 10% of energy, about 50 g at 2000 kcal. The bars show total sugars, which also include milk and fruit sugars.</li><li>Energy 2000 kcal, protein 50 g, saturated fat 20 g: EU reference intakes.</li><li>Fibre 25 g: EFSA adequate intake for adults.</li></ul>
   <h3>Drinks</h3><p>Drinks use the 2017 beverage rules: stricter energy and sugar thresholds per 100 ml, bigger fruit-and-vegetable points, and grades B (≤1), C (2–5), D (6–9), E (≥10); only plain water earns an A. Milk and drinks that are more than 80% milk, by the weight of their liquids (filter coffee, thandai, rose milk, falooda), are scored with the general food rules instead, as the 2017 rules did; the atlas works this out from each recipe.</p>
   <h3>Limits worth knowing</h3>
   <ul class="plain"><li>Nutri-Score was built for packaged foods; here it is a way to compare dishes, not a verdict.</li><li>It ignores frying method, portion size and processing. Legume-rich dishes can score A even when deep-fried.</li><li>Potatoes, yams and sweet potatoes don't count as vegetables.</li><li>Fibre values come from USDA (AOAC method), which reads somewhat higher than the method the published fibre thresholds assume, so fibre points may run slightly generous.</li><li>Composition values are typical, not measured on these exact dishes, and cooked yields are estimates.</li></ul>
   <h3>Sources</h3>${srcList([SRC.nutriWiki,SRC.nutriOFF,SRC.nutriBev,SRC.usda,SRC.ifct,SRC.whoSalt,SRC.whoSugar,SRC.euRI,SRC.fibre])}`;
}
function mAyur(){
  const R=[["Sweet (madhura)","water + earth","Kapha","Vata, Pitta","cooling"],["Sour (amla)","earth + fire","Pitta, Kapha","Vata","heating"],["Salty (lavana)","water + fire","Pitta, Kapha","Vata","heating"],["Pungent (katu)","air + fire","Vata, Pitta","Kapha","heating"],["Bitter (tikta)","air + space","Vata","Pitta, Kapha","cooling"],["Astringent (kashaya)","air + earth","Vata","Pitta, Kapha","cooling"]];
  return `<p class="lead">Ayurveda describes the body through three doshas, functional principles built from the five elements. Food is read by its taste (rasa), potency (virya) and qualities (guna), and by whether those raise or calm each dosha. The framework comes from the Charaka Samhita.</p>
   <div class="dcards">${[["Vata","Air + space","Movement: circulation, nerve impulses, moving food through the gut, elimination.","dry, light, cold"],["Pitta","Fire","Transformation: digestion, metabolism, hunger, thirst, body heat, perception.","hot, sharp, oily"],["Kapha","Water + earth","Structure: cohesion, strength, stability, moisture.","heavy, cold, oily, stable"]].map(([n,e,f,g])=>`<div class="dcard"><b>${n}</b><small class="mono">${e.toUpperCase()}</small><p>${f}</p></div>`).join("")}</div>
   <h3>The six tastes (Charaka Samhita, Sutrasthana 26)</h3>
   <div class="tblwrap"><table class="pts mb"><tr class="mono" style="font-size:11px;color:var(--muted)"><td>Rasa</td><td>Elements</td><td>Raises</td><td>Calms</td><td>Virya</td></tr>${R.map(r=>`<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td style="color:var(--bad)">${r[2]}</td><td style="color:var(--good)">${r[3]}</td><td>${r[4]}</td></tr>`).join("")}</table></div>
   <h3>Virya: potency</h3><p>Each substance is classed as <b>ushna</b> (heating) or <b>shita</b> (cooling). In the taste table, sour, salty and pungent tastes are heating; sweet, bitter and astringent are cooling.</p>
   <h3>How the atlas rates a dish</h3>
   <ol class="flow"><li>List the dish's dominant tastes from its main ingredients (tamarind and yogurt are sour, chillies pungent, jaggery and ghee sweet, and so on).</li><li>Apply the taste table above to each dosha.</li><li>Adjust for qualities: deep-frying and heavy dairy or meat add heaviness and oiliness (Kapha ↑, Vata ↓); dry, baked or very light foods raise Vata; strong chilli and sourness raise Pitta.</li><li>Round to −1 (pacifies), 0 (balanced) or +1 (aggravates).</li></ol>
   <p class="note">This is an editorial application of the classical rules by the atlas, not a quotation from any text and not a clinical assessment. Individual constitution (prakriti), season and quantity all matter in Ayurveda, and none of this is medical advice.</p>
   <h3>Sources</h3>${srcList([SRC.dosha,SRC.rasa,SRC.guna,SRC.virya])}`;
}
function mData(){
  return `<h3>Recipes</h3><p>Every recipe is <b>original, written from scratch for this atlas</b>. None is copied, adapted or paraphrased from a cookbook or recipe website. They use standard home techniques, are scaled to 1–2 servings (or the smallest practical batch), and give quantities in grams or millilitres with household measures. Safety steps (boiling kidney beans hard, cooking poultry to 74 °C / 165 °F) follow the cited food-safety sources.</p>
   <h3>Origins and history</h3><p>Each origin is tagged <span class="conf documented">documented</span> (named place, person or date with a written record), <span class="conf traditional">traditional</span> (widely attributed) or <span class="conf debated">debated</span> (competing claims, both shown). Every history panel lists its sources; claims the sources didn't support were removed.</p>
   <h3>Health numbers</h3><p>Calculated in the page from the ingredient list (see the Nutri-Score tab). Nothing is copied from nutrition labels.</p>
   <h3>Veg / non-veg marks</h3><p>The green dot and brown triangle follow India's FSSAI labelling regulations.</p>
   <h3>Diet labels</h3><p>Worked out in the page from each recipe's ingredients, ignoring anything marked optional or "to serve":</p><table class="pts mb mtab">${Object.entries(TAGDEF).map(([k,v])=>`<tr><td>${v[0]}</td><td>${esc(v[1])}</td></tr>`).join("")}</table><p class="note">Egg counts as non-veg under FSSAI rules, so Egg sits under Non-veg. Jain and vrat practice vary by family and occasion; treat these labels as a first filter and check the recipe. Jain rules follow <a href="https://en.wikipedia.org/wiki/Jain_vegetarianism" target="_blank" rel="noopener">Jain vegetarianism (Wikipedia)</a>.</p>
   <h3>Snack types and variants</h3><p>Snack means savoury: sweets that are eaten as snacks (jalebi, chikki) sit under Sweets. Pick Snack to see its types:</p><table class="pts mb mtab">${Object.values(SNACKDEF).map(v=>`<tr><td>${v[0]}</td><td>${esc(v[1])}</td></tr>`).join("")}</table><p>Many dishes list <b>variants</b> at the end of the recipe: well-known forms (puchka, ragda pattice, egg puff) that don't get a separate recipe. Search finds them too and opens the parent dish. Each variant links to a web search for recipes; those pages are not checked by this atlas.</p>
   <h3>Thali check</h3><p>When you build a thali, the atlas checks its shape against how thalis are served (a staple at the centre with dal, vegetables, curd, a sweet; see <a href="https://en.wikipedia.org/wiki/Thali" target="_blank" rel="noopener">Thali</a>), flags breakfast or tea-time dishes, too many fried dishes or drinks, and suggests classic partners. It also flags the incompatible pairings (viruddha ahara) listed in <a href="${VIRUDDHA_SRC[1]}" target="_blank" rel="noopener">Charaka Samhita, Sutrasthana 26</a>: fish with milk, fish with jaggery, pork with milk or jaggery, and sour fruit with milk. These are traditional Ayurvedic guidance, not food-safety rules.</p>
   <h3>Map</h3><p>State boundaries from DataMeet's open dataset, simplified for the web. The map is drawn from that data in the page, with no tile service, so there is no watermark.</p>
   <h3>Sketches</h3><p>The pencil studies are drawn by code as placeholders, ready to be swapped for your own images.</p>
   <h3>Sources</h3>${srcList([SRC.fssai,SRC.datameet,SRC.beans,SRC.temp])}`;
}
function mCheme(){
  return `<h3>What the ChemE deep dives are</h3>
   <p>Each deep dive treats a recipe as a small process plant: a process flow diagram of unit operations, an interactive model with live plots, a mass and energy balance from the recipe's own quantities, troubleshooting from first principles, and the industrial process that runs on the same physics. Recipe steps carry unit-operation chips that link back here. Switch between <b>Kitchen</b> and <b>Engineer</b> depth inside any deep dive.</p>
   <h3>How the models are built</h3>
   <table class="pts mb mtab"><tr><td>Fermentation</td><td>Gompertz curve fitted to measured idli batter rise and pH at ≈ 30 °C; temperature via the Ratkowsky square-root rule (T<sub>min</sub> illustrative)</td></tr>
   <tr><td>Pressure cooking</td><td>Antoine equation + barometric formula for boiling point; first-order softening with a measured rate constant; activation energy illustrative</td></tr>
   <tr><td>Sugar syrup</td><td>Published sugar-stage concentrations above 80%, ideal boiling-point elevation below 60%, bridged in between</td></tr>
   <tr><td>Pectin</td><td>Shape follows the cited chemistry (β-elimination, acid hydrolysis, Ca²⁺ cross-linking); constants illustrative</td></tr>
   <tr><td>Frying</td><td>1-D slab conduction with the surface at 100 °C; measured oil uptake vs oil temperature; measured heat-transfer coefficients</td></tr>
   <tr><td>Straining</td><td>Ruth constant-pressure cake filtration; constants illustrative, calibrated to the recipe's yield</td></tr></table>
   <p class="note">Wherever a constant is not taken from a cited measurement, the lab note says "illustrative". The models are teaching tools: right in shape and order of magnitude, not process-design grade.</p>
   <p><button class="btn ghost" data-cindex="1">Open the concept index</button></p>
   <h3>Sources</h3>${srcList(Object.values(DS))}`;
}
function mSrc(){
  const g=Object.values(SRC);
  return `<h3>Methods and data</h3>${srcList(g)}<h3>ChemE labs</h3>${srcList(Object.values(DS))}<h3>Dish histories</h3>${DISHES.slice().sort((a,b)=>a.name.localeCompare(b.name)).map(d=>`<div class="srcg"><b>${esc(d.name)}</b>${srcList(d.hist?.src||[])}</div>`).join("")}`;
}

/* ================= passport, XP, badges ================= */
const RANKS=[[0,"Kitchen Intern"],[150,"Lab Cook"],[400,"Process Cook"],[800,"Unit-Ops Chef"],[1400,"Plant Head Chef"]];
function xp(){ const P=Object.values(store.pass); return P.filter(p=>p.c).length*50+P.filter(p=>p.t).length*10+Math.round(store.gamexp)+Object.keys(store.labs||{}).length*30; }
function rank(){ const x=xp(); let i=0; RANKS.forEach((r,k)=>{ if(x>=r[0]) i=k; }); const next=RANKS[i+1]; return {x,name:RANKS[i][1],pct:next?(x-RANKS[i][0])/(next[0]-RANKS[i][0])*100:100,next}; }
const BADGES=[
 ["first","First batch","Cook any dish",S=>S.c.length>=1],
 ["ferm","Fermentation lab","Cook 3 fermented dishes",S=>S.c.filter(d=>d.cheme.includes("fermentation")).length>=3],
 ["mail","Maillard master","Cook 3 browning-driven dishes",S=>S.c.filter(d=>d.cheme.includes("maillard")).length>=3],
 ["pres","Under pressure","Cook 3 pressure-cooker dishes",S=>S.c.filter(d=>d.cheme.includes("pressure")).length>=3],
 ["four","Four corners","Taste dishes from North, South, East and West",S=>["North","South","East","West"].every(r=>S.any.some(d=>d.region===r))],
 ["sis","Seven sisters","Taste a dish from the Northeast",S=>S.any.some(d=>d.region==="Northeast")],
 ["sweet","Mithai box","Taste 4 sweets",S=>S.any.filter(d=>d.meals.includes("sweets")).length>=4],
 ["green","Green thali","Cook 8 vegetarian dishes",S=>S.c.filter(d=>d.diet==="veg").length>=8],
 ["grade","Grade-A cook","Cook 3 dishes rated A or B",S=>S.c.filter(d=>"AB".includes(d.grade)).length>=3],
 ["coast","Coastline run","Taste 5 dishes from coastal states",S=>S.any.filter(d=>["Gujarat","Maharashtra","Goa","Karnataka","Kerala","Tamil Nadu","Andhra Pradesh","Odisha","West Bengal"].includes(d.state)).length>=5],
 ["geo","Cartographer","Score 3,500+ in Guess the Origin",()=>store.best>=3500],
 ["all","Full atlas",`Taste all ${DISHES.length} dishes`,S=>S.any.length>=DISHES.length]];
function sets(){ const c=[],t=[],any=[]; for(const[id,p] of Object.entries(store.pass)){const d=byId[id];if(!d)continue;if(p.c)c.push(d);if(p.t)t.push(d);if(p.c||p.t)any.push(d);} return {c,t,any}; }
function earned(){ const S=sets(); return new Set(BADGES.filter(b=>b[3](S)).map(b=>b[0])); }
function refreshHeader(){
  const S=sets(); $("#passCt").textContent=S.any.length; $("#thaliCt").textContent=store.thali.length;
  const r=rank(); $("#rank").textContent=r.name; $("#xpbar").style.width=r.pct+"%"; $(".xp").title=`${r.x} XP${r.next?` · ${r.next[0]-r.x} to ${r.next[1]}`:""}`;
}
function mark(id,k){
  const before=earned(), p=(store.pass[id] ||= {}); p[k]=!p[k]; if(k==="c"&&p.c) p.t=true; if(!p.t&&!p.c) delete store.pass[id]; save();
  if(k==="c"&&p.c&&cur&&cur.id===id){ const bs=$("#bigstamp"); bs.classList.remove("go"); void bs.offsetWidth; bs.classList.add("go"); setTimeout(()=>bs.classList.remove("go"),1600); }
  refreshHeader(); if(cur&&cur.id===id) { const keep=$("#dbody").scrollTop; renderDetail(); $("#dbody").scrollTop=keep; }
  renderRail(); renderCards();
  const nb=[...earned()].filter(b=>!before.has(b)); if(nb.length){ const b=BADGES.find(x=>x[0]===nb[0]); toast(`Badge unlocked: ${b[1]}`); }
  else if(p.c&&k==="c") toast("+50 XP · stamped in your passport"); else if(p.t&&k==="t") toast("+10 XP · tasted");
}
function openModal(head,body){ $("#mh").innerHTML=head+`<button class="ibtn" id="mClose" aria-label="Close"><svg width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" stroke-width="1.8"><path d="M2 2l10 10M12 2L2 12"/></svg></button>`; $("#mb").innerHTML=body; $("#modal").classList.add("on"); $("#modal").setAttribute("aria-hidden","false"); $("#scrim").classList.add("on"); $("#mClose").onclick=()=>closeModal(); $("#mClose").focus({preventScroll:true}); }
function closeModal(keepScrim){ if(!$("#modal").classList.contains("on")) return; $("#modal").classList.remove("on"); $("#modal").setAttribute("aria-hidden","true"); if(!keepScrim && !$("#drawer").classList.contains("on")) $("#scrim").classList.remove("on"); }
function openPassport(){
  const S=sets(), e=earned(), r=rank(), st=new Set(S.any.map(d=>d.state));
  openModal(`<h2>Food passport</h2>`,`
   <div class="stats"><div class="stat"><b>${S.c.length}<small style="font-size:13px;color:var(--muted)">/${DISHES.length}</small></b><span>dishes cooked</span></div><div class="stat"><b>${S.any.length}<small style="font-size:13px;color:var(--muted)">/${DISHES.length}</small></b><span>dishes tasted</span></div><div class="stat"><b>${st.size}<small style="font-size:13px;color:var(--muted)">/${new Set(DISHES.map(d=>d.state)).size}</small></b><span>states visited</span></div><div class="stat"><b>${r.x}</b><span>XP · ${r.name}</span></div></div>
   <h3 style="font-family:var(--f-display);font-weight:400;font-size:20px;margin:0 0 8px">Badges <span class="mono" style="font-size:12px;color:var(--muted)">${e.size}/${BADGES.length}</span></h3>
   <div class="badges">${BADGES.map(b=>`<div class="badge ${e.has(b[0])?"on":""}"><span class="ic">${b[1].split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}</span><span><b>${b[1]}</b><small>${b[2]}</small></span></div>`).join("")}</div>
   <h3 style="font-family:var(--f-display);font-weight:400;font-size:20px;margin:0 0 8px">Process badges <span class="mono" style="font-size:12px;color:var(--muted)">${Object.keys(store.labs||{}).length}/${Object.keys(LAB_BADGES).length}</span></h3>
   <div class="badges">${Object.entries(DEEP).map(([k,D])=>{const on=store.labs&&store.labs[D.lab];return `<button class="badge lb ${on?"on":""}" data-open="${D.dishes[0]}" data-deeptab="1"><span class="ic">⚗</span><span><b>${LAB_BADGES[D.lab]}</b><small>${on?"Solved: ":"Solve the lab: "}${esc(LABS[D.lab].title)}</small></span></button>`;}).join("")}</div>
   <h3 style="font-family:var(--f-display);font-weight:400;font-size:20px;margin:0 0 8px">Stamps</h3>
   <div class="stamps">${DISHES.slice().sort(geoOrder).map(d=>{const s=status(d.id);return `<button class="stampc ${s.t?"t":""} ${s.c?"c":""}" data-open="${d.id}"><div class="art">${sketch(d)}</div>${s.c?"<i>cooked</i>":s.t?"<i>tasted</i>":""}<span>${esc(d.name)}</span></button>`;}).join("")}</div>
   <p class="note">Progress is saved in this browser only. Best Guess-the-Origin score: <b class="mono">${store.best}</b>.</p>`);
}
$("#bPass").onclick=openPassport;
$("#bHow").onclick=()=>openMethods("nutri");

/* ================= thali (meal builder) ================= */
function toggleThali(id){ const i=store.thali.indexOf(id); if(i>=0) store.thali.splice(i,1); else { if(store.thali.length>=6){ toast("A thali holds 6 dishes. Remove one first."); return; } store.thali.push(id); toast("Added to your thali"); } save(); refreshHeader(); }
const CARB_IDS = new Set(["hyderabadi-biryani","bisi-bele-bath","ven-pongal","indori-poha","ragi-mudde","dal-bafla","pakhala","galho","sawhchiar","bajre-khichdi","idiyappam","bore-baasi"]);
const CONDIMENT = new Set(["kachri-chutney","mosdeng","eromba","singju"]);
const MOUND_SIDE = new Set(["aloo-ke-gutke","aloo-pitika","singju","akuri","jhalmuri","cabbage-thoran","khichu","mas-podichathu"]);
// break a dish into what lands on the plate: katori (bowl) parts and plate parts
function parts(d){
  const B=(g,t)=>({kind:"bowl",g:g||d.garnish||"pieces",t:t||d.tint}), Pl=(f,t)=>({kind:"plate",f,t:t||d.tint});
  switch(d.sketch){
    case "katori": return [B()];
    case "balls": return [B("balls")];
    case "handi": return /biryani/.test(d.id)?[Pl("rice","#e0a63d")]:[B(d.id==="undhiyu"?"veg":"pieces")];
    case "leafmound": return CARB_IDS.has(d.id)?[Pl("rice")]:[B("veg")];
    case "mound": return MOUND_SIDE.has(d.id)?[B("veg")]:[Pl("rice")];
    case "stack": return d.side==="bowl"?[B("veg"),Pl("flat","#e3c070")]:[Pl("flat")];
    case "dosa": return [Pl("dosa")];
    case "appam": return [Pl("appam"),B("veg","#efe6cf")];
    case "puffed": return [B("beans","#9b5a28"),Pl("bhatura")];
    case "bunbowl": return [B(d.garnish||"veg"),Pl("pav","#d9a861")];
    case "bun": return [Pl("vadapav")];
    case "rounds": return d.garnish==="kachori"?[Pl("kachori")]:[B("veg",d.id==="dal-baati"?"#d9a63a":"#8a6a4a"),Pl("balls")];
    case "squares": return [Pl("squares")];
    case "kebab": return [Pl("kebab")];
    case "steamer": return [Pl("momos")];
    case "cake": return [Pl("wedge")];
    case "triangles": return [Pl("triangles")];
    case "spirals": return [Pl("spirals")];
    case "modak": return [Pl("modakp")];
    case "glass": return [B("kheer",d.tint)];
  }
  return [B()];
}
const SWEET_PLATE=new Set(["squares","spirals","modakp","wedge"]);
const NOT_CARB=new Set(["mas-podichathu","maddur-vada","medu-vada","kathi-roll","golgappa","punugulu"]);
function isCarb(d){ if(d.meals.includes("sweets")||d.meals.includes("drinks")||NOT_CARB.has(d.id)) return false; if(CARB_IDS.has(d.id)) return true; return parts(d).some(p=>p.kind==="plate"&&["rice","flat","dosa","appam","bhatura","pav","vadapav","balls"].includes(p.f)); }
function bowlTop(P,x,y,r,g,t){
  P.hatch(ellD(P,x+5,y+5,r,r),[x-r,y-r,x+r+5,y+r+5],3,-.6);
  P.washEll(x,y,r,r,"#c9ced2",.9); P.ellipse(x,y,r,r); P.ellipse(x,y,r*.84,r*.84,{passes:1,cls:"pl2"});
  P.washEll(x,y,r*.8,r*.8,t,.75);
  const inC=()=>{for(;;){const a=P.j(1),b=P.j(1);if(a*a+b*b<.5)return[x+a*r*.75,y+b*r*.75];}};
  if(g==="balls"){ [[-.35,-.25],[.35,-.25],[0,.3]].forEach(([a,b])=>{const cx=x+a*r,cy=y+b*r;P.washEll(cx,cy,r*.28,r*.28,"#f6f0dc",1);P.ellipse(cx,cy,r*.28,r*.28,{passes:1});P.arc(cx-2,cy-2,r*.15,r*.12,3.4,4.6,{passes:1,cls:"pl2"});}); }
  else if(g==="beans"){ for(let i=0;i<12;i++){const[a,b]=inC();P.ellipse(a,b,2.6,2,{passes:1,cls:"pl2"});} }
  else if(g==="fish"){ const pts=[[x-12,y-4],[x,y-8],[x+12,y-3],[x+10,y+5],[x-2,y+8],[x-12,y+4]]; P.wash(P.smooth(pts,true),t,.9); P.closed(pts,{passes:1}); P.ellipse(x,y,2.5,2.5,{passes:1,cls:"pl2"}); }
  else if(g==="cream"){ const p=[];for(let a=0;a<10;a+=.4){const rr=1+a*1.3;p.push([x+Math.cos(a)*rr,y+Math.sin(a)*rr]);} P.stroke(P.smooth(p,false),"pl"); }
  else if(g==="kheer"){ P.dots(10,inC,.9); }
  else if(g==="veg"||g==="drumstick"||g==="misal"){ for(let i=0;i<5;i++){const[a,b]=inC();const an=P.r()*3.14;P.line([[a-Math.cos(an)*5,b-Math.sin(an)*5],[a+Math.cos(an)*5,b+Math.sin(an)*5]],{passes:1});} P.dots(5,inC,1); }
  else { for(let i=0;i<4;i++){const[a,b]=inC();blob(P,a,b,5,t,.7);} }
  leaves(P,x+r*.25,y-r*.25,1,3);
}
function plateTop(P,x,y,f,t){
  if(f==="rice"){ const pts=[];for(let i=0;i<14;i++){const a=i/14*6.28;const k=30*(.85+P.r()*.25);pts.push([x+Math.cos(a)*k,y+Math.sin(a)*k*.85]);} P.wash(P.smooth(pts,true),t||"#f3eee0",.75); P.closed(pts,{passes:1}); for(let i=0;i<45;i++){const a=P.r()*6.28,rr=P.r()*26;const px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr*.85,an=P.r()*3.14;P.stroke(`M${f1(px)},${f1(py)}l${f1(Math.cos(an)*3)},${f1(Math.sin(an)*3)}`,"pl2");} leaves(P,x+8,y-6,2,6); }
  else if(f==="flat"){ for(let i=2;i>=0;i--){P.washEll(x+i*4,y-i*3,30,30,t,.55);P.ellipse(x+i*4,y-i*3,30,30,{passes:1});} P.dots(14,()=>[x+P.j(20),y+P.j(20)],1.3); }
  else if(f==="dosa"){ const L=[[x-48,y-8],[x+48,y-14],[x+50,y+4],[x-48,y+12]]; P.wash(P.smooth(L,true),t,.6); P.closed(L); for(let i=0;i<8;i++)P.arc(x-38+i*11,y,3,2,3.4,5.6,{passes:1}); P.ellipse(x-48,y+2,5,10,{passes:1}); }
  else if(f==="appam"){ P.washEll(x,y,30,30,t,.6); const e=[];for(let i=0;i<=30;i++){const a=i/30*6.28;e.push([x+Math.cos(a)*30*(1+Math.sin(a*9)*.05),y+Math.sin(a)*30*(1+Math.sin(a*9)*.05)]);} P.closed(e); P.washEll(x,y,13,13,"#f3ead0",1); P.ellipse(x,y,13,13,{passes:1}); P.dots(12,()=>[x+P.j(9),y+P.j(9)],.7); }
  else if(f==="bhatura"){ P.washEll(x,y,34,28,t,.55); P.ellipse(x,y,34,28); P.arc(x-6,y-6,22,16,3.5,4.8,{passes:1,cls:"hl"}); P.dots(10,()=>[x+P.j(24),y+P.j(18)],1.2); }
  else if(f==="pav"||f==="vadapav"){ [[-14,0],[14,0]].forEach(([dx])=>{P.washEll(x+dx,y,15,13,"#d9a861",.75);P.ellipse(x+dx,y,15,13,{passes:1});P.arc(x+dx-3,y-3,8,6,3.5,4.6,{passes:1,cls:"pl2"});}); if(f==="vadapav"){P.washEll(x,y+2,10,9,"#c88a2a",.85);P.ellipse(x,y+2,10,9,{passes:1});} }
  else if(f==="balls"||f==="kachori"){ const r=f==="kachori"?15:11; [[-14,-8],[12,-10],[0,10]].forEach(([dx,dy])=>{P.washEll(x+dx,y+dy,r,r,t,.7);P.ellipse(x+dx,y+dy,r,r,{passes:1});P.line([[x+dx-5,y+dy-3],[x+dx,y+dy],[x+dx+5,y+dy-4]],{passes:1});}); }
  else if(f==="squares"){ [[-14,-10],[12,-8],[-2,12]].forEach(([dx,dy],i)=>{const a=.3*i,s=11;const c=[[-s,-s],[s,-s],[s,s],[-s,s]].map(([u,v])=>[x+dx+u*Math.cos(a)-v*Math.sin(a),y+dy+u*Math.sin(a)+v*Math.cos(a)]);P.wash(P.smooth(c,true),t,.75);P.closed(c,{passes:1});}); }
  else if(f==="kebab"){ [[-14,-6],[12,-8],[0,10]].forEach(([dx,dy])=>{P.washEll(x+dx,y+dy,14,9,t,.8);P.ellipse(x+dx,y+dy,14,9,{passes:1});P.dots(3,()=>[x+dx+P.j(8),y+dy+P.j(4)],.9);}); P.ellipse(x+26,y+16,7,4,{passes:1,cls:"pl2"}); }
  else if(f==="momos"){ [[-14,-8],[12,-8],[-14,12],[12,12]].forEach(([dx,dy])=>{const cx=x+dx,cy=y+dy;P.washEll(cx,cy,11,11,"#f4ecd8",1);P.ellipse(cx,cy,11,11,{passes:1});for(let k=0;k<6;k++){const a=k/6*6.28;P.stroke(`M${f1(cx)},${f1(cy)}l${f1(Math.cos(a)*7)},${f1(Math.sin(a)*7)}`,"pl2");}}); }
  else if(f==="triangles"){ [[-14,-6,0],[12,-4,.4],[0,14,-.3]].forEach(([dx,dy,an])=>{const T=[[-13,8],[0,-12],[13,8]].map(([u,v])=>[x+dx+u*Math.cos(an)-v*Math.sin(an),y+dy+u*Math.sin(an)+v*Math.cos(an)]);P.wash(P.smooth(T,true),t,.8);P.closed(T,{passes:1});}); }
  else if(f==="spirals"){ [[-12,-6],[12,4]].forEach(([dx,dy])=>{const p=[];for(let a=0;a<12;a+=.4){const r=1+a*1.2;p.push([x+dx+Math.cos(a)*r,y+dy+Math.sin(a)*r]);} const dd=P.smooth(p,false);P.add(`<path d="${dd}" style="fill:none;stroke:${t};stroke-width:4;stroke-linecap:round;opacity:.8"/>`);P.stroke(dd,"pl2");}); }
  else if(f==="modakp"){ [[-14,-4],[12,-6],[0,12]].forEach(([dx,dy])=>{const cx=x+dx,cy=y+dy;const s=[[cx-10,cy+6],[cx-9,cy-2],[cx,cy-14],[cx+9,cy-2],[cx+10,cy+6],[cx,cy+9]];P.wash(P.smooth(s,true),t,1);P.closed(s,{passes:1});}); }
  else if(f==="wedge"){ const w=[[x-24,y+16],[x+26,y+14],[x+2,y-24]]; P.wash(P.smooth(w,true),t,.85); P.closed(w); P.hatch(P.smooth(w,true),[x-26,y-26,x+28,y+18],2.2,.4); }
}
function thaliSVG(L){
  const P=new Pencil(hashStr(L.map(d=>d.id).join("|")||"empty")); const cx=320, cy=218, R=170;
  // steel plate
  P.hatch(ellD(P,cx+8,cy+8,R,R),[cx-R,cy-R,cx+R+8,cy+R+8],4,-.6);
  P.washEll(cx,cy,R,R,"#c3c9ce",.85); P.ellipse(cx,cy,R,R); P.ellipse(cx,cy,R-12,R-12,{passes:1,cls:"pl2"});
  P.washEll(cx,cy,R-14,R-14,"#d9dee1",.6);
  P.dots(70,()=>{const a=P.r()*6.28;return [cx+Math.cos(a)*(R-6),cy+Math.sin(a)*(R-6)];},.6);
  const bowls=[], plates=[]; L.forEach(d=>parts(d).forEach(p=>(p.kind==="bowl"?bowls:plates).push({...p,d})));
  const extra=[]; if(L.length && !L.some(isCarb)) plates.unshift({kind:"plate",f:"rice",t:"#f3eee0",d:{name:"Steamed rice",acc:true}});
  // fixed accompaniments: salt, pickle, lemon at the top rim (traditional placement)
  const acc=[[cx-28,cy-R+34,"#ffffff","salt"],[cx+2,cy-R+30,"#c4561c","pickle"],[cx+32,cy-R+36,"#e9d550","lemon"]];
  acc.forEach(([x,y,c,n])=>{ P.washEll(x,y,9,8,c,.9); P.ellipse(x,y,9,8,{passes:1}); });
  const labels=[]; const nb=Math.min(bowls.length,6);
  bowls.slice(0,6).forEach((b,i)=>{ const deg=nb===1?-40:-45+i*(270/(nb-1)); const a=deg*Math.PI/180; const x=cx+Math.cos(a)*(R-54), y=cy+Math.sin(a)*(R-54); bowlTop(P,x,y,36,b.g,b.t); labels.push({x,y,a,name:b.d.name.split(" & ")[0]}); });
  const np=Math.min(plates.length,5);
  const pSlots=np===1?[[0,12]]:np===2?[[-38,14],[42,-2]]:[[-40,22],[42,18],[0,-36],[0,58],[-50,-30]];
  plates.slice(0,5).forEach((p,i)=>{ const x=cx+pSlots[i][0]*1.15, y=cy+pSlots[i][1]*1.1; plateTop(P,x,y,p.f,p.t); labels.push({x,y,a:Math.atan2(y-cy,x-cx)||Math.PI,name:p.d.name.split(" & ")[0]+(p.d.acc?" (side)":"")}); });
  // labels outside the plate, de-duplicated per dish
  const seen=new Set(); const lab=labels.filter(l=>{const k=l.name; if(seen.has(k)) return false; seen.add(k); return true;});
  const left=lab.filter(l=>Math.cos(l.a)<0).sort((a,b)=>a.y-b.y), right=lab.filter(l=>Math.cos(l.a)>=0).sort((a,b)=>a.y-b.y);
  let txt="";
  [[left,-1],[right,1]].forEach(([arr,s])=>{ const gap=Math.min(34,(2*R)/Math.max(1,arr.length)); arr.forEach((l,i)=>{ const ty=cy-R+20+i*gap+(2*R-arr.length*gap)/2, tx=s<0?cx-R-12:cx+R+12;
    txt+=`<path d="M${f1(l.x)},${f1(l.y)}L${f1(s<0?cx-R+4:cx+R-4)},${f1(ty)}L${f1(tx)},${f1(ty)}" class="lead"/><text x="${f1(tx+(s<0?-4:4))}" y="${f1(ty+4)}" text-anchor="${s<0?"end":"start"}" class="tlab">${esc(l.name)}</text>`; }); });
  txt+=`<text x="${cx}" y="${cy-R-8}" text-anchor="middle" class="tlab sm">salt · pickle · lemon</text>`;
  if(!L.length) txt+=`<text x="${cx}" y="${cy+6}" text-anchor="middle" class="tlab">Empty thali: tap “Suggest a thali”</text>`;
  return P.svg().replace('viewBox="0 0 240 170"','viewBox="0 0 640 420"').replace("</g></svg>",`</g>${txt}</svg>`);
}
function suggestThali(region, vegOnly){
  const meal=d=>d.meals.includes("lunch")||d.meals.includes("dinner")||d.meals.includes("sweets");
  let pool=DISHES.filter(d=>(!vegOnly||d.diet==="veg")&&!d.meals.includes("drinks")&&meal(d));
  const drinks=DISHES.filter(d=>d.meals.includes("drinks")&&(!vegOnly||d.diet==="veg"));
  const inR=pool.filter(d=>!region||d.region===region);
  const sweets=(inR.filter(d=>d.meals.includes("sweets")).length?inR:pool).filter(d=>d.meals.includes("sweets"));
  const carbs=(inR.filter(d=>isCarb(d)&&!d.meals.includes("sweets")).length?inR:pool).filter(d=>isCarb(d)&&!d.meals.includes("sweets"));
  const isMain=d=>!isCarb(d)&&!d.meals.includes("sweets")&&!CONDIMENT.has(d.id);
  const mains=(inR.filter(isMain).length>=2?inR:pool).filter(isMain);
  const pick=a=>a[Math.floor(Math.random()*a.length)];
  let best=null, bs=-1e9;
  for(let k=0;k<500;k++){
    const m1=pick(mains), m2=pick(mains); if(!m1||!m2||m1===m2) continue;
    const set=[pick(carbs),m1,m2,pick(sweets)].filter(Boolean);
    const rasa=new Set(set.flatMap(d=>d.ay.rasa)).size;
    const dz=["v","p","k"].reduce((a,q)=>a+Math.abs(set.reduce((s,d)=>s+d.ay[q],0)),0);
    const salt=set.reduce((s,d)=>s+d.nut.serv[5]*2.5/1000,0);
    const reg=region?set.filter(d=>d.region===region).length:new Set(set.map(d=>d.region)).size===1?2:0;
    const sc=rasa*3-dz*1.5-Math.max(0,salt-5)*2+reg-(m1.diet==="nonveg"&&m2.diet==="nonveg"?2:0)+Math.random()*.5;
    if(sc>bs){bs=sc;best=set;}
  }
  const dr=drinks.filter(x=>!region||x.region===region); if(best&&(dr.length||drinks.length)) best.push(pick(dr.length?dr:drinks));
  return (best||[]).map(d=>d.id);
}
let thaliOpts={region:"",veg:false};
const VIRUDDHA_SRC=["Charaka Samhita, Sutrasthana 26.82–83: Viruddha ahara (incompatible foods)","https://www.carakasamhitaonline.com/index.php/Viruddha_Ahara"];
const PAIRS={ "masala-dosa":["sambar"], "idli":["sambar"], "medu-vada":["sambar"], "fafda":["jalebi"], "indori-poha":["jalebi"],
  "hyderabadi-biryani":["mirchi-ka-salan"], "mirchi-ka-salan":["hyderabadi-biryani"], "sheermal":["nihari","galouti-kebab"], "meen-molee":["appam-stew"] };
const gIn=(d,keys)=>d.ing.reduce((s,r)=>r[0]==="#"?s:s+keys.reduce((a,k)=>a+((r[2]||{})[k]||0),0),0);
const isMilky=d=>gIn(d,["milk","khoya","chhena","paneer","condensedmilk","cream","icecream"])>=100;
const isFried=d=>d.ing.some(r=>/for frying/i.test(r[0]));
function thaliCheck(L){
  const out=[], nm=d=>`<b>${esc(d.name)}</b>`;
  if(!L.length) return out;
  const carbs=L.filter(isCarb), drinks=L.filter(d=>d.meals.includes("drinks")), sweets=L.filter(d=>d.meals.includes("sweets")&&!d.meals.includes("drinks"));
  const mains=L.filter(d=>!isCarb(d)&&!drinks.includes(d)&&!sweets.includes(d));
  if(!carbs.length) out.push(["tip","No rice or bread yet. Thalis are built around a staple at the centre."]);
  if(!mains.length) out.push(["warn","No dal, curry or vegetable yet."]);
  if(drinks.length>1) out.push(["warn",`Two drinks (${drinks.map(nm).join(", ")}). A thali usually has one, often buttermilk or a cooler.`]);
  if(sweets.length>2) out.push(["warn",`${sweets.length} sweets. Most thalis carry one or two.`]);
  const fr=L.filter(isFried); if(fr.length>=3) out.push(["warn",`${fr.length} deep-fried dishes (${fr.map(nm).join(", ")}). Thalis usually balance one fried item with steamed or simmered dishes.`]);
  L.filter(d=>!d.meals.some(m=>["lunch","dinner","sweets","drinks"].includes(m))).forEach(d=>out.push(["warn",`${nm(d)} is a ${d.meals.join("/")} dish, not usually part of a lunch or dinner thali.`]));
  L.filter(d=>CONDIMENT.has(d.id)).forEach(d=>out.push(["tip",`${nm(d)} is a side or chutney: fine in a katori, but it won't stand in for a main.`]));
  const regs=[...new Set(L.map(d=>d.region))]; if(regs.length>=3) out.push(["tip",`Dishes from ${regs.length} regions (${regs.join(", ")}): a fusion plate rather than a regional thali.`]);
  // Ayurveda: viruddha ahara (Charaka SS 26)
  const sea=L.filter(d=>d.tags.includes("seafood")), milky=L.filter(isMilky), pork=L.filter(d=>gIn(d,["pork","smokedPork"])>0), jag=L.filter(d=>gIn(d,["jaggery"])>=30);
  const sour=L.filter(d=>gIn(d,["rawmango","kokum","pomegranate","phalsa"])>=20);
  if(sea.length&&milky.length) out.push(["ayur",`Fish with milk: ${sea.map(nm).join(", ")} with ${milky.map(nm).join(", ")}. Charaka lists fish with milk as an incompatible pairing (viruddha ahara).`]);
  if(sea.length&&jag.length) out.push(["ayur",`Fish with jaggery: ${sea.map(nm).join(", ")} with ${jag.map(nm).join(", ")}. Listed as incompatible by Charaka.`]);
  if(pork.length&&(milky.length||jag.length)) out.push(["ayur",`Pork with milk or jaggery: ${pork.map(nm).join(", ")} with ${[...milky,...jag].map(nm).join(", ")}. Listed as incompatible by Charaka.`]);
  if(sour.length&&milky.length&&!sour.some(d=>milky.includes(d))) out.push(["ayur",`Sour fruit with milk: ${sour.map(nm).join(", ")} with ${milky.map(nm).join(", ")}. Charaka lists sour fruits such as mango and pomegranate with milk as incompatible.`]);
  // classic partners
  L.forEach(d=>{ const p=(PAIRS[d.id]||[]).filter(id=>byId[id]); if(p.length&&!p.some(id=>L.some(x=>x.id===id))) out.push(["pair",`${nm(d)} is classically served with ${p.map(id=>`<button class="linkbtn" data-tadd="${id}">${esc(byId[id].name)} +</button>`).join(" or ")}`]); });
  if(L.every(d=>d.region==="South")&&L.some(isCarb)&&!L.some(d=>d.id==="curd-rice")&&byId["curd-rice"]) out.push(["pair",`South Indian meals traditionally end with <button class="linkbtn" data-tadd="curd-rice">Curd Rice +</button>`]);
  if(!out.some(o=>o[0]!=="pair"&&o[0]!=="tip")) out.unshift(["ok","Looks like a well-formed thali: no clashes found."]);
  return out;
}
function openThali(){
  const L=store.thali.map(id=>byId[id]).filter(Boolean);
  const tot=[0,0,0,0,0,0]; L.forEach(d=>d.nut.serv.forEach((v,i)=>tot[i]+=v));
  const dz={v:0,p:0,k:0}; L.forEach(d=>["v","p","k"].forEach(k=>dz[k]+=d.ay[k]));
  const rasa=new Set(L.flatMap(d=>d.ay.rasa));
  const body=`<div class="tctl"><select id="tReg" aria-label="Region"><option value="">Any region</option>${REGIONS.map(r=>`<option ${thaliOpts.region===r?"selected":""}>${r}</option>`).join("")}</select>
     <label class="chip" style="cursor:pointer"><input type="checkbox" id="tVeg" ${thaliOpts.veg?"checked":""} style="margin:0 4px 0 0">Veg only</label>
     <button class="btn acc" id="tSug">Suggest a thali</button>${L.length?`<button class="btn ghost" id="clearT">Clear</button>`:""}</div>
   <div class="tgrid"><div class="tplate">${thaliSVG(L)}</div>
   <div class="tstats">${L.length?`
     <div class="thali-list">${L.map(d=>`<div class="tl"><div class="art">${sketch(d)}</div><div><b>${esc(d.name)}</b><small>${esc(d.place.split(",")[0])} · ${Math.round(d.nut.serv[0])} kcal</small></div><button class="ibtn" data-rm="${d.id}" aria-label="Remove ${esc(d.name)}"><svg width="12" height="12" viewBox="0 0 14 14" stroke="currentColor" stroke-width="1.8"><path d="M2 2l10 10M12 2L2 12"/></svg></button></div>`).join("")}</div>
     <h3 class="th3">Thali check</h3><ul class="tchk">${thaliCheck(L).map(([k,t])=>`<li class="c-${k}"><span>${({ok:"✓",warn:"!",ayur:"☯",tip:"i",pair:"+"})[k]}</span><div>${t}</div></li>`).join("")}</ul>${thaliCheck(L).some(o=>o[0]==="ayur")?`<p class="note" style="margin-top:0">☯ Ayurvedic pairing rules: <a href="${VIRUDDHA_SRC[1]}" target="_blank" rel="noopener">${esc(VIRUDDHA_SRC[0])}</a>. Traditional guidance, not a food-safety rule.</p>`:""}
     <h3 class="th3">One plate, per person</h3>
     <div class="serv">${[["Energy",tot[0],"kcal",2000],["Protein",tot[1],"g",50],["Sat. fat",tot[2],"g",20],["Salt",tot[5]*2.5/1000,"g",5]].map(([l,v,u,r])=>{const pc=v/r*100;return `<div class="r"><span>${l}</span><span class="v">${u==="g"?v.toFixed(1):Math.round(v)} ${u}</span><span class="bar"><i class="${(l==="Salt"||l==="Sat. fat")&&pc>=70?"hi":""}" style="width:${Math.min(100,pc)}%"></i></span><span class="pc">${Math.round(pc)}%</span></div>`;}).join("")}</div>
     <h3 class="th3">Six tastes · ${rasa.size} of 6</h3><div class="rasa">${RASA.map(r=>`<span class="${rasa.has(r)?"on":""}">${cap(r)}</span>`).join("")}</div>
     <h3 class="th3">Dosha balance</h3><div class="dosha">${["v","p","k"].map(k=>`<div class="r"><div><b>${DOSHA[k][0]}</b></div><div><div class="dial"><i style="left:${50+Math.max(-1,Math.min(1,dz[k]/Math.max(1,L.length)))*40}%"></i></div></div><div class="eff ${dz[k]<0?"dn":dz[k]>0?"up":"eq"}">net ${dz[k]>0?"+":""}${dz[k]}</div></div>`).join("")}</div>
     ${!L.some(isCarb)?`<p class="note">No rice or bread chosen, so plain rice is drawn as a side. It isn't counted in the numbers.</p>`:""}
     <div class="cookdone"><button class="btn acc" id="serve">Serve the thali</button></div><div id="tk"></div>`
   :`<div class="empty" style="padding:20px 8px"><b>Build a thali</b>Tap “Suggest a thali” for a balanced plate (one rice or bread, two mains, one sweet, chosen to cover the six tastes and keep the doshas level), or add dishes from any recipe with “+ Add to thali”.</div>`}</div></div>
   <p class="note">Up to 6 dishes. Katoris (bowls) sit around the rim; rice, breads and dry dishes sit on the plate; salt, pickle and lemon go at the top, as on a traditional thali.</p>`;
  openModal(`<h2>Tonight's thali</h2>`, body);
  $("#tReg").onchange=e=>{thaliOpts.region=e.target.value;}; $("#tVeg").onchange=e=>{thaliOpts.veg=e.target.checked;};
  $("#tSug").onclick=()=>{ store.thali=suggestThali(thaliOpts.region,thaliOpts.veg); save(); refreshHeader(); openThali(); };
  $$("#mb [data-rm]").forEach(b=>b.onclick=()=>{ toggleThali(b.dataset.rm); openThali(); });
  $$("#mb [data-tadd]").forEach(b=>b.onclick=()=>{ if(!store.thali.includes(b.dataset.tadd)) toggleThali(b.dataset.tadd); openThali(); });
  const sv=$("#serve"); if(sv) sv.onclick=()=>{ const no=String(1000+Math.floor(Math.random()*9000)); $("#tk").innerHTML=`<div class="ticket"><h4>Order up! · Table 2</h4><div class="ln"><span>ORDER #${no}</span><span>${new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</span></div><hr style="border:0;border-top:1px dashed var(--rule)">${L.map(d=>`<div class="ln"><span>2 × ${esc(d.name)}</span><span>${d.mins}′</span></div>`).join("")}<hr style="border:0;border-top:1px dashed var(--rule)"><div class="ln"><b>Kitchen time (longest dish)</b><b>${Math.max(...L.map(d=>d.mins))}′</b></div><div style="margin-top:6px;color:var(--muted)">Home-restaurant mode arrives with the meal planner.</div></div>`; };
  const cl=$("#clearT"); if(cl) cl.onclick=()=>{ store.thali=[]; save(); refreshHeader(); openThali(); };
}
$("#bThali").onclick=openThali;


/* ================= food trails ================= */
const trailById = Object.fromEntries(TRAILS.map(t=>[t.id,t]));
const trailG = svg.insert("g", () => pinsG.node());
let trail = null;
function trailStops(){ return trail ? trail.stops.map(id=>byId[id]).filter(Boolean) : []; }
function drawTrail(){
  trailG.selectAll("*").remove(); if(!trail || $("#mapView").hidden) return;
  const pts = trailStops().map(d=>{ const p=proj([d.lon,d.lat]); return [T.applyX(p[0]),T.applyY(p[1]),d]; });
  const line = d3.line().curve(d3.curveCatmullRom.alpha(.5));
  trailG.append("path").attr("d",line(pts.map(p=>[p[0],p[1]]))).attr("class","trail-line").style("stroke",trail.color);
  const mr=$("#map").getBoundingClientRect(); const ps=Math.max(1,Math.min(2.2,.8/(Math.min(mr.width/W,mr.height/H)||1)));
  const seen={}; pts.forEach((p,i)=>{ const key=Math.round(p[0])+","+Math.round(p[1]); const off=(seen[key]=(seen[key]||0)+1)-1;
    const g=trailG.append("g").attr("transform",`translate(${p[0]+14*ps+off*15*ps},${p[1]-12*ps}) scale(${ps})`).attr("class","trail-stop").style("cursor","pointer").on("click",()=>openDish(p[2].id));
    g.append("circle").attr("r",7.5).style("fill",trail.color); g.append("text").attr("text-anchor","middle").attr("dy","3.2").text(i+1); });
}
function startTrail(id){
  closeModal(); closeDrawer(); clearAll(); trail = trailById[id]; F.trail = id; setView("map"); applyFilters();
  const pts=trailStops().map(d=>proj([d.lon,d.lat])); const xs=pts.map(p=>p[0]), ys=pts.map(p=>p[1]);
  const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
  const k=Math.min(6,Math.max(1,.75/Math.max((x1-x0)/W,(y1-y0)/H,.05)));
  svg.transition().duration(600).call(zoom.transform, d3.zoomIdentity.translate(W/2-k*(x0+x1)/2, H/2-k*(y0+y1)/2).scale(k));
  renderTrailBar(); drawTrail();
}
function endTrail(){ trail=null; F.trail=""; $("#trailbar").hidden=true; trailG.selectAll("*").remove(); applyFilters(); }
function renderTrailBar(){
  const b=$("#trailbar"); if(!trail){ b.hidden=true; return; }
  const L=trailStops(), tasted=L.filter(d=>status(d.id).t||status(d.id).c).length;
  b.hidden=false; b.style.borderColor=trail.color;
  b.innerHTML=`<span class="tdot" style="background:${trail.color}"></span><div class="q"><small>FOOD TRAIL · ${L.length} STOPS · ${tasted} TASTED</small><b>${esc(trail.name)}</b></div><button class="btn acc" id="trStart">Stop 1 →</button><button class="ibtn" id="trEnd" aria-label="End trail"><svg width="12" height="12" viewBox="0 0 14 14" stroke="currentColor" stroke-width="1.8"><path d="M2 2l10 10M12 2L2 12"/></svg></button>`;
  $("#trStart").onclick=()=>openDish(L[0].id); $("#trEnd").onclick=endTrail;
}
function openTrails(){
  openModal(`<h2>Food trails</h2>`,`<p class="lead" style="font-family:var(--f-display);font-size:17px;margin:0 0 14px">Pick a route. The map draws it, numbers each stop, and the arrows in a recipe walk you along it in order.</p>
   <div class="trails">${TRAILS.map(t=>{const L=t.stops.map(id=>byId[id]).filter(Boolean), done=L.filter(d=>status(d.id).t||status(d.id).c).length;
     return `<button class="trailc" data-trail="${t.id}" style="--tc:${t.color}"><span class="tbar"></span><b>${esc(t.name)}</b><span class="tmeta mono">${L.length} stops · ${done} tasted</span><span class="tblurb">${esc(t.blurb)}</span><span class="tstops">${L.slice(0,6).map(d=>esc(d.name)).join(" · ")}${L.length>6?" …":""}</span></button>`;}).join("")}</div>
   <p class="note">Trails are curated by the atlas.${TRAILS.filter(t=>t.src).length?" Background:":""}</p>${srcList(TRAILS.filter(t=>t.src).map(t=>t.src))}`);
  $$("#mb [data-trail]").forEach(b=>b.onclick=()=>startTrail(b.dataset.trail));
}
$("#bTrails").onclick=openTrails;
$("#bLab").onclick=openConcepts;

/* ================= ChemE deep dives ================= */
const DS = {
  mandhania:["Mandhania et al. (2019), Diversity and succession of microbiota during fermentation of idli, Applied and Environmental Microbiology 85:e00368-19","https://journals.asm.org/doi/pdf/10.1128/AEM.00368-19"],
  ratkowsky:["Ratkowsky, Olley, McMeekin & Ball (1982), Relationship between temperature and growth rate of bacterial cultures, J. Bacteriology 149:1–5","https://journals.asm.org/doi/10.1128/jb.149.1.1-5.1982"],
  leiden:["Wikipedia: Leidenfrost effect (≈193 °C for water)","https://en.wikipedia.org/wiki/Leidenfrost_effect"],
  antoine:["Wikipedia: Antoine equation (water constants)","https://en.wikipedia.org/wiki/Antoine_equation"],
  baro:["Wikipedia: Barometric formula","https://en.wikipedia.org/wiki/Barometric_formula"],
  mc:["Modernist Cuisine: How pressure cookers work (0.7–1 bar gauge → 114–121 °C)","https://modernistcuisine.com/mc/how-pressure-cookers-work/"],
  kwofie:["Kwofie, Mba & Ngadi (2020), Classification, force deformation characteristics and cooking kinetics of common beans, Processes 8:1227 (softening constants ≈ 0.04–0.06 across ten cultivars)","https://www.mdpi.com/2227-9717/8/10/1227"],
  dolan:["Dolan, Stoeckle & Beck (2005), Softening kinetics of cooked dry beans below 100 °C, J. Texture Studies 36:351","https://www.researchgate.net/publication/229887927_Softening_kinetics_of_cooked_dry_beans_at_temperatures_below_100C"],
  kbean:["Wikipedia: Kidney bean (phytohaemagglutinin; boil ≥10 min; 80 °C insufficient)","https://en.wikipedia.org/wiki/Kidney_bean"],
  explo:["Exploratorium: Sugar stages (temperature ↔ concentration)","https://annex.exploratorium.edu/cooking/candy/sugar-stages.html"],
  cooksinfo:["CooksInfo: Thread stage, 106–112 °C, 80% sugar","https://www.cooksinfo.com/thread-stage"],
  pectinW:["Wikipedia: Pectin (Ca²⁺ 'egg-box' gelation, middle lamella)","https://en.wikipedia.org/wiki/Pectin"],
  diaz:["Diaz, Anthon & Barrett (2007), Nonenzymatic degradation of citrus pectin and pectate during prolonged heating: effects of pH, temperature and degree of methyl esterification (UC Davis Postharvest)","https://postharvest.ucdavis.edu/node/5982"],
  voldrich:["Voldřich et al. (2009), Factors affecting the softening of pickled pasteurised cucumbers, Czech J. Food Sci. 27 (special issue): 20 mM CaCl₂ kept cucumbers firm; calcium's firming effect increases as pH falls","https://www.agriculturejournals.cz/pdfs/cjf/2009/10/79.pdf"],
  usu:["Utah State University Extension: Getting crisp home-pickled vegetables (pickling lime, calcium chloride)","https://extension.usu.edu/preserve-the-harvest/research/getting-crisp-home-pickled-vegetables.pdf"],
  sbuddies:["Science Buddies: Bean softening and cooking liquids (after McGee)","https://www.sciencebuddies.org/science-fair-projects/project-ideas/FoodSci_p026/cooking-food-science/bean-softening-cooking-liquids"],
  esrf:["ESRF / Nature Communications (2025): oil enters fried dough mostly during cooling; 14.4% oil at 180 °C, 12.2% at 150 °C, 1.3% at 120 °C","https://www.esrf.fr/home/news/general/content-news/general/scientists-find-ways-to-reduce-oil-intake-in-deep-fried-foods.html"],
  sahin:["Şahin & Bayındırlı (1999), Heat transfer during frying of potato slices, LWT (h ≈ 300–480 W/m²K before crust, 70–150 after)","https://open.metu.edu.tr/handle/11511/37633"],
  casein:["Wikipedia: Casein (isoelectric point 4.6)","https://en.wikipedia.org/wiki/Casein"],
  ruth:["911 Metallurgist: Pressure filtration theory (constant-pressure cake filtration, t/V vs V)","https://www.911metallurgist.com/blog/pressure-filtration-theory/"]
};
const LAB_BADGES = {ferment:"Fermenter",pressure:"Pressure vessel",syrup:"Evaporator",pectin:"Texture engineer",fry:"Fryer operator",filter:"Filter press"};

/* ---------- small chart helper ---------- */
function chart(el, o){
  const W0=o.w||520, H0=o.h||230, m={l:48,r:14,t:12,b:38}, w=W0-m.l-m.r, h=H0-m.t-m.b;
  const x=d3.scaleLinear().domain(o.x.d).range([0,w]), y=d3.scaleLinear().domain(o.y.d).range([h,0]);
  const s=d3.select(el).html("").append("svg").attr("viewBox",`0 0 ${W0} ${H0}`).attr("class","dchart");
  const g=s.append("g").attr("transform",`translate(${m.l},${m.t})`);
  g.append("g").attr("class","grid").call(d3.axisLeft(y).ticks(5).tickSize(-w).tickFormat(""));
  g.append("g").attr("class","ax").attr("transform",`translate(0,${h})`).call(d3.axisBottom(x).ticks(6));
  g.append("g").attr("class","ax").call(d3.axisLeft(y).ticks(5));
  g.append("text").attr("class","axl").attr("x",w/2).attr("y",h+32).attr("text-anchor","middle").text(o.x.l);
  g.append("text").attr("class","axl").attr("transform","rotate(-90)").attr("x",-h/2).attr("y",-36).attr("text-anchor","middle").text(o.y.l);
  (o.bands||[]).forEach(b=>{ g.append("rect").attr("x",x(b[0])).attr("width",Math.max(0,x(b[1])-x(b[0]))).attr("y",0).attr("height",h).attr("class","band").style("fill",b[2]); if(b[3]) g.append("text").attr("class","bandl").attr("x",x(b[0])+4).attr("y",12).text(b[3]); });
  (o.hlines||[]).forEach(v=>{ g.append("line").attr("x1",0).attr("x2",w).attr("y1",y(v[0])).attr("y2",y(v[0])).attr("class","ref"); g.append("text").attr("class","bandl").attr("x",w-4).attr("y",y(v[0])-4).attr("text-anchor","end").text(v[1]); });
  (o.vlines||[]).forEach(v=>{ g.append("line").attr("x1",x(v[0])).attr("x2",x(v[0])).attr("y1",0).attr("y2",h).attr("class","ref"); if(v[1]) g.append("text").attr("class","bandl").attr("x",x(v[0])+4).attr("y",h-6).text(v[1]); });
  const line=d3.line().x(p=>x(p[0])).y(p=>y(p[1]));
  o.series.forEach((sr,i)=>{ g.append("path").attr("d",line(sr.pts)).attr("class","sline").style("stroke",sr.c).style("stroke-dasharray",sr.dash||null);
    if(sr.label){ const L=sr.pts[Math.max(0,Math.min(sr.pts.length-1,sr.lab??(sr.pts.length-1)))]; const st=sr.anchor==="start"; g.append("text").attr("class","slab").attr("x",x(L[0])+(st?6:-4)).attr("y",y(L[1])-6).attr("text-anchor",st?"start":"end").style("fill",sr.c).text(sr.label);} });
  if(o.legend){ const lg=g.append("g").attr("transform",`translate(${x(o.legend[0])},${y(o.legend[1])})`); o.series.filter(s=>s.name).forEach((sr,i)=>{ lg.append("line").attr("x1",0).attr("x2",18).attr("y1",i*16).attr("y2",i*16).attr("class","sline").style("stroke",sr.c).style("stroke-dasharray",sr.dash||null); lg.append("text").attr("class","slab").attr("x",24).attr("y",i*16+4).style("fill",sr.c).text(sr.name); }); }
  (o.dots||[]).forEach(d=>{ g.append("circle").attr("cx",x(d[0])).attr("cy",y(d[1])).attr("r",d[3]||3.5).attr("class","ddot").style("fill",d[2]||"var(--ink)"); });
  if(o.marker){ const [mx,my]=o.marker; g.append("circle").attr("cx",x(mx)).attr("cy",y(my)).attr("r",5.5).attr("class","mk"); }
}

/* ---------- models ---------- */
const M = {
  // idli: Gompertz fit to Mandhania et al. 2019 lab batter at ~30 °C; time scaled by Ratkowsky square-root rule
  gomp:t=>t<=0?0:62*Math.exp(-Math.exp(6*Math.E/62*(6.5-t)+1)),
  phFit:t=>4.18+(6.3-4.18)*(1+Math.exp(-.52*9.3))/(1+Math.exp(.52*(t-9.3))),
  scale:T=>T<=5?0:Math.pow((Math.min(T,38)-5)/(30-5),2),
  rise(T,t){ return M.gomp(M.scale(T)*t)/M.gomp(15)*100; },
  ph(T,t){ return M.phFit(M.scale(T)*t); },
  tDouble(T){ const s=M.scale(T); return s>0?15/s:Infinity; },
  // water boiling point via Antoine (mmHg, °C)
  patm(alt){ return 101.325*Math.pow(1-2.25577e-5*alt,5.25588); },
  tboil(kPa){ const mm=kPa*7.50062; const [A,B,C]=mm>760?[8.14019,1810.94,244.485]:[8.07131,1730.63,233.426]; return B/(A-Math.log10(mm))-C; },
  kSoft(T){ const R=8.314, Ea=100e3; return 0.045*Math.exp(-Ea/R*(1/(T+273.15)-1/(96+273.15))); },
  // syrup: Exploratorium sugar stages (sea level) + pure water
  SYR:[[100,0],[100.37,20],[101.0,40],[101.5,50],[102.24,60],[110,80],[113,85],[118,87],[121,92],[132,95],[149,99],[160,100]],
  conc(T){ const S=M.SYR; if(T<=S[0][0]) return 0; for(let i=1;i<S.length;i++){ if(T<=S[i][0]){ const [t0,c0]=S[i-1],[t1,c1]=S[i]; return c0+(c1-c0)*(T-t0)/(t1-t0);} } return 100; },
  stage(T){ return T<104?"Thin syrup":T<110?"One-string (chashni)":T<113?"Thread":T<118?"Soft ball":T<121?"Firm ball":T<132?"Hard ball":T<149?"Soft crack":T<160?"Hard crack":"Caramel"; },
  // pectin: illustrative relative softening rate
  kPectin(pH,Ca){ const beta=0.02*(Math.pow(10,0.45*Math.max(0,pH-4.5))-1), acid=0.02*(Math.pow(10,0.5*Math.max(0,3.5-pH))-1); const caEff=pH<5?1:Math.max(.35,1-.25*(pH-5)); return (0.015+beta+acid)/(1+caEff*Ca/8); },
  // frying: oil content vs oil temperature, ESRF dough data (monotone interpolation)
  OIL:[[110,0.5],[120,1.3],[150,12.2],[180,14.4],[200,14.9]],
  oil(T){ const S=M.OIL; if(T<=S[0][0]) return S[0][1]; for(let i=1;i<S.length;i++) if(T<=S[i][0]){ const [a,b]=S[i-1],[c,d]=S[i]; return b+(d-b)*(T-a)/(c-a);} return S[S.length-1][1]; },
  // slab conduction, surface held at 100 °C (boiling front), centre temperature (Fourier series)
  centreT(t,L,T0=25,Ts=100,alpha=1.4e-7){ let s=0; for(let n=0;n<40;n++){ const ln=(2*n+1)*Math.PI/2; s+=(4*Math.pow(-1,n)/((2*n+1)*Math.PI))*Math.exp(-ln*ln*alpha*t/(L*L)); } return Ts+(T0-Ts)*s; },
  // filtration: Ruth constant-pressure; t = K1 V² + K2 V  (V in L, t in h)
  filt(t,P,Rm){ const K1=85/P, K2=1.2*Rm/P; return (-K2+Math.sqrt(K2*K2+4*K1*t))/(2*K1); }
};

/* ---------- deep-dive content ---------- */
const DEEP = {
ferment:{dishes:["idli","masala-dosa"],title:"The batter is a batch bioreactor",
 kitchen:"Overnight, bacteria on the urad dal eat sugars and breathe out gas and acid. Warmth speeds them up; cold stalls them. When the batter has doubled and smells pleasantly sour, it's ready.",
 eng:"Idli batter is a non-sterile, mixed-culture batch fermentation dominated by lactic acid bacteria (Weissella, then Enterococcus and Lactococcus). Heterofermentative metabolism produces CO₂ that the urad dal's protein-gum matrix traps, while lactic acid drops the pH from 6.3 to about 4.5. Rice alone barely leavens; the dal supplies both the microbes and the gas-holding structure.",
 pfd:[["Soak","Hydration","rice + urad, 6 h, 25–30 °C"],["Wet grind","Size reduction","ice-cold water keeps T low"],["Mix + salt","Inoculation","hand-mixing adds microbes"],["Ferment","Batch bioreactor","8–15 h, 26–32 °C"],["Steam / griddle","Heat transfer","idli: steam at 100 °C · dosa: tawa ≈ 200 °C"]],
 lab:"ferment",
 balance:[["Batter in (rice 120 g + urad 40 g + water ≈ 200 g)","≈ 360 g"],["Volume change at 15 h","≈ 2× (100% rise)"],["pH","6.3 → ≈ 4.5"],["Steaming: heat 360 g batter 30 → 95 °C, cp ≈ 3.5 kJ/kg·K","≈ 82 kJ"],["Steam condensed to supply it (h_fg 2257 kJ/kg)","≈ 36 g"]],
 trouble:[["Batter didn't rise overnight","Kitchen below ~20 °C: by the square-root rule the rate falls with (T − Tmin)², so 18 °C is roughly 3.7× slower than 30 °C. Use an oven with only the light on."],["Rose, then collapsed and smells sharp","Over-fermented: acid keeps rising and gas escapes as the matrix weakens. Refrigerate once doubled."],["Dosa sticks to the pan","Pan below the Leidenfrost point (~193 °C for water): batter boils in contact instead of gliding on a steam film. Test with a water drop that skitters."],["Flat, dense idlis","Under-aerated urad grind or too much water; the protein matrix can't hold the CO₂."]],
 twin:["Batch fermenter","Same physics as a jacketed batch bioreactor: inoculum, temperature control, a growth curve, and a product (acid + gas) measured over time. The tawa is a heat-transfer surface operated above the Leidenfrost point."],
 src:["mandhania","ratkowsky","leiden"],
 overlay:{"idli":[["Size reduction + aeration","cold grind limits heating"],["Inoculation","LAB from dal and hands"],["Batch fermentation","µ ∝ (T − Tmin)²"],["Gentle transfer","low shear keeps the CO₂"],["Steam heat transfer","condensing steam, very high h"],["Size reduction + tempering","—"]],
          "masala-dosa":[["Hydration","water uptake ∝ √t early on"],["Size reduction","cold grind limits heating"],["Batch fermentation","µ ∝ (T − Tmin)²"],["Heat + mixing","—"],["Leidenfrost test","T_pan > ~193 °C"],["Thin-film conduction + evaporation","crisp in 1–2 min"]]}},
pressure:{dishes:["rajma-chawal"],title:"Raise the pressure, raise the boiling point",
 kitchen:"A sealed cooker traps steam, so water can get hotter than 100 °C. Hotter water softens beans much faster. Kidney beans also need a proper hard boil to destroy a natural toxin; a slow cooker isn't hot enough.",
 eng:"Bean softening is limited by pectin solubilisation in the cell walls and is roughly first order in texture over the early cook. The rate constant follows Arrhenius, so the extra ~20 K from 1 bar gauge pressure (≈ 120 °C) compresses a 45-minute boil into ~10 minutes. Phytohaemagglutinin is denatured by boiling but not by 80 °C holding.",
 pfd:[["Soak","Hydration","8–10 h, ~2× mass"],["Seal + heat","Pressure vessel","steam at ≈ 1 bar gauge"],["Hold","Isothermal reaction","≈ 120 °C, 20–25 min"],["Vent","Flash / depressurise","natural release"],["Simmer gravy","Evaporation","thicken"]],
 lab:"pressure",
 balance:[["Beans 100 g dry → soaked","≈ 200 g (water uptake ≈ 100 g)"],["Water in cooker","400 ml"],["Heat 500 g water+beans 25 → 120 °C (cp ≈ 4.0)","≈ 190 kJ"],["Steam vented per whistle (order of magnitude)","a few grams"],["Toxin kill step","≥ 100 °C for ≥ 10 min"]],
 trouble:[["Still hard after cooking","Old, hard-to-cook beans soften far more slowly; soak longer, or add a pinch of baking soda (alkaline water helps cell walls loosen)."],["Upset stomach after slow-cooker rajma","80 °C doesn't destroy phytohaemagglutinin. Boil hard (pressure cook) first."],["Takes forever in the hills","At altitude water boils below 100 °C (Leh ≈ 88 °C), and by Arrhenius every few kelvin lost multiplies the time. The cooker fixes it."]],
 twin:["Retort / autoclave","Industrial canning runs the same steam-under-pressure idea at ~121 °C, and the 'F₀' value adds up lethality over time just as softening adds up here."],
 src:["antoine","baro","mc","kwofie","dolan","kbean","sbuddies"],
 overlay:{"rajma-chawal":[["Pressure vessel","T_b from Antoine at P_atm + P_g; F = F₀·e^(−kt)"],["Absorption cooking","water:rice ≈ 2:1 by mass"],["Maillard + evaporation","—"],["Reaction + thickening","starch from mashed beans"]]}},
syrup:{dishes:["jalebi"],title:"A syrup's temperature is its concentration",
 kitchen:"As sugar syrup boils, water leaves and the syrup gets hotter. So the thermometer tells you how concentrated it is. Jalebi syrup stops at 'one string' so it soaks in without crystallising.",
 eng:"Dissolved sucrose raises the boiling point (a colligative effect, strongly non-ideal at high concentration). At sea level the boiling temperature maps onto concentration: thread ≈ 110 °C ≈ 80% sucrose; Indian one-string chashni is a little thinner. A little acid inverts some sucrose to glucose and fructose, which disrupts crystal nucleation. The fried batter then wicks syrup into its pores.",
 pfd:[["Ferment batter","Batch fermentation","12–24 h"],["Fry","Heat + mass transfer","ghee ≈ 170 °C"],["Concentrate syrup","Evaporator","to ≈ 105 °C (one-string)"],["Soak","Absorption / wicking","≈ 1 min"]],
 lab:"syrup",
 balance:[["Syrup in: sugar 200 g + water 120 g","62.5% sugar"],["At one-string (≈ 105 °C → ≈ 67% in this model): water left = 200 × 0.33/0.67","≈ 98 g"],["Water evaporated","≈ 22 g"],["Latent heat for that (2257 kJ/kg)","≈ 50 kJ"],["Taken to true thread (80%) instead","70 g evaporated, ≈ 158 kJ"],["Sugar absorbed by the jalebis","≈ 90 g"]],
 trouble:[["Syrup crystallised","Too concentrated or agitated while cooling; add a few drops of lemon (inversion) and don't over-boil."],["Jalebis soggy","Syrup too thin, so it floods the pores; or batter fried too cool to set a crisp shell."],["Jalebis didn't absorb","Syrup too thick (past soft ball) or too cold to wick."]],
 twin:["Multiple-effect evaporator","Sugar mills concentrate juice the same way, by boiling off water. The boiling-point rise with concentration is what an evaporator designer has to account for."],
 src:["explo","cooksinfo"],
 overlay:{"jalebi":[["Batch fermentation","—"],["Evaporation","T_b ↔ concentration; acid inverts sucrose"],["Aeration","—"],["Frying: heat + mass transfer","—"],["Absorption","capillary wicking into pores"]]}},
pectin:{dishes:["agra-petha","khar"],title:"Firm or melting: pectin decides",
 kitchen:"Plant cells are glued together by pectin. Calcium (in petha's lime soak) ties pectin chains together, so pieces stay firm through hours of syrup. Alkali (khar water or baking soda) breaks pectin down, so papaya melts in minutes.",
 eng:"Low-methoxyl pectin chains cross-link through Ca²⁺ bridges between ionised galacturonic-acid carboxyls (the 'egg-box'), raising middle-lamella strength. Heating at near-neutral to alkaline pH depolymerises methyl-esterified pectin by β-elimination; at low pH, acid hydrolysis takes over. Calcium's firming effect grows as the pH falls. Petha and khar sit at the two ends of the same curve.",
 pfd:[["Cut + prick","Size reduction","more surface"],["Lime soak (petha)","Ion exchange + cross-linking","Ca(OH)₂, 6–8 h"],["Boil","Heat treatment","10–12 min"],["Syrup (petha) / alkaline simmer (khar)","Diffusion / β-elimination","30–40 min / 15–20 min"]],
 lab:"pectin",
 balance:[["Petha: gourd 500 g + sugar absorbed ≈ 220 g","≈ 420 g candied after drying"],["Khar: ¼ tsp baking soda in ≈ 300 ml","alkaline simmer, pH ≈ 8–9 (illustrative)"],["Petha soak: Ca(OH)₂ in 1 L","food-grade lime, rinsed off"]],
 trouble:[["Petha went soft","Lime soak too short or rinsed away before boiling; Ca²⁺ never reached the middle lamella."],["Khar turned to mush too fast","Too much alkali; the β-elimination rate climbs steeply with pH."],["Vegetables stay hard in tomato gravy","Acidic pH slows softening; add them before the tomatoes or cook longer."]],
 twin:["Calcium firming in canning","Commercial pickles and canned vegetables use calcium chloride for the same cross-linking; home picklers use food-grade lime or calcium chloride."],
 src:["pectinW","diaz","voldrich","usu","sbuddies"],
 overlay:{"agra-petha":[["Size reduction","more surface area"],["Ca²⁺ cross-linking","egg-box bridges"],["Washing","remove excess alkali"],["Blanching","—"],["Diffusion (osmotic)","sugar in, water out"],["Drying + crystallisation","—"]],
          "khar":[["Extraction (fat)","—"],["Mixing","—"],["Alkaline softening","β-elimination ↑ with pH"],["Size reduction (mash)","—"]]}},
fry:{dishes:["samosa","medu-vada"],title:"Frying is boiling from the outside in",
 kitchen:"Hot oil turns the water near the surface into steam; that's the bubbling. The steam pushes outwards and builds a crust, while the inside cooks like it's being steamed. Most oil actually soaks in after you lift the food out, as it cools.",
 eng:"Deep-fat frying is coupled heat and mass transfer with a moving evaporation front. The surface is pinned near 100 °C while free water flashes off, and convective coefficients run ~300–480 W/m²K in the vigorous boiling regime, falling once a crust forms. The interior heats by conduction (Bi ≈ 3–10 for these sizes, so internal conduction controls). Oil uptake is largely a post-frying capillary process as vapour in the pores condenses.",
 pfd:[["Shape","Geometry","half-thickness L sets cook time"],["Immerse","Convective heat transfer","oil 140–180 °C"],["Evaporate","Moving boundary","surface ≈ 100 °C"],["Crust forms","Drying / pore formation","h drops"],["Drain + cool","Capillary uptake","most oil enters here"]],
 lab:"fry",
 balance:[["Samosa: oil absorbed (recipe estimate)","≈ 40 g for 6"],["Medu vada: oil absorbed","≈ 30 g for 2 servings"],["Water evaporated (≈ 10% of mass, illustrative)","≈ 30–50 g"],["Latent heat to boil it off","≈ 70–110 kJ"]],
 trouble:[["Greasy result","Draining too slowly or piling hot pieces together: oil is drawn in as they cool. Drain on a rack, shake off surface oil while hot."],["Samosa crust blistered","Oil too hot at the start; rapid surface flashing puffs the dough. Start near 140 °C and raise slowly."],["Raw inside, dark outside","Too thick for the oil temperature: centre heating scales with L²/α, the crust with surface temperature."]],
 twin:["Continuous industrial fryer","Snack lines control oil temperature, residence time and post-fryer de-oiling for exactly these reasons."],
 src:["esrf","sahin"],
 overlay:{"samosa":[["Fat dispersion (shortening)","fat coats flour, limits gluten"],["Mixing","—"],["Shaping","sets L"],["Shaping","—"],["Frying: moving evaporation front","t_centre ∝ L²/α"]],
          "medu-vada":[["Size reduction","—"],["Aeration","foam traps air"],["Mixing","—"],["Shaping","ring cuts L"],["Frying: heat + mass transfer","surface ≈ 100 °C while wet"]]}},
filter:{dishes:["shrikhand","rosogolla"],title:"Curds, whey and cake filtration",
 kitchen:"Acid makes milk proteins clump; that's chhena. Hanging yogurt or chhena in cloth lets whey drip out; it starts fast and slows down as the layer of curd on the cloth thickens.",
 eng:"Casein micelles lose their net charge near the isoelectric point (pH 4.6), so acidifying milk precipitates them. Straining is constant-pressure cake filtration driven by a small hydrostatic head: filtrate rate falls as cake builds, and t/V is linear in V (Ruth), with the slope set by specific cake resistance and the intercept by the cloth.",
 pfd:[["Acidify / culture","Coagulation","pH 6.6 → ≈ 4.6"],["Pour into muslin","Filter cake forms","gravity head"],["Hang","Constant-ΔP filtration","rate falls with cake"],["Knead / whisk","Shear","smooth texture"]],
 lab:"filter",
 balance:[["Shrikhand: yogurt in","500 g"],["Strained yogurt out","≈ 220 g"],["Whey removed","≈ 280 g (56%)"],["Rosogolla: milk in → chhena","1 L → ≈ 180 g"]],
 trouble:[["Shrikhand grainy","Curds too firm or not whisked; push through a sieve."],["Whey stopped dripping","The cake is now the main resistance; a gentle press (more ΔP) restarts flow."],["Chhena rubbery","Acid added to boiling milk or held hot too long; proteins over-contract."]],
 twin:["Plate-and-frame filter press","Industrial whey separation uses the same Ruth analysis: plot t/V against V to read cake resistance and cloth resistance."],
 src:["casein","ruth"],
 overlay:{"shrikhand":[["Constant-ΔP cake filtration","t/V = K₁V + K₂"],["Infusion","—"],["Mixing / shear","—"],["Chilling","—"]],
          "rosogolla":[["Acid coagulation","pH → 4.6"],["Filtration + washing","—"],["Shear (kneading)","—"],["Heat transfer","—"],["Boiling + diffusion","syrup in"],["Cooling","—"]]}}
};
const DEEP_BY_DISH = {}; Object.entries(DEEP).forEach(([k,v])=>v.dishes.forEach(d=>DEEP_BY_DISH[d]=k));

/* ---------- labs ---------- */
function rng(id,label,min,max,step,val,unit){ return `<div class="rngx"><label for="${id}">${label}<output id="${id}o">${val}${unit}</output></label><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}"></div>`; }
const LABS = {
 ferment:{title:"Fermentation: temperature vs time", challenge:"Get the batter to double in under 10 hours without going above 37 °C.",
  html:()=>`${rng("fTemp","Batter temperature",10,40,1,24," °C")}${rng("fTime","Fermentation time",0,24,0.5,12," h")}`,
  run(){ const T=+$("#fTemp").value, t=+$("#fTime").value; $("#fTempo").textContent=T+" °C"; $("#fTimeo").textContent=t+" h";
   const ts=d3.range(0,24.01,.25), r=ts.map(x=>[x,M.rise(T,x)]), r30=ts.map(x=>[x,M.rise(30,x)]), td=M.tDouble(T);
   chart($("#labc"),{x:{d:[0,24],l:"Time (h)"},y:{d:[0,150],l:"Rise (% of start volume)"},hlines:[[100,"doubled"]],series:[{pts:r30,c:"var(--muted)",dash:"4 4",label:"30 °C",lab:70},{pts:r,c:"var(--turmeric)",label:T+" °C",lab:96}],
    dots:[[0,0],[6,1],[12,34],[18,52],[24,62]].map(p=>[p[0],p[1]/M.gomp(15)*100,"var(--muted)"]),marker:[t,M.rise(T,t)]});
   const ph=M.ph(T,t);
   $("#labr").innerHTML=ro([["Rise now",Math.round(M.rise(T,t))+"%"],["pH now",ph.toFixed(1)],["Time to double",isFinite(td)?td.toFixed(1)+" h":"never"],["Rate vs 30 °C",(M.scale(T)).toFixed(2)+"×"]]);
   return td<10 && T<=37; },
  note:"Dots: measured rise of laboratory idli batter at ≈ 30 °C (Mandhania et al. 2019), normalised so 100% = doubled at 15 h. Solid line: Gompertz fit to those points, with time scaled by the Ratkowsky square-root rule µ ∝ (T − Tmin)², Tmin = 5 °C (illustrative; the study saw no fermentation at 4 °C). Capped at 38 °C; real batter turns over-sour and yeasty above that."},
 pressure:{title:"Pressure cooking: boiling point → softening time", challenge:"Get rajma tender (95% softened) in under 15 minutes of hold time at Leh's altitude, 3,500 m, and pass the toxin step.",
  html:()=>`${rng("pA","Altitude",0,4000,100,0," m")}${rng("pP","Cooker pressure (gauge)",0,1.0,0.05,1.0," bar")}${rng("pt","Hold time",0,90,1,20," min")}`,
  run(){ const A=+$("#pA").value, P=+$("#pP").value, t=+$("#pt").value; $("#pAo").textContent=A+" m"; $("#pPo").textContent=P.toFixed(2)+" bar"; $("#pto").textContent=t+" min";
   const pa=M.patm(A), Tb=M.tboil(pa+P*100), Topen=M.tboil(pa), k=M.kSoft(Tb), ko=M.kSoft(Topen);
   const ts=d3.range(0,90.1,1), f=ts.map(x=>[x,100*Math.exp(-k*x)]), fo=ts.map(x=>[x,100*Math.exp(-ko*x)]);
   chart($("#labc"),{x:{d:[0,90],l:"Hold time (min)"},y:{d:[0,100],l:"Firmness (% of soaked bean)"},hlines:[[5,"tender (95% softened)"]],series:[{pts:fo,c:"var(--muted)",dash:"4 4",name:`open pot, boils at ${Topen.toFixed(1)} °C`},{pts:f,c:"var(--chili)",name:`cooker, ${Tb.toFixed(1)} °C`}],legend:[42,92],marker:[t,100*Math.exp(-k*t)]});
   const tsoft=Math.log(20)/k, safe=Tb>=100&&t>=10;
   $("#labr").innerHTML=ro([["Boiling point",Tb.toFixed(1)+" °C"],["Time to tender",tsoft.toFixed(0)+" min"],["Open pot would take",(Math.log(20)/ko).toFixed(0)+" min"],["Toxin step",safe?"✓ ≥100 °C, ≥10 min":"✗ not yet safe"]]);
   return A>=3500 && tsoft<15 && safe; },
  note:"Boiling point from the Antoine equation for water at P_atm (barometric formula) + gauge pressure. Softening F = F₀·e^(−kt), first order (adequate for the first ~30 min per Dolan et al. 2005), with k = 0.045 min⁻¹ at 96 °C (mid-range of Kwofie et al. 2020) and an illustrative activation energy of 100 kJ/mol. The toxin check follows the guidance to boil kidney beans at least 10 minutes. Hold time excludes heat-up and natural release, which is why the recipe's 6–7 whistles take about 25 minutes overall."},
 syrup:{title:"Sugar syrup: temperature ↔ concentration", challenge:"Bring the syrup to one-string chashni (105–110 °C) for jalebi, at sea level.",
  html:()=>`${rng("sT","Syrup temperature",100,160,0.5,104," °C")}${rng("sA","Altitude",0,3000,100,0," m")}`,
  run(){ const T=+$("#sT").value, A=+$("#sA").value; $("#sTo").textContent=T+" °C"; $("#sAo").textContent=A+" m";
   const corr=A/152.4*0.556, Teq=T+corr, c=M.conc(Teq), ts=d3.range(100,150.1,.5);
   chart($("#labc"),{x:{d:[100,150],l:"Boiling temperature at sea level (°C)"},y:{d:[0,100],l:"Sucrose (% by mass)"},bands:[[105,110,"var(--turmeric-soft)","one-string"]],
    series:[{pts:ts.map(x=>[x,M.conc(x)]),c:"var(--turmeric)"}],dots:M.SYR.slice(1,-1).filter(p=>p[0]<=150).map(p=>[p[0],p[1],"var(--ink-2)",3]),marker:[Math.min(150,Teq),c]});
   const S=200, W=S*(1-c/100)/(c/100||1e-9), ev=Math.max(0,120-W);
   $("#labr").innerHTML=ro([["Stage",M.stage(Teq)],["Sucrose",c.toFixed(0)+"%"],["Water left (200 g sugar)",c>0?W.toFixed(0)+" g":"—"],["Evaporated / energy",c>62.5?`${ev.toFixed(0)} g · ${(ev*2.257).toFixed(0)} kJ`:"still diluting"]]);
   return Teq>=105 && Teq<=110 && A===0; },
  note:"Above 80%: sugar stages and concentrations from the Exploratorium at the lower end of each stage (thread 110 °C / 80%, soft ball 113 °C / 85%, firm ball 118 °C / 87%, hard ball 121 °C / 92%, soft crack 132 °C / 95%, hard crack 149 °C / 99%). Up to 60%: ideal boiling-point elevation ΔT = K_b·m with K_b = 0.512 K·kg/mol (dilute-solution theory; it underestimates at high concentration). Between 60 and 80% the curve is a straight-line bridge, so read it as approximate. Indian one-string chashni sits at the thin end of thread stage. Altitude: the Exploratorium's rule of about 1 °F lower per 500 ft. Mass balance uses the recipe's 200 g sugar + 120 g water."},
 pectin:{title:"Pectin: pH and calcium set the softening rate", challenge:"Find conditions that keep petha firm (≥ 70% after 40 min) and khar soft (≤ 20% after 15 min).",
  html:()=>`${rng("qp","pH of cooking liquid",3,9.5,0.1,4.5,"")}${rng("qc","Calcium",0,40,1,0," mM")}${rng("qt","Cooking time",0,60,1,30," min")}`,
  run(){ const pH=+$("#qp").value, Ca=+$("#qc").value, t=+$("#qt").value; $("#qpo").textContent=pH.toFixed(1); $("#qco").textContent=Ca+" mM"; $("#qto").textContent=t+" min";
   const ps=d3.range(3,9.51,.05), k=M.kPectin(pH,Ca), F=100*Math.exp(-k*t/10);
   chart($("#labc"),{x:{d:[3,9.5],l:"pH"},y:{d:[0,2],l:"Softening rate k (per 10 min)"},bands:[[3,3.6,"var(--panel-2)","acid hydrolysis"],[6.5,9.5,"var(--panel-2)","β-elimination"]],
    series:[{pts:ps.map(x=>[x,Math.min(2,M.kPectin(x,0))]),c:"var(--chili)",name:"no calcium"},{pts:ps.map(x=>[x,Math.min(2,M.kPectin(x,20))]),c:"var(--veg)",name:"20 mM Ca²⁺"},{pts:ps.map(x=>[x,Math.min(2,M.kPectin(x,Ca))]),c:"var(--turmeric)",dash:"5 3",name:`your setting, ${Ca} mM`}],legend:[3.9,1.75],marker:[pH,Math.min(2,k)],
    vlines:[[4.5,"most stable"]]});
   const petha=100*Math.exp(-M.kPectin(pH,Ca)*40/10), khar=100*Math.exp(-M.kPectin(pH,Ca)*15/10);
   $("#labr").innerHTML=ro([["Rate (relative)",k.toFixed(2)],["Firmness now",F.toFixed(0)+"%"],["…after 40 min (petha)",petha.toFixed(0)+"%"],["…after 15 min (khar)",khar.toFixed(0)+"%"]]);
   LABS.pectin._seen ||= {}; if(petha>=70 && Ca>=10) LABS.pectin._seen.p=1; if(khar<=20 && pH>=7.5) LABS.pectin._seen.k=1;
   return !!(LABS.pectin._seen.p && LABS.pectin._seen.k); },
  note:"Illustrative model, not fitted constants: softening rate rises steeply above pH ≈ 4.5 (β-elimination of methyl-esterified pectin) and below ≈ 3.5 (acid hydrolysis), and calcium cross-linking slows it, more strongly at lower pH (Voldřich et al. 2009, citing earlier work; 20 mM CaCl₂ kept their pickles firm). The shape follows the cited chemistry; the numbers are for intuition. The challenge needs two separate settings: one for petha, one for khar."},
 fry:{title:"Frying: oil temperature, thickness and oil uptake", challenge:"Cook a 1.2 cm-thick piece through (centre ≥ 75 °C) in under 6 minutes while keeping oil content below 13%.",
  html:()=>`${rng("yT","Oil temperature",110,200,1,170," °C")}${rng("yL","Thickness",4,30,1,16," mm")}`,
  run(){ const T=+$("#yT").value, Lmm=+$("#yL").value; $("#yTo").textContent=T+" °C"; $("#yLo").textContent=Lmm+" mm";
   const L=Lmm/2000, ts=d3.range(0,900.1,5), c=ts.map(x=>[x/60,M.centreT(x,L)]);
   let t75=null; for(const s of ts){ if(M.centreT(s,L)>=75){ t75=s; break; } }
   const oil=M.oil(T), h=T<150?300:T<175?380:450, Bi=h*L/0.5, vig=Math.max(0,(T-100))*h/1000;
   chart($("#labc"),{x:{d:[0,15],l:"Time in oil (min)"},y:{d:[20,100],l:"Centre temperature (°C)"},hlines:[[75,"cooked through"]],series:[{pts:c,c:"var(--chili)",label:`${Lmm} mm piece`,lab:t75?Math.round(t75/5)+8:60,anchor:"start"}],marker:t75?[t75/60,75]:null});
   $("#labr").innerHTML=ro([["Centre ≥ 75 °C at",t75?(t75/60).toFixed(1)+" min":"> 15 min"],["Oil content (dough data)",oil.toFixed(1)+"%"],["Biot number hL/k",Bi.toFixed(0)],["Heat flux h(T_oil − 100 °C)",vig.toFixed(0)+" kW/m²"]]);
   return Lmm===12 && t75 && t75<=360 && oil<13; },
  note:"Centre temperature: 1-D slab conduction with the surface pinned at 100 °C while water evaporates (series solution), α = 1.4×10⁻⁷ m²/s (typical moist food, illustrative). Oil content: measured final oil in fried dough at 120, 150 and 180 °C (ESRF / Nature Communications 2025), interpolated. h from potato-slice measurements (Şahin & Bayındırlı 1999); k ≈ 0.5 W/m·K. Frying time doesn't depend on oil temperature in this simple model because the surface sits at 100 °C until a crust dries; oil temperature mainly sets crust, bubbling and oil uptake."},
 filter:{title:"Straining: cake filtration in a muslin cloth", challenge:"Strain 500 g yogurt to shrikhand texture (≥ 0.26 L whey out) within 6 hours.",
  html:()=>`${rng("zP","Driving pressure (×, gravity hang = 1)",0.5,4,0.1,1,"×")}${rng("zR","Cloth resistance (×)",0.2,3,0.1,1,"×")}${rng("zt","Time hanging",0,10,0.25,4," h")}`,
  run(){ const P=+$("#zP").value, Rm=+$("#zR").value, t=+$("#zt").value; $("#zPo").textContent=P.toFixed(1)+"×"; $("#zRo").textContent=Rm.toFixed(1)+"×"; $("#zto").textContent=t+" h";
   const ts=d3.range(0,10.01,.1), V=ts.map(x=>[x,M.filt(x,P,Rm)]), v=M.filt(t,P,Rm);
   chart($("#labc"),{x:{d:[0,10],l:"Time (h)"},y:{d:[0,.45],l:"Whey collected (L)"},hlines:[[.26,"shrikhand texture"]],series:[{pts:V,c:"var(--turmeric)"}],marker:[t,v],w:520,h:200});
   const yld=500-v*1030;
   $("#labr").innerHTML=ro([["Whey out",(v*1000).toFixed(0)+" ml"],["Strained yogurt",Math.max(0,yld).toFixed(0)+" g"],["Rate now",t>0?((M.filt(t+.05,P,Rm)-M.filt(t,P,Rm))/.05*1000).toFixed(0)+" ml/h":"—"],["t/V (Ruth plot, h/L)",t>0?(t/v).toFixed(1):"—"]]);
   return v>=.26 && t<=6; },
  note:"Constant-pressure cake filtration (Ruth): t = K₁V² + K₂V, with K₁ ∝ μαc/(A²ΔP) and K₂ ∝ μR_m/(AΔP). Constants are illustrative, chosen so a plain gravity hang removes ≈ 280 g of whey from 500 g yogurt in about 6–8 hours, matching the recipe. A 'driving pressure' of 2× is like a gentle weight on the bundle. Watch t/V: it rises in a straight line with V, which is how an engineer reads cake and cloth resistance off a filter test. The casein in the curd precipitates near its isoelectric point, pH 4.6."}
};
function overlayFor(d){ const k=DEEP_BY_DISH[d.id]; return k&&DEEP[k].overlay[d.id]||[]; }
function opChip(o,big){ if(!o) return ""; const eq=isEng()&&o[1]&&o[1]!=="—"; return `<button class="opchip ${big?"big":""}" data-deeptab="1" title="Open the ChemE deep dive"><span class="mono">UNIT OP</span> ${esc(o[0])}${eq?`<em>${esc(o[1])}</em>`:""}</button>`; }
function ro(rows){ return rows.map(([a,b])=>`<div><span>${a}</span><b>${b}</b></div>`).join(""); }

/* ---------- render the ChemE pane ---------- */
function isEng(){ return (store.depth||"eng")==="eng"; }
function paneCheme(d){
  const key=DEEP_BY_DISH[d.id];
  if(!key){
    return `<div class="lockban"><svg width="34" height="34" viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M13 7h10M15 7v8L8.5 26.5A3 3 0 0 0 11 31h14a3 3 0 0 0 2.5-4.5L21 15V7"/><path d="M11 23h14"/></svg><div><b>No deep dive for this dish yet</b><span>${Object.keys(DEEP).length} process deep dives with interactive labs are live, covering ${Object.keys(DEEP_BY_DISH).length} dishes (see the concept index). Here are the core concepts in this recipe:</span></div></div>
     ${d.cheme.map(k=>`<div class="concept"><b>${esc(CHEME[k][0])}</b><p>${esc(CHEME[k][1])}</p><button class="linkbtn" data-concept="${k}">See all ${DISHES.filter(x=>x.cheme.includes(k)).length} dishes with ${esc(CHEME[k][0].toLowerCase())} →</button></div>`).join("")}
     <p><button class="btn ghost" data-cindex="1">Open the concept index</button></p>`;
  }
  const D=DEEP[key], L=LABS[D.lab], eng=isEng(), done=store.labs&&store.labs[D.lab];
  return `<div class="dhead"><div><div class="kick mono">CHEME DEEP DIVE</div><h3 style="margin:2px 0 0">${esc(D.title)}</h3></div>
    <div class="seg dseg" role="group" aria-label="Depth"><button data-depth="kit" aria-pressed="${!eng}">Kitchen</button><button data-depth="eng" aria-pressed="${eng}">Engineer</button></div></div>
   <p class="story" style="font-size:15.5px">${esc(eng?D.eng:D.kitchen)}</p>
   <h3>Process flow</h3>
   <div class="pfdwrap"><div class="pfd">${D.pfd.map((u,i)=>`<div class="unit"><span class="un mono">U-${String(i+1).padStart(2,"0")}</span><b>${esc(u[0])}</b><span class="uop">${esc(u[1])}</span>${eng?`<span class="ucond mono">${esc(u[2])}</span>`:""}</div>${i<D.pfd.length-1?'<span class="arrow" aria-hidden="true">→</span>':""}`).join("")}</div></div>
   <h3>Lab: ${esc(L.title)} ${done?`<span class="pbadge">✓ ${esc(LAB_BADGES[D.lab])} badge</span>`:""}</h3>
   <div class="lab"><div class="labctl">${L.html()}<div class="chal"><b>Challenge</b> ${esc(L.challenge)}<span id="chalst"></span></div></div>
    <div class="labout"><div id="labc" class="labc"></div><div class="readx" id="labr"></div></div></div>
   ${eng?`<p class="note">${esc(L.note)}</p>`:""}
   <h3>Mass and energy balance</h3><table class="pts bal">${D.balance.map(r=>`<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join("")}</table>
   <h3>Troubleshooting from first principles</h3><div class="trbl">${D.trouble.map(t=>`<div><b>${esc(t[0])}</b><p>${esc(t[1])}</p></div>`).join("")}</div>
   <h3>Plant-scale twin</h3><div class="concept"><b>${esc(D.twin[0])}</b><p>${esc(D.twin[1])}</p></div>
   ${Object.keys(D.overlay||{}).length?`<p class="note">The step-by-step overlay is on the Recipe tab and in cook mode: each step shows its unit operation${eng?" and governing relation":""}.</p>`:""}
   <h3>Sources</h3>${srcList(D.src.map(s=>DS[s]))}`;
}
function wireCheme(d){
  const key=DEEP_BY_DISH[d.id]; if(!key || !$("#pane .lab")) return;
  const D=DEEP[key], L=LABS[D.lab];
  const go=()=>{ const ok=L.run(); const st=$("#chalst"); if(!st) return; st.textContent=ok?" ✓ Solved":""; st.className=ok?"ok":"";
    if(ok){ store.labs ||= {}; if(!store.labs[D.lab]){ store.labs[D.lab]=true; save(); refreshHeader(); toast(`Process badge: ${LAB_BADGES[D.lab]}`); } } };
  $$("#pane .lab input[type=range]").forEach(r=>r.addEventListener("input",go)); go();
}
document.addEventListener("click",e=>{
  const dp=e.target.closest("[data-depth]"); if(dp){ store.depth=dp.dataset.depth; save(); renderPane(); return; }
  const c=e.target.closest("[data-concept]"); if(c){ clearAll(); F.concept=c.dataset.concept; closeModal(); closeDrawer(); applyFilters(); toast(`Showing ${shown.length} dishes: ${CHEME[F.concept][0]}`); return; }
  const ci=e.target.closest("[data-cindex]"); if(ci){ openConcepts(); }
});

/* ---------- concept index ---------- */
function openConcepts(){
  const rows=Object.entries(CHEME).map(([k,[n,desc]])=>({k,n,desc,L:DISHES.filter(d=>d.cheme.includes(k))})).sort((a,b)=>b.L.length-a.L.length);
  openModal(`<h2>ChemE concept index</h2>`,`<p class="lead" style="font-family:var(--f-display);font-size:17px;margin:0 0 14px">Every concept, and every dish that uses it. Tap "Show on map" to light up just those dishes.</p>
   <div class="deepl">${Object.entries(DEEP).map(([k,D])=>`<button class="deepc" data-open="${D.dishes[0]}" data-deeptab="1"><span class="mono">DEEP DIVE${store.labs&&store.labs[D.lab]?" · ✓":""}</span><b>${esc(D.title)}</b><span>${D.dishes.map(id=>esc(byId[id].name)).join(" · ")}</span></button>`).join("")}</div>
   <div class="cidx">${rows.map(r=>`<div class="crow"><div><b>${esc(r.n)}</b><p>${esc(r.desc)}</p><div class="cdish">${r.L.slice(0,14).map(d=>`<button class="kinb" data-open="${d.id}">${esc(d.name)}</button>`).join("")}${r.L.length>14?`<span class="mono" style="font-size:11px;color:var(--muted)">+${r.L.length-14} more</span>`:""}</div></div><button class="btn ghost" data-concept="${r.k}">Show ${r.L.length} on map</button></div>`).join("")}</div>`);
}
document.addEventListener("click",e=>{ const t=e.target.closest("[data-deeptab]"); if(t){ if(cookState) closeCook(); setTimeout(()=>{ if(!cur) return; $("#dbody").scrollTop=0; tab="cheme"; $$(".tabs button").forEach(x=>x.setAttribute("aria-selected",x.dataset.tab==="cheme")); renderPane(); },0); } });

/* ================= guess-the-origin game ================= */
let game=null;
const hav=(a,b)=>{ const R=6371,r=Math.PI/180,dLa=(b[1]-a[1])*r,dLo=(b[0]-a[0])*r; const h=Math.sin(dLa/2)**2+Math.cos(a[1]*r)*Math.cos(b[1]*r)*Math.sin(dLo/2)**2; return 2*R*Math.asin(Math.sqrt(h)); };
function startGame(){
  closeDrawer(); closeModal(); if(trail) endTrail(); setView("map"); hidePop();
  const pool=DISHES.slice().sort(()=>Math.random()-.5).slice(0,5);
  game={pool,i:0,total:0,res:[],guess:null};
  svg.transition().duration(400).call(zoom.transform,d3.zoomIdentity);
  updatePins(); hud(); readout(null);
}
function hud(){
  const h=$("#hud"); if(!game){ h.hidden=true; return; } h.hidden=false;
  const d=game.pool[game.i], g=game.guess;
  h.innerHTML=`<div class="thumb">${sketch(d)}</div><div class="q"><small>Round ${game.i+1} of 5</small><b>${esc(d.name)}</b><span>${g?`${esc(d.place)} · ${Math.round(g.km)} km off · +${g.pts}`:"Tap the map where it comes from"}</span></div>
   <div class="sc">${game.total}<small>points</small></div>${g?`<button class="btn acc" id="gNext">${game.i<4?"Next":"Finish"}</button>`:`<button class="ibtn" id="gQuit" aria-label="Quit game"><svg width="12" height="12" viewBox="0 0 14 14" stroke="currentColor" stroke-width="1.8"><path d="M2 2l10 10M12 2L2 12"/></svg></button>`}`;
  const n=$("#gNext"); if(n) n.onclick=nextRound; const q=$("#gQuit"); if(q) q.onclick=()=>endGame(true);
}
svg.on("click.game",function(e){
  if(!game||game.guess) return;
  const [mx,my]=d3.pointer(e,this); const [x,y]=T.invert([mx,my]); const ll=proj.invert([x,y]); if(!ll) return;
  const d=game.pool[game.i]; const km=hav(ll,[d.lon,d.lat]); const p=Math.round(1000*Math.exp(-km/400));
  game.guess={ll,km,pts:p}; game.total+=p; game.res.push({d,km,p}); drawGame(true); hud();
});
function drawGame(animate){
  gameG.selectAll("*").remove(); if(!game||!game.guess) return;
  const d=game.pool[game.i]; const a=proj(game.guess.ll), b=proj([d.lon,d.lat]);
  const A=[T.applyX(a[0]),T.applyY(a[1])], B=[T.applyX(b[0]),T.applyY(b[1])];
  const ln=gameG.append("line").attr("class","guess-line").attr("x1",A[0]).attr("y1",A[1]).attr("x2",A[0]).attr("y2",A[1]);
  if(animate) ln.transition().duration(600).attr("x2",B[0]).attr("y2",B[1]); else ln.attr("x2",B[0]).attr("y2",B[1]);
  gameG.append("path").attr("d",`M${A[0]-6},${A[1]-6}L${A[0]+6},${A[1]+6}M${A[0]+6},${A[1]-6}L${A[0]-6},${A[1]+6}`).style("stroke","var(--chili)").attr("stroke-width",3);
  gameG.append("circle").attr("cx",B[0]).attr("cy",B[1]).attr("r",8).style("fill",pinColor([d])).style("stroke","var(--panel)").attr("stroke-width",2);
  gameG.append("text").attr("x",B[0]+12).attr("y",B[1]+4).attr("class","grat-l").style("font-size","13px").style("font-weight","700").style("fill","var(--ink)").style("paint-order","stroke").style("stroke","var(--sea)").style("stroke-width","3px").text(d.place.split(",")[0]);
}
function nextRound(){ if(game.i<4){ game.i++; game.guess=null; drawGame(); hud(); } else finishGame(); }
function finishGame(){
  const g=game; const prev=store.best; store.best=Math.max(store.best,g.total); store.gamexp+=g.total/20; save(); refreshHeader();
  endGame(true);
  openModal(`<h2>Final score: <span class="mono">${g.total}</span></h2>`,`
   <table class="pts">${g.res.map(r=>`<tr><td>${esc(r.d.name)} <span style="color:var(--muted)">· ${esc(r.d.place)}</span></td><td>${Math.round(r.km)} km</td><td>+${r.p}</td></tr>`).join("")}<tr class="tot"><td>Total</td><td></td><td>${g.total}</td></tr></table>
   <p class="note">${g.total>prev?"New personal best! ":""}Best: <b class="mono">${store.best}</b>. Points fall off with distance: 1000 × e<sup>−km/400</sup>. +${Math.round(g.total/20)} XP.</p>
   <div class="cookdone"><button class="btn acc" id="again">Play again</button><button class="btn ghost" data-open="${g.res[0].d.id}">Open ${esc(g.res[0].d.name)}</button></div>`);
  $("#again").onclick=startGame;
}
function endGame(silent){ game=null; gameG.selectAll("*").remove(); $("#hud").hidden=true; updatePins(); readout(null); }
$("#bPlay").onclick=startGame;
$("#bSurprise").onclick=()=>{ const L=shown.length?shown:DISHES; const d=L[Math.floor(Math.random()*L.length)]; if(store.view==="map") flyTo(d); openDish(d.id); };

/* ================= keyboard, hash, boot ================= */
document.addEventListener("keydown", e => {
  const typing = /INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName);
  if (e.key==="Escape"&&!$("#cook").hidden){ closeCook(); return; }
  if (!$("#cook").hidden){ if(e.key==="ArrowRight") $("#ckNext")?.click(); else if(e.key==="ArrowLeft") $("#ckPrev")?.click(); return; }
  if (e.key==="Escape"){ if($("#modal").classList.contains("on")) closeModal(); else if($("#drawer").classList.contains("on")) closeDrawer(); else if(game) endGame(true); else if(typing) document.activeElement.blur(); return; }
  if (typing) return;
  if (e.key==="/"){ e.preventDefault(); $("#q").focus(); }
  else if (e.key==="m") setView("map"); else if (e.key==="c") setView("cards"); else if (e.key==="p") setView("plan");
  else if (e.key==="g") startGame();
  else if (cur && e.key==="ArrowRight") step(1); else if (cur && e.key==="ArrowLeft") step(-1);
});
function syncHdr(){ document.documentElement.style.setProperty("--hdr", $("#top").offsetHeight+"px"); }
window.addEventListener("resize", ()=>{ syncHdr(); updatePins(); });
document.addEventListener("click", e => { const j=e.target.closest("[data-jumpvars]"); if(j){ const v=$("#vars"); if(v) v.scrollIntoView({behavior:"smooth",block:"start"}); } });
document.addEventListener("click", e => { const tg=e.target.closest("[data-tagf]"); if(tg){ clearAll(); F.tags.add(tg.dataset.tagf); closeDrawer(); applyFilters(); toast(`Showing ${shown.length} dishes: ${TAGDEF[tg.dataset.tagf][0]}`); } });
document.addEventListener("click", e => { const k=e.target.closest("[data-kit]"), f=e.target.closest("[data-fest]"); if(!k&&!f) return; clearAll(); if(k) F.kit=k.dataset.kit; else F.fest=f.dataset.fest; closeDrawer(); applyFilters(); toast(`Showing ${shown.length} dish${shown.length===1?"":"es"}: ${k?KITCHENS[F.kit]:F.fest}`); });
$("#subt").textContent = `Indian Food Atlas · ${DISHES.length} dishes`;
renderFilters(); syncHdr(); refreshHeader();
/*PLANNER*/
const h=(location.hash||"").slice(1);
setView(["cards","map","plan","pantry"].includes(h)?h:store.view, false);
applyFilters(); drawGratLabels();
if (byId[h]) { const d=byId[h]; setTimeout(()=>{ flyTo(d); openDish(h,{noFocus:true}); }, 60); }
window.__atlas={byId,F,matches,viaVariant,HIST,PLAN,opsOf,schedule,fillWeek,handsOn,stepMeta,parseTime,LABS,DEEP,PAIRS,CARB_IDS,CONDIMENT,KIDS,INGR,STARTER,dishNeeds};
})();
