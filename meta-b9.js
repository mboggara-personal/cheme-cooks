// ===== Wave 7 tags =====
Object.assign(KITCHENS, { sindhi:"Sindhi", kathiawadi:"Kathiawadi", koli:"Koli (Mumbai fisherfolk)" });
Object.assign(META, {
  "dhokla":{k:["street"]}, "fafda":{k:["street"],f:["Dussehra"]}, "mohanthal":{k:["temple"],f:["Diwali","Janmashtami"]},
  "khichu":{k:["street"]}, "sev-tameta":{k:["kathiawadi"]}, "basundi":{f:["Diwali"]},
  "zunka-bhakri":{k:["street"]}, "bombil-fry":{k:["koli"]}, "chakli":{f:["Diwali"]},
  "prawn-balchao":{k:["goancath"]}, "patoleo":{k:["goancath","goanhindu"],f:["Feast of the Assumption","Nag Panchami"]},
  "akuri":{k:["parsi"]}, "patra-ni-machhi":{k:["parsi"]}, "dal-pakwan":{k:["sindhi"]},
  "luchi-alur-dom":{k:["bengali"],f:["Durga Puja"]}, "shukto":{k:["bengali"]}, "chingri-malai-curry":{k:["bengali"]}, "jhalmuri":{k:["street","bengali"]},
  "ghugni":{k:["street","odia"]}, "silao-khaja":{f:["Chhath"]}, "malpua":{k:["temple","odia"],f:["Holi","Eid"]}, "rasabali":{k:["temple","odia"]},
  "chhena-gaja":{k:["odia"]}, "machha-besara":{k:["odia"]}, "falooda":{k:["street","nizami"]}
});
(function(){ const add=(id,after,ids)=>{ const t=TRAILS.find(x=>x.id===id); if(!t) return; const i=t.stops.indexOf(after); t.stops.splice(i<0?t.stops.length:i+1,0,...ids); };
  add("coast","sol-kadhi",["kokum-sharbat"]); add("coast","chicken-xacuti",["prawn-balchao","patoleo"]);
  add("street","dabeli",["fafda"]); add("street","vada-pav",["bombil-fry","akuri"]); add("street","kathi-roll",["jhalmuri"]);
  add("temple","pakhala",["malpua","rasabali"]); add("temple","mathura-peda",["mohanthal"]);
  add("gt","kathi-roll",["jhalmuri","luchi-alur-dom"]); add("gt","litti-chokha",["champaran-mutton","silao-khaja"]);
})();
TRAILS.push({id:"parsi",name:"Parsi & Irani Mumbai",color:"#7a5c2e",blurb:"From Navsari, where the Parsis settled, to Mumbai's dhansak and akuri, with a stop at Dadar for piyush.",
  stops:["patra-ni-machhi","dhansak","akuri","piyush","bombil-fry"],src:W("Parsis")});
