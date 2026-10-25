/* ================= thali (meal builder) ================= */
function toggleThali(id){ const i=store.thali.indexOf(id); if(i>=0) store.thali.splice(i,1); else { if(store.thali.length>=6){ toast("A thali holds 6 dishes. Remove one first."); return; } store.thali.push(id); toast("Added to your thali"); } save(); refreshHeader(); }
const CARB_IDS = new Set(["hyderabadi-biryani","bisi-bele-bath","ven-pongal","indori-poha"]);
// break a dish into what lands on the plate: katori (bowl) parts and plate parts
function parts(d){
  const B=(g,t)=>({kind:"bowl",g:g||d.garnish||"pieces",t:t||d.tint}), Pl=(f,t)=>({kind:"plate",f,t:t||d.tint});
  switch(d.sketch){
    case "katori": return [B()];
    case "balls": return [B("balls")];
    case "handi": return d.id==="undhiyu"?[B("veg")]:[Pl("rice","#e0a63d")];
    case "leafmound": return CARB_IDS.has(d.id)?[Pl("rice")]:[B("veg")];
    case "mound": return [Pl("rice")];
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
  }
  return [B()];
}
function isCarb(d){ return parts(d).some(p=>p.kind==="plate"&&["rice","flat","dosa","appam","bhatura","pav","vadapav","balls"].includes(p.f)); }
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
  else if(f==="wedge"){ const w=[[x-24,y+16],[x+26,y+14],[x+2,y-24]]; P.wash(P.smooth(w,true),t,.85); P.closed(w); P.hatch(P.smooth(w,true),[x-26,y-26,x+28,y+18],2.2,.4); }
}
function thaliSVG(L){
  const P=new Pencil(hashStr(L.map(d=>d.id).join("|")||"empty")); const cx=240, cy=210, R=165;
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
  const bSlots=[-150,-112,-68,-30,8,46,84].map(a=>a*Math.PI/180);
  const labels=[];
  bowls.slice(0,7).forEach((b,i)=>{ const a=bSlots[i]; const x=cx+Math.cos(a)*(R-50), y=cy+Math.sin(a)*(R-50); bowlTop(P,x,y,33,b.g,b.t); labels.push({x,y,a,name:b.d.name}); });
  const pSlots=[[cx-52,cy+70],[cx+10,cy+40],[cx-70,cy+5],[cx+40,cy+100],[cx-10,cy+108],[cx-8,cy-14]];
  plates.slice(0,6).forEach((p,i)=>{ const [x,y]=pSlots[i]; plateTop(P,x,y,p.f,p.t); labels.push({x,y,a:Math.atan2(y-cy,x-cx),name:p.d.name+(p.d.acc?" (side)":"")}); });
  // labels outside the plate, de-duplicated per dish
  const seen=new Set(); const lab=labels.filter(l=>{const k=l.name; if(seen.has(k)) return false; seen.add(k); return true;});
  const left=lab.filter(l=>Math.cos(l.a)<0).sort((a,b)=>a.y-b.y), right=lab.filter(l=>Math.cos(l.a)>=0).sort((a,b)=>a.y-b.y);
  let txt="";
  [[left,-1],[right,1]].forEach(([arr,s])=>{ const gap=Math.min(34,(2*R)/Math.max(1,arr.length)); arr.forEach((l,i)=>{ const ty=cy-R+20+i*gap+(2*R-arr.length*gap)/2, tx=s<0?cx-R-12:cx+R+12;
    txt+=`<path d="M${f1(l.x)},${f1(l.y)}L${f1(s<0?cx-R+4:cx+R-4)},${f1(ty)}L${f1(tx)},${f1(ty)}" class="lead"/><text x="${f1(tx+(s<0?-4:4))}" y="${f1(ty+4)}" text-anchor="${s<0?"end":"start"}" class="tlab">${esc(l.name)}</text>`; }); });
  txt+=`<text x="${cx}" y="${cy-R-8}" text-anchor="middle" class="tlab sm">salt · pickle · lemon</text>`;
  if(!L.length) txt+=`<text x="${cx}" y="${cy+6}" text-anchor="middle" class="tlab">Empty thali: tap “Suggest a thali”</text>`;
  return P.svg().replace('viewBox="0 0 240 170"','viewBox="0 0 480 410"').replace("</g></svg>",`</g>${txt}</svg>`);
}
function suggestThali(region, vegOnly){
  let pool=DISHES.filter(d=>(!vegOnly||d.diet==="veg"));
  const inR=pool.filter(d=>!region||d.region===region);
  const sweets=(inR.filter(d=>d.meals.includes("sweets")).length?inR:pool).filter(d=>d.meals.includes("sweets"));
  const carbs=(inR.filter(d=>isCarb(d)&&!d.meals.includes("sweets")).length?inR:pool).filter(d=>isCarb(d)&&!d.meals.includes("sweets"));
  const mains=(inR.filter(d=>!isCarb(d)&&!d.meals.includes("sweets")).length>=2?inR:pool).filter(d=>!isCarb(d)&&!d.meals.includes("sweets"));
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
  return (best||[]).map(d=>d.id);
}
let thaliOpts={region:"",veg:false};
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
  const sv=$("#serve"); if(sv) sv.onclick=()=>{ const no=String(1000+Math.floor(Math.random()*9000)); $("#tk").innerHTML=`<div class="ticket"><h4>Order up! · Table 2</h4><div class="ln"><span>ORDER #${no}</span><span>${new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</span></div><hr style="border:0;border-top:1px dashed var(--rule)">${L.map(d=>`<div class="ln"><span>2 × ${esc(d.name)}</span><span>${d.mins}′</span></div>`).join("")}<hr style="border:0;border-top:1px dashed var(--rule)"><div class="ln"><b>Kitchen time (longest dish)</b><b>${Math.max(...L.map(d=>d.mins))}′</b></div><div style="margin-top:6px;color:var(--muted)">Home-restaurant mode arrives with the meal planner.</div></div>`; };
  const cl=$("#clearT"); if(cl) cl.onclick=()=>{ store.thali=[]; save(); refreshHeader(); openThali(); };
}
$("#bThali").onclick=openThali;

