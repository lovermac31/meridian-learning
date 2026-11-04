/** Verify built files, redirects and explicitly delegated rewrites; never accept the SPA fallback.
 * Only reads disk. External rewritten applications are reported separately, never fetched.
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { builtSite } from './lib/built-site.mjs';
import { decodeEntities } from './lib/visible-text.mjs';

export function sourceMatcher(source) {
  return new RegExp('^' + source.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/:[a-zA-Z]+\*/g, '(.*)').replace(/:[a-zA-Z]+/g, '([^/]+)') + '/?$');
}
export async function checkBuild(directory = 'dist', configuration = 'vercel.json') {
  const config = JSON.parse(await readFile(configuration, 'utf8'));
  const rules = [...(config.redirects || []), ...(config.rewrites || [])].filter(r => !r.has && r.source !== '/(.*)' && !r.source.includes(':path('));
  const inventory = await builtSite(directory, configuration);
  const present = new Set(inventory.files.keys());
  const failures = [], delegated = [], seen = new Set(), fragments = [];
  const htmlCache = new Map();
  let sitemap = '';
  try { sitemap = await readFile(path.join(directory, 'sitemap.xml'), 'utf8'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  const publishedAiPaths = new Set([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => new URL(decodeEntities(m[1])).pathname));
  let links = 0, assets = 0;
  function resolveTarget(pathname, chain = []) {
    let decoded;
    try { decoded = decodeURIComponent(pathname); } catch { return false; }
    const normalized = path.posix.normalize(decoded);
    if (present.has(normalized) || present.has(normalized.replace(/\/$/, '') + '/index.html')) return true;
    if (chain.includes(pathname) || chain.length > 10) return false;
    for (const rule of rules) {
      const match = sourceMatcher(rule.source).exec(pathname);
      if (!match) continue;
      if (/^https:\/\//.test(rule.destination)) {
        // A broad upstream rewrite must not turn typos into valid internal links.
        if (/^\/ai-speaking(?:\/|$)/.test(pathname) && !publishedAiPaths.has(pathname)) return false;
        if (inventory.academyBuilt && inventory.mounted(pathname)) return inventory.dynamicPages.has(pathname) ? 'authenticated-app' : false;
        return 'delegated';
      }
      if (rule.destination.startsWith('/api/')) return 'api';
      let i = 1;
      const destination = rule.destination.replace(/:[a-zA-Z]+\*?/g, () => match[i++] || '');
      // The app-shell rewrite deliberately does not make unknown paths valid.
      if (destination === '/index.html' && pathname !== '/') continue;
      return resolveTarget(new URL(destination, 'https://jurassicenglish.com').pathname, [...chain, pathname]);
    }
    return false;
  }
  function inspect(href, from, kind) {
    if (!href || /^(data:|blob:|mailto:|tel:|javascript:)/i.test(href)) return;
    let url;
    try { url = new URL(decodeEntities(href), 'https://jurassicenglish.com' + from); } catch { failures.push({ from, href, kind, reason: 'invalid-url' }); return; }
    if (!['jurassicenglish.com', 'www.jurassicenglish.com'].includes(url.hostname)) return;
    const key = [from, href, kind].join('|');
    if (seen.has(key)) return;
    seen.add(key);
    if (kind === 'link') links++; else assets++;
    const result = resolveTarget(url.pathname);
    if (result === 'delegated' || result === 'api' || result === 'authenticated-app') delegated.push({ from, href, kind, reason: result });
    else if (!result) failures.push({ from, href, kind, reason: 'missing-built-target' });
    else if (kind === 'link' && url.hash && !url.hash.startsWith('#:~:text=')) fragments.push({ from, href, url });
  }
  for (const [from, file] of inventory.files) {
    if (file.endsWith('.html')) {
      const html = await readFile(file, 'utf8');
      for (const tag of html.matchAll(/<(a|img|script|link|source|video|audio|track|iframe)\b[^>]*>/gi)) {
        const attrs = Object.fromEntries([...tag[0].matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/g)].map(m => [m[1].toLowerCase(), m[3]]));
        const name = tag[1].toLowerCase();
        if (name === 'a') inspect(attrs.href, from, 'link');
        else if (name === 'link' && /^(stylesheet|preload|modulepreload|icon|apple-touch-icon)$/.test(attrs.rel)) inspect(attrs.href, from, 'asset');
        else inspect(attrs.src, from, 'asset');
        inspect(attrs.poster, from, 'asset');
        if (attrs.srcset && !attrs.srcset.startsWith('data:')) for (const candidate of attrs.srcset.split(',')) inspect(candidate.trim().split(/\s+/)[0], from, 'asset');
      }
    } else if (file.endsWith('.css')) {
      const css = await readFile(file, 'utf8');
      for (const match of css.matchAll(/url\(\s*["']?([^\s"')]+)["']?\s*\)/g)) inspect(match[1], from, 'asset');
    }
  }
  for (const { from, href, url } of fragments) {
    let pathname = decodeURIComponent(url.pathname);
    let target = present.has(pathname) ? pathname : pathname.replace(/\/$/, '') + '/index.html';
    // Redirects and dynamic application endpoints cannot be inspected as static HTML.
    if (!target.endsWith('.html') || !present.has(target)) continue;
    if (!htmlCache.has(target)) htmlCache.set(target, await readFile(inventory.files.get(target), 'utf8'));
    const html = htmlCache.get(target);
    const ids = [...html.matchAll(/\b(?:id|name)\s*=\s*(["'])(.*?)\1/g)].map(m => decodeEntities(m[2]));
    let fragment;
    try { fragment = decodeURIComponent(url.hash.slice(1)); } catch { fragment = url.hash.slice(1); }
    if (!ids.includes(fragment)) failures.push({ from, href, kind: 'link', reason: 'missing-fragment' });
  }
  return { pages: inventory.pages.length, links, assets, failures, delegated };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = await checkBuild();
  if (process.argv[2]) await writeFile(process.argv[2], JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ event: 'built_link_check', pages: report.pages, links: report.links, assets: report.assets, failures: report.failures, delegated: report.delegated.length }));
  if (report.failures.length) process.exitCode = 1;
}
