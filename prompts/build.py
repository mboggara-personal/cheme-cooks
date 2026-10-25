import json, details, html
D=json.load(open('/tmp/claude-0/-home-claude/57855ce1-1143-5fff-af91-4a63ec532ed2/scratchpad/dishes.json'))
ORDER=["North","Central","West","East","Northeast","South"]
WAVES=json.load(open('waves.json'))
ALLW=set(i for w in WAVES for i in w)
key=lambda d:(ORDER.index(d['region']),-d['lat'])
OLD=sorted([d for d in D if d['id'] not in ALLW],key=key)
GROUPS=[OLD]+[sorted([d for d in D if d['id'] in set(w)],key=key) for w in WAVES]
D=[d for g in GROUPS for d in g]
STYLE=("Editorial cookbook photography of home-cooked Indian food. Weathered wooden or stone kitchen counter. "
 "45-degree camera angle, 50mm lens, shallow depth of field, dish centred with space around it. "
 "Soft natural window light from the left, gentle shadows, warm but true-to-life colours. "
 "A little visible steam for hot dishes. No text, no logos, no hands, no people. Landscape, 3:2 aspect ratio.")
items=[]
for d in D:
    s,k,p=details.D[d['id']]
    kind="a drink" if "drinks" in d['meals'] else "a dish"
    place=d['place'] if d['state'] in d['place'] or d['state'] in ("Delhi","Puducherry") else f"{d['place']}, {d['state']}"
    txt=(f"File name: {d['id']}.png\n{d['name']} ({d['aka']}), {kind} from {place}, India.\n"
         f"Serving: {s}. Key details: {k}. Nearby, slightly out of focus: {p}.")
    items.append({"id":d['id'],"name":d['name'],"region":d['region'],"text":txt})
B=8; batches=[]
spans=[]; pos=0
for g in GROUPS:
    for i in range(pos,pos+len(g),B): spans.append((i,min(i+B,pos+len(g))))
    pos+=len(g)
for i,j in spans:
    chunk=items[i:j]
    regs=[]; [regs.append(x['region']) for x in chunk if x['region'] not in regs]
    body="\n\n".join(f"{j+1}. {x['text']}" for j,x in enumerate(chunk))
    msg=(f"Please create {len(chunk)} photorealistic food photographs, one separate image per dish, in the order listed. "
         f"If you can only make one image per reply, make image 1 now, then make the next one each time I write \"next\". "
         f"Above each image, write its file name so I can save it correctly.\n\n"
         f"Style for every image (keep it identical across the whole set): {STYLE}\n\n{body}")
    batches.append({"n":len(batches)+1,"regions":regs,"items":chunk,"msg":msg})
open('food-image-prompts.txt','w').write("\n\n" + ("\n\n"+"="*60+"\n\n").join(f"BATCH {b['n']} ({' / '.join(b['regions'])})\n\n{b['msg']}" for b in batches)+"\n")
data=json.dumps({"style":STYLE,"batches":batches},ensure_ascii=False).replace("</","<\\/")
page=open('page.html').read().replace('/*DATA*/',data)
open('food-image-prompts.html','w').write(page)
print(len(batches), "batches", sum(len(b['items']) for b in batches))
