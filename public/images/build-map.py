from pathlib import Path
import re,json
from PIL import Image
p=Path(__file__).parent
records={}
for filename,start in [('search-results.txt',0),('more-search.txt',100),('final-search.txt',300)]:
 i=start
 for block in (p/filename).read_text().split('--------------------------------------------------------------------------------'):
  m=re.search(r'Image URL: (https?://[^\n]+)',block)
  if not m: continue
  f=p/f'event-{i:03d}.jpg'
  if f.exists():
   try:
    im=Image.open(f);im.load();im=im.convert('RGB');im.thumbnail((1400,1400));im.save(f,quality=84,optimize=True)
    title=block.strip().split('\n')[0].split(' (http')[0]
    page=re.search(r'\((https?://[^\n]+)\)',block.split('Image URL:')[0])
    records[i]={'src':f'/images/{f.name}','alt':title,'source':page.group(1) if page else m.group(1).split('#')[0],'imageSource':m.group(1).split('#')[0]}
   except Exception as e: print('invalid',i,str(e))
  i+=1
exclude={8,9,12,13,21,23,26,31,127,133,164,178,309,315,316,322}
for i in exclude:records.pop(i,None)
r=lambda a,b:list(range(a,b+1))
groups={
'weddings':r(100,111)+r(112,122)+[1,3,5,11],
'wedding-day-decor':r(100,111)+[114,115,118,120,121],
'engagement':r(112,122)+[107,108,109,101,104,106],
'pellikoduku':[156,157,158,159,160,161,162,163,0,2,4]+r(165,176),
'pellikuthuru':r(165,177)+[1,3,5,7,156,157,158,159],
'haldi':r(323,333)+[156,157,158,162,165,168,170,172,174,176],
'sangeeth':r(123,132)+[109,111,114,115,116,118,120,101,104,106],
'birthdays':r(145,155)+[14,15,18,22,146,147,150,152,153,154,329,107,120],
'corporate-events':r(300,311)+[16,17,19,134,137,139,140,141,142,143,144],
'kitty-parties':r(178,188)+[24,27,28,30,33,107,114,118,120,146,147,152],
'reunion-parties':r(134,144)+[17,19,300,301,304,306,307,308,311],
'traditional-festivals':r(312,322)+[25,29,32,14,15,18,156,157,158,159,162,170,176],
'social-gatherings':[179,181,184,187,134,136,138,140,142,143,25,29,32,312,314,317,319,320,321],
 'theme-events':[14,15,18,22,146,147,151,152,153,154,156,157,172,173,174,176,329],
'custom-experiences':[107,109,111,114,115,118,120,123,124,125,126,130,131,146,147,152,176]
}
out={}
for slug,ids in groups.items():
 selected=[];seen=set()
 for i in ids:
  if i not in records:continue
  ob=records[i]
  if ob['imageSource'] in seen:continue
  seen.add(ob['imageSource']);selected.append(ob)
  if len(selected)==15:break
 out[slug]=selected
 print(slug,len(selected),[x['src'] for x in selected])
(p.parent.parent/'src/images.json').write_text(json.dumps(out,indent=2))
(p/'credits.json').write_text(json.dumps({'notice':'Third-party inspiration imagery discovered through web image search. Not Utsav House portfolio photographs. Image copyright belongs to respective source owners; permission for commercial publication has not been verified. Replace with owned or appropriately licensed photography before commercial launch.','images':list(records.values())},indent=2))
