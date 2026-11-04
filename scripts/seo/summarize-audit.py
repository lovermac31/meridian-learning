"""Reproduce the dated audit summary from the retained crawl and verified build."""
import csv, importlib.util, json, re, sys
sys.dont_write_bytecode = True
from collections import defaultdict
from pathlib import Path
from urllib.parse import urlsplit, urljoin
spec=importlib.util.spec_from_file_location('audit',Path(__file__).with_name('audit-live.py'))
audit=importlib.util.module_from_spec(spec);spec.loader.exec_module(audit)
out=Path('docs/seo'); before=json.loads((out/'indexing-audit-2026-10-29.json').read_text())
checked=json.loads((out/'indexability-after-2026-10-29.json').read_text())
base='https://jurassicenglish.com'
normalize=lambda u: base+'/' if u==base else u
indexable=lambda r:r['status']==200 and not r['chain'] and 'noindex' not in str(r['robots'])+r['xrobots'] and [normalize(u) for u in r['canonical']]==[normalize(r['url'])]
missing=[r for r in before if not r['in_sitemap'] and indexable(r)]
after=[]
for c in checked:
 r=dict(next(r for r in before if r['url']==c['url']))
 r['in_sitemap']=True
 if c['source']=='local-build':
  p=audit.Parser();p.feed((Path('dist')/urlsplit(c['url']).path.lstrip('/')/'index.html').read_text())
  r.update(h1=' '.join(p.h1),title=' '.join(p.title),text=' '.join(' '.join(p.text).split()),links=[a['href'] for t,a in p.tags if t=='a' and 'href' in a])
 after.append(r)
# Count distinct referring pages from the built native HTML plus retained external crawl.
inventory={r['url']: r for r in before}
inventory.update({r['url']:r for r in after})
for alias in ['/ai-speaking/samples/basic','/ai-speaking/vi/samples/basic']:
 inventory.pop(base+alias,None)
incoming=defaultdict(set)
for source,r in inventory.items():
 for href in r['links']:
  target=audit.page_url(href,source)
  if target and target!=source: incoming[target].add(source)
low_after=[r['url'] for r in after if len(incoming[r['url']])<2]
assert not low_after, 'Important pages still need distinct incoming links: '+str(low_after)
with (out/'indexing-internal-links-after-2026-10-29.csv').open('w') as f:
 w=csv.writer(f,lineterminator='\n');w.writerow(['url','distinct_other_referring_pages'])
 for r in after:w.writerow([r['url'],len(incoming[r['url']])])
def groups(rows,key):
 d=defaultdict(list)
 for r in rows:
  if r[key]:d[r[key]].append(r['url'])
 return [v for v in d.values() if len(v)>1]
def flagged(rows,key):return len({u for g in groups(rows,key) for u in g})
b=[r for r in before if r['in_sitemap']];a=after
hbefore=flagged(b,'h1');hafter=flagged(a,'h1')
lines=['# Live indexing audit — 29 October 2026','',
'Public read-only GET crawl: **231 URLs**, including **204/204 sitemap URLs** and **27 additional internal/hreflang targets**. Four workers, 25-second request deadlines, maximum 2,000 URLs; no GSC, forms, authenticated requests or database calls. The sitemap had no child sitemaps. The CSV records every response, redirect chain, final URL, canonical, robots headers/meta, language alternates, title, description, H1, raw body word count, incoming source-page count and duplicate flags. Raw response-derived text and links are retained in the companion JSON.', '',
'## What these numbers mean','',
'Google’s reported 91 excluded pages are not available as a URL export in this job. The categories below are **observed technical signals**, not invented GSC classifications or predictions that Google will index all eligible pages. Exact Crawled/Discovered counts require the SEO Manager’s GSC export. A bare origin canonical and the same origin with `/` are equivalent; those are normalized rather than counted as defects.', '',
'After = 189 native/static pages served from this branch’s build plus 34 public external rewrite responses. This is local code verification, not a production release. The full after check is in `indexability-after-2026-10-29.json`.', '',
'## Google reason groups','',
'| Reason | Before | After | Evidence / treatment |','|---|---:|---:|---|',
'| Duplicate without user-selected canonical | 0 sitemap URLs | 0 | Every sitemap response has a canonical; no eligible public page lacks one. |',
'| Alternate page with proper canonical | 1 sitemap URL; 2 public aliases overall | 0 sitemap aliases | `/ai-speaking/samples/basic` and its VI twin duplicate the samples hubs exactly. Keep the hubs, remove the EN alias from sitemap, redirect both aliases permanently. |',
'| Crawled – currently not indexed | Unknown in GSC | Unknown in GSC | Proxy: '+str(hbefore)+' sitemap pages shared an H1 before, '+str(hafter)+' after. Detailed native product offers and syllabus pages now have distinct localized headings. All sitemap pages have real raw HTML content. |',
'| Discovered – currently not indexed | Unknown in GSC; 20 eligible linked pages missing from sitemap | Unknown in GSC; 0 of those 20 missing | Add the verified canonical public pages, strengthen lesson/writing/story links. Twelve original sitemap pages had only one other referring page; resource links now give each at least two. Self-links are excluded from incoming counts. |',
'| Page with redirect | 0 sitemap URLs | 0 | Two intentional basic-sample aliases now redirect by configuration, outside sitemap. Hosting behavior must be rechecked after release. |',
'| Not found (404) | 0 | 0 | No crawl response was non-200; local gate also checks actual static-file coverage without SPA fallback. |',
'| Excluded by noindex | 0 sitemap URLs; 6 internal routes | 0 sitemap URLs | Six account/exam/writing-session pages are intentionally excluded; retain privacy controls. |',
'| Soft 404 | 0 observed placeholder candidates | 0 observed placeholder candidates | No empty server body was found; after gate requires at least 150 server-rendered main-content words and 50 initially visible words, H1, title and description. Google’s own soft-404 decision remains unknown. |', '',
'## Additional checks','',
f'- Sitemap inventory: **204 → 223** (remove one alias, add 20 verified public pages). Native build: 189 URLs; public external rewrites: 34 URLs.',
'- Non-200, accidental noindex, missing SSR content, sitemap redirect: **0 → 0** each.',
'- Original sitemap pages with fewer than two distinct other referring pages: **12 → 0**. All 223 after URLs have at least two; counts are retained in `indexing-internal-links-after-2026-10-29.csv` (built native HTML plus retained live external links).',
'- Broken reciprocal alternates on eligible canonical sitemap pages: **0 → 0**. The basic aliases had six failed return-link checks; permanent redirects consolidate them. Noindex EN writing practice/history each advertises three nonreciprocal hub alternates in the external app; these are outside the sitemap and remain an external-app follow-up.',
'- Wrong `lang` on EN/VI twins: **0 → 0**. Existing VI metadata is correct; no speculative translation or language rewrite was introduced.',
f'- Duplicate title groups in sitemap: **{len(groups(b,"title"))} → {len(groups(a,"title"))}**. Duplicate-description groups: **{len(groups(b,"description"))} → {len(groups(a,"description"))}**; see external ownership below.',
'- Similarity uses case-folded five-word shingle Jaccard overlap > 90%, plus exact title/H1 matches. Repeated headings are review signals, not proof of duplicate content. The only indexable >90% pairs are the two basic aliases and their hubs; the >90% writing practice/history pair is intentionally noindex.', '',
'## Content decisions and external ownership','',
'No page or unique content is deleted. The basic sample routes are exact copies of their hubs (1.000 overlap), so permanent redirects preserve entry links and consolidate canonical identity. Native syllabus pages explain curriculum and assessment; their EN/VI headings now explicitly say syllabus. Product detail pages use their existing localized search titles, distinguishing priced offers from programme hubs and translated product names.', '',
'The separately deployed `jurassic-ai-speaking` app still uses the same H1 across its hub/intermediate/advanced sample pages in each language (six sitemap pages) and the same description across three VI sample pages. Their sample reports contain distinct substantive content. This repository only controls their rewrite and sitemap, so **two duplicate-description warnings and six repeated-H1 signals remain**. Follow up in that app: localize tier-specific H1s/descriptions and remove alternate tags from noindex writing sessions. Do not hide this work behind a sitemap exclusion or rewrite the external app’s response in a proxy.', '',
'External pages retain their own HTML, headers and content. The quality gate fails for all sitemap URLs on non-200, noindex, non-self-canonical or empty content; it also fails duplicate native metadata. External duplicate metadata is reported as an explicit warning because its source is outside this PR. Availability of those public apps is now a CI dependency; the checker has per-request and overall deadlines.', '',
'## URLs added to the sitemap','']
lines += ['- '+r['url'] for r in missing]
lines += ['', '## Remaining repeated H1 groups (after)', '']
lines += ['- '+'; '.join(g) for g in groups(a,'h1')]
lines += ['', '## Intentional noindex routes (not submitted)', '']
lines += ['- '+r['url'] for r in before if 'noindex' in str(r['robots'])+r['xrobots']]
lines += ['', '## Reproduce / release verification', '', '```sh', 'python3 scripts/seo/audit-live.py', 'npm ci --no-audit --no-fund', 'npm test', 'npm run lint', 'npm run build', 'npm run validate:prerender', 'npm run validate:indexability -- --report', 'python3 scripts/seo/summarize-audit.py', '```', '', 'After Jay merges and releases: verify both basic aliases return one 308 to their hubs, fetch all 223 sitemap URLs again, then give the ordered priority list to the SEO Manager. Do not submit aliases, session/account URLs or any noindex page. Compare GSC reason counts after 14 and 28 days. Rollback: revert this PR’s application/config commits and rebuild; no schema or data rollback is required.']
(out/'indexing-audit-2026-10-29.md').write_text('\n'.join(lines)+'\n')
# Prioritize the newly discoverable public routes, changed offers and useful entry hubs.
priority=['/story-club/reserve', '/en/story-club/reserve', '/products/story-club', '/vi/products/story-club', '/ai-speaking/vi/lessons', '/ai-speaking/lessons', '/ai-speaking/vi/writing', '/ai-speaking/writing', '/vi/student-academy/stories', '/student-academy/stories', '/ai-speaking/vi/baseline', '/ai-speaking/vi/pricing', '/ai-speaking/vi/solutions', '/ai-speaking/solutions', '/ai-speaking/vi/samples', '/ai-speaking/vi/samples/intermediate', '/ai-speaking/vi/samples/advanced', '/ai-speaking/vi/writing/demo', '/ai-speaking/vi/writing/sample', '/ai-speaking/writing/demo', '/ai-speaking/writing/sample', '/ielts-speaking-online/india', '/ielts-speaking-online/philippines', '/ielts-speaking-online/nigeria', '/ielts-speaking-online/singapore', '/vi/cong-cu/tinh-diem-ielts', '/vi/cong-cu/dong-ho-ielts-speaking-part-2', '/story-club', '/vi/story-club', '/ielts-speaking-online']
assert len(priority)==30 and len(set(priority))==30
assert all(base+p in {r['url'] for r in checked} for p in priority), 'Unverified priority URL'
(out/'gsc-request-priority.md').write_text('# GSC request priority — after approved merge and release\n\nOwner: SEO Manager / master agent. No GSC or IndexNow submission was made by this job. Verify deployed canonical, 200 status and indexability first. These 30 URLs are queued in order; batch within the current daily GSC limit (about 10), accounting for requests already used that day. Re-submit the sitemap before individual requests. Do not request the redirected basic aliases or noindex session/account pages.\n\n'+ '\n'.join(f'{i}. {base}{p} — '+('new discovery / stronger internal links' if base+p in {r['url'] for r in missing} else 'changed heading, stronger discovery or priority programme entry') for i,p in enumerate(priority,1))+'\n')
print(json.dumps({'sitemap_before':len(b),'sitemap_after':len(a),'shared_h1_before':hbefore,'shared_h1_after':hafter,'added':len(missing)}))
