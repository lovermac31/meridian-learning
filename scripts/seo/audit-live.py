"""Read-only, bounded public HTML crawl. No GSC, forms, APIs or query URLs."""
import concurrent.futures, csv, json, re, time, urllib.request, urllib.error, urllib.parse
from html.parser import HTMLParser
from pathlib import Path
from collections import defaultdict
BASE='https://jurassicenglish.com'
class Parser(HTMLParser):
 def __init__(self):
  super().__init__(); self.tags=[]; self.text=[]; self.title=[]; self.h1=[]; self.stack=[]; self.skip=0
 def handle_starttag(self,t,a):
  a=dict(a); self.tags.append((t,a)); self.stack.append(t)
  if t in ('script','style','template','svg','noscript'): self.skip+=1
 def handle_endtag(self,t):
  if t in ('script','style','template','svg','noscript'): self.skip=max(0,self.skip-1)
  if t in self.stack: self.stack=self.stack[:len(self.stack)-1-self.stack[::-1].index(t)]
 def handle_data(self,s):
  if 'title' in self.stack: self.title.append(s)
  if 'h1' in self.stack: self.h1.append(s)
  if not self.skip and 'body' in self.stack: self.text.append(s)
def fetch(url):
 chain=[]
 class Redirect(urllib.request.HTTPRedirectHandler):
  def redirect_request(self,req,fp,code,msg,headers,newurl):
   chain.append({'status':code,'url':req.full_url,'location':newurl})
   if urllib.parse.urlsplit(newurl).netloc!='jurassicenglish.com': raise ValueError('off-origin redirect')
   return super().redirect_request(req,fp,code,msg,headers,newurl)
 try:
  op=urllib.request.build_opener(Redirect())
  try: r=op.open(urllib.request.Request(url,headers={'User-Agent':'JurassicEnglish-IndexingAudit/1.0'}),timeout=25)
  except urllib.error.HTTPError as e: r=e
  raw=r.read(5_000_000).decode('utf-8','replace'); p=Parser(); p.feed(raw)
  links=[a for t,a in p.tags if t=='link']; metas=[a for t,a in p.tags if t=='meta']
  return dict(url=url,status=r.code,chain=chain,final=r.url,canonical=[a.get('href','') for a in links if a.get('rel')=='canonical'],robots=[a.get('content','') for a in metas if a.get('name','').lower() in ('robots','googlebot')],xrobots=r.headers.get('X-Robots-Tag',''),alternates=[{'lang':a.get('hreflang'),'url':a.get('href')} for a in links if a.get('hreflang')],title=' '.join(p.title),h1=' '.join(p.h1),lang=next((a.get('lang','') for t,a in p.tags if t=='html'),''),description=next((a.get('content','') for a in metas if a.get('name')=='description'),''),text=' '.join(' '.join(p.text).split()),links=[a['href'] for t,a in p.tags if t=='a' and 'href' in a],error='')
 except Exception as e: return dict(url=url,status=0,chain=chain,final=url,error=type(e).__name__,links=[],alternates=[],canonical=[],robots=[],xrobots='',title='',h1='',description='',lang='',text='')
def page_url(href,base):
 u=urllib.parse.urlsplit(urllib.parse.urljoin(base,href))
 if u.scheme!='https' or u.netloc!='jurassicenglish.com' or u.query: return None
 if re.search(r'\.[a-z0-9]{2,5}$',u.path,re.I) or re.match(r'^/(api|go|film|internal|external|pilot)(/|$)',u.path): return None
 return urllib.parse.urlunsplit((u.scheme,u.netloc,u.path or '/','',''))
def analyze(results,sitemap):
 incoming=defaultdict(set)
 for u,r in results.items():
  for h in r['links']:
   v=page_url(h,r['final'])
   if v and v!=u: incoming[v].add(u)
 for u,r in results.items():
  r['in_sitemap']=u in sitemap; r['word_count']=len(r['text'].split()); r['incoming']=len(incoming[u]); r['hreflang_errors']=[]
  for a in r['alternates']:
   target=results.get(page_url(a['url'],u))
   if not target or target['status']!=200 or target['chain']: r['hreflang_errors'].append('target not final 200: '+str(a['url']))
   elif not any(page_url(b['url'],target['url'])==u for b in target['alternates']): r['hreflang_errors'].append('no return link: '+str(a['url']))
 # Duplicate titles/H1 and >90% Jaccard overlap of five-word shingles, excluding identical redirect destinations.
 for r in results.values(): r['duplicates']=[]
 rows=list(results.values())
 shingles=lambda r:set(zip(*[r['text'].lower().split()[i:] for i in range(5)]))
 sets=[shingles(r) for r in rows]
 for i,r in enumerate(rows):
  if r['status']!=200 or r['chain']: continue
  for j in range(i):
   s=rows[j]
   if s['status']!=200 or s['chain']: continue
   overlap=len(sets[i]&sets[j])/max(1,len(sets[i]|sets[j]))
   reasons=[]
   if r['title'] and r['title']==s['title']: reasons.append('same title')
   if r['h1'] and r['h1']==s['h1']: reasons.append('same H1')
   if overlap>.9: reasons.append(f'text overlap {overlap:.3f}')
   if reasons:
    r['duplicates'].append({'url':s['url'],'reasons':reasons}); s['duplicates'].append({'url':r['url'],'reasons':reasons})
 out=Path('docs/seo'); out.mkdir(parents=True,exist_ok=True)
 (out/'indexing-audit-2026-10-29.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n')
 fields=['url','in_sitemap','status','chain','final','canonical','robots','xrobots','alternates','hreflang_errors','lang','title','description','h1','word_count','incoming','duplicates','error']
 with (out/'indexing-audit-2026-10-29.csv').open('w') as f:
  w=csv.DictWriter(f,fieldnames=fields,lineterminator='\n'); w.writeheader()
  for r in rows: w.writerow({k:json.dumps(r[k],ensure_ascii=False) if isinstance(r[k],(list,dict)) else r[k] for k in fields})

def main():
 pending=[BASE+'/sitemap.xml']; sitemap=set(); visited=set()
 while pending:
  u=pending.pop()
  if u in visited: continue
  if urllib.parse.urlsplit(u).scheme!='https' or urllib.parse.urlsplit(u).netloc!='jurassicenglish.com': raise ValueError('off-origin sitemap')
  visited.add(u)
  if len(visited)>20: raise RuntimeError('sitemap limit exceeded')
  data=urllib.request.urlopen(u,timeout=25).read(5_000_000).decode()
  locs=re.findall(r'<loc>(.*?)</loc>',data)
  if '<sitemapindex' in data: pending+=locs
  else: sitemap.update(locs)
 results={}; todo=set(sitemap); rounds=0
 while todo:
  if len(results)+len(todo)>2000: raise RuntimeError('crawl limit exceeded')
  with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
   for row in pool.map(fetch,sorted(todo)): results[row['url']]=row
  following=set()
  for u in todo:
   for href in results[u]['links']+[a['url'] for a in results[u]['alternates'] if a['url']]:
    v=page_url(href,results[u]['final'])
    if v and v not in results: following.add(v)
  todo=following; rounds+=1; print(json.dumps({'round':rounds,'fetched':len(results),'pending':len(todo)}),flush=True)
  time.sleep(.3)
 analyze(results,sitemap)
if __name__=='__main__': main()
