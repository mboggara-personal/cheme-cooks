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
  [/pressure|whistle/i,"cooker","Pressure cooker"],[/tawa|griddle|appachatti/i,"tawa","Tawa"],[/bake|oven|air fryer/i,"oven","Oven"],
  [/steam/i,"steamer","Steamer"],[/deep|fry|frying/i,"kadai","Kadai"],[/grind|blend|purée|puree|mash/i,"grinder","Grind / mash"],
  [/marinate|soak|rest |ferment|refrigerat|hang|chill|dry on/i,"rest","Rest / wait"],[/knead|dough|roll|shape|pleat|wrap/i,"pin","Dough work"],
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
function parseTime(s){ const segs=[]; s.split(/\+|,/).forEach(p=>{ p=p.trim(); const h=(p.match(/(\d+)\s*h/)||[])[1], mi=(p.match(/(\d+)\s*min/)||[])[1]; const mins=(+h||0)*60+(+mi||0); if(!mins) return; let lab=p.replace(/\d+\s*h|\d+\s*min/g,"").trim(); segs.push({mins,lab:lab||(segs.length?"wait":"hands-on")}); }); return segs; }
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
  const mise = groups.filter(g=>g.items.length).map(g=>`${g.title?`<div class="misec">${esc(g.title)}</div>`:""}<div class="misegrid">${g.items.map(([r,j])=>{const c=catOf(r);return `<label class="mtile ${tk.i.includes(j)?"done":""}" title="${CATNAME[c]}"><input type="checkbox" data-ti="${j}" ${tk.i.includes(j)?"checked":""}>${bowlIcon(c)}<b>${esc(r[0])}</b><span>${esc(r[1])}</span></label>`;}).join("")}</div>`).join("");
  const steps = d.steps.map((s,j)=>{ const m=stepMeta(s); return `<li class="bstep ${tk.s.includes(j)?"done":""}"><label><input type="checkbox" data-ts="${j}" ${tk.s.includes(j)?"checked":""}><span class="bn">${j+1}</span></label>
     <div class="bbody"><div class="beq">${eqIcon(m.eq,18)}<span>${m.eqName}</span>${m.chips.map(c=>c.type==="time"?`<button class="tchip" data-timer="${c.secs}" data-tlabel="Step ${j+1}">${tIcon()} ${c.label}</button>`:`<span class="tchip ${c.type}">${c.type==="temp"?"🌡":"◎"} ${c.label}</span>`).join("")}</div><p>${esc(s)}</p></div></li>`; }).join("");
  const safety = [/kidney/.test(d.ing.map(r=>r[1]).join(" ").toLowerCase())?SRC.beans:null, d.diet==="nonveg"?SRC.temp:null].filter(Boolean);
  return `<article class="book">
   <header class="bhead"><div class="kick mono">RECIPE № ${String(ORDER.indexOf(d.id)+1).padStart(2,"0")} · ${esc(d.region.toUpperCase())} · ${esc(d.state.toUpperCase())}</div>
    <h2>${esc(d.name)}</h2><p class="headnote">${esc(d.hist?.place||d.story)}</p>
    <div class="facts"><div><small>Serves</small><b>${d.serves}</b></div><div><small>Hands-on</small><b>${fmtM(segs[0]?.mins||d.mins)}</b></div><div><small>Start to finish</small><b>${fmtM(tot||d.mins)}</b></div><div><small>Makes</small><b>≈${d.yield} g</b></div><div><small>Level</small><b>${level(d)}</b></div></div>
    ${segs.length>1?`<div class="tline" aria-label="Timeline">${segs.map(s=>`<span style="flex:${Math.max(s.mins/tot,.12)};background:${SEGCOL[s.lab]||SEGCOL[s.lab.split(" ")[0]]||"var(--ink-2)"}" title="${esc(s.lab)} · ${fmtM(s.mins)}"><em>${esc(s.lab)} · ${fmtM(s.mins)}</em></span>`).join("")}</div>`:""}
   </header>
   <section><div class="bsec"><h3>Mise en place</h3><span class="prog mono"><span>${tk.i.length}/${nI}</span><span class="bar"><i style="width:${tk.i.length/nI*100}%"></i></span></span></div>${mise}</section>
   <section><div class="bsec"><h3>Method</h3><span class="prog mono"><span>${tk.s.length}/${d.steps.length}</span><span class="bar"><i style="width:${tk.s.length/d.steps.length*100}%"></i></span></span></div><ol class="bsteps">${steps}</ol></section>
   <div class="cookdone"><button class="btn acc" id="cookMode">${eqIcon("pot",16)} Start cook mode</button><button class="btn ${tk.s.length===d.steps.length?"":"ghost"}" id="cookIt">${status(d.id).c?"Cooked ★ (tap to undo)":"I cooked this"}</button><button class="btn ghost" id="resetTicks">Reset</button></div>
   <p class="note"><b>Original recipe.</b> Written for this atlas from standard home-cooking technique. It isn't copied or adapted from any published recipe. Quantities are scaled to the smallest practical batch.${safety.length?" Food-safety notes in the steps follow:":""}</p>${safety.length?srcList(safety):""}
  </article>`;
}
const tIcon = () => `<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="8" cy="9" r="6"/><path d="M8 6v3l2 1.5M6 1.5h4"/></svg>`;

function paneHealth(d){
  const n=d.nut, s=n.serv, salt=s[5]*2.5/1000;
  const ref=[["Energy",s[0],"kcal",2000,"EU reference intake 2000 kcal"],["Protein",s[1],"g",50,"EU reference intake 50 g"],["Sat. fat",s[2],"g",20,"EU reference intake 20 g"],["Sugars",s[3],"g",50,"WHO: free sugars <10% of energy, ≈50 g (total sugars shown)"],["Fibre",s[4],"g",25,"EFSA adequate intake 25 g"],["Salt",salt,"g",5,"WHO: under 5 g a day"]];
  const row=(l,v,u,r,t)=>{const pc=v/r*100;const hi=(l==="Salt"||l==="Sat. fat"||l==="Sugars")&&pc>=40;return `<div class="r" title="${t}"><span>${l}</span><span class="v">${v<10&&u==="g"?v.toFixed(1):Math.round(v)} ${u}</span><span class="bar"><i class="${hi?"hi":""}" style="width:${Math.min(100,pc)}%"></i></span><span class="pc">${Math.round(pc)}%</span></div>`;};
  const pr=n.per100;
  return `<h3>Nutri-Score</h3><div class="nsscale">${"ABCDE".split("").map(g=>`<span class="ns-${g} ${g===d.grade?"on":""}">${g}</span>`).join("")}<span class="lab">score ${n.score} · per 100 g</span></div>
   <div class="twocol"><div><table class="pts"><tr><td colspan="3" class="mono" style="font-size:10.5px;letter-spacing:.12em;color:var(--muted)">NEGATIVE POINTS · PER 100 G</td></tr>
     <tr><td>Energy</td><td>${Math.round(n.kj)} kJ</td><td class="neg">${n.N.energy}</td></tr><tr><td>Sugars</td><td>${pr[3].toFixed(1)} g</td><td class="neg">${n.N.sugar}</td></tr>
     <tr><td>Saturated fat</td><td>${pr[2].toFixed(1)} g</td><td class="neg">${n.N.satfat}</td></tr><tr><td>Sodium</td><td>${Math.round(pr[5])} mg</td><td class="neg">${n.N.sodium}</td></tr></table></div>
    <div><table class="pts"><tr><td colspan="3" class="mono" style="font-size:10.5px;letter-spacing:.12em;color:var(--muted)">POSITIVE POINTS</td></tr>
     <tr><td>Fruit, veg, legumes, nuts</td><td>${Math.round(n.fvl)} %</td><td class="pos">${n.P.fvl}</td></tr><tr><td>Fibre</td><td>${pr[4].toFixed(1)} g</td><td class="pos">${n.P.fibre}</td></tr>
     <tr><td>Protein${n.protCounts?"":" (not counted)"}</td><td>${pr[1].toFixed(1)} g</td><td class="pos">${n.protCounts?n.P.protein:"–"}</td></tr>
     <tr class="tot"><td>Score = ${n.nTot} − ${n.nTot-n.score}</td><td></td><td>${n.score}</td></tr></table></div></div>
   <h3>Per serving <span class="mono" style="font-size:12px;color:var(--muted)">≈${Math.round(d.yield/d.serves)} g · % of daily reference</span></h3>
   <div class="serv">${ref.map(r=>row(...r)).join("")}</div>
   ${howLink("nutri")}
   <h3>Sources</h3>${srcList([SRC.nutriWiki,SRC.nutriOFF,SRC.usda,SRC.ifct,SRC.whoSalt,SRC.whoSugar,SRC.euRI,SRC.fibre])}`;
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
   ${h.tl?`<h3>Timeline</h3><ol class="tl">${h.tl.map(([w,t])=>`<li><span class="when mono">${esc(w)}</span><span>${esc(t)}</span></li>`).join("")}</ol>`:""}
   ${h.kin?`<h3>Relatives across the subcontinent</h3><div class="rasa">${h.kin.map(k=>{const m=DISHES.find(x=>k.toLowerCase().startsWith(x.name.toLowerCase()));return m&&m.id!==d.id?`<button class="kinb" data-open="${m.id}">${esc(k)} →</button>`:`<span class="on">${esc(k)}</span>`;}).join("")}</div>`:""}
   <h3>Sources</h3>${srcList(h.src||[])}</div>`;
}
function paneCheme(d){
  return `<div class="lockban"><svg width="34" height="34" viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M13 7h10M15 7v8L8.5 26.5A3 3 0 0 0 11 31h14a3 3 0 0 0 2.5-4.5L21 15V7"/><path d="M11 23h14"/></svg><div><b>ChemE overlay, coming next</b><span>Each step will be annotated with its unit operation, temperatures and the governing equation. For now, the core concepts in this recipe:</span></div></div>
   ${d.cheme.map(k=>`<div class="concept"><b>${esc(CHEME[k][0])}</b><p>${esc(CHEME[k][1])}</p></div>`).join("")}
   <p class="note">Concept summaries are general textbook chemistry written for this atlas.</p>`;
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
}

/* ---------- kitchen timer + cook mode ---------- */
let timer=null;
function beep(){ try{ const ac=new (window.AudioContext||window.webkitAudioContext)(); [0,0.35,0.7].forEach(t=>{const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=880;o.connect(g);g.connect(ac.destination);g.gain.setValueAtTime(.0001,ac.currentTime+t);g.gain.exponentialRampToValueAtTime(.3,ac.currentTime+t+.02);g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+t+.3);o.start(ac.currentTime+t);o.stop(ac.currentTime+t+.32);}); }catch(e){} try{ navigator.vibrate&&navigator.vibrate([200,100,200]); }catch(e){} }
function startTimer(secs,label){ stopTimer(); timer={end:Date.now()+secs*1000,total:secs,label,paused:false,left:secs}; tickTimer(); timer.iv=setInterval(tickTimer,500); $("#ktimer").hidden=false; }
function stopTimer(){ if(timer){ clearInterval(timer.iv); timer=null; } const k=$("#ktimer"); if(k) k.hidden=true; }
function tickTimer(){ if(!timer) return; const left=timer.paused?timer.left:Math.max(0,Math.round((timer.end-Date.now())/1000)); timer.left=left;
  const mm=String(Math.floor(left/60)).padStart(2,"0"), ss=String(left%60).padStart(2,"0");
  const k=$("#ktimer"); k.innerHTML=`<svg width="34" height="34" viewBox="0 0 36 36"><circle cx="18" cy="18" r="15" fill="none" stroke="var(--panel-2)" stroke-width="4"/><circle cx="18" cy="18" r="15" fill="none" stroke="var(--turmeric)" stroke-width="4" stroke-dasharray="${(94.2*left/timer.total).toFixed(1)} 94.2" transform="rotate(-90 18 18)"/></svg><span><small>${esc(timer.label)}</small><b class="mono">${mm}:${ss}</b></span><button class="ibtn" id="kPause" aria-label="${timer.paused?"Resume":"Pause"} timer">${timer.paused?"▶":"❚❚"}</button><button class="ibtn" id="kStop" aria-label="Stop timer">✕</button>`;
  $("#kPause").onclick=()=>{ if(timer.paused){ timer.end=Date.now()+timer.left*1000; timer.paused=false; } else timer.paused=true; tickTimer(); };
  $("#kStop").onclick=stopTimer;
  if(left===0 && !timer.paused){ clearInterval(timer.iv); beep(); toast(`⏰ ${timer.label}: time's up`); k.classList.add("ring"); setTimeout(()=>{k.classList.remove("ring");stopTimer();},6000); }
}
document.addEventListener("click",e=>{ const t=e.target.closest("[data-timer]"); if(t){ e.preventDefault(); startTimer(+t.dataset.timer, `${cur?cur.name+" · ":""}${t.dataset.tlabel||"Timer"}`); toast("Timer started"); } const hw=e.target.closest("[data-how]"); if(hw) openMethods(hw.dataset.how); });
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
     ${nd.length?`<div class="ckneed"><small class="mono">YOU'LL NEED</small>${nd.map(r=>`<span>${bowlIcon(catOf(r))}<b>${esc(r[0])}</b> ${esc(r[1])}</span>`).join("")}</div>`:""}</div>`; }
  $("#cook").innerHTML=`<div class="ckbar"><b>${esc(d.name)}</b><span class="ckdots">${d.steps.map((_,j)=>`<i class="${j<i?"p":j===i?"c":""}"></i>`).join("")}</span><button class="ibtn" id="ckX" aria-label="Exit cook mode"><svg width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" stroke-width="1.8"><path d="M2 2l10 10M12 2L2 12"/></svg></button></div>
   <div class="ckmain">${body}</div>
   ${done?"":`<div class="cknav"><button class="btn ghost" id="ckPrev" ${i===0?"disabled":""}>← Back</button><button class="btn acc" id="ckNext">${i===n-1?"Finish":"Done, next step →"}</button></div>`}`;
  $("#ckX").onclick=closeCook;
  const p=$("#ckPrev"); if(p) p.onclick=()=>{ cookState.i--; renderCook(); };
  const nx=$("#ckNext"); if(nx) nx.onclick=()=>{ if(!tk.s.includes(i)) tk.s.push(i); save(); cookState.i++; renderCook(); };
  const st=$("#ckStamp"); if(st) st.onclick=()=>{ if(!status(d.id).c) mark(d.id,"c"); closeCook(); };
  const cc=$("#ckClose"); if(cc) cc.onclick=closeCook;
}

/* ---------- methods explainer ---------- */
const NS_T = {energy:[335,670,1005,1340,1675,2010,2345,2680,3015,3350], sugar:[4.5,9,13.5,18,22.5,27,31,36,40,45], satfat:[1,2,3,4,5,6,7,8,9,10], sodium:[90,180,270,360,450,540,630,720,810,900], fibre:[0.7,1.4,2.1,2.8,3.5], protein:[1.6,3.2,4.8,6.4,8]};
function openMethods(sec="nutri"){
  const tabs=[["nutri","Nutri-Score"],["ayur","Ayurveda"],["data","Recipes & data"],["src","All sources"]];
  openModal(`<h2>How the atlas works</h2>`,`<div class="tabs mtabs" role="tablist">${tabs.map(([k,l])=>`<button role="tab" data-ms="${k}" aria-selected="${k===sec}">${l}</button>`).join("")}</div><div id="mpane" class="mpane"></div>`);
  const show=k=>{ $$("[data-ms]").forEach(b=>b.setAttribute("aria-selected",b.dataset.ms===k)); $("#mpane").innerHTML=({nutri:mNutri,ayur:mAyur,data:mData,src:mSrc})[k](); $("#mb").scrollTop=0; const sel=$("#exDish"); if(sel) sel.onchange=()=>{ $("#ex").innerHTML=example(byId[sel.value]); }; };
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
   <h3>Limits worth knowing</h3>
   <ul class="plain"><li>Nutri-Score was built for packaged foods; here it is a way to compare dishes, not a verdict.</li><li>It ignores frying method, portion size and processing. Legume-rich dishes can score A even when deep-fried.</li><li>Potatoes, yams and sweet potatoes don't count as vegetables.</li><li>Fibre values come from USDA (AOAC method), which reads somewhat higher than the method the published fibre thresholds assume, so fibre points may run slightly generous.</li><li>Composition values are typical, not measured on these exact dishes, and cooked yields are estimates.</li></ul>
   <h3>Sources</h3>${srcList([SRC.nutriWiki,SRC.nutriOFF,SRC.usda,SRC.ifct,SRC.whoSalt,SRC.whoSugar,SRC.euRI,SRC.fibre])}`;
}
function mAyur(){
  const R=[["Sweet (madhura)","water + earth","Kapha","Vata, Pitta","cooling"],["Sour (amla)","earth + fire","Pitta, Kapha","Vata","heating"],["Salty (lavana)","water + fire","Pitta, Kapha","Vata","heating"],["Pungent (katu)","air + fire","Vata, Pitta","Kapha","heating"],["Bitter (tikta)","air + space","Vata","Pitta, Kapha","cooling"],["Astringent (kashaya)","air + earth","Vata","Pitta, Kapha","cooling"]];
  return `<p class="lead">Ayurveda describes the body through three doshas, functional principles built from the five elements. Food is read by its taste (rasa), potency (virya) and qualities (guna), and by whether those raise or calm each dosha. The framework comes from the Charaka Samhita.</p>
   <div class="dcards">${[["Vata","Air + space","Movement: circulation, nerve impulses, moving food through the gut, elimination.","dry, light, cold"],["Pitta","Fire","Transformation: digestion, metabolism, hunger, thirst, body heat, perception.","hot, sharp, oily"],["Kapha","Water + earth","Structure: cohesion, strength, stability, moisture.","heavy, cold, oily, stable"]].map(([n,e,f,g])=>`<div class="dcard"><b>${n}</b><small class="mono">${e.toUpperCase()}</small><p>${f}</p><span>Typical qualities: ${g}</span></div>`).join("")}</div>
   <h3>The six tastes (Charaka Samhita, Sutrasthana 26)</h3>
   <div class="tblwrap"><table class="pts mb"><tr class="mono" style="font-size:11px;color:var(--muted)"><td>Rasa</td><td>Elements</td><td>Raises</td><td>Calms</td><td>Virya</td></tr>${R.map(r=>`<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td style="color:var(--bad)">${r[2]}</td><td style="color:var(--good)">${r[3]}</td><td>${r[4]}</td></tr>`).join("")}</table></div>
   <h3>Virya: potency</h3><p>Each substance is classed as <b>ushna</b> (heating) or <b>shita</b> (cooling). Heating foods stoke digestion and raise Pitta; cooling foods soothe Pitta but can weigh on Kapha.</p>
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
   <h3>Map</h3><p>State boundaries from DataMeet's open dataset, simplified for the web. The map is drawn from that data in the page, with no tile service, so there is no watermark.</p>
   <h3>Sketches</h3><p>The pencil studies are drawn by code as placeholders, ready to be swapped for your own images.</p>
   <h3>Sources</h3>${srcList([SRC.fssai,SRC.datameet,SRC.beans,SRC.temp])}`;
}
function mSrc(){
  const g=Object.values(SRC);
  return `<h3>Methods and data</h3>${srcList(g)}<h3>Dish histories</h3>${DISHES.slice().sort((a,b)=>a.name.localeCompare(b.name)).map(d=>`<div class="srcg"><b>${esc(d.name)}</b>${srcList(d.hist?.src||[])}</div>`).join("")}`;
}
