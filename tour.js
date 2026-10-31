/* ================= first-visit tour + deep links ================= */
const TOUR=[
  [".seg", "Four views", "Switch between the map, a card grid, your week's meal plan and the pantry. Keys: M, C, P."],
  ["#q", "Search anything", "A dish, a city or an ingredient. Variants work too: “puchka” finds Golgappa."],
  ["#filters", "Filter the atlas", "Diet (veg, fish, egg, Jain, vrat), meal, region, Nutri-Score, dosha, kitchen and festival. Tap a state on the map to filter by it."],
  ["#bTrails", "Trails, thali and surprises", "Follow a food trail across India, build a balanced thali, or let the atlas pick a dish for you."],
  ["#bLab", "The science", "ChemE opens every concept and the 17 labs; new to it? ‘What is ChemE?’ is a short pencil-sketch primer. Kids lab has experiments for young cooks. How it works explains the scores and sources, and replays this tour."]
];
let tourI=-1;
function tourEl(){ let t=$("#tour"); if(!t){ t=document.createElement("div"); t.id="tour"; t.className="tour"; t.setAttribute("role","dialog"); t.setAttribute("aria-label","Atlas tour"); document.body.appendChild(t); } return t; }
function startTour(){ if(store.view!=="map"&&store.view!=="cards") setView("map"); closeModal(); closeDrawer(); tourI=0; showTour(); }
function endTour(){ tourI=-1; const t=$("#tour"); if(t) t.remove(); store.toured=1; save(); }
function showTour(){
  const [sel,title,text]=TOUR[tourI]; let el=$(sel);
  if(!el || !el.getClientRects().length){ el=$("#top"); }
  const r=el.getBoundingClientRect(), pad=6, t=tourEl();
  const ring={l:r.left-pad,t:r.top-pad,w:r.width+pad*2,h:Math.min(r.height+pad*2,window.innerHeight*.5)};
  const below=ring.t+ring.h+190<window.innerHeight;
  const cw=Math.min(340,window.innerWidth-24), cl=Math.max(12,Math.min(window.innerWidth-cw-12,ring.l));
  t.innerHTML=`<div class="tring" style="left:${ring.l}px;top:${ring.t}px;width:${ring.w}px;height:${ring.h}px"></div>
   <div class="tcard" style="left:${cl}px;width:${cw}px;${below?`top:${ring.t+ring.h+12}px`:`top:${Math.max(12,ring.t-12-180)}px`}">
    <span class="mono tstep">${tourI+1} / ${TOUR.length}</span><b>${esc(title)}</b><p>${esc(text)}</p>
    <div class="tbtns"><button class="btn ghost" id="tSkip">${tourI===TOUR.length-1?"Close":"Skip tour"}</button>${tourI>0?`<button class="btn ghost" id="tBack">Back</button>`:""}<button class="btn acc" id="tNext">${tourI===TOUR.length-1?"Start exploring":"Next"}</button></div></div>`;
  $("#tSkip").onclick=endTour; const b=$("#tBack"); if(b) b.onclick=()=>{ tourI--; showTour(); };
  $("#tNext").onclick=()=>{ if(tourI===TOUR.length-1) endTour(); else { tourI++; showTour(); } };
  $("#tNext").focus({preventScroll:true});
}
window.addEventListener("resize",()=>{ if(tourI>=0) showTour(); });
document.addEventListener("keydown",e=>{ if(tourI>=0 && e.key==="Escape"){ e.stopPropagation(); endTour(); } },true);
document.addEventListener("click",e=>{ if(e.target.closest("[data-tour]")) startTour(); });
/* a link back to the landing page when the atlas is served from /atlas/ */
if(/\/atlas\/?$/.test(location.pathname)){ const b=$(".brand"); if(b && !b.closest("a")){ const a=document.createElement("a"); a.href="../"; a.className="brandlink"; a.title="ChemE Cooks home"; b.parentNode.insertBefore(a,b); a.appendChild(b); } }
/* deep links from the landing page: #kids, #labs, #pantry; first-visit tour otherwise */
setTimeout(()=>{
  const hh=(location.hash||"").slice(1);
  if(hh==="kids") openKids();
  else if(hh==="labs") openConcepts();
  else if(!store.toured && !byId[hh] && (store.view==="map"||store.view==="cards") && !game) startTour();
}, 700);
window.addEventListener("hashchange",()=>{ const hh=location.hash.slice(1); if(hh==="kids") openKids(); else if(hh==="labs") openConcepts(); });

/* ---- links to the "What is chemical engineering?" primer, from anywhere in the atlas ---- */
function whatURL(anchor){ const onSite=/\/atlas\/?$/.test(location.pathname); return (onSite?"../cheme/":"https://mboggara-personal.github.io/cheme-cooks/cheme/")+(anchor?"#"+anchor:""); }
function whatTarget(){ return /\/atlas\/?$/.test(location.pathname)?"":' target="_blank" rel="noopener"'; }
const WHAT_ANCHOR={fermentation:"ferment",leavening:"ferment",acidbase:"ferment",maillard:"kinetics",caramelization:"kinetics",denaturation:"kinetics",enzyme:"kinetics",crosslinking:"kinetics",gelatinization:"balance",emulsion:"emulsion",diffusion:"diffusion",heat:"heat",smoking:"heat",extraction:"separate",crystallization:"separate",pressure:"pressure",phase:"pressure"};
function whatBox(text){ return `<div class="whatis"><span class="wq" aria-hidden="true">?</span><span>${text||"New to chemical engineering?"} <a href="${whatURL()}"${whatTarget()}>What is chemical engineering? Twelve big ideas in pencil sketches →</a></span></div>`; }
function whatConcept(k){ const a=WHAT_ANCHOR[k]; return a?`<a class="clink" href="${whatURL(a)}"${whatTarget()}>The basics, sketched →</a>`:""; }
(function(){ const b=$("#bWhat"); if(b){ b.href=whatURL(); if(!/\/atlas\/?$/.test(location.pathname)){ b.target="_blank"; b.rel="noopener"; } } })();

/* ---- pairing note: masala dosa → filter coffee (same pencil cup as the landing-page sketch) ---- */
const DRINK_PAIR={"masala-dosa":["filter-coffee","best with filter coffee…"]};
function pairCard(d){ const p=DRINK_PAIR[d.id]; if(!p||!byId[p[0]]) return ""; return `<button class="paircard" data-open="${p[0]}" aria-label="Open ${esc(byId[p[0]].name)}">
<svg width="92" height="92" viewBox="0 0 120 130" aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
 <path d="M42 32l6 60q1 6 20 6t20-6l6-60z" fill="#8a5a2b" fill-opacity=".28" stroke="none"/>
 <ellipse cx="60" cy="104" rx="56" ry="10" stroke-width="2"/><path d="M4 104q4 24 56 24t56-24" stroke-width="2"/>
 <path d="M42 32l6 62q1 6 20 6t20-6l6-62" stroke-width="2"/><ellipse cx="60" cy="32" rx="27" ry="6" stroke-width="2"/>
 <path d="M45 48q23 5 46 0M47 80q21 5 42 0" stroke-width="1.2" opacity=".7"/>
 <g stroke-width="1.2" opacity=".8"><circle cx="48" cy="32" r="2.5"/><circle cx="58" cy="30" r="2"/><circle cx="68" cy="33" r="2.5"/><circle cx="76" cy="31" r="1.8"/></g>
 <path d="M52 20q-9-10 0-20M70 20q-9-10 0-18" stroke-width="1.2" opacity=".7"/>
</svg><span><span class="phand">${esc(p[1])}</span><small>${esc(byId[p[0]].name)} · ${esc(byId[p[0]].place)} →</small></span></button>`; }
document.addEventListener("click",e=>{ if(e.target.closest(".paircard")) setTimeout(()=>{ const b=$("#dbody"); if(b) b.scrollTop=0; },60); });
