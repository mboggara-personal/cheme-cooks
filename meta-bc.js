// ===== Wave 10 tags =====
Object.assign(KITCHENS, { bakery:"Bakery", faral:"Diwali faral" });
Object.assign(META, {
  "phirni":{k:["awadhi"],f:["Eid"]}, "sheer-khurma":{k:["nizami"],f:["Eid"]}, "balushahi":{f:["Diwali"]}, "soan-papdi":{f:["Diwali"]},
  "shakarpara":{k:["faral"],f:["Diwali"]}, "nankhatai":{k:["bakery","parsi"]},
  "aloo-tikki":{k:["street"]}, "bhel-puri":{k:["street"]}, "dahi-vada":{k:["street"],f:["Holi"]}, "sundal":{k:["tamilbrahmin"],f:["Navratri"]},
  "pakora":{k:["street"]}, "mysore-bonda":{k:["udupi"]}, "mathri":{}, "chivda":{k:["faral"],f:["Diwali"]}, "bikaneri-bhujia":{},
  "banana-chips":{f:["Onam"]}, "khakhra":{}, "veg-puff":{k:["bakery"]}
});
(function(){ const add=(id,after,ids)=>{ const t=TRAILS.find(x=>x.id===id); if(!t) return; const i=t.stops.indexOf(after); t.stops.splice(i<0?t.stops.length:i+1,0,...ids); };
  add("street","golgappa",["aloo-tikki"]); add("street","vada-pav",["bhel-puri"]);
})();
TRAILS.push({id:"chaat",name:"Chaat & Namkeen",color:"#b8641e",blurb:"Teatime across India: Bikaner's bhujia and Rajasthan's mathri, Varanasi's tikki, Mumbai's bhel, Pune's chivda, Gujarat's khakhra, then south for bonda, bakery puffs, Marina sundal and Kerala's banana chips.",
  stops:["bikaneri-bhujia","mathri","pakora","golgappa","aloo-tikki","jhalmuri","khakhra","dhokla","bhel-puri","vada-pav","chivda","dahi-vada","mysore-bonda","veg-puff","sundal","banana-chips"],src:W("Chaat")});
