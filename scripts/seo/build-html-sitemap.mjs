/** Standalone HTML directories: no client bundle and no SPA routing dependency. */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolveRouteMetadata } from '../../src/lib/routeMetadata.ts';
const origin = 'https://jurassicenglish.com';
const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
const paths = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => new URL(m[1]).pathname);
const section = p => p.includes('ai-speaking') ? 0 : p.includes('ielts-speaking-online') ? 1 : /insights|tools|cong-cu|knowledge/.test(p) ? 2 : /series|thinking-cycle|framework|methodology|cefr|teacher/.test(p) ? 3 : /legal|privacy|terms/.test(p) ? 4 : 5;
for (const [route, lang, title, description, headings] of [
  ['/site-map', 'en', 'Site map', 'Find every public Jurassic English learning page, grouped by purpose: speaking and writing, IELTS markets, guides, curriculum, policies and programmes.', ['Speaking and writing', 'IELTS by location and language', 'Guides and practice tools', 'Curriculum and teaching', 'Policies', 'Programmes and people']],
  ['/vi/so-do-trang', 'vi', 'Sơ đồ trang', 'Tìm các trang công khai của Jurassic English theo mục đích học: luyện nói và viết, IELTS theo thị trường, hướng dẫn, chương trình, chính sách và khóa học.', ['Luyện nói và viết', 'IELTS theo quốc gia và ngôn ngữ', 'Hướng dẫn và công cụ', 'Chương trình và phương pháp', 'Chính sách', 'Khóa học và đội ngũ']],
]) {
  const groups = headings.map(() => []);
  for (const p of paths) {
    let label;
    try { label = resolveRouteMetadata(p).title.split('|')[0].trim(); } catch { /* External route: readable path identifies its scope. */ }
    if (!label || /not found|404/i.test(label)) label = p.slice(1).replaceAll('/', ' · ').replaceAll('-', ' ');
    groups[section(p)].push(`<li><a href="${esc(p)}">${esc(label)} <small>(${esc(p)})</small></a></li>`);
  }
  const body = groups.map((links, i) => `<section><h2>${headings[i]}</h2><ul>${links.join('')}</ul></section>`).join('');
  await mkdir(`dist${route}`, { recursive: true });
  await writeFile(`dist${route}/index.html`, `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} | Jurassic English</title><meta name="description" content="${description}"><link rel="canonical" href="${origin}${route}"><style>body{font:1rem/1.6 system-ui;margin:auto;max-width:75rem;padding:2rem;color:#163d30}a{color:inherit}ul{columns:2 24rem}li{break-inside:avoid;margin:.6rem 0}small{overflow-wrap:anywhere}</style></head><body><header><a href="${lang === 'vi' ? '/vi' : '/'}">Jurassic English</a> · <a href="${lang === 'vi' ? '/site-map' : '/vi/so-do-trang'}">${lang === 'vi' ? 'English' : 'Tiếng Việt'}</a></header><main><h1>${title}</h1><p>${description}</p>${body}</main></body></html>`);
}
console.log(JSON.stringify({ event: 'html_sitemap_built', pages: 2, entries: paths.length }));
