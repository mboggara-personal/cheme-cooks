// ===== Wave 6 tags =====
Object.assign(KITCHENS, { kashmirimuslim:"Kashmiri wazwan", meitei:"Meitei" });
Object.assign(META, {
  "gushtaba":{k:["kashmirimuslim"]}, "haak":{k:["pandit"]}, "dum-olav":{k:["pandit"]},
  "amritsari-fish":{k:["street"]}, "tandoori-chicken":{k:["street"]}, "makhan-malai":{k:["street"]}, "kulfi":{k:["royal","street"]},
  "sheermal":{k:["awadhi"]}, "gulab-jamun":{k:["royal"],f:["Diwali","Eid"]}, "imarti":{k:["street"]}, "mirchi-vada":{k:["street"]},
  "gatte-ki-sabzi":{k:["royal"]}, "jhangora-kheer":{k:["pahari"],f:["Navratri"]}, "chakki-ki-shaak":{k:["malwa"]},
  "haah-kumura":{k:["assamese"],f:["Bihu"]}, "aloo-pitika":{k:["assamese"]}, "sawhchiar":{k:["mizo"]}, "berma-bwtwi":{k:["tripuri"]},
  "singju":{k:["meitei"]}, "kangshoi":{k:["meitei"]}, "noon-chai":{k:["pandit","kashmirimuslim"],link:"tea"}, "jaljeera":{k:["street"]}, "pinni":{f:["Lohri"]}
});
(function(){ const add=(id,after,ids)=>{ const t=TRAILS.find(x=>x.id===id); if(!t) return; const i=t.stops.indexOf(after); t.stops.splice(i<0?t.stops.length:i+1,0,...ids); };
  add("himalaya","kahwa",["noon-chai","haak","gushtaba","dum-olav"]); add("himalaya","kafuli",["jhangora-kheer"]);
  add("ne","sel-roti",["gundruk"]); add("ne","jolpan",["aloo-pitika","haah-kumura"]);
  add("ne","mosdeng",["berma-bwtwi","sawhchiar"]); add("ne","eromba",["singju","kangshoi"]);
  add("street","jalebi",["amritsari-fish"]); add("street","golgappa",["makhan-malai"]); add("street","indori-poha",["mirchi-vada"]);
  add("royal","samosa",["kulfi"]); add("royal","galouti-kebab",["sheermal"]);
  add("gt","lassi",["amritsari-fish","pinni"]); add("gt","nihari",["tandoori-chicken","kulfi"]); add("gt","agra-petha",["gulab-jamun"]); add("gt","golgappa",["makhan-malai"]);
})();
