const SISTER = { tea:["The Tea Atlas","https://claude.ai/artifact/UswwpFZcpSd4sAcVv9ra2h"], coffee:["The Coffee Atlas","https://claude.ai/artifact/X7YoCRpGqm5S7MXijYybap"] };
Object.assign(META, {
  "masala-chai":{k:["street"],link:"tea"}, "filter-coffee":{link:"coffee"}, "thandai":{f:["Holi","Shivratri"]},
  "shikanji":{k:["street"]}
});
// ===== Food trails: curated routes across the map =====
const TRAILS = [
 {id:"gt",name:"Grand Trunk Road",color:"#b1381d",blurb:"The road Sher Shah Suri rebuilt in the 16th century: Amritsar, Jalandhar, Ludhiana, Delhi, Agra, Varanasi and Kolkata, with two short Bihar detours for litti and thekua.",
  stops:["amritsari-kulcha","lassi","sarson-saag","gajar-halwa","samosa","nihari","jalebi","agra-petha","golgappa","litti-chokha","thekua","kathi-roll","rosogolla"],src:W("Grand_Trunk_Road")},
 {id:"coast",name:"Konkan & Malabar Coast",color:"#1f7a8c",blurb:"Down the west coast from the Konkan through Goa and coastal Karnataka to Kerala's spice ports.",
  stops:["sol-kadhi","goan-fish-curry","bebinca","chicken-ghee-roast","masala-dosa","thalassery-biryani","appam-stew","palpayasam","puttu-kadala"],src:W("Malabar_Coast")},
 {id:"ne",name:"Seven Sisters & Sikkim",color:"#2f7d4a",blurb:"Across the Northeast, from Sikkim's momos to Manipur's black rice.",
  stops:["momos","thukpa","masala-chai","khar","til-pitha","masor-tenga","mosdeng","bai","eromba","chakhao-kheer","zan"],src:W("Seven_Sister_States")},
 {id:"royal",name:"Royal Kitchens",color:"#8a5a12",blurb:"Dishes born in the kitchens of sultans, emperors, nawabs, Nizams and maharajas.",
  stops:["samosa","agra-petha","galouti-kebab","lucknowi-biryani","dal-baati","hyderabadi-biryani","haleem","mysore-pak","bisi-bele-bath","sambar"]},
 {id:"street",name:"Street Food",color:"#6b3fa0",blurb:"Carts, stalls and station platforms: India's street classics.",
  stops:["chole-bhature","jalebi","golgappa","kathi-roll","dhuska","indori-poha","dabeli","vada-pav","pav-bhaji","shikanji"]}
];
