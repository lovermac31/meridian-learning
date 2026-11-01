/** Inventory the two builds served by this repository, without an SPA fallback. */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

export async function walkFiles(directory) {
  const files = [];
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, item.name);
    if (item.isDirectory()) files.push(...await walkFiles(file));
    else files.push(file);
  }
  return files;
}
export async function builtSite(directory = 'dist', configuration = 'vercel.json') {
  const root = path.resolve(directory);
  const config = JSON.parse(await readFile(configuration, 'utf8'));
  const files = new Map((await walkFiles(root)).map(file => ['/' + path.relative(root, file).split(path.sep).join('/'), file]));
  const pages = [];
  for (const [url, file] of files) if (file.endsWith('.html')) {
    const html = await readFile(file, 'utf8');
    pages.push({ route: /data-prerendered-route-path="([^"]+)"/.exec(html)?.[1] || url.replace(/index\.html$/, ''), file, source: 'main' });
  }
  const academy = path.resolve(path.dirname(configuration), 'docs/jurassic-english---b2b-evidence-showcase/ecosystem-landing');
  const academyRules = (config.rewrites || []).filter(r => r.destination.startsWith('https://je-ecosystem-landing-preview.vercel.app/'));
  const mounted = url => academyRules.some(r => r.source === url || r.source.endsWith('/:path*') && url.startsWith(r.source.slice(0, -':path*'.length)));
  const dynamicPages = new Set();
  let academyBuilt = false;
  try {
    const manifest = JSON.parse(await readFile(path.join(academy, '.next/app-path-routes-manifest.json'), 'utf8'));
    academyBuilt = true;
    const staticPaths = new Set(Object.keys(JSON.parse(await readFile(path.join(academy, '.next/prerender-manifest.json'), 'utf8')).routes));
    for (const route of new Set(Object.values(manifest))) {
      if (!mounted(route)) continue;
      const file = path.join(academy, '.next/server/app', route.slice(1) + '.html');
      try {
        await readFile(file);
        files.set(route + '/index.html', file);
        pages.push({ route, file, source: 'academy' });
      } catch {
        if (staticPaths.has(route)) throw new Error(`Missing built Academy page: ${route}`);
        dynamicPages.add(route);
      }
    }
    for (const [directory, prefix] of [[path.join(academy, '.next/static'), '/_next/static/'], [path.join(academy, 'public'), '/']]) {
      for (const file of await walkFiles(directory)) {
        const url = prefix + path.relative(directory, file).split(path.sep).join('/');
        if (mounted(url) && !files.has(url)) files.set(url, file);
      }
    }
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  return { root, files, pages, dynamicPages, academyBuilt, mounted };
}
