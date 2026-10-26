// Builds landing-map.svg.html: India (Survey of India outline) + every dish as a pin, for the landing page hero.
const fs=require("fs"), vm=require("vm");
const umd=f=>{ const m={exports:{}}; new Function("exports","module",fs.readFileSync(f,"utf8"))(m.exports,m); return m.exports; };
const d3=umd("./libs/d3-7.8.5/dist/d3.min.js"), tj=umd("./libs/topojson-3.0.2/dist/topojson.min.js");
const ctx={}; vm.createContext(ctx);
let s=fs.readFileSync("data.js","utf8")+"\n"+fs.readdirSync(".").filter(f=>/^data-b[0-9a-z]+\.js$/.test(f)).sort().map(f=>fs.readFileSync(f,"utf8")).join("\n");
vm.runInContext(s.replace(/^const /gm,"var ")+";this.D=DISHES;",ctx);
const soiT=JSON.parse(fs.readFileSync("landing-soi.topo.json","utf8")); const soi=tj.feature(soiT,soiT.objects.India);
const stT=JSON.parse(fs.readFileSync("landing-states.topo.json","utf8")); const st=tj.mesh(stT,stT.objects[Object.keys(stT.objects)[0]],(a,b)=>a!==b);
const W=520,H=600, proj=d3.geoMercator().fitExtent([[10,10],[W-10,H-10]],soi), path=d3.geoPath(proj).digits(1);
const seen=new Set(); const pins=[];
ctx.D.forEach(d=>{ const [x,y]=proj([d.lon,d.lat]); const k=Math.round(x/6)+","+Math.round(y/6); if(seen.has(k)) return; seen.add(k); pins.push([x,y,d.diet]); });
pins.sort((a,b)=>a[1]-b[1]);
const col={veg:"#1d8a3a",nonveg:"#7a3b10"};
const svg=`<svg class="hmap" viewBox="0 0 ${W} ${H}" role="img" aria-label="Map of India with a pin for each dish's place of origin">
<path d="${path(soi)}" class="hl"/>
<path d="${path(st)}" class="hs"/>
<path d="${path(soi)}" class="hb"/>
${pins.map((p,i)=>`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="4.2" fill="${col[p[2]]}" style="animation-delay:${(i*18)}ms"/>`).join("")}
</svg>`;
const states=new Set(ctx.D.map(d=>d.state)).size;
fs.writeFileSync("landing-map.svg",svg);
fs.writeFileSync("landing-stats.json",JSON.stringify({dishes:ctx.D.length,states,pins:pins.length}));
console.log(svg.length, ctx.D.length, states, pins.length);
