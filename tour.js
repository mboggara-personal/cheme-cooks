/* ================= first-visit tour + deep links ================= */
const TOUR=[
  [".seg", "Four views", "Switch between the map, a card grid, your week's meal plan and the pantry. Keys: M, C, P."],
  ["#q", "Search anything", "A dish, a city or an ingredient. Variants work too: “puchka” finds Golgappa."],
  ["#filters", "Filter the atlas", "Diet (veg, fish, egg, Jain, vrat), meal, region, Nutri-Score, dosha, kitchen and festival. Tap a state on the map to filter by it."],
  ["#bTrails", "Trails, thali and surprises", "Follow a food trail across India, build a balanced thali, or let the atlas pick a dish for you."],
  ["#bLab", "The science", "ChemE opens every concept and the 17 labs; Kids lab has experiments for young cooks. How it works explains the scores and sources, and replays this tour."]
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
