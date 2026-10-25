const fs=require("fs"),vm=require("vm");const c={};vm.createContext(c);
let s=fs.readFileSync("data.js","utf8")+"\n"+fs.readdirSync(".").filter(f=>/^data-b[0-9a-z]+\.js$/.test(f)).sort().map(f=>fs.readFileSync(f,"utf8")).join("\n");
vm.runInContext(s.replace(/^const /gm,"var ")+";this.D=DISHES;",c);
fs.writeFileSync("/tmp/claude-0/-home-claude/57855ce1-1143-5fff-af91-4a63ec532ed2/scratchpad/dishes.json",JSON.stringify(c.D.map(d=>({id:d.id,name:d.name,aka:d.aka,place:d.place,state:d.state,region:d.region,lat:d.lat,meals:d.meals}))));
console.log(c.D.length);
