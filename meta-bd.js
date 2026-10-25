// ===== Wave 11 tags =====
Object.assign(KITCHENS, { nepali:"Nepali (Gorkha)" });
Object.assign(META, {
  "nga-thongba":{k:["meitei"],f:["Yaoshang"]}, "paro-koldil":{k:["assamese"]}, "konir-dom":{k:["assamese"]}, "lau-diya-maas":{k:["assamese"]},
  "khasi-ko-masu":{k:["nepali"],f:["Dashain"]}
});
(function(){ const add=(id,after,ids)=>{ const t=TRAILS.find(x=>x.id===id); if(!t) return; const i=t.stops.indexOf(after); t.stops.splice(i<0?t.stops.length:i+1,0,...ids); };
  add("ne","gundruk",["khasi-ko-masu"]); ["sel-roti","gundruk"].forEach(id=>{ if(META[id]) META[id].k=[...new Set([...(META[id].k||[]),"nepali"])]; }); add("ne","haah-kumura",["paro-koldil","konir-dom","lau-diya-maas"]); add("ne","eromba",["nga-thongba"]);
  add("seafood","masor-tenga",["lau-diya-maas","nga-thongba"]);
})();
