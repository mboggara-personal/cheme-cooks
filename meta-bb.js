// ===== Wave 9 tags =====
Object.assign(KITCHENS, { bhopali:"Bhopali (Nawabi)", malvani:"Malvani", saoji:"Saoji", rayalaseema:"Rayalaseema" });
Object.assign(META, {
  "bhopali-gosht-korma":{k:["bhopali","royal"]}, "bhopali-paya":{k:["bhopali","street"]}, "garadu":{k:["street","malwa"]}, "indori-shikanji":{k:["street","malwa"]},
  "bore-baasi":{f:["Bore Baasi Tihar"]}, "chepala-pulusu":{}, "ambot-tik":{k:["goancath"]}, "paplet-saar":{k:["malvani"]}, "kombdi-vade":{k:["malvani"]},
  "fish-kabiraji":{k:["street","bengali"]}, "bhetki-paturi":{k:["bengali"]}, "mughlai-paratha":{k:["street","bengali"]}, "mutton-yakhni":{k:["kashmirimuslim"]},
  "natu-kodi-pulusu":{k:["rayalaseema"]}, "pathar-ka-gosht":{k:["nizami"]}, "keema-pav":{k:["street","parsi"]}, "dhaulo-maans":{k:["royal","rajput"]},
  "saoji-mutton":{k:["saoji"]}, "jardaloo-sali-boti":{k:["parsi"]}, "kolambi-fry":{k:["koli"]},
  "gujiya":{f:["Holi","Diwali","Chhath"]}, "rasmalai":{k:["bengali"]}, "kaju-katli":{f:["Diwali"]}, "motichoor-laddoo":{f:["Ganesh Chaturthi","Diwali"]},
  "moong-dal-halwa":{f:["Diwali","Holi"]}, "kesari-bath":{f:["Ugadi"]}, "kozhikode-halwa":{k:["street"]}, "ariselu":{f:["Diwali","Ganesh Chaturthi"]},
  "rabri":{k:["temple","braj"]}, "sohan-halwa":{k:["street"]}, "khoya-jalebi":{k:["street"]}
});
(function(){ const add=(id,after,ids)=>{ const t=TRAILS.find(x=>x.id===id); if(!t) return; const i=t.stops.indexOf(after); t.stops.splice(i<0?t.stops.length:i+1,0,...ids); };
  add("coast","kokum-sharbat",["kolambi-fry"]); add("coast","patoleo",["ambot-tik"]); add("coast","sol-kadhi",["paplet-saar","kombdi-vade"]);
  add("parsi","dhansak",["jardaloo-sali-boti","keema-pav"]);
  add("street","indori-poha",["garadu","indori-shikanji"]); add("street","jhalmuri",["fish-kabiraji","mughlai-paratha"]);
  add("royal","dal-baati",["dhaulo-maans"]); add("royal","double-ka-meetha",["pathar-ka-gosht"]);
  add("temple","mathura-peda",["rabri"]);
})();
TRAILS.push({id:"seafood",name:"Coastal Catch",color:"#1f6f8b",blurb:"India's fish and seafood coast to coast: Konkan prawns and pomfret, Goan ambot tik, Kerala pearl spot, Tamil and Andhra tamarind curries, Odia crab and Bengal's paturi.",
  stops:["bombil-fry","kolambi-fry","paplet-saar","prawn-balchao","ambot-tik","goan-fish-curry","karimeen-pollichathu","meen-molee","kappa-meen-curry","meen-kuzhambu","chepala-pulusu","gongura-royyalu","kankada-jhola","machha-besara","bhetki-paturi","shorshe-ilish","chingri-malai-curry","masor-tenga"],src:W("Seafood")});
