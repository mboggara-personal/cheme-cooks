/* ================= meal planner + ChemE kitchen scheduler ================= */
const WK = t => ["Wikipedia: " + t.replace(/_/g," ").replace(/\(.*\)/,"").trim(), "https://en.wikipedia.org/wiki/" + t];   // W is the map width inside this scope
const DAYS=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], DAYL=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const SLOTS=["breakfast","lunch","snack","dinner"];
const PLAN = store.plan = Object.assign({people:2, wd:45, we:90, burners:2, veg:false, snacks:false,
  serve:{breakfast:"08:00",lunch:"13:00",snack:"16:30",dinner:"19:30"}, days:null}, store.plan||{});
if(!PLAN.days) PLAN.days=DAYS.map(()=>({breakfast:[],lunch:[],snack:[],dinner:[]}));
/* plain rice and phulka: everyday staples the atlas doesn't list as dishes, used only by the planner */
const BASICS=[
 {id:"_rice",name:"Steamed rice",aka:"Everyday plain rice",place:"",state:"",region:"",diet:"veg",meals:["lunch","dinner"],serves:2,yield:420,time:"20 min",mins:20,tint:"#efe9dc",
  ing:[["150 g","Rice, rinsed",{rice:150}],["300 ml","Water",{}]],steps:["Rinse the rice 2–3 times until the water runs almost clear.","Bring to a boil with the water, then cover and cook on low 12–15 minutes until absorbed.","Rest 5 minutes covered, then fluff with a fork."]},
 {id:"_roti",name:"Phulka roti",aka:"Everyday whole-wheat flatbread",place:"",state:"",region:"",diet:"veg",meals:["lunch","dinner"],serves:2,yield:230,time:"25 min + 15 min rest",mins:25,tint:"#d9b67a",
  ing:[["160 g","Whole-wheat flour (atta)",{atta:160}],["about 100 ml","Water",{}],["1 tsp","Ghee, to brush (optional)",{ghee:5}]],steps:["Knead the flour and water into a soft dough and rest it 15 minutes.","Divide into 6 balls and roll each into a thin 15 cm round.","Cook each on a hot tawa 30 seconds a side, then puff over an open flame or press with a cloth, about 2 minutes per roti. Brush with ghee."]}];
BASICS.forEach(d=>{ Object.assign(d,{cheme:[],tags:[],k:[],f:[],vars:[],snack:"",ay:{v:0,p:0,k:0}}); d.nut=nutrition(d); d.grade=d.nut.grade; byId[d.id]=d; });
const isBasic = d => d.id[0]==="_";
const budgetOf = i => i>=5 ? PLAN.we : PLAN.wd;
const pf = d => Math.max(.25, PLAN.people/d.serves);          // plan scale factor for a dish
const hm = m => { m=((Math.round(m)%1440)+1440)%1440; const h=Math.floor(m/60), mi=m%60; return `${(h%12)||12}:${String(mi).padStart(2,"0")} ${h<12?"am":"pm"}`; };
const toMin = s => { const [h,m]=s.split(":").map(Number); return h*60+m; };
const fmtD = m => m>=60 ? `${Math.floor(m/60)} h${Math.round(m%60)?" "+Math.round(m%60)+" min":""}` : `${Math.round(m)} min`;

/* ---------- 1. a dish as a chain of unit operations ----------
   Each recipe step becomes an operation with a duration, the part that needs your hands (active),
   the part that runs on its own (passive), and the equipment it holds (a burner, the oven). */
const PRE_RE=/soak|ferment|marina|\brest|\brise|strain|overnight|sprout|hang|refrigerat/i, POST_RE=/chill|set|cool|freez|dry/i;
const PASSIVE_EQ=new Set(["cooker","oven","steamer","rest"]);
const RES_OF={pot:"burner",kadai:"burner",tawa:"burner",cooker:"burner",steamer:"burner",oven:"oven"};
const SCALE_EQ=new Set(["kadai","pin","tawa","bowl","grinder"]);   // work that grows with batch size
const LONG=120;                                                     // waits longer than this become advance prep
const OPS_CACHE={};
function opsOf(d, f=1){
  const key=d.id+"|"+f.toFixed(2); if(OPS_CACHE[key]) return OPS_CACHE[key];
  const segs=parseTime(d.time);
  const waits=segs.slice(1).filter(s=>PRE_RE.test(s.lab)||POST_RE.test(s.lab)).map(s=>({...s,pre:PRE_RE.test(s.lab)}));
  const coreT=Math.max(5,(segs[0]?segs[0].mins:d.mins)+segs.slice(1).filter(s=>!PRE_RE.test(s.lab)&&!POST_RE.test(s.lab)).reduce((a,s)=>a+s.mins,0));
  const steps=d.steps.map((t,i)=>{ const m=stepMeta(t); const tc=m.chips.filter(c=>c.type==="time");
    let dur=tc.reduce((a,c)=>a+c.secs/60,0); const wh=m.chips.find(c=>c.type==="whistle"); if(!dur&&wh) dur=4*parseInt(wh.label);
    const st={i,t,eq:m.eq,dur,explicit:dur>0,wait:false};
    if(dur>=60 && (PRE_RE.test(t)||POST_RE.test(t)||/\bleave\b|keep (it )?(covered|aside)/i.test(t))){
      st.wait=true; st.pre=!POST_RE.test(t)||PRE_RE.test(t);
      // the same wait is usually also in the recipe's time line: use that figure, and don't add it twice
      const cand=waits.map((w,j)=>({j,s:(w.lab.split(" ").some(x=>x.length>3&&t.toLowerCase().includes(x.slice(0,5)))?0:1)*1e4+Math.abs(w.mins-dur)})).sort((a,b)=>a.s-b.s)[0];
      if(cand&&cand.s<1e4+dur){ st.dur=waits[cand.j].mins; waits.splice(cand.j,1); }
    }
    return st; });
  const ex=steps.filter(s=>s.explicit&&!s.wait).reduce((a,s)=>a+Math.min(s.dur,180),0), non=steps.filter(s=>!s.explicit);
  const left=coreT-ex, Wt=non.reduce((a,s)=>a+s.t.length,0)||1;
  non.forEach(s=>{ s.dur = left>2*non.length ? Math.max(2,left*s.t.length/Wt) : 3; });
  const ops=[];
  waits.filter(w=>w.pre).forEach(w=>ops.push({d,kind:"wait",label:cap(w.lab),text:`${cap(w.lab)}: get it started`,act:3,pas:w.mins,res:null,eq:"rest"}));
  steps.forEach(s=>{ let act=Math.min(s.dur,180), pas=0;
    if(s.wait){ ops.push({d,kind:"wait",i:s.i,label:`Step ${s.i+1}`,text:s.t,act:2,pas:s.dur,res:null,eq:"rest"}); return; }
    const waitish = /\b(leave|rest|marinat\w*|soak|ferment|cool|chill|set aside|refrigerat\w*|under a weight|to set)\b/i.test(s.t);
    const passive = PASSIVE_EQ.has(s.eq) || (/simmer|cover|slow|until tender|whistles?|bake|low heat|on low|\bdum\b|sealed|coals/i.test(s.t) && s.dur>=10);
    if(waitish && s.dur>=5){ act=2; pas=s.dur-2; }
    else if(passive && s.dur>=8){ act=Math.min(4,Math.max(1,s.dur*.12)); pas=s.dur-act; }
    if(f>1 && SCALE_EQ.has(s.eq)) act*=1+.6*(f-1);            // scale-up: frying in batches, more rolling and chopping
    if(f<1 && SCALE_EQ.has(s.eq)) act*=Math.max(.6,f);
    ops.push({d,kind:"core",i:s.i,label:`Step ${s.i+1}`,text:s.t,act,pas,res:RES_OF[s.eq]||null,eq:s.eq}); });
  waits.filter(w=>!w.pre).forEach(w=>ops.push({d,kind:"wait",label:cap(w.lab),text:`Leave to ${w.lab}`,act:1,pas:w.mins,res:null,eq:"rest"}));
  ops.forEach(o=>{ o.act=Math.max(1,Math.round(o.act)); o.pas=Math.round(o.pas); o.dur=o.act+o.pas; });
  // everything up to the last long wait happens ahead of the cooking session
  let last=-1; ops.forEach((o,j)=>{ if(o.kind==="wait"&&o.pas>=LONG) last=j; });
  ops.forEach((o,j)=>o.adv=j<=last && !(j===last && j===ops.length-1 && !ops.slice(0,j).some(x=>x.kind==="core")) ? true : j<=last);
  if(last===ops.length-1) ops.forEach(o=>o.adv=false), ops[last].tail=true;   // a long chill/set at the end: cook today, serve later
  return OPS_CACHE[key]=ops;
}
const handsOn = (d,f=1) => opsOf(d,f).reduce((a,o)=>a+o.act,0);
const leadTime = d => opsOf(d).filter(o=>o.adv).reduce((a,o)=>a+o.dur,0);

/* ---------- 2. backward list scheduling ----------
   Time runs backwards from the moment the meal is served. At each minute we place the next-to-last
   operation of whichever dish has the longest remaining chain (critical path first), as long as
   you have free hands for its active part and a burner or the oven is free for its whole length. */
function schedule(dishes, serveAt, opt={}){
  const burners=opt.burners||PLAN.burners, cooks=opt.cooks||1, H=4000;
  const busyCook=new Uint8Array(H), busyB=new Uint8Array(H), busyO=new Uint8Array(H);
  const chains=dishes.map(({d,f})=>({d,f,ops:opsOf(d,f).slice().reverse(),k:0,ready:0}));
  const remain=c=>c.ops.slice(c.k).reduce((a,o)=>a+o.dur,0);
  const placed=[]; let tau=0, guard=0;
  const free=(o,t)=>{ const e=t+o.dur; if(e>=H) return true;
    for(let x=e-o.act;x<e;x++) if(busyCook[x]>=cooks) return false;
    if(o.res==="burner") for(let x=t;x<e;x++) if(busyB[x]>=burners) return false;
    if(o.res==="oven") for(let x=t;x<e;x++) if(busyO[x]>=1) return false;
    return true; };
  while(chains.some(c=>c.k<c.ops.length) && guard++<20000){
    const ready=chains.filter(c=>c.k<c.ops.length && c.ready<=tau).sort((a,b)=>remain(b)-remain(a));
    let any=false;
    for(const c of ready){ const o=c.ops[c.k]; if(!free(o,tau)) continue;
      const e=Math.min(H,tau+o.dur); for(let x=e-o.act;x<e;x++) if(x>=0) busyCook[x]++;
      if(o.res==="burner") for(let x=tau;x<e;x++) busyB[x]++; if(o.res==="oven") for(let x=tau;x<e;x++) busyO[x]++;
      placed.push({...o, start:serveAt-(tau+o.dur), end:serveAt-tau}); c.k++; c.ready=tau+o.dur; any=true; }
    if(!any) tau++;
  }
  // window = cooking session (long soaks/ferments become advance prep)
  const core=placed.filter(p=>!p.adv);
  const start=Math.min(...core.map(p=>p.start)), win=serveAt-start;
  const active=placed.reduce((a,p)=>a+p.act,0), activeWin=core.reduce((a,p)=>a+p.act,0);
  const serial=dishes.reduce((a,{d,f})=>a+opsOf(d,f).filter(o=>!o.adv).reduce((b,o)=>b+o.dur,0),0);
  let fullB=0; for(let t=0;t<Math.min(win,H);t++) if(busyB[t]>=burners) fullB++;
  const longest=dishes.map(({d,f})=>({d,len:opsOf(d,f).filter(o=>!o.adv).reduce((a,o)=>a+o.dur,0)})).sort((a,b)=>b.len-a.len)[0];
  const util=win?activeWin/win:0, bSat=win?fullB/win:0;
  const bottleneck = util>.8 ? "you" : bSat>.5 ? "stove" : (longest&&longest.len>=win*.9 ? "dish" : "none");
  const advance=placed.filter(p=>p.adv).sort((a,b)=>a.start-b.start);
  return {placed, start, serveAt, win, active, activeWin, serial, util, bSat, bottleneck, longest, advance};
}

/* ---------- 3. Gantt chart ---------- */
function gantt(S){
  const rows=[...new Set(S.placed.map(p=>p.d.id))].map(id=>byId[id]);
  const ops=S.placed.filter(p=>!p.adv);
  const t0=Math.floor(S.start/5)*5, t1=S.serveAt, span=Math.max(10,t1-t0);
  const W=760, L=150, R=12, rh=30, top=26, H=top+(rows.length+1)*rh+20;
  const x=t=>L+(t-t0)/span*(W-L-R);
  const tick=span>240?60:span>90?30:15; let g="";
  for(let t=Math.ceil(t0/tick)*tick;t<=t1;t+=tick) g+=`<line x1="${x(t)}" x2="${x(t)}" y1="${top-6}" y2="${H-18}" class="gl"/><text x="${x(t)}" y="${top-10}" class="gt" text-anchor="middle">${hm(t)}</text>`;
  rows.forEach((d,r)=>{ const y=top+r*rh;
    g+=`<text x="${L-8}" y="${y+rh/2+4}" text-anchor="end" class="gn">${esc(d.name.length>20?d.name.slice(0,19)+"…":d.name)}</text>`;
    ops.filter(p=>p.d===d).forEach(p=>{ const a=x(p.start), m=x(p.start+p.act), b=x(p.end);
      g+=`<g><title>${esc(d.name)} · ${esc(p.label)}: ${hm(p.start)}–${hm(p.end)} (${p.act} min hands-on${p.pas?`, ${p.pas} min on its own`:""})\n${esc(p.text)}</title>`
       +(p.pas?`<rect x="${m}" y="${y+7}" width="${Math.max(0,b-m)}" height="${rh-14}" rx="3" class="gp${p.res==="burner"?" gb":p.res==="oven"?" go":""}"/>`:"")
       +`<rect x="${a}" y="${y+5}" width="${Math.max(2,m-a)}" height="${rh-10}" rx="3" class="ga"/></g>`; }); });
  const yy=top+rows.length*rh;
  g+=`<text x="${L-8}" y="${yy+rh/2+4}" text-anchor="end" class="gn gy">You</text>`;
  ops.forEach(p=>{ g+=`<rect x="${x(p.start)}" y="${yy+8}" width="${Math.max(1.5,x(p.start+p.act)-x(p.start))}" height="${rh-16}" class="ga gyou"/>`; });
  g+=`<line x1="${x(t1)}" x2="${x(t1)}" y1="${top-6}" y2="${H-18}" class="gserve"/><text x="${x(t1)-4}" y="${H-6}" text-anchor="end" class="gt gs">Serve ${hm(t1)}</text>`;
  return `<div class="gwrap"><svg viewBox="0 0 ${W} ${H}" class="gantt" role="img" aria-label="Cooking schedule">${g}</svg></div>
   <div class="glegend"><span><i class="ga"></i>Hands-on</span><span><i class="gp gb"></i>On a burner, cooking itself</span><span><i class="gp go"></i>In the oven</span><span><i class="gp"></i>Waiting (soak, rest, chill)</span></div>`;
}

/* ---------- 4. the plan view ---------- */
const slotOf = d => d.meals.includes("breakfast")&&!d.meals.some(m=>m==="lunch"||m==="dinner") ? "breakfast" : d.meals.includes("snack")&&!d.meals.some(m=>m==="lunch"||m==="dinner") ? "snack" : d.meals.includes("dinner")?"dinner": d.meals.includes("lunch")?"lunch": d.meals.includes("breakfast")?"breakfast":"snack";
const perServ = d => d.nut.per100[0]*d.yield/d.serves/100;
function dayStats(i){ const D=PLAN.days[i]; let act=0,kcal=0,ds=[];
  SLOTS.forEach(sl=>D[sl].forEach(id=>{ const d=byId[id]; if(!d) return; ds.push(d); act+=handsOn(d,pf(d)); kcal+=perServ(d); }));
  return {act,kcal,ds,over:act>budgetOf(i)}; }
function leadAlerts(){ const out=[]; PLAN.days.forEach((D,i)=>SLOTS.forEach(sl=>D[sl].forEach(id=>{ const d=byId[id]; if(!d) return;
  const ops=opsOf(d,pf(d)); const k=ops.findIndex(o=>o.adv); if(k<0) return;
  const lw=ops.filter(o=>o.adv&&o.kind==="wait").pop(); let st=toMin(PLAN.serve[sl])-ops.slice(k).reduce((a,o)=>a+o.dur,0)-30; let dayOff=Math.floor(st/1440), at=((st%1440)+1440)%1440;
  if(at<360){ dayOff--; at=1320; } else if(at>=1380) at=1320;          // nobody soaks dal at 3 am: start it at bedtime instead
  const what=lw?((lw.text.match(/soak|ferment|marinat\w*|strain|hang|refrigerat\w*|rest/i)||["Start ahead"])[0]):"Start ahead";
  out.push({day:(i+dayOff+7)%7, at, text:`${cap(what.toLowerCase())}: ${d.name} for ${dayOff<0?DAYS[i]+" ":""}${sl}`}); }))); return out; }
function renderPlan(){
  const el=$("#planView"); if(!el) return;
  const alerts=leadAlerts();
  const totals=PLAN.days.map((_,i)=>dayStats(i)), all=totals.flatMap(t=>t.ds);
  const grades={}; all.forEach(d=>grades[d.grade]=(grades[d.grade]||0)+1);
  const wkAct=totals.reduce((a,t)=>a+t.act,0), wkBud=PLAN.days.reduce((a,_,i)=>a+budgetOf(i),0);
  const slots=SLOTS.filter(s=>s!=="snack"||PLAN.snacks);
  const opt=(v,L)=>L.map(x=>`<option value="${x}" ${+v===x?"selected":""}>${x} min</option>`).join("");
  el.innerHTML=`<div class="cards-h"><h2>Meal plan<span>${all.length} dishes this week</span></h2>
   <div class="pctl">
    <label>People <span class="srv"><button class="srvb" data-pp="-1" aria-label="Fewer people">−</button><b class="mono">${PLAN.people}</b><button class="srvb" data-pp="1" aria-label="More people">+</button></span></label>
    <label>Hands-on, weekdays <select id="pWd">${opt(PLAN.wd,[20,30,45,60,90])}</select></label>
    <label>Weekends <select id="pWe">${opt(PLAN.we,[30,45,60,90,120,180])}</select></label>
    <label>Burners <select id="pBu">${[1,2,3,4].map(n=>`<option ${PLAN.burners===n?"selected":""}>${n}</option>`).join("")}</select></label>
    <label class="chip" style="cursor:pointer"><input type="checkbox" id="pVeg" ${PLAN.veg?"checked":""}> Veg only</label>
    <label class="chip" style="cursor:pointer"><input type="checkbox" id="pSn" ${PLAN.snacks?"checked":""}> Snacks</label>
   </div></div>
   <div class="pact"><button class="btn acc" id="pFill">Fill my week</button><button class="btn ghost" id="pShop">Shopping list</button><button class="btn ghost" id="pPrep">Weekend prep session</button><button class="btn ghost" id="pHow">How the planner works</button>${all.length?`<button class="btn ghost" id="pClear">Clear week</button>`:""}</div>
   <div class="pweek">${PLAN.days.map((D,i)=>{ const t=totals[i], b=budgetOf(i), al=alerts.filter(a=>a.day===i);
     return `<div class="pday ${t.over?"over":""}"><div class="pdh"><b>${DAYL[i]}</b><button class="linkbtn" data-psched="${i}" ${t.ds.length?"":"disabled"}>Schedule ▸</button></div>
      ${slots.map(sl=>`<div class="pslot"><small class="mono">${sl.toUpperCase()} · ${hm(toMin(PLAN.serve[sl]))}</small>${D[sl].map(id=>{ const d=byId[id]; if(!d) return ""; return `<div class="pdish">${fs(d)}${isBasic(d)?`<span class="pnm pbasic">${esc(d.name)}</span>`:`<button class="pnm" data-open="${d.id}">${esc(d.name)}</button>`}<span class="mono pmin">${Math.round(handsOn(d,pf(d)))}′</span><button class="px" data-prm="${i}|${sl}|${d.id}" aria-label="Remove ${esc(d.name)}">✕</button></div>`; }).join("")}<button class="padd" data-padd="${i}|${sl}">+ Add</button></div>`).join("")}
      <div class="pfoot"><div class="pbar" title="Hands-on time against your budget"><i style="width:${Math.min(100,t.act/b*100)}%"></i></div><span class="mono">${Math.round(t.act)} / ${b} min hands-on${t.ds.length?` · ≈${Math.round(t.kcal)} kcal/person`:""}</span>
      ${al.map(a=>`<div class="palert">⏰ ${hm(a.at)}: ${esc(a.text)}</div>`).join("")}</div></div>`; }).join("")}</div>
   <div class="psum"><div><small>Hands-on this week</small><b>${fmtD(wkAct)}</b><span>of ${fmtD(wkBud)} budget</span></div>
    <div><small>Nutri-Score mix</small><b>${"ABCDE".split("").map(g=>grades[g]?`<span class="nsb ns-${g}">${g}</span>×${grades[g]}`:"").join(" ")||"–"}</b></div>
    <div><small>Regions</small><b>${new Set(all.map(d=>d.region)).size} of 6</b><span>${all.filter(d=>d.diet==="veg").length} veg · ${all.filter(d=>d.diet==="nonveg").length} non-veg</span></div>
    <div><small>Advance prep</small><b>${alerts.length}</b><span>soaks or ferments to start ahead</span></div></div>`;
}
function wirePlan(){
  const el=$("#planView");
  el.addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b) return;
    if(b.dataset.pp){ PLAN.people=Math.max(1,Math.min(12,PLAN.people+(+b.dataset.pp))); for(const k in OPS_CACHE) delete OPS_CACHE[k]; }
    else if(b.dataset.prm){ const [i,sl,id]=b.dataset.prm.split("|"); const L=PLAN.days[i][sl]; L.splice(L.indexOf(id),1); }
    else if(b.dataset.padd){ const [i,sl]=b.dataset.padd.split("|"); openPicker(+i,sl); return; }
    else if(b.dataset.psched){ openDay(+b.dataset.psched); return; }
    else if(b.id==="pFill"){ fillWeek(); const ov=PLAN.days.filter((_,i)=>dayStats(i).over).length; toast(ov?`Week filled; ${ov} day${ov>1?"s go":" goes"} over budget, so try a bigger budget or fewer meals`:"Week filled within your hands-on budget"); }
    else if(b.id==="pClear"){ PLAN.days=DAYS.map(()=>({breakfast:[],lunch:[],snack:[],dinner:[]})); }
    else if(b.id==="pShop"){ openShop(); return; }
    else if(b.id==="pPrep"){ openPrep(); return; }
    else if(b.id==="pHow"){ openPlanHow(); return; }
    else return;
    save(); renderPlan(); });
  el.addEventListener("change",e=>{ const t=e.target;
    if(t.id==="pWd") PLAN.wd=+t.value; else if(t.id==="pWe") PLAN.we=+t.value; else if(t.id==="pBu") PLAN.burners=+t.value;
    else if(t.id==="pVeg") PLAN.veg=t.checked; else if(t.id==="pSn") PLAN.snacks=t.checked; else return; save(); renderPlan(); });
}

/* ---------- 5. adding dishes ---------- */
function addToPlan(i,sl,id){ const L=PLAN.days[i][sl]; if(L.includes(id)) return; if(L.length>=4){ toast("Four dishes per meal is plenty"); return; } L.push(id); save(); renderPlan(); }
function openPicker(i,sl,q=""){
  const fit=d=>sl==="snack"?(d.meals.includes("snack")||d.meals.includes("sweets")||d.meals.includes("drinks")):sl==="breakfast"?(d.meals.includes("breakfast")||d.meals.includes("drinks")):(d.meals.some(m=>m==="lunch"||m==="dinner"||m==="sweets"||m==="drinks"));
  const used=handsOnDay(i), b=budgetOf(i);
  const list=()=>{ const ws=q.toLowerCase().split(/\s+/).filter(Boolean);
    return DISHES.filter(d=>fit(d)&&(!PLAN.veg||d.diet==="veg")&&ws.every(w=>(d.name+" "+d.aka+" "+d.state).toLowerCase().includes(w)))
      .concat(sl==="lunch"||sl==="dinner"?BASICS.filter(d=>ws.every(w=>d.name.toLowerCase().includes(w))):[])
      .map(d=>({d,h:handsOn(d,pf(d))})).sort((a,b)=>a.h-b.h).slice(0,60); };
  const draw=()=>{ $("#pkl").innerHTML=list().map(({d,h})=>`<button class="pkrow ${used+h>b?"over":""}" data-pk="${d.id}">${fs(d)}<span><b>${esc(d.name)}</b><small>${isBasic(d)?"Everyday staple":`${esc(d.state)} · ${d.meals.join(", ")}`}</small></span><span class="mono">${Math.round(h)}′ hands-on${leadTime(d)>0?" · ⏰":""}</span>${nsb(d)}</button>`).join("")||`<p class="note">No match.</p>`; };
  openModal(`<h2>Add to ${DAYL[i]} ${sl}</h2>`,`<p class="note" style="margin-top:0">Quickest first. ${Math.max(0,Math.round(b-used))} min of your ${b}-min hands-on budget left today; dishes that would go over are dimmed. ⏰ means it needs a soak or ferment ahead.</p>
    <input id="pkq" type="search" class="pkq" placeholder="Search dishes" value="${esc(q)}" autocomplete="off"><div id="pkl" class="pkl"></div>`);
  draw(); $("#pkq").oninput=e=>{ q=e.target.value; draw(); }; $("#pkq").focus();
  $("#pkl").onclick=e=>{ const r=e.target.closest("[data-pk]"); if(!r) return; addToPlan(i,sl,r.dataset.pk); closeModal(); toast(`Added to ${DAYS[i]} ${sl}`); };
}
const handsOnDay = i => SLOTS.reduce((a,sl)=>a+PLAN.days[i][sl].reduce((b,id)=>b+(byId[id]?handsOn(byId[id],pf(byId[id])):0),0),0);
function openAddFromDish(d){
  let sl=slotOf(d);
  const draw=()=>`<p class="note" style="margin-top:0">${esc(d.name)}: about ${Math.round(handsOn(d,pf(d)))} min hands-on for ${PLAN.people}${leadTime(d)>0?`, plus soaking, fermenting or resting started ${fmtD(leadTime(d))} ahead`:""}.</p>
    <div class="pkslots">${SLOTS.map(s=>`<button class="chip" data-ps="${s}" aria-pressed="${s===sl}">${cap(s)}</button>`).join("")}</div>
    <div class="pkdays">${DAYS.map((x,i)=>{ const u=handsOnDay(i), h=handsOn(d,pf(d)); return `<button class="pkday ${u+h>budgetOf(i)?"over":""}" data-pd="${i}"><b>${x}</b><small class="mono">${Math.round(u)}+${Math.round(h)} / ${budgetOf(i)}′</small></button>`; }).join("")}</div>`;
  openModal(`<h2>Add to meal plan</h2>`,`<div id="pkw">${draw()}</div>`);
  $("#pkw").onclick=e=>{ const s=e.target.closest("[data-ps]"), dd=e.target.closest("[data-pd]");
    if(s){ sl=s.dataset.ps; $("#pkw").innerHTML=draw(); }
    if(dd){ addToPlan(+dd.dataset.pd,sl,d.id); closeModal(true); toast(`${d.name} → ${DAYS[+dd.dataset.pd]} ${sl}`); } };
}

/* ---------- 6. fill my week ----------
   Greedy, with a random tie-break: a breakfast, then lunch and dinner as a main plus a staple
   (unless the main is itself rice or bread), keeping each day's hands-on time inside the budget,
   no dish twice in a week, and the regions rotating. */
function fillWeek(){
  const used=new Set(PLAN.days.flatMap(D=>SLOTS.flatMap(s=>D[s])));
  const ok=d=>(!PLAN.veg||d.diet==="veg")&&!used.has(d.id)&&!CONDIMENT.has(d.id)&&"ABCD".includes(d.grade);
  const h=d=>handsOn(d,pf(d)), rand=L=>L.length?L[Math.floor(Math.random()*L.length)]:null;
  const LD=d=>d.meals.some(m=>m==="lunch"||m==="dinner")&&!d.meals.includes("sweets")&&!d.meals.includes("drinks");
  const COMPLETE_RE=/&|chawal|bhaat|bhature|baati|bafla|litti|puttu|appam|pav\b|bhakri|roti|kulcha|luchi|kappa|pakwan|poori|biryani|khichdi|pulao|bath\b|pongal|pakhala|baasi|thalipeeth|paratha|dhokli/i;
  const STAPLE_IDS=new Set(["kerala-parotta","neer-dosa","idiyappam","ragi-mudde","malabar-pathiri","akki-rotti","sheermal","bedmi-poori"]);
  const COMPLETE=DISHES.filter(d=>LD(d)&&!STAPLE_IDS.has(d.id)&&COMPLETE_RE.test(d.id+" "+d.name));
  const STAPLE=DISHES.filter(d=>isCarb(d)&&d.meals.some(m=>m==="lunch"||m==="dinner")&&!COMPLETE_RE.test(d.id+" "+d.name)||STAPLE_IDS.has(d.id));
  const MAIN=DISHES.filter(d=>LD(d)&&!isCarb(d)&&!COMPLETE.includes(d));
  const B=DISHES.filter(d=>d.meals.includes("breakfast")&&!d.meals.includes("drinks")&&!d.meals.includes("sweets"));
  const SN=DISHES.filter(d=>d.meals.includes("snack"));
  const meal=room=>{ if(Math.random()<.35){ const c=rand(COMPLETE.filter(d=>ok(d)&&h(d)<=room)); if(c) return [c]; }
    const m=rand(MAIN.filter(d=>ok(d)&&h(d)<=room*.75)); if(!m) return [rand(COMPLETE.filter(d=>ok(d)&&h(d)<=room))].filter(Boolean);
    const r2=room-h(m), SO=STAPLE.filter(stOk), pr=(PAIRS[m.id]||[]).map(id=>byId[id]).find(d=>d&&isCarb(d)&&stOk(d)&&h(d)<=r2);
    const basic=byId[["North","Central"].includes(m.region)||(m.region==="West"&&m.state!=="Goa")?(Math.random()<.75?"_roti":"_rice"):"_rice"];
    const alt=Math.random()<.35?(rand(SO.filter(d=>d.region===m.region&&h(d)<=r2))):null;
    return [m, pr||alt||(h(basic)<=r2+5?basic:byId["_rice"])]; };
  const stUse={}; PLAN.days.forEach(D=>SLOTS.forEach(sl=>D[sl].forEach(id=>stUse[id]=(stUse[id]||0)+1)));
  const stOk=d=>d.diet==="veg"&&(isBasic(d)||(stUse[d.id]||0)<2);
  let lastRegs=new Set();
  PLAN.days.forEach((D,i)=>{
    const bud=budgetOf(i)-handsOnDay(i); let best=null;
    for(let t=0;t<400;t++){
      const pick={}; let room=bud;
      if(PLAN.snacks&&!D.snack.length){ pick.snack=[rand(SN.filter(d=>ok(d)&&h(d)<=room*.15))||rand(SN.filter(ok))]; room-=pick.snack[0]?h(pick.snack[0]):0; }
      if(!D.breakfast.length){ pick.breakfast=[rand(B.filter(d=>ok(d)&&h(d)<=room*(.2+Math.random()*.2)))||rand(B.filter(ok))]; room-=pick.breakfast[0]?h(pick.breakfast[0]):0; }
      const ls=["lunch","dinner"].filter(sl=>!D[sl].length);
      ls.forEach((sl,j)=>{ const share=j===ls.length-1?room:room*(.35+Math.random()*.25); pick[sl]=meal(share); room-=pick[sl].reduce((a,d)=>a+(d?h(d):0),0); });
      const all=Object.values(pick).flat().filter(Boolean), mains=all.filter(d=>!STAPLE.includes(d));
      if(new Set(mains.map(d=>d.id)).size<mains.length) continue;
      const tot=all.reduce((a,d)=>a+h(d),0), over=Math.max(0,tot-bud);
      const regs=new Set(mains.map(d=>d.region));
      const score=-over*25 + regs.size*.6 - [...regs].filter(r=>lastRegs.has(r)).length*.5 + all.filter(d=>"AB".includes(d.grade)).length*.3 + (tot>bud*.5?.6:0) + Math.random()*.8;
      if(!best||score>best.score) best={score,pick,mains};
    }
    if(!best) return;
    Object.entries(best.pick).forEach(([sl,L])=>L.filter(Boolean).forEach(d=>{ if(!D[sl].includes(d.id)) D[sl].push(d.id); }));
    best.mains.forEach(d=>used.add(d.id)); Object.values(best.pick).flat().filter(d=>d&&!best.mains.includes(d)).forEach(d=>stUse[d.id]=(stUse[d.id]||0)+1); lastRegs=new Set(best.mains.map(d=>d.region));
  });
}

/* ---------- 7. one day's schedule ---------- */
let daySlot=null;
function openDay(i, sl){
  const D=PLAN.days[i]; const avail=SLOTS.filter(s=>D[s].length); if(!avail.length) return;
  sl = sl && D[sl].length ? sl : (daySlot&&D[daySlot].length?daySlot:avail[avail.length-1]); daySlot=sl;
  const dishes=D[sl].map(id=>byId[id]).filter(Boolean).map(d=>({d,f:pf(d)}));
  const serve=toMin(PLAN.serve[sl]); const S=schedule(dishes,serve);
  const save_=S.serial-S.win;
  const BN={you:["You are the bottleneck",`Your hands are busy ${Math.round(S.util*100)}% of the session. More burners won't help; a quicker dish, a helper or doing some prep ahead will.`],
    stove:["The stove is the bottleneck",`All ${PLAN.burners} burner${PLAN.burners>1?"s are":" is"} in use for ${Math.round(S.bSat*100)}% of the session. Another burner, the oven or a pressure cooker would shorten it.`],
    dish:["One dish sets the pace",`${S.longest?S.longest.d.name:""} takes ${fmtD(S.longest?S.longest.len:0)} from start to finish, so the session can't be shorter. Start it first; everything else fits around it.`],
    none:["Plenty of slack",`You're busy ${Math.round(S.util*100)}% of the time, with room to tidy as you go.`]}[S.bottleneck];
  openModal(`<h2>${DAYL[i]} · ${cap(sl)} schedule</h2>`,
   `<div class="pkslots">${avail.map(s=>`<button class="chip" data-dsl="${s}" aria-pressed="${s===sl}">${cap(s)}</button>`).join("")}</div>
    <div class="psum ps2"><div><small>Start cooking</small><b>${hm(S.start)}</b><span>to serve at ${hm(serve)}</span></div>
     <div><small>Session</small><b>${fmtD(S.win)}</b><span>one dish after another: ${fmtD(S.serial)}</span></div>
     <div><small>Hands-on</small><b>${fmtD(S.activeWin)}</b><span>${Math.round(S.util*100)}% of the session</span></div>
     <div><small>Saved by overlapping</small><b>${fmtD(Math.max(0,save_))}</b><span>passive steps run while you work</span></div></div>
    ${S.advance.length?`<div class="padv"><b>Start ahead</b>${S.advance.map(p=>`<div>⏰ <b>${hm(p.start)}</b>${p.start<0?" the day before":""} · ${esc(p.d.name)}: ${esc(p.text.length>110?p.text.slice(0,108)+"…":p.text)}${p.pas?` <span class="mono">(${fmtD(p.pas)})</span>`:""}</div>`).join("")}</div>`:""}
    ${gantt(S)}
    <div class="pbn"><b>${BN[0]}.</b> ${BN[1]}</div>
    <div class="cookdone"><button class="btn acc" id="pCookMeal">Cook this meal, step by step</button><button class="btn ghost" id="pDayBack">Back to the week</button></div>
    <p class="note">Hover a bar for the step. Times are estimated from each recipe's step times and its total time; scaled for ${PLAN.people} people (frying, rolling and chopping take longer in bigger batches; simmering doesn't). Serving times and burners are set in the plan view.</p>`);
  $$("#mb [data-dsl]").forEach(b=>b.onclick=()=>openDay(i,b.dataset.dsl));
  $("#pDayBack").onclick=()=>closeModal();
  $("#pCookMeal").onclick=()=>{ closeModal(); openMealCook(S, `${DAYL[i]} ${sl}`); };
}

/* ---------- 8. cook the whole meal: one merged step list ---------- */
let mealCook=null;
function openMealCook(S,title){
  const L=S.placed.filter(p=>!p.adv).sort((a,b)=>a.start-b.start||a.d.name.localeCompare(b.d.name));
  mealCook={L,i:0,title,S}; $("#cook").hidden=false; document.body.style.overflow="hidden";
  try{ navigator.wakeLock && navigator.wakeLock.request("screen").then(w=>wake=w).catch(()=>{}); }catch(e){}
  renderMealCook();
}
function renderMealCook(){
  const {L,i,title,S}=mealCook, n=L.length, done=i>=n; let body;
  if(done) body=`<div class="ckdone"><h2>Served.</h2><p>${esc(title)}: ${[...new Set(L.map(p=>p.d.name))].map(esc).join(", ")}.</p><div class="cookdone" style="justify-content:center"><button class="btn acc" id="mcStamp">Stamp them all: I cooked these</button><button class="btn ghost" id="mcClose">Close</button></div></div>`;
  else { const p=L[i], m=stepMeta(p.text), nxt=L[i+1];
    const during=L.filter((q,j)=>j<i&&q.pas&&q.start+q.act<=p.start&&q.end>p.start).map(q=>q.d.name);
    body=`<div class="ckstep">
      <div class="ckeq">${eqIcon(p.eq||m.eq,54)}<span class="mono">${hm(p.start)}</span></div><div class="cknum mono">${String(i+1).padStart(2,"0")}<small>/${String(n).padStart(2,"0")}</small></div>
      <p class="cktext"><span class="mcwho" style="--c:${p.d.tint}">${esc(p.d.name)} · ${esc(p.label)}</span>${esc(p.text)}</p>
      <div class="ckchips">${p.pas?`<button class="tchip big" data-timer="${p.pas*60}" data-tfull="${esc(p.d.name)} · ${esc(p.label)}">${tIcon()} Start ${p.pas} min timer, then move on</button>`:""}${m.chips.filter(c=>c.type!=="time").map(c=>`<span class="tchip big ${c.type}">${c.label}</span>`).join("")}</div>
      ${during.length?`<p class="mcbg">Still going on their own: ${[...new Set(during)].map(esc).join(", ")}.</p>`:""}
      ${nxt?`<p class="mcnext">Next at ${hm(nxt.start)}: ${esc(nxt.d.name)}, ${esc(nxt.label.toLowerCase())}</p>`:""}</div>`; }
  $("#cook").innerHTML=`<div class="ckbar"><b>${esc(title)}</b><span class="ckdots">${L.map((p,j)=>`<i class="${j<i?"p":j===i?"c":""}"></i>`).join("")}</span><button class="ibtn" id="ckX" aria-label="Exit cook mode"><svg width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" stroke-width="1.8"><path d="M2 2l10 10M12 2L2 12"/></svg></button></div>
   <div class="ckmain">${body}</div>${done?"":`<div class="cknav"><button class="btn ghost" id="ckPrev" ${i===0?"disabled":""}>← Back</button><button class="btn acc" id="ckNext">${i===n-1?"Finish":"Done, next →"}</button></div>`}`;
  const close=()=>{ $("#cook").hidden=true; document.body.style.overflow=""; try{ wake&&wake.release(); }catch(e){} wake=null; mealCook=null; };
  $("#ckX").onclick=close;
  const p=$("#ckPrev"); if(p) p.onclick=()=>{ mealCook.i--; renderMealCook(); };
  const nx=$("#ckNext"); if(nx) nx.onclick=()=>{ mealCook.i++; renderMealCook(); };
  const st=$("#mcStamp"); if(st) st.onclick=()=>{ [...new Set(L.map(p=>p.d.id))].filter(id=>id[0]!=="_").forEach(id=>{ if(!status(id).c) mark(id,"c"); }); close(); };
  const cc=$("#mcClose"); if(cc) cc.onclick=close;
}

/* ---------- 9. shopping list ---------- */
const KEYNAME={water:"",salt:"Salt",soda:"Baking soda",oil:"Cooking oil",mustardoil:"Mustard oil",sesameoil:"Sesame oil",coconutoil:"Coconut oil",ghee:"Ghee",butter:"Butter",butterS:"Butter",cream:"Cream",milk:"Milk",yogurt:"Yogurt",chhena:"Chhena / paneer curds",sugar:"Sugar",jaggery:"Jaggery",
 rice:"Rice",blackrice:"Black rice",poha:"Poha",atta:"Whole-wheat flour (atta)",maida:"Maida",semolina:"Semolina",makki:"Maize flour",pav:"Pav / bread rolls",urad:"Urad dal",toor:"Toor dal",chanadal:"Chana dal",moong:"Moong dal",moongwhole:"Whole moong",kidney:"Rajma",chickpea:"Chickpeas",besan:"Besan",sattu:"Sattu",sprout:"Sprouts",
 potato:"Potatoes",sweetpotato:"Sweet potatoes",yam:"Yam",plantain:"Raw plantains",onion:"Onions",tomato:"Tomatoes",ginger:"Ginger",garlic:"Garlic",chili:"Green / dried chillies",coriander:"Coriander & herbs",spinach:"Spinach & leafy greens",mustardgreens:"Mustard greens",cauli:"Cauliflower",peas:"Green peas",capsicum:"Capsicum",beans:"Green beans",carrot:"Carrots",brinjal:"Brinjal",ashgourd:"Ash gourd",pumpkin:"Pumpkin",drumstick:"Drumsticks",papaya:"Raw papaya",bamboo:"Bamboo shoot",
 lemon:"Lemons",tamarind:"Tamarind",raisin:"Raisins",coconut:"Fresh coconut",drycoconut:"Dry coconut",coconutmilk:"Coconut milk",peanut:"Peanuts",cashew:"Cashews",spice:"",vinegar:"Vinegar",soy:"Fermented soybean",chicken:"Chicken (boneless)",chickenBone:"Chicken (bone-in)",muttonBone:"Mutton / goat, on the bone",mince:"Mutton mince",fish:"Fish",fishRohu:"Rohu / river fish",
 bajra:"Bajra flour",ragi:"Ragi flour",ricefl:"Rice flour",turnip:"Turnip",natto:"Fermented soybean",mas:"Dried tuna (mas)",khoya:"Khoya",pomegranate:"Pomegranate",yolk:"Egg yolks",masoor:"Masoor dal",hilsa:"Hilsa",sesame:"Sesame seeds",noodles:"Noodles",egg:"Eggs",dalia:"Broken wheat",cornflour:"Cornflour",almond:"Almonds & pistachios",rawmango:"Raw mango",gongura:"Gongura",mutton:"Mutton / goat",bread:"Bread",corn:"Sweetcorn",bael:"Bael fruit",banana:"Bananas",poppy:"Poppy seeds",puffedrice:"Puffed rice",walnut:"Walnuts",lotusstem:"Lotus stem",paneer:"Paneer",beet:"Beetroot",sago:"Sago",bottlegourd:"Bottle gourd",jowar:"Jowar flour",condensedmilk:"Condensed milk",icecream:"Ice cream",sangri:"Ker-sangri",duck:"Duck",cabbage:"Cabbage",phalsa:"Phalsa",gluten:"Wheat gluten",barnyard:"Barnyard millet",prawn:"Prawns",drypeas:"Dried peas",kokum:"Kokum",basil:"Basil seeds",bombil:"Bombil",tapioca:"Tapioca",horsegram:"Horse gram",apricot:"Apricots",cowpea:"Cowpeas",crab:"Crab",apricotdry:"Dried apricots",milkpowder:"Milk powder",vermicelli:"Vermicelli",dates:"Dates",moth:"Moth-bean flour",squab:"Pigeon",bananaflower:"Banana flower"};
const AISLE={veg:"Vegetables & fruit",tuber:"Vegetables & fruit",sour:"Vegetables & fruit",protein:"Meat, fish & eggs",dairy:"Dairy",grain:"Grains & flours",pulse:"Dals & pulses",fat:"Oils & ghee",nut:"Nuts, coconut & dried fruit",sweet:"Sugar & jaggery",other:"Other"};
function shopping(){
  const sum={}, uses={}, pantry=new Set();
  PLAN.days.forEach(D=>SLOTS.forEach(sl=>D[sl].forEach(id=>{ const d=byId[id]; if(!d) return; const f=pf(d);
    d.ing.forEach(r=>{ if(r[0]==="#") return; if(/to serve|optional/i.test(r[0])&&!Object.keys(r[2]||{}).length) return;
      for(const [k,g] of Object.entries(r[2]||{})){ if(k==="water") continue; if(k==="spice"||k==="salt"||k==="soda"){ pantry.add(k); continue; }
        sum[k]=(sum[k]||0)+g*f; (uses[k] ||= new Set()).add(d.name); } }); })));
  const groups={};
  Object.entries(sum).forEach(([k,g])=>{ let c=CAT[k]||(NUT[k]&&NUT[k][6]?"veg":"other"); if(k==="egg"||k==="yolk") c="protein"; if(["raisin","dates","apricotdry","almond","walnut","cashew","peanut"].includes(k)) c="nut";
    const a=AISLE[c]||"Other"; (groups[a] ||= []).push({k,g,name:KEYNAME[k]||cap(k),uses:[...uses[k]]}); });
  const eggN=k=>k==="egg"?` (≈${Math.ceil(sum[k]/50)})`:"";
  const fmtG=(k,g)=>g>=1000?`${(g/1000).toFixed(g>=10000?0:1)} kg`:`${Math.ceil(g/10)*10} g`;
  return {groups, pantry, fmtG, eggN};
}
function openShop(){
  const {groups,fmtG,eggN}=shopping(); const order=Object.values(AISLE).filter((v,i,a)=>a.indexOf(v)===i);
  const txt=order.filter(a=>groups[a]).map(a=>`${a}\n`+groups[a].sort((x,y)=>y.g-x.g).map(it=>`- ${it.name}: ${fmtG(it.k,it.g)}${eggN(it.k)}`).join("\n")).join("\n\n")+"\n\nPantry: salt, whole and ground spices (check stock)";
  openModal(`<h2>Shopping list</h2>`, Object.keys(groups).length?`<p class="note" style="margin-top:0">For ${PLAN.people} ${PLAN.people>1?"people":"person"}, every planned dish, totalled by ingredient. Weights are the amounts the recipes use (peeled, trimmed); buy a little more of vegetables and meat on the bone. Items ticked in your pantry are pre-checked.</p>
    <div class="shop">${order.filter(a=>groups[a]).map(a=>`<div class="shg"><h3>${a}</h3>${groups[a].sort((x,y)=>(inPantryKey(x.k)-inPantryKey(y.k))||y.g-x.g).map(it=>`<label class="shi ${inPantryKey(it.k)?"have":""}"><input type="checkbox" ${inPantryKey(it.k)?"checked":""}><span><b>${esc(it.name)}</b>${inPantryKey(it.k)?' <small class="ihave">in your pantry</small>':""} <span class="mono">${fmtG(it.k,it.g)}${eggN(it.k)}</span><small>${it.uses.slice(0,4).map(esc).join(", ")}${it.uses.length>4?` +${it.uses.length-4}`:""}</small></span></label>`).join("")}</div>`).join("")}
     <div class="shg"><h3>Pantry</h3><p class="note">Salt and the whole and ground spices the recipes call for: check your stock.</p></div></div>
    <div class="cookdone"><button class="btn acc" id="shCopy">Copy as text</button></div>`
   :`<div class="empty" style="padding:20px 8px"><b>Nothing planned yet</b>Add dishes to the week, or tap “Fill my week”.</div>`);
  const c=$("#shCopy"); if(c) c.onclick=()=>{ try{ navigator.clipboard.writeText(txt).then(()=>toast("Shopping list copied"),()=>toast("Couldn't copy here")); }catch(e){ toast("Couldn't copy here"); } };
}

/* ---------- 10. weekend prep session: batch the repeated chores ---------- */
const PREP=[ // key(s), task, setup min, min per 100 g, keeps
  [["onion"],"Slice or chop onions",2,1.6,"2–3 days in a sealed box in the fridge"],
  [["tomato"],"Chop tomatoes (or purée)",2,0.8,"2 days in the fridge; purée freezes well"],
  [["ginger","garlic"],"Grind ginger-garlic paste",4,6,"about a week in the fridge with a film of oil; freeze in cubes for longer"],
  [["coconut"],"Grate fresh coconut",3,3,"2 days in the fridge, or freeze"],
  [["coriander","spinach","mustardgreens"],"Wash and dry herbs and greens",2,1.5,"3–4 days wrapped in a cloth in the fridge"],
  [["potato"],"Boil potatoes",4,0.5,"2–3 days in the fridge, peeled or not"]];
function openPrep(){
  const sum={}, cnt={};
  PLAN.days.forEach(D=>SLOTS.forEach(sl=>D[sl].forEach(id=>{ const d=byId[id]; if(!d) return; const f=pf(d); const seen=new Set();
    d.ing.forEach(r=>{ if(r[0]==="#") return; for(const [k,g] of Object.entries(r[2]||{})){ sum[k]=(sum[k]||0)+g*f; if(!seen.has(k)){ cnt[k]=(cnt[k]||0)+1; seen.add(k);} } }); })));
  const rows=PREP.map(([ks,task,setup,rate,keep])=>{ const g=ks.reduce((a,k)=>a+(sum[k]||0),0), n=Math.max(...ks.map(k=>cnt[k]||0)); if(!g||n<2) return null;
    const work=g/100*rate; return {task,g,n,setup,work,batch:setup+work,each:n*setup+work,keep}; }).filter(Boolean);
  const ferm=[]; PLAN.days.forEach((D,i)=>SLOTS.forEach(sl=>D[sl].forEach(id=>{ const d=byId[id]; if(d&&opsOf(d).some(o=>o.adv&&/ferment/i.test(o.label+" "+o.text))) ferm.push(`${d.name} (${DAYS[i]})`); })));
  const ahead=[]; PLAN.days.forEach((D,i)=>SLOTS.forEach(sl=>D[sl].forEach(id=>{ const d=byId[id]; if(d&&(d.meals.includes("sweets")||d.snack==="dry")&&i<5) ahead.push(`${d.name} (${DAYS[i]})`); })));
  const T=rows.reduce((a,r)=>a+r.batch,0), Sv=rows.reduce((a,r)=>a+r.each-r.batch,0);
  openModal(`<h2>Weekend prep session</h2>`, rows.length||ahead.length||ferm.length?`<p class="note" style="margin-top:0">Chores that come up again and again this week, done once. Each time you start a chore you pay a set-up cost: get out the board and knife or the grinder, then wash up. Batching pays that cost once.</p>
   ${rows.length?`<div class="psum ps2"><div><small>Prep session</small><b>${fmtD(T)}</b><span>on Saturday or Sunday</span></div><div><small>Saved over the week</small><b>${fmtD(Sv)}</b><span>set-ups you don't repeat</span></div></div>
   <div class="tblwrap"><table class="pts mb prept"><tr class="mono" style="font-size:11px;color:var(--muted)"><td>Task</td><td>Amount</td><td>Dishes</td><td>Batch</td><td>One at a time</td><td>Keeps</td></tr>
    ${rows.map(r=>`<tr><td><b>${r.task}</b></td><td>${Math.round(r.g)} g</td><td>${r.n}</td><td>${fmtD(r.batch)}</td><td>${fmtD(r.each)}</td><td><small>${r.keep}</small></td></tr>`).join("")}</table></div>`:""}
   ${ferm.length?`<h3>One batter, several days</h3><p>${ferm.map(esc).join(", ")}: grind and ferment one batch at the weekend and keep it in the fridge, where fermentation slows right down.</p>`:""}
   ${ahead.length?`<h3>Make ahead</h3><p>${ahead.map(esc).join(", ")}: sweets and dry snacks keep, so making them at the weekend frees up weekday time.</p>`:""}
   <p class="note">The ChemE idea: a <b>batch process</b> carries a fixed set-up time (cleaning, changeover) on top of processing time that grows with the amount. Running one larger batch instead of several small ones spreads the set-up over more product, which is why plants schedule long runs. Times are rough averages for a home cook.</p>`
   :`<div class="empty" style="padding:20px 8px"><b>Nothing to batch yet</b>Plan a few days first; chores shared by two or more dishes show up here.</div>`);
}

/* ---------- 11. how it works ---------- */
function openPlanHow(){
  openModal(`<h2>Your kitchen as a batch plant</h2>`,`<p>A chemical plant and a home kitchen share a scheduling problem: several products (dishes) each pass through a fixed sequence of operations, and they compete for limited resources. The planner treats it the way a process engineer would.</p>
   <h3>1. Every dish is a recipe of unit operations</h3><p>Each step is an operation with a duration, taken from the times in the step or shared out from the recipe's total time. Part of it needs you (<b>hands-on</b>: chopping, tempering, rolling); part runs by itself (<b>passive</b>: simmering, pressure-cooking, baking, soaking, fermenting). Steps also hold equipment: a burner or the oven.</p>
   <h3>2. Resources are limited</h3><p>You are one operator with two hands. The stove has as many burners as you set, and there is one oven. Passive steps still hold their burner.</p>
   <h3>3. Schedule backwards from serving time</h3><p>Like a plant scheduling to a delivery date, the planner starts from the moment the food is served and works back. At each point it places the operation from the dish with the <b>longest remaining chain</b> (the critical path) first, if your hands and a burner are free. Everything finishes together, hot, and you see the latest moment to start.</p>
   <h3>4. Read the result like a process engineer</h3><p><b>Makespan</b> is the session length. <b>Utilisation</b> is the share of it you are busy. The <b>bottleneck</b> is whatever limits it: you, the stove, or one long dish. Overlapping passive steps with hands-on work is where the time saving comes from, compared with cooking one dish after another.</p>
   <h3>5. Scale-up isn't linear</h3><p>Cooking for more people makes frying, rolling and chopping take longer (more batches), but a pot simmers in about the same time whether it holds two portions or six. The planner scales those steps and leaves the rest. Soaks and ferments longer than two hours become advance-prep reminders.</p>
   <h3>6. Batching the chores</h3><p>The weekend prep session groups repeated chores (onions, ginger-garlic paste, boiled potatoes) because every chore has a set-up cost, paid once per batch.</p>
   <p class="note">The schedule is a heuristic, not an optimum; real recipes have slack the step times don't capture. Further reading: ${srcList([WK("Gantt_chart"),WK("Critical_path_method"),WK("List_scheduling"),WK("Job-shop_scheduling"),WK("Batch_production")])}</p>`);
}

/* ---------- wiring ---------- */
wirePlan();
document.addEventListener("click",e=>{ const b=e.target.closest("#tPlan"); if(b&&cur) openAddFromDish(cur); });
