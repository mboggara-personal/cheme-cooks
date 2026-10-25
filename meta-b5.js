// ===== Wave 5 tags =====
Object.assign(KITCHENS, { malwa:"Malwa", braj:"Braj", kumaoni:"Kumaoni", rajput:"Rajput", tuluva:"Tulu Nadu", odia:"Odia temple & home", assamese:"Assamese" });
Object.assign(META, {
  "double-ka-meetha":{k:["royal","nizami"],f:["Eid"]}, "bhutte-ka-kees":{k:["street","malwa"]}, "dal-bafla":{k:["malwa"]},
  "pakhala":{k:["temple","odia"]}, "chhena-jhili":{k:["odia"]}, "bela-pana":{k:["odia"],f:["Pana Sankranti"]},
  "aloo-posto":{k:["bengali"]}, "jolpan":{k:["assamese"],f:["Bihu"]}, "pumaloi":{k:["khasi"]},
  "siddu":{k:["pahari"]}, "aloo-ke-gutke":{k:["pahari","kumaoni","street"]}, "bal-mithai":{k:["kumaoni"]},
  "kahwa":{k:["pandit"],link:"tea"}, "nadru-yakhni":{k:["pandit"],f:["Navreh"]}, "gur-gur-cha":{k:["ladakhi"],link:"tea"},
  "sel-roti":{f:["Dashain","Tihar"]}, "galho":{k:["naga"]}, "kanji":{f:["Holi"]},
  "bedmi-poori":{k:["braj","street"]}, "mathura-peda":{k:["braj","temple"],f:["Janmashtami"]},
  "laal-maas":{k:["royal","rajput"]}, "ghewar":{k:["royal"],f:["Teej","Raksha Bandhan"]},
  "sabudana-khichdi":{k:["street"],f:["Navratri","Shivratri"]}, "chicken-xacuti":{k:["goanhindu"]},
  "neer-dosa":{k:["tuluva"]}, "mangalore-buns":{k:["udupi","temple","tuluva"]},
  "jigarthanda":{k:["street"]}, "kuzhi-paniyaram":{k:["chettiar"]}, "curd-rice":{k:["temple","tamilbrahmin"]},
  "pulihora":{k:["temple"]}, "palak-paneer":{k:["street"]}, "kerala-parotta":{k:["street","mappila"]}
});
// extend existing trails with new stops
(function(){ const add=(id,after,ids)=>{ const t=TRAILS.find(x=>x.id===id); if(!t) return; const i=t.stops.indexOf(after); t.stops.splice(i<0?t.stops.length:i+1,0,...ids); };
  add("coast","sol-kadhi",["chicken-xacuti"]); add("coast","chicken-ghee-roast",["neer-dosa","mangalore-buns"]); add("coast","appam-stew",["karimeen-pollichathu"]);
  add("ne","momos",["sel-roti"]); add("ne","masor-tenga",["jolpan"]); add("ne","mosdeng",["pumaloi"]); add("ne","chakhao-kheer",["galho"]);
  add("street","indori-poha",["bhutte-ka-kees"]); add("street","shikanji",["jigarthanda"]);
  add("royal","agra-petha",["ghewar","laal-maas"]); add("royal","haleem",["double-ka-meetha"]);
})();
TRAILS.push(
 {id:"himalaya",name:"Himalayan Kitchens",color:"#4a6fa5",blurb:"High-altitude cooking from Ladakh and Kashmir through Himachal and Kumaon: butter tea, saffron kahwa, steamed siddu and Almora's fudge.",
  stops:["gur-gur-cha","skyu","kahwa","nadru-yakhni","rogan-josh","rajma-chawal","chana-madra","siddu","kafuli","aloo-ke-gutke","bal-mithai"],src:W("Himalayas")},
 {id:"temple",name:"Temple Prasadam",color:"#c27c0e",blurb:"Food offered in temples, from Puri's pakhala to Thanjavur's 1,000-year-old tamarind rice and Mathura's peda.",
  stops:["mathura-peda","pakhala","dalma","ven-pongal","pulihora","curd-rice","mangalore-buns","palpayasam"],src:W("Prasada")}
);
