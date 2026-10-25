/* ===== derived diet tags: seafood, egg, Jain, vrat ===== */
const TAGDEF = {
  seafood:["Fish & seafood","Contains fish, prawns, crab, clams or fermented fish as written (not counting optional extras)."],
  egg:["Egg","Non-veg only because of egg; no meat or fish."],
  jain:["Jain","As written: vegetarian, no onion, garlic, roots or tubers, no brinjal, cabbage, cauliflower or mushroom, no honey, no yeast or overnight-fermented batter."],
  vrat:["Vrat","As written: no grains (wheat, rice, maida), no pulses, no onion or garlic, vegetarian. Uses the common Navratri/Ekadashi convention; use rock salt. Family rules differ."]
};
const K_SEA=["fish","fishRohu","hilsa","prawn","bombil","mas","crab"], K_MEAT=["chicken","chickenBone","muttonBone","mutton","mince","pork","smokedPork","duck","squab"], K_EGG=["egg","yolk"];
const K_JAIN_NO=["potato","sweetpotato","yam","onion","garlic","ginger","carrot","beet","turnip","lotusstem","tapioca","brinjal","cabbage","cauli","natto"];
const T_JAIN_NO=/\b(onion|shallot|garlic|ginger|potato|carrot|radish|beet|beetroot|lotus stem|yam|colocasia|arbi|mushroom|brinjal|aubergine|eggplant|cabbage|cauliflower|honey|yeast|spring onion|leek|tapioca|cassava|sweet potato|turmeric root)\b/i;
const K_GRAIN=["rice","blackrice","poha","puffedrice","atta","maida","semolina","makki","bajra","ragi","ricefl","jowar","noodles","dalia","bread","pav","cornflour","gluten","corn","vermicelli"];
const K_PULSE=["urad","toor","chanadal","moong","moongwhole","kidney","chickpea","besan","sattu","sprout","masoor","drypeas","horsegram","cowpea","natto"];
const T_VRAT_NO=/\b(onion|shallot|garlic|rice|wheat|atta|maida|semolina|sooji|rava|besan|gram flour|dal|lentil|bread|pav|vermicelli|seviyan|asafoetida|hing|corn|millet flour)\b/i;
function rows(d){ return d.ing.filter(r=>r[0]!=="#" && !/optional/i.test(r[0]+" "+r[1]) && !/^(to serve|serve with|for serving)/i.test(r[0])); }
function deriveTags(d){
  const R=rows(d), keys=new Set(R.flatMap(r=>Object.keys(r[2]||{})));
  const has=L=>L.some(k=>keys.has(k));
  const text=R.map(r=>r[1]).join(" | ");
  const t=[];
  const sea=has(K_SEA)||/\b(ngari|berma|crabs?|clams?|prawns?|shrimps?|mackerel|sardines?)\b/i.test(text);
  if(d.diet==="nonveg"&&sea) t.push("seafood");
  if(d.diet==="nonveg"&&!sea&&!has(K_MEAT)&&(has(K_EGG)||/\begg/i.test(text))) t.push("egg");
  if(d.diet==="veg"){
    const ferm=d.cheme.includes("fermentation")||/\byeast\b/i.test(text);
    if(!has(K_JAIN_NO)&&!T_JAIN_NO.test(text)&&!ferm) t.push("jain");
    if(!has(K_GRAIN)&&!has(K_PULSE)&&!T_VRAT_NO.test(text)&&!keys.has("onion")&&!keys.has("garlic")) t.push("vrat");
  }
  return t;
}
/* ===== Snack: savoury only, with a sub-type ===== */
const SNACKDEF = { chaat:["Chaat & street","Assembled street plates: chutneys, yogurt, sev, puffed rice"], fried:["Fried","Fritters, vadas, kachoris and samosas eaten hot"], steamed:["Steamed & boiled","Steamed cakes and dumplings, boiled legumes"], griddle:["Griddle & oven","Griddled, pan-cooked, grilled or baked"], dry:["Dry namkeen","Crisp, dry snacks that keep for weeks"] };
const SNACKTYPE = {
  chaat:["golgappa","jhalmuri","aloo-tikki","bhel-puri","dahi-vada","pav-bhaji","dabeli","vada-pav","garadu","singju","ghugni","bhutte-ka-kees"],
  fried:["samosa","pyaaz-kachori","medu-vada","chicken-65","mirchi-vada","fafda","maddur-vada","punugulu","pakora","mysore-bonda","amritsari-fish","fish-kabiraji","kolambi-fry","dhuska","mangalore-buns","kothimbir-vadi"],
  steamed:["khaman","dhokla","momos","khandvi","fara","dal-pitha","pumaloi","siddu","khichu","sundal"],
  griddle:["galouti-kebab","paneer-tikka","pathar-ka-gosht","kathi-roll","mughlai-paratha","thepla","chila","chilka-roti","veg-puff","handvo","sarva-pindi","kuzhi-paniyaram","aloo-ke-gutke","sabudana-khichdi"],
  dry:["chakli","murukku","mathri","chivda","bikaneri-bhujia","banana-chips","khakhra"]
};
const SNACK_OF = {}; Object.entries(SNACKTYPE).forEach(([t,L])=>L.forEach(id=>SNACK_OF[id]=t));
function snackify(d){ if(d.meals.includes("sweets")) d.meals=d.meals.filter(m=>m!=="snack"); d.snack = d.meals.includes("snack") ? (SNACK_OF[d.id]||"fried") : ""; }
