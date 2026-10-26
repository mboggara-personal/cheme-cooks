/* ================= Wave C: kitchen science for kids ================= */
/* [id, title, emoji-free icon key, dish, chemE lab dish, age, adult?, time, you need[], predict question, options[], answer index, steps[], explain, wiki] */
const KIDS = [
 {id:"colour",title:"The colour-changing spice",dish:"khaman",lab:"khaman",age:"6+",adult:false,time:"10 min",
  need:["½ tsp turmeric","2 clear glasses of water","½ tsp baking soda","1 tbsp lemon juice","a spoon"],
  q:"You stir baking soda into yellow turmeric water. What happens?",opts:["Nothing changes","It turns red-brown","It turns blue"],a:1,
  steps:["Stir the turmeric into a glass of water. It turns yellow.","Pour half into the second glass so you can compare.","Stir the baking soda into one glass and watch the colour.","Now stir lemon juice into that same glass. What happens?"],
  why:"Turmeric is a natural pH indicator. Baking soda is a base (the opposite of an acid), and in a base turmeric's colour molecule, curcumin, changes shape and looks red-brown. Lemon juice is an acid; it cancels the base and the yellow comes back. Cooks see the same thing when too much soda turns dhokla reddish.",src:"Turmeric"},
 {id:"fizz",title:"Blow up a balloon with lemon and soda",dish:"dhokla",lab:"khaman",age:"6+",adult:false,time:"10 min",
  need:["a small empty bottle","3 tbsp lemon juice (or vinegar)","1 tsp baking soda","a balloon","a funnel or paper cone"],
  q:"What will make the balloon grow?",opts:["Air from the bottle","A gas made by the reaction","Water vapour"],a:1,
  steps:["Pour the lemon juice into the bottle.","Use the funnel to put the baking soda inside the balloon.","Stretch the balloon over the bottle's neck without spilling the soda.","Lift the balloon so the soda falls in, and watch."],
  why:"Acid plus baking soda makes carbon dioxide gas. The gas needs room, so it inflates the balloon. In dhokla and khaman batter the same gas makes thousands of tiny bubbles, and steaming makes them grow, so the cake turns spongy.",src:"Sodium_bicarbonate"},
 {id:"paneer",title:"Turn milk into paneer",dish:"palak-paneer",lab:"shrikhand",age:"8+",adult:true,time:"25 min",
  need:["2 cups whole milk","2 tbsp lemon juice","a pan (a grown-up heats it)","a sieve lined with a clean thin cloth","a bowl"],
  q:"When lemon juice goes into hot milk, what do you think happens?",opts:["The milk boils over","It splits into white lumps and yellow-green liquid","It turns into yogurt"],a:1,
  steps:["A grown-up heats the milk until it's just about to boil, then turns off the heat.","Add the lemon juice one spoon at a time and stir gently.","Watch for white curds and a greenish liquid called whey.","When it has cooled a little, pour it through the cloth into the sieve. Squeeze gently once it's cool enough to touch."],
  why:"Milk protein (casein) floats around as tiny clusters that repel each other. Acid takes away their electric charge, so they stop repelling and clump together into curds. That's paneer. The leftover whey is mostly water, milk sugar and some other proteins.",src:"Paneer"},
 {id:"dahi",title:"Warm versus cold dahi",dish:"mishti-doi",lab:"mishti-doi",age:"7+",adult:true,time:"10 min + overnight",
  need:["1 cup milk","2 tsp plain yogurt","2 small cups","a warm spot (an oven with only the light on)","the fridge"],
  q:"Which cup will turn into dahi by morning?",opts:["The cold one in the fridge","The warm one","Both the same"],a:1,
  steps:["A grown-up warms the milk until it feels comfortably warm on your wrist, not hot.","Pour it into two cups and stir 1 tsp yogurt into each.","Put one cup somewhere warm and one in the fridge.","Next morning, tilt each cup. Which one has set?"],
  why:"Yogurt is full of living bacteria. They eat milk sugar and make acid, and the acid makes the milk proteins join into a soft gel. Like you, the bacteria work best when they're warm. In the fridge they're too cold to do much.",src:"Yogurt"},
 {id:"kulfi",title:"Kulfi in a bag",dish:"kulfi",lab:"kulfi",age:"7+",adult:false,time:"20 min",
  need:["½ cup milk + 1 tbsp sugar + a pinch of cardamom","a small zip bag","a big zip bag","3 cups ice","⅓ cup salt","a towel or gloves (it gets very cold)"],
  q:"Will ice with salt be colder or warmer than plain ice?",opts:["Colder","Warmer","The same"],a:0,
  steps:["Mix the milk, sugar and cardamom in the small bag and seal it well.","Put the ice and salt in the big bag.","Put the small bag inside the big bag and seal it.","Wrap it in the towel and shake for 10–15 minutes. Then open the small bag and taste."],
  why:"Salt makes it harder for water to freeze, so salty ice melts even below 0 °C. Melting needs energy, and the ice takes it as heat from the milk bag, which gets cold enough to freeze. Sugar in the kulfi also lowers its freezing point, which keeps it soft enough to eat.",src:"Freezing-point_depression"},
 {id:"rice",title:"Weigh the water rice drinks",dish:"curd-rice",lab:"curd-rice",age:"8+",adult:true,time:"30 min",
  need:["½ cup rice","a kitchen scale","water","a pot with a lid (a grown-up cooks)"],
  q:"After cooking, the rice will weigh…",opts:["The same as before","About double or more","Less than before"],a:1,
  steps:["Weigh the dry rice and write it down.","A grown-up cooks it with twice its weight of water and the lid on.","When it has cooled, weigh the cooked rice.","Subtract: how much water did the rice soak up?"],
  why:"Rice is mostly starch. When it's heated in water the starch grains swell and soak up water, like tiny sponges. That's why cooked rice weighs two to three times as much as raw rice. Engineers call this a mass balance: what goes in must come out or stay inside.",src:"Starch_gelatinization"},
 {id:"dissolve",title:"Sugar race: warm or cold?",dish:"gulab-jamun",lab:"gulab-jamun",age:"6+",adult:false,time:"10 min",
  need:["2 clear glasses","cold water and warm tap water","2 sugar cubes or 2 tsp sugar","a timer"],
  q:"Where will sugar disappear faster?",opts:["Cold water","Warm water","No difference"],a:1,
  steps:["Fill one glass with cold water and one with warm tap water.","Drop sugar into both at the same moment. Don't stir.","Time how long until you can't see the sugar.","Try again, this time stirring both."],
  why:"Molecules are always jiggling, and in warm water they jiggle faster, so sugar spreads out quicker. That's diffusion. Stirring helps even more. It's why gulab jamuns soak up warm syrup faster than cold.",src:"Diffusion"},
 {id:"cubes",title:"Big cube, small cube",dish:"rasmalai",lab:"gulab-jamun",age:"7+",adult:false,time:"15 min",
  need:["2 slices of bread","a ruler","a bowl of water with a few drops of food colour","a spoon","a plate"],
  q:"If one cube is twice as wide, how much longer does colour take to reach its middle?",opts:["Twice as long","About four times as long","Half as long"],a:1,
  steps:["Cut one small cube (1 cm) and one big cube (2 cm) from the bread.","Dip both in the coloured water for 5 seconds and lift them out.","Wait 1 minute, then cut each one in half.","Which one is coloured all the way through?"],
  why:"Liquid soaking in has to travel from the outside to the centre. When something is twice as wide, it doesn't take twice as long: it takes about four times as long, because soaking time goes with the size squared. That's why cooks make jamuns and rasmalai discs small.",src:"Fick's_laws_of_diffusion"},
 {id:"oil",title:"Spice in oil or water?",dish:"rogan-josh",lab:"filter-coffee",age:"6+",adult:false,time:"10 min",
  need:["2 small clear glasses","3 tbsp water","3 tbsp cooking oil","¼ tsp turmeric for each glass","a spoon"],
  q:"Which liquid turns a brighter, clearer yellow?",opts:["Water","Oil","Both the same"],a:1,
  steps:["Put turmeric into each glass.","Stir both well for 30 seconds.","Let them sit for 5 minutes.","Hold them up to a window. Which one is clear and bright, and which one is cloudy with bits at the bottom?"],
  why:"Curcumin, the yellow in turmeric, dissolves in fat, not in water. In water the powder just floats and sinks. That's why Indian cooks fry spices in hot oil first (tadka): the oil pulls out the colour and flavour and carries it through the whole dish.",src:"Curcumin"},
 {id:"crisp",title:"Why chips go soft",dish:"banana-chips",lab:"banana-chips",age:"6+",adult:false,time:"5 min + 1 day",
  need:["a handful of chips or papad","2 bowls","a sealed jar or zip bag"],
  q:"After a day, which chips will still crunch?",opts:["The ones in the open bowl","The ones in the sealed jar","Both"],a:1,
  steps:["Put half the chips in an open bowl and half in a sealed jar.","Leave them on the counter for a day (a steamy kitchen works fastest).","Taste one from each.","Which one lost its crunch?"],
  why:"Frying takes almost all the water out, which is what makes chips crunchy. Air always has some water vapour in it, and dry chips soak it up like a sponge and go soft. A sealed jar keeps the damp air out. With so little water, germs can't grow either, so namkeen keeps for weeks.",src:"Water_activity"},
 {id:"puff",title:"Watch a roti puff",dish:"aloo-paratha",lab:"samosa",age:"6+",adult:true,time:"20 min",
  need:["a grown-up making phulka rotis","a safe spot to watch from"],
  q:"What blows the roti up like a balloon?",opts:["Air","Steam from water in the dough","Smoke"],a:1,
  steps:["Watch a grown-up roll a thin, even roti.","They cook it on the tawa for a few seconds on each side.","Then they put it over the flame or press it with a cloth.","Count how many seconds it takes to puff."],
  why:"Dough has water in it. When it gets hot enough the water turns to steam, and steam takes up over a thousand times more space than the water it came from. The cooked outside layers trap the steam, so the roti swells up like a balloon.",src:"Chapati"},
 {id:"dance",title:"Dancing water drops",dish:"masala-dosa",lab:"idli",age:"8+",adult:true,time:"5 min",
  need:["a grown-up with a dosa tawa or heavy pan","a few drops of water"],
  q:"On a very hot pan, a water drop will…",opts:["Disappear instantly","Skate around for a while","Sink into the pan"],a:1,
  steps:["A grown-up heats the pan; stand back where you can see.","They flick in a drop of water while the pan is only warm: it sizzles away.","When the pan is much hotter, they flick in another drop.","Watch it skate and dance! That's when the pan is ready for dosa."],
  why:"On a really hot pan, the bottom of the drop turns to steam so fast that the drop floats on a cushion of its own vapour. Scientists call it the Leidenfrost effect. Dosa batter spreads and crisps best on a pan that hot.",src:"Leidenfrost_effect"}
];
store.kids = store.kids || {};
function openKids(){ const done=Object.keys(store.kids).length;
  openModal(`<h2>Kitchen science for kids</h2>`,`<p class="lead" style="margin-top:0">Twelve experiments using things from the kitchen. Each one starts with a guess: <b>predict</b>, then <b>try</b> it, then find out <b>why</b>. They link to the dish and to the grown-up ChemE lab.</p>
   <div class="kbar"><span class="mono">${done}/${KIDS.length} done</span><span class="bar"><i style="width:${done/KIDS.length*100}%"></i></span><b>${done>=KIDS.length?"Master scientist":done>=8?"Kitchen scientist":done>=4?"Junior scientist":done>=1?"Curious cook":"Ready to start"}</b></div>
   <div class="kgrid">${KIDS.map(k=>`<button class="kcard ${store.kids[k.id]?"done":""}" data-kid="${k.id}"><span class="kmeta mono">AGE ${k.age} · ${k.time}${k.adult?" · WITH A GROWN-UP":""}</span><b>${esc(k.title)}</b><small>${esc(k.q)}</small>${store.kids[k.id]?'<span class="kstamp">done ✓</span>':""}</button>`).join("")}</div>
   <p class="note"><b>For grown-ups:</b> experiments marked "with a grown-up" use the stove, hot liquids or a knife; an adult does those steps. Check for milk allergies before the dairy ones. Taste only the experiments meant to be eaten (paneer, dahi, kulfi, rice).</p>${whatBox("Want the big ideas behind these experiments?")}`);
}
function openKid(id,picked){ const k=KIDS.find(x=>x.id===id); const ans=picked!==undefined;
  openModal(`<h2>${esc(k.title)}</h2>`,`<p class="kmeta mono" style="margin-top:0">AGE ${k.age} · ${k.time}${k.adult?" · WITH A GROWN-UP":""}</p>
   <div class="kstep"><span class="kn">1</span><div><h3>Predict</h3><p>${esc(k.q)}</p><div class="kopts">${k.opts.map((o,i)=>`<button class="chip kopt ${ans?(i===k.a?"right":i===picked?"wrong":""):""}" data-kpick="${i}" ${ans?"disabled":""}>${esc(o)}</button>`).join("")}</div>
    ${ans?`<p class="kres">${picked===k.a?"Good guess! Now test it.":"Interesting guess. Try it and see what really happens."}</p>`:`<p class="note" style="margin:6px 0 0">Make your guess before you try.</p>`}</div></div>
   <div class="kstep"><span class="kn">2</span><div><h3>You'll need</h3><ul>${k.need.map(n=>`<li>${esc(n)}</li>`).join("")}</ul><h3>Try it</h3><ol>${k.steps.map(s=>`<li><label><input type="checkbox"> ${esc(s)}</label></li>`).join("")}</ol></div></div>
   <div class="kstep"><span class="kn">3</span><div><h3>Why it happens</h3>${ans?`<p>${esc(k.why)}</p>`:`<p class="note" style="margin:0">Make your prediction first to unlock this.</p>`}</div></div>
   <div class="cookdone"><button class="btn ${store.kids[k.id]?"acc":"ghost"}" id="kDone">${store.kids[k.id]?"Done ✓":"We did it!"}</button><button class="btn ghost" data-open="${k.dish}">See the dish: ${esc(byId[k.dish].name)}</button><button class="btn ghost" data-open="${k.lab}" data-deeptab="1">Grown-up ChemE lab →</button><button class="btn ghost" id="kBack">All experiments</button></div>
   <p class="note">Learn more: ${srcList([WK(k.src)])}</p>`);
  $$("#mb [data-kpick]").forEach(b=>b.onclick=()=>openKid(id,+b.dataset.kpick));
  $("#kDone").onclick=()=>{ if(store.kids[k.id]) delete store.kids[k.id]; else { store.kids[k.id]=1; toast("Experiment stamped!"); } save(); openKid(id,picked===undefined?k.a:picked); };
  $("#kBack").onclick=openKids;
}
document.addEventListener("click",e=>{ const c=e.target.closest("[data-kid]"); if(c) openKid(c.dataset.kid); });
$("#bKids").onclick=openKids;
