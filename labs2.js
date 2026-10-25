/* ================= Wave B: eleven more ChemE deep dives + labs ================= */
Object.assign(DS, {
  wLemon:WK("Lemon"), wBicarb:WK("Sodium_bicarbonate"), wIdeal:WK("Ideal_gas_law"), wCitric:WK("Citric_acid"),
  wCoffee:WK("Coffee_preparation"), wFilterCoffee:WK("Indian_filter_coffee"), wArr:WK("Arrhenius_equation"),
  wYog:WK("Yogurt"), wCTMI:["Rosso et al. 1993: cardinal temperature model with inflection (J. Theor. Biol.)","https://doi.org/10.1006/jtbi.1993.1099"], wDahi:WK("Dahi_(curd)"),
  wSpecHeat:WK("Specific_heat_capacity"), wFusion:WK("Enthalpy_of_fusion"), wIdli:WK("Idli"),
  wMaillard:WK("Maillard_reaction"), wCaramel:WK("Caramelization"), wBiryani:WK("Biryani"),
  wGelat:WK("Starch_gelatinization"), wRice:WK("Cooked_rice"),
  wSB:WK("Stefan–Boltzmann_law"), wTandoor:WK("Tandoor"), wRad:WK("Thermal_radiation"),
  wFick:WK("Fick's_laws_of_diffusion"), wCrank:["Crank, The Mathematics of Diffusion (2nd ed., 1975), ch. 6: diffusion in a sphere","https://archive.org/details/mathematicsofdif0000cran"], wJamun:WK("Gulab_jamun"),
  wFPD:WK("Freezing-point_depression"), wMilk:WK("Milk"), wKulfi:WK("Kulfi"),
  wEvap:WK("Enthalpy_of_vaporization"), wKhoa:WK("Khoa"), wRabri:WK("Rabri"),
  wAw:WK("Water_activity"), wGAB:WK("Moisture_sorption_isotherm"), wGlass:WK("Glass_transition")
});
Object.assign(LAB_BADGES, {leaven:"Gas engineer",brew:"Extractor",culture:"Culture keeper",grind:"Heat balancer",brown:"Reaction kineticist",absorb:"Mass balancer",radiate:"Radiation engineer",soak:"Diffusion master",freeze:"Cryo cook",reduce:"Evaporator II",dry:"Shelf-life engineer"});

Object.assign(M, {
  // leavening: soda + citric acid, 3 NaHCO3 + C6H8O7 → Na3C6H5O7 + 3 CO2 + 3 H2O
  co2(soda,lemon,cit){ const nS=soda/84.01, nC=(lemon*0.048+cit)/192.12; const nCO2=Math.min(nS,3*nC); return {nS,nC,nCO2,leftS:(nS-nCO2)*84.01,leftC:Math.max(0,nC-nCO2/3)*192.12,V:nCO2*0.08206*368}; },
  // coffee: first-order extraction toward a 28% ceiling
  ey(t,dmm,T){ const k=0.0835*Math.pow(0.4/dmm,2)*Math.exp(-30e3/8.314*(1/(T+273.15)-1/366.15)); return 28*(1-Math.exp(-k*t)); },
  // yogurt: CTMI temperature factor (Tmin 10, Topt 43, Tmax 50 °C), logistic pH in "43 °C-equivalent hours"
  ctmi(T){ const a=10,o=43,x=50; if(T<=a||T>=x) return 0; return (T-x)*(T-a)*(T-a)/((o-a)*((o-a)*(T-o)-(o-x)*(o+a-2*T))); },
  yph(T,t){ const tau=M.ctmi(T)*t; return 4.1+2.5/(1+Math.exp((tau-3.96)/0.75)); },
  // onion browning: drying stage then Arrhenius browning stage
  brown(T,Lmm){ const h=40, drying=0.89*1000*(Lmm/2000)*2.257e6/(h*Math.max(1,T-100)); const tb=180*Math.exp(100e3/8.314*(1/(T+273.15)-1/443.15)); return {dry:drying/60, brown:tb/60, total:(drying+tb)/60}; },
  // rice absorption
  rice(ratio,lid,t){ const dry=150, W0=ratio*dry, cap=360*(1-Math.exp(-t/9)), ev=(lid?1.2:5)*t; const avail=Math.max(0,W0-ev); const abs=Math.min(cap,avail); const free=avail-abs; return {abs,free,ev,moist:(18+abs)/(dry+abs)*100}; },
  // tandoor: radiation + hot-air convection onto a wet surface at 100 °C
  qTand(Tw){ const s=5.67e-8, Ts=373.15, Tk=Tw+273.15; return 0.9*0.7*s*(Tk**4-Ts**4)+15*Math.max(0,Tw-150); },
  qOven(To){ const s=5.67e-8, Ts=373.15, Tk=To+273.15; return 0.9*0.7*s*(Tk**4-Ts**4)+20*Math.max(0,To-100); },
  // sphere: mean uptake fraction (Crank eq. 6.20)
  sphere(Dt_r2){ let s=0; for(let n=1;n<60;n++) s+=Math.exp(-n*n*Math.PI*Math.PI*Dt_r2)/(n*n); return Math.max(0,1-6/(Math.PI*Math.PI)*s); },
  Dsyr(T){ const Tk=T+273.15; return 4e-9*(Tk/333.15)*Math.exp(-30e3/8.314*(1/Tk-1/333.15)); },
  // kulfi: ideal freezing-point depression
  kulfi(sugar,r,Tf){ const W=451*(1-r)/1000, n=0.126+sugar/342.3, tf=-1.86*n/W, Wu=Math.min(W,1.86*n/Math.abs(Tf)), ice=Math.max(0,W-Wu)*1000, tot=515-451*r+sugar; return {tf,ice,tot,icePct:ice/tot*100}; },
  // milk reduction
  reduce(P,pct){ const m0=1030, mf=m0*pct/100, heat=m0*3.9*80/1000/P, ev=(m0-mf)*2.257/P; return {mf,solids:129/mf*100,heat:heat/60,boil:ev/60,total:(heat+ev)/60}; },
  // drying: GAB isotherm (illustrative constants) and first-order moisture pickup
  gab(aw){ const Mo=4,C=10,K=0.9; return Mo*C*K*aw/((1-K*aw)*(1-K*aw+C*K*aw)); },
  awOf(Mdb){ let lo=0,hi=0.999; for(let i=0;i<40;i++){ const m=(lo+hi)/2; if(M.gab(m)<Mdb) lo=m; else hi=m; } return (lo+hi)/2; }
});
Object.assign(DEEP, {
leaven:{dishes:["khaman","dhokla"],title:"Stoichiometry makes the sponge",
 kitchen:"Baking soda is a base; lemon juice or citric acid is an acid. Mixed in wet batter they react and release carbon dioxide, which steam then expands into a sponge. Too much soda and the dhokla tastes soapy and the turmeric turns red.",
 eng:"3 NaHCO₃ + C₆H₈O₇ → Na₃C₆H₅O₇ + 3 CO₂ + 3 H₂O. Gas yield is set by the limiting reagent: 84 g of soda gives one mole of CO₂, about 30 L at steaming temperature (ideal gas, V = nRT/P). Excess bicarbonate is left as an alkali, and turmeric, a natural pH indicator, shifts from yellow to red-brown above about pH 8.",
 pfd:[["Batter","Mixing","besan + water, rested"],["Add soda + acid","Neutralisation","CO₂ released"],["Pour","Transfer","work fast: gas escapes"],["Steam","Heat transfer + expansion","gas expands ≈ 25% from 20 → 95 °C"],["Temper","Infusion","mustard, curry leaves"]],
 lab:"leaven",
 balance:[["1 tsp baking soda","≈ 4.6 g = 0.055 mol"],["Citric acid to neutralise it","0.018 mol ≈ 3.5 g, or ≈ 73 ml lemon juice"],["CO₂ released (both fully reacted)","0.055 mol ≈ 1.7 L at 95 °C"],["Lemon juice","≈ 48 g citric acid per litre"]],
 trouble:[["Dhokla tastes soapy, turned reddish","Too much soda for the acid: leftover bicarbonate is alkaline. Add acid or cut the soda."],["Didn't rise","The gas escaped: soda went in too early or the batter waited before steaming. Add soda last, pour and steam at once."],["Rose then sank","Too much gas for the batter's protein structure, or the lid lifted early so steam pressure dropped."]],
 twin:["Gas-generating reactors","Fire extinguishers and some foam processes use the same acid–carbonate reaction; the design question is identical: how many moles of gas, released how fast."],
 src:["wBicarb","wCitric","wLemon","wIdeal"],overlay:{}},
brew:{dishes:["filter-coffee"],title:"Coffee is a solid–liquid extraction",
 kitchen:"Hot water dissolves flavour out of the grounds. Finer grounds and hotter water extract faster; too little extraction tastes sour and thin, too much tastes bitter. South Indian filter coffee drips slowly to make a strong decoction, then milk is added.",
 eng:"Brewing is leaching from porous particles. Extraction yield (EY, % of the dry coffee dissolved) follows roughly first-order kinetics toward a ceiling of about 28–30%, with a rate constant that scales with 1/d² for particle size d (diffusion path) and rises with temperature. Strength is a mass balance: TDS = EY × coffee ÷ beverage. The widely used target is EY 18–22%.",
 pfd:[["Grind","Size reduction","sets diffusion path d"],["Fill upper chamber","Packed bed","coffee (+ chicory)"],["Add hot water","Percolation","gravity drip, 10–20 min"],["Collect decoction","Extract","strong: several % TDS"],["Mix with hot milk","Dilution","≈ 1:3"]],
 lab:"brew",
 balance:[["Coffee in","20 g"],["Water in","100 ml"],["Water held back in the wet grounds","≈ 2 g per g coffee ≈ 40 g"],["At EY 20%: solids dissolved","4 g"],["Decoction strength","≈ 4 ÷ 64 ≈ 6% TDS"]],
 trouble:[["Sour, thin coffee","Under-extracted: grind finer, use hotter water, or let it drip longer."],["Harsh and bitter","Over-extracted: grind coarser or shorten contact."],["Decoction drips forever","Grind too fine or packed too hard: the bed's resistance is too high (same physics as a filter cake)."]],
 twin:["Industrial leaching and instant coffee","Soluble-coffee plants extract in columns of hot water and then spray-dry; tea, sugar-beet and oilseed plants are leaching units too."],
 src:["wCoffee","wFilterCoffee","wArr"],overlay:{}},
culture:{dishes:["mishti-doi","lassi"],title:"Setting dahi: a living culture's temperature curve",
 kitchen:"A spoon of yesterday's dahi seeds warm milk with bacteria that turn milk sugar into acid. Too cool and they crawl; around body heat and above they race; too hot and they die. When the milk is acidic enough, it sets.",
 eng:"Lactic acid bacteria grow and acidify fastest near an optimum temperature and stop at a minimum and maximum. The cardinal temperature model (CTMI) captures this skewed curve. Lactic acid lowers the pH from about 6.6; casein gels near its isoelectric point, pH 4.6.",
 pfd:[["Heat milk","Denaturation","≈ 85 °C, whey proteins unfold"],["Cool","Heat exchange","to 30–45 °C"],["Inoculate","Seeding","1 tsp dahi per cup"],["Incubate","Batch fermentation","4–12 h"],["Chill","Arrest","fridge stops acidification"]],
 lab:"culture",
 balance:[["Milk in","500 g (lactose ≈ 24 g)"],["Lactose fermented to set it","only a small fraction"],["pH","6.6 → ≤ 4.6"],["Mishti doi","milk reduced and caramel-sweetened before setting"]],
 trouble:[["Didn't set overnight in winter","Kitchen below ~25 °C: the culture is far below its optimum. Use an oven with the light on or a warm spot."],["Sour and watery","Over-incubated or too hot: acid kept rising and the gel squeezed out whey. Chill as soon as it sets."],["Stringy or slimy","Contaminated or a different culture; start from a fresh, good dahi."]],
 twin:["Industrial yogurt fermenters","Dairies incubate at about 42–45 °C for a few hours, then cool fast; the same temperature curve sets their throughput."],
 src:["wYog","wCTMI","wDahi","casein"],overlay:{}},
grind:{dishes:["dahi-vada","punugulu"],title:"Grinding batter: an energy balance",
 kitchen:"A mixer's motor puts energy into the batter, and almost all of it ends up as heat. Warm batter ferments too fast and can turn sour or lose its fluff. That's why cooks add ice-cold water or ice cubes while grinding.",
 eng:"First law, closed system: the shaft work dissipated by the blades becomes sensible heat in the batter (m·cₚ·ΔT), unless ice absorbs it first through its latent heat of fusion (334 J/g). A stone wet grinder runs slower and dissipates less power per kilogram than a blender, so it heats the batter less.",
 pfd:[["Soak dal","Hydration","4 h"],["Grind","Size reduction + work input","heat generated"],["Add ice water","Heat sink","latent + sensible"],["Whip","Aeration","foam traps air"],["Fry","Heat + mass transfer","≈ 170 °C"]],
 lab:"grind",
 balance:[["Batter","300 g, cₚ ≈ 3.6 J/g·K"],["Mixer: effective heat input (pulsed)","≈ 60 W"],["6 minutes of grinding","≈ 22 kJ → ≈ +20 °C with no ice"],["Ice to absorb it","22 kJ ÷ 334 J/g ≈ 65 g"]],
 trouble:[["Batter warm and runny after grinding","Too much heat from the motor: grind in pulses, add ice water, or use a wet grinder."],["Vadas dense","Batter overheated or over-watered, so the foam collapsed."],["Batter over-sour by morning","It started warm, so fermentation got a head start."]],
 twin:["Mills and extruders","Industrial grinders and extruders are jacket-cooled for the same reason: specific energy input (kJ/kg) shows up as temperature rise."],
 src:["wSpecHeat","wFusion","wIdli"],overlay:{}},
brown:{dishes:["hyderabadi-biryani","kosha-mangsho"],title:"Birista: dry first, then brown",
 kitchen:"Sliced onions first steam in the oil while their water boils off; nothing browns yet. Only once they're nearly dry do they colour, and then fast. That's why birista seems to take forever and then suddenly burns.",
 eng:"Two stages in series. Stage 1 is heat-transfer limited: the surface stays near 100 °C until free water evaporates (time ∝ water content × thickness ÷ heat flux). Stage 2 is reaction limited: Maillard browning and caramelisation follow Arrhenius kinetics, so 20 K hotter cuts browning time by roughly a factor of three to four.",
 pfd:[["Slice","Size reduction","thickness sets drying time"],["Fry","Evaporation","surface ≈ 100 °C"],["Brown","Maillard + caramelisation","> 140 °C"],["Drain + spread","Quench","stops carry-over browning"]],
 lab:"brown",
 balance:[["Onion in","150 g (≈ 89% water)"],["Birista out","≈ 30–35 g"],["Water evaporated","≈ 120 g ≈ 270 kJ"],["Oil absorbed","part of the 20 g"]],
 trouble:[["Onions stewed and pale","Pan crowded: oil temperature dropped and water can't escape. Fry in batches."],["Burnt in seconds","Oil too hot in stage 2: browning time shrinks steeply with temperature. Lower the heat once they colour."],["Uneven colour","Uneven slices: thin ones dry first and burn."]],
 twin:["Roasters and dryers","Coffee roasting follows the same sequence: a drying phase, then a browning phase whose rate the roaster controls with temperature."],
 src:["wMaillard","wCaramel","wArr","wBiryani"],overlay:{}},
absorb:{dishes:["curd-rice","ven-pongal"],title:"Cooking rice is a mass balance",
 kitchen:"Rice soaks up water as its starch softens. Whatever water isn't absorbed either boils off or is left in the pot. More water and a lid make soft, mushy rice for curd rice or pongal; less water makes separate grains.",
 eng:"Mass balance on water: in = absorbed + evaporated + left over. Absorption is limited by starch gelatinisation (from about 65–80 °C) and by time; evaporation is set by the lid and the heat. Final moisture content decides texture.",
 pfd:[["Rinse","Washing","removes surface starch"],["Add water","Charge","ratio sets the balance"],["Boil, lid on","Gelatinisation + absorption","≈ 15–20 min"],["Rest","Equilibration","moisture evens out"]],
 lab:"absorb",
 balance:[["Raw rice","150 g (≈ 12% moisture)"],["Cooked rice","≈ 65–70% water, about 2.5–3× the raw weight"],["Evaporation, lid on","≈ 1 g/min"],["Evaporation, lid off","≈ 5 g/min"]],
 trouble:[["Hard centres","Not enough water or time: starch didn't fully gelatinise. Add a splash and rest covered."],["Mushy and sticky","Too much water for the style, or stirred: broken granules release starch."],["Burnt bottom, raw top","Lid off and heat too high: water evaporated faster than the grains absorbed it."]],
 twin:["Parboiling and retort rice","Rice mills and ready-meal plants control water ratio, temperature and time exactly this way to hit a target moisture."],
 src:["wGelat","wRice"],overlay:{}},
radiate:{dishes:["tandoori-chicken","amritsari-kulcha"],title:"The tandoor: radiation at 400 °C",
 kitchen:"A tandoor's clay walls get far hotter than a home oven. They glow with heat that hits the food directly, so the outside chars in a minute or two while the inside is still juicy.",
 eng:"Radiant flux scales with the fourth power of absolute temperature (Stefan–Boltzmann): q = εσF(T_w⁴ − T_s⁴). The food surface stays near 100 °C while wet, so a 480 °C wall delivers several times the flux of a 250 °C oven. The surface dries and chars fast; the centre still heats by conduction at its own pace.",
 pfd:[["Marinate","Diffusion","yogurt + spice"],["Skewer / slap on wall","Loading","close to the wall"],["Radiate + convect","Heat transfer","q ∝ T⁴"],["Surface dries","Evaporation","then char"],["Rest","Equilibration","juices settle"]],
 lab:"radiate",
 balance:[["Tandoor wall","up to ≈ 480 °C"],["Food surface while wet","≈ 100 °C"],["Water to dry 1 mm of kulcha skin","≈ 0.4 kg/m² ≈ 0.9 MJ/m²"],["Emissivity × view factor (assumed)","0.9 × 0.7"]],
 trouble:[["Kulcha falls off the wall","Dough too dry or wall too cool; the wet underside must stick before it sets."],["Charred outside, raw inside","Pieces too thick: the surface chars at a rate set by radiation, but the centre still needs conduction time. Cut thinner."],["No char in a home oven","Not enough flux: use the grill at full heat close to the element."]],
 twin:["Furnaces and radiant heaters","In a furnace's radiant section, heat transfer to tubes follows the same T⁴ law."],
 src:["wSB","wRad","wTandoor"],overlay:{}},
soak:{dishes:["gulab-jamun","langcha"],title:"Soaking syrup into a sphere",
 kitchen:"Fried jamuns are full of tiny pores. Warm syrup creeps inward from the outside; bigger jamuns take much longer because the syrup has further to travel. Warm syrup moves faster than cold.",
 eng:"Uptake into a sphere follows Fick's second law; the mean fraction absorbed depends only on Dt/r² (Crank). Doubling the radius quadruples the time. The effective diffusivity here bundles capillary wicking and diffusion, and rises with temperature as syrup viscosity falls.",
 pfd:[["Shape balls","Geometry","radius r sets time ∝ r²"],["Fry slowly","Heat + mass transfer","pores form"],["Warm syrup","Driving force","sugar gradient"],["Soak","Diffusion into a sphere","1–3 h"]],
 lab:"soak",
 balance:[["Jamuns in","≈ 250 g fried"],["Syrup absorbed","often ≈ their own weight"],["Time ∝ r²","3 cm takes 4× as long as 1.5 cm"]],
 trouble:[["Hard centre","Not soaked long enough for the size, or syrup too cold. Make them smaller or warm the syrup."],["Jamuns broke apart","Syrup too hot or boiling; keep it warm, not bubbling."],["Shrank after soaking","Syrup too thick: water moved out by osmosis faster than syrup moved in."]],
 twin:["Candying and osmotic dehydration","Fruit candying and brining plants schedule soak times by the same Dt/L² scaling."],
 src:["wFick","wCrank","wJamun"],overlay:{}},
freeze:{dishes:["kulfi","falooda"],title:"Kulfi: dissolved sugar lowers the freezing point",
 kitchen:"Sugar and milk solids stop some of the water freezing, so kulfi is scoopable instead of rock hard. Kulfi is dense because the milk is boiled down and nothing whips air in.",
 eng:"Freezing-point depression is colligative: ΔT_f = K_f·m, with K_f = 1.86 K·kg/mol for water. As ice forms, the remaining liquid concentrates, so even at freezer temperature some water stays unfrozen. Boiling the milk down raises solute molality before freezing even starts.",
 pfd:[["Reduce milk","Evaporation","remove water"],["Add sugar","Dissolution","solute ↑"],["Fill moulds","Packaging","no air whipped in"],["Freeze","Crystallisation","ice + concentrated syrup"]],
 lab:"freeze",
 balance:[["Milk in","500 ml ≈ 515 g (≈ 451 g water)"],["Milk's own freezing point","≈ −0.52 °C"],["Sugar","75 g ≈ 0.22 mol"],["Unfrozen water at −18 °C (ideal estimate)","≈ 1.86 × n ÷ 18 kg"]],
 trouble:[["Icy kulfi","Not reduced enough: too much free water forms big crystals. Reduce further."],["Won't freeze firm","Too much sugar for your freezer temperature."],["Grainy","Milk solids crystallised (lactose) after long storage; eat within a couple of weeks."]],
 twin:["Ice-cream freezers and freeze concentration","Dairy plants design mixes by freezing curve; freeze concentration of juices uses the same principle in reverse."],
 src:["wFPD","wMilk","wKulfi"],overlay:{}},
reduce:{dishes:["rabri","basundi"],title:"Rabri and basundi: reduction by evaporation",
 kitchen:"Boiling milk drives off water and concentrates the solids. Rabri goes thick, basundi stays pourable, khoya goes almost solid. The more concentrated it gets, the more it catches, so the heat comes down and the stirring goes up.",
 eng:"At the boil the process is energy-limited: evaporation rate = net heat input ÷ latent heat (2.26 MJ/kg). Solids rise as water leaves (a component balance on milk solids). As viscosity rises, wall heat transfer falls and local overheating drives scorching (Maillard on the pan wall).",
 pfd:[["Heat milk","Sensible heating","20 → 100 °C"],["Simmer, wide pan","Evaporation","energy-limited"],["Scrape malai","Skin collection","layers of rabri"],["Sweeten + flavour","Mixing","near the end"]],
 lab:"reduce",
 balance:[["Milk in","1 L ≈ 1,030 g (≈ 12.5% solids, 129 g)"],["Basundi: half the mass","≈ 25% solids"],["Rabri: about a third","≈ 38% solids"],["Khoya: about a fifth","≈ 60%+ solids"]],
 trouble:[["Scorched taste","Heat too high once thick: lower it and scrape the bottom constantly."],["Took hours","Pan too narrow or heat too low; a wide kadai gives more surface and catches more flame."],["Grainy","Milk curdled from acid or overheating; use fresh milk."]],
 twin:["Falling-film evaporators","Dairies concentrate milk under vacuum so it boils at about 60 °C, avoiding the cooked colour and scorching a kadai gives."],
 src:["wEvap","wKhoa","wRabri"],overlay:{}},
dry:{dishes:["bikaneri-bhujia","banana-chips","chakli"],title:"Why namkeen keeps: water activity",
 kitchen:"Frying drives nearly all the water out, so microbes can't grow and the snack stays crisp. Leave the jar open in humid weather and it pulls water back from the air and goes soft.",
 eng:"Water activity (a_w) is the vapour pressure of water in the food relative to pure water. Below about 0.6 microbes can't grow; around 0.65 cereals lose their crunch as the starch matrix passes its glass transition. The sorption isotherm links moisture content to a_w; in an open container moisture drifts toward equilibrium with the room's humidity.",
 pfd:[["Fry","Dehydration","moisture → a few %"],["Cool","Glass formation","crisp starch-protein matrix"],["Pack","Barrier","limits vapour uptake"],["Store","Sorption","drifts to room humidity"]],
 lab:"dry",
 balance:[["Fried snack moisture","≈ 2–4%"],["a_w for no microbial growth","< 0.6"],["Cereal loses crunch at","a_w ≈ 0.65"],["Most moulds stop below","a_w ≈ 0.80"]],
 trouble:[["Went soft in a week","Container not airtight in humid weather; it absorbed water vapour."],["Soft straight away","Under-fried: too much water left. Fry until bubbling stops."],["Rancid smell","Fat oxidised (light, warmth, air), a different problem from moisture; store cool and dark."]],
 twin:["Shelf-life engineering","Snack and cereal makers choose packaging by water-vapour transmission rate and the product's isotherm."],
 src:["wAw","wGAB","wGlass"],overlay:{}}
});
Object.entries(DEEP).forEach(([k,v])=>v.dishes.forEach(d=>{ if(byId[d]) DEEP_BY_DISH[d]=k; }));

Object.assign(LABS, {
 leaven:{title:"Soda + acid: how much gas?", challenge:"Release at least 1 litre of CO₂ (at steaming temperature) with less than 0.2 g of soda left over.",
  html:()=>`${rng("lS","Baking soda",0,8,0.25,2," g")}${rng("lL","Lemon juice",0,60,1,20," ml")}${rng("lC","Citric acid crystals",0,4,0.1,0," g")}`,
  run(){ const s=+$("#lS").value, l=+$("#lL").value, c=+$("#lC").value; $("#lSo").textContent=s+" g"; $("#lLo").textContent=l+" ml"; $("#lCo").textContent=c.toFixed(1)+" g";
   const R=M.co2(s,l,c), xs=d3.range(0,8.01,.1);
   chart($("#labc"),{x:{d:[0,8],l:"Baking soda (g)"},y:{d:[0,3],l:"CO₂ at 95 °C (litres)"},hlines:[[1,"1 litre"]],
    series:[{pts:xs.map(x=>[x,M.co2(x,l,c).V]),c:"var(--turmeric)",name:"with your acid"},{pts:xs.map(x=>[x,x/84.01*0.08206*368]),c:"var(--muted)",dash:"4 4",name:"if acid were unlimited"}],legend:[0.3,2.8],marker:[s,R.V]});
   const col=R.leftS>0.6?"red-brown":R.leftS>0.2?"orange-tinged":"yellow";
   $("#labr").innerHTML=ro([["CO₂ released",R.V.toFixed(2)+" L"],["Soda left over",R.leftS.toFixed(2)+" g"],["Acid left over",R.leftC.toFixed(2)+" g"],["Turmeric colour",col]]);
   return R.V>=1 && R.leftS<0.2; },
  note:"Stoichiometry 3 NaHCO₃ : 1 citric acid; lemon juice taken as ≈ 48 g citric acid per litre (it varies by fruit). Gas volume from the ideal gas law at 95 °C and 1 atm. Assumes complete reaction in the wet batter; in practice some gas escapes before steaming, which is why speed matters. Turmeric's colour shift is a rough guide to leftover alkali."},
 brew:{title:"Filter coffee: grind, temperature, time", challenge:"Make a decoction with extraction yield between 18 and 22% and strength of at least 5% TDS.",
  html:()=>`${rng("bG","Grind size",0.2,1.4,0.05,0.6," mm")}${rng("bTw","Water temperature",70,100,1,92," °C")}${rng("bTm","Contact time",1,25,0.5,10," min")}${rng("bC","Coffee (with 100 ml water)",8,30,1,18," g")}`,
  run(){ const d=+$("#bG").value, T=+$("#bTw").value, t=+$("#bTm").value, c=+$("#bC").value; $("#bGo").textContent=d.toFixed(2)+" mm"; $("#bTwo").textContent=T+" °C"; $("#bTmo").textContent=t+" min"; $("#bCo").textContent=c+" g";
   const ts=d3.range(0,25.01,.25), ey=M.ey(t,d,T), vol=Math.max(5,100-2*c), sol=ey/100*c, tds=sol/(vol+sol)*100;
   chart($("#labc"),{x:{d:[0,25],l:"Contact time (min)"},y:{d:[0,30],l:"Extraction yield (%)"},bands:[[0,25,"transparent"]],hlines:[[18,"18%"],[22,"22%"]],
    series:[{pts:ts.map(x=>[x,M.ey(x,d,T)]),c:"var(--turmeric)",label:`${d.toFixed(2)} mm, ${T} °C`,lab:70}],marker:[t,ey]});
   $("#labr").innerHTML=ro([["Extraction yield",ey.toFixed(1)+"%"],["Decoction",vol.toFixed(0)+" ml"],["Strength (TDS)",tds.toFixed(1)+"%"],["Taste",ey<18?"sour, thin":ey>22?"bitter, harsh":"balanced"]]);
   return ey>=18 && ey<=22 && tds>=5; },
  note:"First-order extraction EY(t) = 28%·(1 − e^(−kt)); k ∝ 1/d² (diffusion path) with an illustrative 30 kJ/mol temperature dependence, calibrated so a 0.4 mm grind at 93 °C reaches 20% in about 15 minutes. The 18–22% 'ideal yield' band and the TDS definition follow standard brewing practice. Wet grounds are assumed to hold 2 g of water per gram. Chicory, common in filter coffee, is left out."},
 culture:{title:"Setting dahi: incubation temperature and time", challenge:"Set the dahi (pH ≤ 4.6) within 8 hours while keeping it at or below 40 °C, like an oven with only the light on.",
  html:()=>`${rng("cTmp","Incubation temperature",15,50,1,28," °C")}${rng("cTim","Time",0,16,0.25,8," h")}`,
  run(){ const T=+$("#cTmp").value, t=+$("#cTim").value; $("#cTmpo").textContent=T+" °C"; $("#cTimo").textContent=t+" h";
   const ts=d3.range(0,16.01,.1), ph=M.yph(T,t); let tset=null; for(const x of ts){ if(M.yph(T,x)<=4.6){ tset=x; break; } }
   chart($("#labc"),{x:{d:[0,16],l:"Time (h)"},y:{d:[4,6.8],l:"pH"},hlines:[[4.6,"sets (casein gels)"]],
    series:[{pts:ts.map(x=>[x,M.yph(43,x)]),c:"var(--muted)",dash:"4 4",label:"43 °C",lab:30},{pts:ts.map(x=>[x,M.yph(T,x)]),c:"var(--turmeric)",label:T+" °C",lab:120}],marker:[t,ph]});
   $("#labr").innerHTML=ro([["pH now",ph.toFixed(2)],["Sets at",tset!==null?tset.toFixed(1)+" h":"not within 16 h"],["Rate vs 43 °C",M.ctmi(T).toFixed(2)+"×"],["Texture",ph>4.8?"still milk":ph>4.4?"just set":"firm, getting sour"]]);
   return tset!==null && tset<=8 && T<=40 && t>=tset; },
  note:"Temperature factor from the cardinal temperature model with inflection (CTMI; Rosso et al. 1993), with illustrative cardinal temperatures for a mixed dahi culture: 10 °C minimum, 43 °C optimum, 50 °C maximum. pH follows a logistic curve calibrated so it reaches 4.6 in about 5 hours at the optimum, consistent with the 4–12 hours at 30–45 °C usually given. Casein gels near its isoelectric point, pH 4.6. Not a food-safety model."},
 grind:{title:"Grinding: work in, heat out, ice to absorb it", challenge:"After 6 minutes in a mixer, keep the batter at or below 30 °C.",
  html:()=>`${rng("gt","Grinding time",0,10,0.5,6," min")}${rng("gI","Ice added",0,120,5,0," g")}${rng("gP","Appliance (effective heat to batter)",20,120,5,60," W")}`,
  run(){ const t=+$("#gt").value, ice=+$("#gI").value, P=+$("#gP").value; $("#gto").textContent=t+" min"; $("#gIo").textContent=ice+" g"; $("#gPo").textContent=P+" W";
   const Tf=x=>{ const E=P*x*60; if(E<ice*334){ // still some ice: batter cools toward 0 as ice melts (equilibrium)
       const H=300*3.6*25+E-ice*334; return H<0?0:H/(300*3.6+ice*4.18); }
     return (300*3.6*25+E-ice*334)/(300*3.6+ice*4.18); };
   const xs=d3.range(0,10.01,.1), Tn=Tf(t);
   chart($("#labc"),{x:{d:[0,10],l:"Grinding time (min)"},y:{d:[0,60],l:"Batter temperature (°C)"},hlines:[[30,"30 °C"]],
    series:[{pts:xs.map(x=>[x,Tf(x)]),c:"var(--chili)",label:`${ice} g ice, ${P} W`,lab:80}],marker:[t,Tn]});
   $("#labr").innerHTML=ro([["Batter now",Tn.toFixed(1)+" °C"],["Heat put in",(P*t*60/1000).toFixed(1)+" kJ"],["Ice could absorb",(ice*334/1000).toFixed(1)+" kJ"],["Verdict",Tn<=30?"cool enough":"too warm: fluff and flavour suffer"]]);
   return t>=6 && Tn<=30 && P>=60; },
  note:"Closed-system energy balance: 300 g batter (cₚ ≈ 3.6 J/g·K) starting at 25 °C; dissipated shaft work becomes heat; ice melts at 334 J/g and the meltwater joins the batter (equilibrium mixing, no losses to the jar or air). The effective heat input is illustrative: a blender run in pulses at about 60 W, a stone wet grinder nearer 25 W."},
 brown:{title:"Birista: oil temperature and slice thickness", challenge:"Get golden birista in under 20 minutes while keeping at least a 2-minute browning window (so it doesn't burn in seconds).",
  html:()=>`${rng("oT","Oil temperature",120,200,1,165," °C")}${rng("oL","Slice thickness",1,5,0.25,2," mm")}`,
  run(){ const T=+$("#oT").value, L=+$("#oL").value; $("#oTo").textContent=T+" °C"; $("#oLo").textContent=L+" mm";
   const B=M.brown(T,L), xs=d3.range(120,200.1,1);
   chart($("#labc"),{x:{d:[120,200],l:"Oil temperature (°C)"},y:{d:[0,60],l:"Minutes to golden"},hlines:[[20,"20 min"]],
    series:[{pts:xs.map(x=>[x,Math.min(60,M.brown(x,L).total)]),c:"var(--turmeric)",name:"total"},{pts:xs.map(x=>[x,Math.min(60,M.brown(x,L).brown)]),c:"var(--chili)",dash:"4 4",name:"browning stage (your window)"}],legend:[150,55],marker:[T,Math.min(60,B.total)]});
   $("#labr").innerHTML=ro([["Drying stage",B.dry.toFixed(1)+" min"],["Browning stage",B.brown.toFixed(1)+" min"],["Total",B.total.toFixed(1)+" min"],["Risk",B.brown<1?"burns in seconds":B.brown<2?"watch closely":"forgiving"]]);
   return B.total<20 && B.brown>=2; },
  note:"Stage 1: water (89% of onion) evaporates with the surface pinned near 100 °C; time = water per area × latent heat ÷ h(T_oil − 100), with an effective h of 40 W/m²K for crowded shallow frying (illustrative). Stage 2: browning time follows Arrhenius with Eₐ = 100 kJ/mol (a typical order for Maillard browning), set to 3 minutes at 170 °C. Real onions shrink and the oil cools as they go in, so treat the numbers as a guide."},
 absorb:{title:"Rice: water in = absorbed + evaporated + left over", challenge:"Make soft curd-rice rice (70–80% moisture) with the lid on, in 20 minutes or less, with under 20 g of water left in the pot.",
  html:()=>`${rng("aR","Water : rice (by weight)",1,5,0.1,2," ×")}${rng("aL","Lid (0 = off, 1 = on)",0,1,1,1,"")}${rng("at","Cooking time",8,30,1,15," min")}`,
  run(){ const r=+$("#aR").value, lid=+$("#aL").value===1, t=+$("#at").value; $("#aRo").textContent=r.toFixed(1)+" ×"; $("#aLo").textContent=lid?"on":"off"; $("#ato").textContent=t+" min";
   const S=M.rice(r,lid,t), xs=d3.range(1,5.01,.05);
   chart($("#labc"),{x:{d:[1,5],l:"Water : rice ratio"},y:{d:[40,90],l:"Cooked moisture (%)"},bands:[[1,5,"transparent"]],hlines:[[60,"fluffy from here"],[70,"soft"],[76,"mushy"]],
    series:[{pts:xs.map(x=>[x,M.rice(x,lid,t).moist]),c:"var(--turmeric)",label:lid?"lid on":"lid off",lab:60}],marker:[r,S.moist]});
   const tex=S.moist<60?"hard centres":S.moist<70?"fluffy, separate":S.moist<76?"soft":"mushy (pongal-style)";
   $("#labr").innerHTML=ro([["Moisture",S.moist.toFixed(0)+"%"],["Texture",tex],["Absorbed / evaporated",`${S.abs.toFixed(0)} g / ${S.ev.toFixed(0)} g`],["Left in the pot",S.free.toFixed(0)+" g"]]);
   return lid && t<=20 && S.moist>=70 && S.moist<=80 && S.free<20; },
  note:"150 g raw rice at 12% moisture. Absorption capacity rises toward about 2.4 g water per g rice as starch gelatinises (illustrative time constant 9 min); evaporation about 1.2 g/min with the lid on and 5 g/min off. Real rices differ: basmati absorbs less than short-grain, and soaking speeds things up."},
 radiate:{title:"Tandoor vs oven: radiant flux", challenge:"Char a kulcha's skin (dry the outer 1 mm) in under 90 seconds, and beat a 250 °C home oven by at least 3×.",
  html:()=>`${rng("rT","Tandoor wall temperature",200,500,10,350," °C")}${rng("rL","Chicken piece thickness",1,6,0.5,3," cm")}`,
  run(){ const T=+$("#rT").value, L=+$("#rL").value; $("#rTo").textContent=T+" °C"; $("#rLo").textContent=L+" cm";
   const q=M.qTand(T), qo=M.qOven(250), tskin=0.9e6/q, xs=d3.range(200,500.1,5);
   let tc=null; for(let s=0;s<3600;s+=10){ if(M.centreT(s,L/200)>=75){ tc=s; break; } }
   chart($("#labc"),{x:{d:[200,500],l:"Wall temperature (°C)"},y:{d:[0,25],l:"Heat flux to a wet surface (kW/m²)"},hlines:[[qo/1000,"home oven 250 °C"]],
    series:[{pts:xs.map(x=>[x,M.qTand(x)/1000]),c:"var(--chili)"}],marker:[T,q/1000]});
   $("#labr").innerHTML=ro([["Flux now",(q/1000).toFixed(1)+" kW/m²"],["vs home oven",(q/qo).toFixed(1)+"×"],["Kulcha skin dries in",tskin.toFixed(0)+" s"],["Chicken centre ≥ 75 °C",tc?(tc/60).toFixed(0)+" min":"> 1 h"]]);
   return tskin<90 && q/qo>=3; },
  note:"Radiation q = εσF(T_w⁴ − T_s⁴) with ε = 0.9, view factor F = 0.7 (assumed) and the food surface at 100 °C while wet, plus hot-gas convection (h ≈ 15 W/m²K, gas 50 °C below the wall). Oven: same radiation at 250 °C plus h ≈ 20 W/m²K. Skin drying: 0.4 kg water per m² for the outer 1 mm × 2.26 MJ/kg. The centre time uses the frying lab's slab conduction model, so it barely changes with wall temperature, which is the point: the tandoor chars the outside fast, but thickness still sets the inside."},
 soak:{title:"Syrup into a sphere: size, temperature, time", challenge:"Soak 3 cm jamuns to at least 80% of full uptake within 2 hours, with the syrup no hotter than 60 °C.",
  html:()=>`${rng("jD","Jamun diameter",1.5,5,0.1,3," cm")}${rng("jTmp","Syrup temperature",20,90,1,45," °C")}${rng("jTim","Soak time",0,6,0.1,2," h")}`,
  run(){ const Dm=+$("#jD").value, T=+$("#jTmp").value, t=+$("#jTim").value; $("#jDo").textContent=Dm.toFixed(1)+" cm"; $("#jTmpo").textContent=T+" °C"; $("#jTimo").textContent=t+" h";
   const r=Dm/200, D=M.Dsyr(T), f=x=>M.sphere(D*x*3600/(r*r))*100, xs=d3.range(0,6.01,.05);
   let t80=null; for(const x of xs){ if(f(x)>=80){ t80=x; break; } }
   chart($("#labc"),{x:{d:[0,6],l:"Soak time (h)"},y:{d:[0,100],l:"Syrup uptake (% of full)"},hlines:[[80,"80%"]],
    series:[{pts:xs.map(x=>[x,M.sphere(M.Dsyr(T)*x*3600/(0.015*0.015))*100]),c:"var(--muted)",dash:"4 4",label:"3 cm",lab:40},{pts:xs.map(x=>[x,f(x)]),c:"var(--turmeric)",label:`${Dm.toFixed(1)} cm`,lab:90}],marker:[t,f(t)]});
   $("#labr").innerHTML=ro([["Uptake now",f(t).toFixed(0)+"%"],["80% reached at",t80!==null?t80.toFixed(1)+" h":"> 6 h"],["Effective D",(D*1e9).toFixed(1)+" ×10⁻⁹ m²/s"],["Syrup",T>70?"too hot: jamuns may split":"fine"]]);
   return Math.abs(Dm-3)<0.05 && t80!==null && t80<=2 && t>=t80 && T<=60; },
  note:"Mean uptake into a sphere with constant surface concentration (Crank, eq. 6.20): M_t/M_∞ = 1 − (6/π²)Σ e^(−n²π²Dt/r²)/n². The effective diffusivity bundles capillary wicking and diffusion; it's set (illustratively) to 4×10⁻⁹ m²/s at 60 °C and scales as T/μ with a 30 kJ/mol viscosity activation energy. The r² scaling is exact; the constants are for intuition."},
 freeze:{title:"Kulfi: freezing point and ice content", challenge:"Make a kulfi that starts freezing below −2 °C and is at most 55% ice at −18 °C (dense but scoopable).",
  html:()=>`${rng("kS","Sugar (per 500 ml milk)",0,150,5,75," g")}${rng("kR","Water boiled off",0,0.7,0.05,0.4,"")}${rng("kT","Freezer temperature",-25,-10,1,-18," °C")}`,
  run(){ const s=+$("#kS").value, r=+$("#kR").value, T=+$("#kT").value; $("#kSo").textContent=s+" g"; $("#kRo").textContent=Math.round(r*100)+"%"; $("#kTo").textContent=T+" °C";
   const K=M.kulfi(s,r,T), xs=d3.range(0,0.701,.01);
   chart($("#labc"),{x:{d:[0,70],l:"Water boiled off (%)"},y:{d:[0,90],l:"Ice at freezer temperature (% of mass)"},hlines:[[55,"55%"]],
    series:[{pts:xs.map(x=>[x*100,M.kulfi(s,x,T).icePct]),c:"var(--turmeric)",label:`${s} g sugar`,lab:20},{pts:xs.map(x=>[x*100,M.kulfi(0,x,T).icePct]),c:"var(--muted)",dash:"4 4",label:"no sugar",lab:10}],marker:[r*100,K.icePct]});
   $("#labr").innerHTML=ro([["Starts freezing at",K.tf.toFixed(2)+" °C"],["Ice at "+T+" °C",K.icePct.toFixed(0)+"% of mass"],["Mix weight",K.tot.toFixed(0)+" g"],["Texture",K.icePct>65?"icy, hard":K.icePct>55?"firm":"dense, scoopable"]]);
   return K.tf<=-2 && K.icePct<=55 && T<=-15; },
  note:"Ideal freezing-point depression, ΔT_f = 1.86·n/W (K_f of water), with milk's own solutes set to match its −0.52 °C freezing point and sucrose at 342 g/mol. Unfrozen water at the freezer temperature is the amount that keeps the remaining solution's freezing point equal to that temperature. Real concentrated solutions deviate from ideal and some lactose crystallises, so the ice figure is an estimate."},
 reduce:{title:"Reducing milk: heat in, water out", challenge:"Make khoya (at least 60% solids) from 1 litre of milk in 75 minutes or less without going above 0.6 kW of effective heat.",
  html:()=>`${rng("mP","Effective heat into the milk",0.2,1.2,0.05,0.45," kW")}${rng("mF","Reduce to (% of start weight)",15,80,1,33,"%")}`,
  run(){ const P=+$("#mP").value, pct=+$("#mF").value; $("#mPo").textContent=P.toFixed(2)+" kW"; $("#mFo").textContent=pct+"%";
   const R=M.reduce(P,pct), xs=d3.range(15,80.1,.5);
   chart($("#labc"),{x:{d:[15,80],l:"Final weight (% of start)"},y:{d:[0,240],l:"Minutes"},bands:[[45,55,"var(--panel-2)","basundi"],[30,36,"var(--turmeric-soft)","rabri"],[15,22,"var(--panel-2)","khoya"]],hlines:[[75,"75 min"]],
    series:[{pts:xs.map(x=>[x,Math.min(240,M.reduce(P,x).total)]),c:"var(--turmeric)",label:`${P.toFixed(2)} kW`,lab:20}],marker:[pct,Math.min(240,R.total)]});
   const scorch=R.solids>45&&P>0.6;
   $("#labr").innerHTML=ro([["Solids",R.solids.toFixed(0)+"%"],["Left in the pan",R.mf.toFixed(0)+" g"],["Time",R.total.toFixed(0)+" min"],["Scorching",scorch?"high: turn it down":"manageable with stirring"]]);
   return R.solids>=60 && R.total<=75 && P<=0.6; },
  note:"Energy-limited evaporation: heat-up 1,030 g × 3.9 J/g·K × 80 K, then water removed × 2.26 MJ/kg, both divided by the effective heat reaching the milk (a gas burner delivers only part of its rating to an open pan). Milk solids taken as 12.5%. Scorching risk is flagged above 45% solids at more than 0.6 kW, a rule of thumb, not a model."},
 dry:{title:"Namkeen shelf life: moisture, humidity, container", challenge:"Keep fried snacks crisp (a_w below 0.5) for at least 30 days at 75% humidity.",
  html:()=>`${rng("dM","Moisture after frying",1,10,0.25,3,"%")}${rng("dRH","Room humidity",30,90,5,75,"%")}${rng("dC","Container (1 = open bowl, 0.01 = sealed jar)",0.01,1,0.01,0.3,"")}`,
  run(){ const m0=+$("#dM").value, RH=+$("#dRH").value/100, c=+$("#dC").value; $("#dMo").textContent=m0+"%"; $("#dRHo").textContent=Math.round(RH*100)+"%"; $("#dCo").textContent=c.toFixed(2);
   const Mdb0=m0/(100-m0)*100, Meq=M.gab(RH), k=0.25*c, Mt=t=>Meq+(Mdb0-Meq)*Math.exp(-k*t), aw=t=>M.awOf(Mt(t)), xs=d3.range(0,90.1,.5);
   let soft=null; for(const t of xs){ if(aw(t)>=0.5){ soft=t; break; } }
   chart($("#labc"),{x:{d:[0,90],l:"Days in storage"},y:{d:[0,1],l:"Water activity a_w"},hlines:[[0.5,"crisp below"],[0.6,"no microbial growth below"]],
    series:[{pts:xs.map(t=>[t,aw(t)]),c:"var(--turmeric)"}],marker:[soft!==null?soft:90,soft!==null?0.5:aw(90)]});
   $("#labr").innerHTML=ro([["a_w fresh",M.awOf(Mdb0).toFixed(2)],["Equilibrium at this humidity",RH.toFixed(2)],["Goes soft after",soft!==null?soft.toFixed(0)+" days":"> 90 days"],["Microbes",aw(90)<0.6?"can't grow":"possible if it gets that damp"]]);
   return (soft===null||soft>=30) && RH>=0.75 && m0<=6; },
  note:"Sorption isotherm: GAB equation with illustrative constants (M₀ = 4 g/100 g dry, C = 10, K = 0.9). Moisture drifts toward equilibrium with the room's humidity at a first-order rate scaled by the container's permeability (illustrative). Thresholds: no microbial growth below a_w ≈ 0.6; cereals lose their crunch around 0.65; 'crisp below 0.5' is a conservative target."}
});
/* the fermentation lab can set the kitchen temperature the planner uses */
const _fermHtml=LABS.ferment.html;
LABS.ferment.html=()=>_fermHtml()+`<button class="btn ghost" id="fToPlan" style="margin-top:8px">Use this temperature in my meal planner</button>`;
document.addEventListener("click",e=>{ if(e.target.closest("#fToPlan")){ PLAN.kitchenT=+$("#fTemp").value; for(const k in OPS_CACHE) delete OPS_CACHE[k]; save(); toast(`Planner now assumes a ${PLAN.kitchenT} °C kitchen for ferments`); } });
