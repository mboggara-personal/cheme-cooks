// ===== Kitchen traditions, festivals and links (each tag rests on the dish's cited history) =====
const FEST_ATLAS = "https://claude.ai/artifact/Wd5D5yZm6d5yb3FYxFyCvP";
const KITCHENS = {
  royal:"Royal kitchens", temple:"Temple kitchens", street:"Street food",
  pandit:"Kashmiri Pandit", awadhi:"Awadhi", nizami:"Hyderabadi (Nizami)", chettiar:"Chettiar", syrian:"Syrian Christian",
  goancath:"Goan Catholic", goanhindu:"Goan Hindu", udupi:"Udupi", naga:"Naga", khasi:"Khasi", mizo:"Mizo", tripuri:"Tripuri",
  monpa:"Monpa", creole:"Pondicherry Creole", ladakhi:"Ladakhi", pahari:"Pahari (hill)", parsi:"Parsi", kodava:"Kodava", mappila:"Mappila", bengali:"Bengali", tamilbrahmin:"Tamil home"
};
// festival names that also appear in the Hindu Festivals Atlas
const HINDU_FEST = new Set(["Pongal","Holi","Gudi Padwa","Ganesh Chaturthi","Chhath","Bihu","Onam","Diwali","Makar Sankranti","Navratri","Durga Puja","Janmashtami","Ugadi","Kartik"]);
const META = {
  "butter-chicken":{k:["street"]}, "chole-bhature":{k:["street"]}, "rogan-josh":{k:["pandit"]},
  "galouti-kebab":{k:["royal","awadhi"]}, "dal-baati":{k:["royal"]}, "mysore-pak":{k:["royal"]}, "bisi-bele-bath":{k:["royal"]},
  "sambar":{k:["royal"]}, "hyderabadi-biryani":{k:["royal","nizami"]}, "chettinad-chicken":{k:["chettiar"]},
  "appam-stew":{k:["syrian"],f:["Easter"]}, "goan-fish-curry":{k:["goanhindu"]},
  "masala-dosa":{k:["udupi"]}, "dalma":{k:["temple"],f:["Kartik"]},
  "ven-pongal":{k:["temple"],f:["Pongal"]}, "puran-poli":{f:["Holi","Gudi Padwa","Ganesh Chaturthi"]},
  "vada-pav":{k:["street"]}, "pav-bhaji":{k:["street"]}, "indori-poha":{k:["street"]}, "momos":{k:["street"]},
  "dhuska":{k:["street"]}, "litti-chokha":{f:["Panchkosi Jatra"]}, "macher-jhol":{k:["bengali"]}, "kosha-mangsho":{k:["bengali"]}, "rosogolla":{k:["bengali"]},
  "avial":{f:["Onam"]}, "bai":{k:["mizo"]}, "mosdeng":{k:["tripuri"]}, "zan":{k:["monpa"]},
  "fish-assad":{k:["creole"]}, "skyu":{k:["ladakhi"]}, "kafuli":{k:["pahari"]}, "chana-madra":{k:["pahari"]}
};
