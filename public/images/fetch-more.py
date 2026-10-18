import urllib.request,re,concurrent.futures,json,pathlib
p=pathlib.Path(__file__).parent
s=(p/'more-search.txt').read_text()
items=[]
for block in s.split('--------------------------------------------------------------------------------'):
 m=re.search(r'Image URL: (https?://[^\n]+)',block)
 if m:
  url=m.group(1).split('#')[0].strip();title=block.strip().split('\n')[0];items.append((url,title))
def get(x):
 i,(url,title)=x
 try:
  req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
  r=urllib.request.urlopen(req,timeout=12);d=r.read()
  if r.headers.get('content-type','').startswith('image'):
   (p/f'event-{i:03d}.jpg').write_bytes(d);return {'src':f'/images/event-{i:03d}.jpg','alt':title.split(' (http')[0],'source':url,'bytes':len(d)}
 except Exception as e: return {'failed':url,'error':str(e)}
with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:out=list(pool.map(get,enumerate(items,100)))
(p/'more-results.json').write_text(json.dumps(out,indent=2));print(json.dumps(out,indent=2))
