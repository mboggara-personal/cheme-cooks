// ===== Wave 8 tags =====
Object.assign(META, {
  "idiyappam":{k:["tamilbrahmin"]}, "mor-kuzhambu":{k:["tamilbrahmin"]}, "murukku":{f:["Diwali"]}, "kori-rotti":{k:["tuluva"]},
  "maddur-vada":{k:["street"]}, "chiroti":{}, "erissery":{f:["Onam","Vishu"]}, "cabbage-thoran":{f:["Onam"]},
  "ada-pradhaman":{k:["temple"],f:["Onam"]}, "malabar-pathiri":{k:["mappila"],f:["Eid"]}, "meen-molee":{k:["syrian"]},
  "mirchi-ka-salan":{k:["nizami"]}, "qubani-ka-meetha":{k:["nizami","royal"]}, "irani-chai":{k:["street","parsi"],link:"tea"},
  "sulaimani":{k:["mappila"],link:"tea"}, "panakam":{k:["temple"],f:["Rama Navami"]}, "nannari-sarbath":{k:["street"]},
  "goli-soda":{k:["street"]}, "kulukki-sarbath":{k:["street"]}, "rose-milk":{k:["street"]}, "punugulu":{k:["street"]}
});
(function(){ const add=(id,after,ids)=>{ const t=TRAILS.find(x=>x.id===id); if(!t) return; const i=t.stops.indexOf(after); t.stops.splice(i<0?t.stops.length:i+1,0,...ids); };
  add("coast","mangalore-buns",["kori-rotti"]); add("coast","thalassery-biryani",["sulaimani","malabar-pathiri"]); add("coast","appam-stew",["meen-molee","kappa-meen-curry"]);
  add("royal","double-ka-meetha",["mirchi-ka-salan","qubani-ka-meetha"]); add("temple","pulihora",["panakam"]); add("temple","palpayasam",["ada-pradhaman"]);
})();
TRAILS.push({id:"drinks",name:"Drinks of India",color:"#2a7a9a",blurb:"A glass from every corner: butter tea in Leh, pink tea in Srinagar, sattu in Bihar, kokum on the Konkan, Irani chai in Hyderabad and rose milk in Chennai.",
  stops:["gur-gur-cha","noon-chai","kahwa","lassi","bajra-raab","jaljeera","kanji","thandai","sattu-sharbat","masala-chai","bela-pana","irani-chai","piyush","kokum-sharbat","filter-coffee","ragi-malt","sulaimani","jigarthanda","panakam","rose-milk"],src:W("List_of_Indian_beverages")});
