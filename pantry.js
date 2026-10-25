/* ================= ingredient atlas + pantry ================= */
const INGR = INGR_RAW.map(([id,name,local,type,keys,re,grown,chem,keep,sub,wiki])=>({id,name,local,type,keys,re:new RegExp("\\b(?:"+re+")","i"),grown,chem,keep,sub,src:WK(wiki)}));
const INGR_BY = Object.fromEntries(INGR.map(x=>[x.id,x]));
const KEY2ING = {}; INGR.forEach(x=>x.keys.forEach(k=>KEY2ING[k]=x.id));
const BASICS_P = new Set(["k:oil","k:sugar","k:butterS"]);          // assumed in every kitchen (with salt and water)
store.pantry = store.pantry || []; if(store.basics===undefined) store.basics=true;
const OPT_HEAD=/to serve|garnish|serve with/i;
const PIN = {}; // dish id -> {req:Set, opt:Set}
function dishNeeds(d){ if(PIN[d.id]) return PIN[d.id];
  const req=new Set(), opt=new Set(); let head="";
  d.ing.forEach(r=>{ if(r[0]==="#"){ head=r[1]; return; }
    const optional=/optional/i.test(r[0]+" "+r[1])||OPT_HEAD.test(head)||/^to serve/i.test(r[0]); const S=optional?opt:req;
    Object.keys(r[2]||{}).forEach(k=>{ if(k==="water"||k==="salt"||k==="spice"||k==="soda") return; S.add(KEY2ING[k]||"k:"+k); });
    INGR.forEach(x=>{ if(!x.keys.length && x.re.test(r[1])) S.add(x.id); });
  });
  opt.forEach(x=>{ if(req.has(x)) opt.delete(x); });
  return PIN[d.id]={req,opt}; }
const pName = id => INGR_BY[id] ? INGR_BY[id].name : (KEYNAME[id.slice(2)]||cap(id.slice(2)));
function pAisle(id){ if(INGR_BY[id]) return INGR_TYPES[INGR_BY[id].type]; const k=id.slice(2); let c=CAT[k]||(NUT[k]&&NUT[k][6]?"veg":"other"); if(k==="egg"||k==="yolk") c="protein"; return AISLE[c]||"Other"; }
const havePantry = id => store.pantry.includes(id) || (store.basics && BASICS_P.has(id));
function inPantryKey(k){ return havePantry(KEY2ING[k]||"k:"+k); }
function missing(d){ return [...dishNeeds(d).req].filter(id=>!havePantry(id)); }
function snip(t){ const S=t.split(/(?<=\.)\s+/); let o=""; for(const x of S){ o+=(o?" ":"")+x; if(o.length>=60) break; } return o; }
const ingrDishes = id => DISHES.filter(d=>dishNeeds(d).req.has(id)||dishNeeds(d).opt.has(id));
function ingrChips(d){ const L=[...dishNeeds(d).req].filter(id=>INGR_BY[id]).slice(0,10); if(!L.length) return "";
  return `<div class="kingr"><small class="mono">KEY INGREDIENTS</small>${L.map(id=>`<button class="ichip ${havePantry(id)?"have":""}" data-ingr="${id}">${esc(INGR_BY[id].name)}</button>`).join("")}</div>`; }

/* ---------- ingredient card ---------- */
function openIngr(id){ const x=INGR_BY[id]; if(!x) return; const L=ingrDishes(id);
  openModal(`<h2>${esc(x.name)}</h2>`,`<div class="icard">
   <p class="ilocal">${esc(x.local)} · <span class="tag">${INGR_TYPES[x.type]}</span></p>
   <div class="igrid"><div><h3>Where it grows</h3><p>${esc(x.grown)}</p></div>
    <div class="ichem"><h3>⚗ The ChemE bit</h3><p>${esc(x.chem)}</p></div>
    <div><h3>Storing it</h3><p>${esc(x.keep)}</p></div>
    <div><h3>In a US kitchen</h3><p>${esc(x.sub)}</p></div></div>
   <div class="cookdone"><button class="btn ${havePantry(id)?"acc":"ghost"}" id="iHave">${havePantry(id)?"✓ In my pantry":"+ I have this"}</button></div>
   <h3>Used in ${L.length} dish${L.length===1?"":"es"}</h3><div class="rasa">${L.slice(0,60).map(d=>`<button class="kinb" data-open="${d.id}">${esc(d.name)}</button>`).join("")}${L.length>60?`<span class="on">+${L.length-60} more</span>`:""}</div>
   <h3>Source</h3>${srcList([x.src])}</div>`);
  $("#iHave").onclick=()=>{ togglePantry(id); openIngr(id); };
}
function togglePantry(id){ const i=store.pantry.indexOf(id); if(i>=0) store.pantry.splice(i,1); else store.pantry.push(id); save(); }
document.addEventListener("click",e=>{ const b=e.target.closest("[data-ingr]"); if(b){ e.preventDefault(); openIngr(b.dataset.ingr); } });

/* ---------- the pantry view ---------- */
let pTab="atlas", pType="", pQ="";
const STARTER=["cumin","mustard-seed","turmeric","red-chilli","coriander-seed","garam-masala","asafoetida","black-pepper","cardamom","clove","cinnamon","fenugreek","ajwain","fennel","curry-leaf","rice","atta","maida","semolina","besan","toor","moong","urad","chana","masoor","kabuli-chana","ghee","yogurt","onion","tomato","ginger","garlic","green-chilli","coriander-leaf","lemon","tamarind","jaggery","coconut","k:potato","k:milk","k:peas"];
function renderPantry(){
  const el=$("#pantryView"); if(!el) return;
  const tabs=`<div class="tabs ptabs" role="tablist"><button role="tab" data-ptab="atlas" aria-selected="${pTab==="atlas"}">Ingredient atlas</button><button role="tab" data-ptab="pantry" aria-selected="${pTab==="pantry"}">My pantry · what can I cook?</button></div>`;
  if(pTab==="atlas"){
    const ws=pQ.toLowerCase().split(/\s+/).filter(Boolean);
    const L=INGR.filter(x=>(!pType||x.type===pType)&&ws.every(w=>(x.name+" "+x.local+" "+x.grown).toLowerCase().includes(w)));
    el.innerHTML=`<div class="cards-h"><h2>Ingredients &amp; spices<span>${INGR.length} cards</span></h2><input type="search" class="pkq" id="iq" placeholder="Search ingredients" value="${esc(pQ)}" style="max-width:280px;margin:0"></div>${tabs}
     <div class="fgroup" style="margin:10px 0 14px;flex-wrap:wrap"><button class="chip" data-itype="" aria-pressed="${!pType}">All</button>${Object.entries(INGR_TYPES).map(([k,v])=>`<button class="chip" data-itype="${k}" aria-pressed="${pType===k}">${v} <small>${INGR.filter(x=>x.type===k).length}</small></button>`).join("")}</div>
     <div class="igrid2">${L.map(x=>{ const n=ingrDishes(x.id).length; return `<button class="icardb" data-ingr="${x.id}"><span class="itype t-${x.type}">${INGR_TYPES[x.type]}</span><b>${esc(x.name)}</b><small>${esc(x.local)}</small><p>${esc(snip(x.chem))}</p><span class="ifoot mono">${n} dishes${havePantry(x.id)?" · ✓ in pantry":""}</span></button>`; }).join("")||`<p class="note">No match.</p>`}</div>`;
  } else {
    const all=new Set(); DISHES.forEach(d=>dishNeeds(d).req.forEach(id=>all.add(id)));
    const groups={}; [...all].forEach(id=>(groups[pAisle(id)] ||= []).push(id));
    const order=[...Object.values(INGR_TYPES),...new Set(Object.values(AISLE))].filter((v,i,a)=>a.indexOf(v)===i&&groups[v]);
    const ranked=DISHES.map(d=>({d,m:missing(d)})).filter(x=>x.m.length<=2).sort((a,b)=>a.m.length-b.m.length||handsOn(a.d)-handsOn(b.d));
    const sec=(n,t)=>{ const L=ranked.filter(x=>x.m.length===n); return L.length?`<h3>${t} <small class="mono">${L.length}</small></h3><div class="pres">${L.slice(0,40).map(({d,m})=>`<div class="prow">${fs(d)}<button class="pnm" data-open="${d.id}">${esc(d.name)}</button><span class="mono pmin">${Math.round(handsOn(d))}′</span>${m.length?`<span class="pmiss">need ${m.map(id=>esc(pName(id))).join(", ")}</span>`:""}</div>`).join("")}${L.length>40?`<p class="note">+${L.length-40} more</p>`:""}</div>`:""; };
    el.innerHTML=`<div class="cards-h"><h2>My pantry<span>${store.pantry.length} items ticked</span></h2>
      <div class="pact" style="margin:0"><button class="btn ghost" id="pStarter">Tick a typical Indian pantry</button><button class="btn ghost" id="pNone">Clear</button><label class="chip" style="cursor:pointer"><input type="checkbox" id="pBas" ${store.basics?"checked":""}> Assume oil, sugar, salt, water</label></div></div>${tabs}
     <div class="pgrid"><div class="plist">${order.map(g=>`<div class="pgrp"><h4>${g}</h4>${groups[g].sort((a,b)=>pName(a).localeCompare(pName(b))).map(id=>`<label class="pchk"><input type="checkbox" data-pid="${id}" ${store.pantry.includes(id)?"checked":""}><span>${esc(pName(id))}</span>${INGR_BY[id]?`<button class="linkbtn" data-ingr="${id}" aria-label="About ${esc(pName(id))}">ⓘ</button>`:""}</label>`).join("")}</div>`).join("")}</div>
      <div class="presults">${store.pantry.length?sec(0,"Cook now")+sec(1,"Missing one thing")+sec(2,"Missing two things")||`<p class="note">Nothing yet within two items. Tick a few more.</p>`:`<div class="empty" style="padding:20px 8px"><b>What's in your kitchen?</b>Tick what you have, or start from a typical Indian pantry, and dishes you can cook now appear here, quickest first.</div>`}
       <p class="note">Matching uses each recipe's ingredient list; optional extras and serving garnishes don't count. Spices hidden in a recipe's "spices" line count only when the atlas has a card for them.</p></div></div>`;
  }
}
function wirePantry(){ const el=$("#pantryView");
  el.addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b) return;
    if(b.dataset.ptab){ pTab=b.dataset.ptab; renderPantry(); }
    else if(b.dataset.itype!==undefined && b.hasAttribute("data-itype")){ pType=b.dataset.itype; renderPantry(); }
    else if(b.id==="pStarter"){ STARTER.forEach(id=>{ if(!store.pantry.includes(id)) store.pantry.push(id); }); save(); renderPantry(); toast("Ticked a typical Indian pantry: untick what you're out of"); }
    else if(b.id==="pNone"){ store.pantry=[]; save(); renderPantry(); } });
  el.addEventListener("change",e=>{ const t=e.target; if(t.dataset.pid){ togglePantry(t.dataset.pid); renderPantry(); } else if(t.id==="pBas"){ store.basics=t.checked; save(); renderPantry(); } });
  el.addEventListener("input",e=>{ if(e.target.id==="iq"){ pQ=e.target.value; const pos=e.target.selectionStart; renderPantry(); const q=$("#iq"); q.focus(); q.setSelectionRange(pos,pos); } });
}
wirePantry();
