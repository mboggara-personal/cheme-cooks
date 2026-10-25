// ===== Wave 11 histories =====
const AK_KONIR=["Archana's Kitchen: Aloo konir dom (Assamese egg potato curry)","https://www.archanaskitchen.com/aloo-konir-dom-recipe-assamese-egg-potato-curry"];
const OK_DASHAIN=["Onlinekhabar: Special Nepali food items during festivals","https://english.onlinekhabar.com/special-nepali-food-items-festivals.html"];
Object.assign(HIST, {
"nga-thongba":{story:"Nga thongba is a staple freshwater fish curry of Meitei households in Manipur, flavoured with heiribob (citrus peel), culantro and hooker chives. It is served at festival feasts such as Ningol Chakouba, Cheiraoba and Yaoshang.",
 place:"Imphal, in the Manipur valley around Loktak Lake, the heart of Meitei fish culture.",
 tl:[["Cheiraoba","Meitei New Year feasts"],["Yaoshang","Spring festival feasts"],["Ningol Chakouba","Married daughters are feasted at their parents' home"]],
 kin:["Nga atoiba thongba","Eromba","Masor tenga"],
 src:[W("Nga_thongba"),W("Fish_in_Meitei_culture")]},
"paro-koldil":{story:"Duck, pigeon and squab are popular meats in Assam, and squab cooked with papaya or banana flower is one of its best-known pairings.",
 place:"Central Assam's Brahmaputra plains.",
 tl:[["Today","A winter and celebration dish across Assam"]],
 kin:["Haah kumura","Koldil murgi (chicken with banana flower)","Mocha ghonto (Bengal)"],
 src:[W("Assamese_cuisine")]},
"konir-dom":{story:"Egg and potato curry is an everyday part of the Assamese meal, eaten with plain rice. It is medium-spicy day to day and made fiery red for special occasions.",
 place:"Guwahati and homes across Assam.",
 tl:[["Today","Everyday Assamese lunch and dinner"]],
 kin:["Dimer dalna (Bengal)","Egg curry","Anda curry"],
 src:[AK_KONIR]},
"lau-diya-maas":{story:"Assamese cooks fry fish in mustard oil and stew it with bottle gourd or greens, a light counterpart to the sour tenga.",
 place:"Upper Assam, along the Brahmaputra.",
 tl:[["Today","Everyday fish stew"]],
 kin:["Masor tenga","Lau chingri (Bengal)","Macher jhol"],
 src:[W("Assamese_cuisine")]},
"khasi-ko-masu":{story:"For most Nepalis, khasi ko masu (goat meat) is the dish they look forward to at Dashain, whatever the family's means. Hinduism is the largest religion in Sikkim, followed mostly by its Nepali-speaking majority.",
 place:"Gangtok, capital of Sikkim, where Nepali, Lepcha and Bhutia kitchens meet.",
 tl:[["Dashain","Goat curry at the centre of the feast"],["Tihar","Sel roti and festival meals"]],
 kin:["Kalo masu (Nepal)","Kosha mangsho","Rogan josh"],
 src:[OK_DASHAIN,W("Hinduism_in_Sikkim")]}
});
