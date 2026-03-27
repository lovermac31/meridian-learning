import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPrerenderRoutes, resolveRouteMetadata } from '../src/lib/routeMetadata.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '..', 'dist');
const baseIndexPath = path.join(distDir, 'index.html');

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function upsertTag(html, { marker, replacement, insertAfterPattern }) {
  if (html.includes(marker)) {
    const pattern = new RegExp(`${marker}[\\s\\S]*?-->`, 'g');
    return html.replace(pattern, replacement);
  }

  if (!insertAfterPattern) {
    return `${html}\n${replacement}`;
  }

  return html.replace(insertAfterPattern, (match) => `${match}\n${replacement}`);
}

function replaceMetaTag(html, pattern, replacement) {
  if (pattern.test(html)) {
    return html.replace(pattern, replacement);
  }

  return html.replace('</head>', `  ${replacement}\n  </head>`);
}

function injectMetadata(html, pathname) {
  const metadata = resolveRouteMetadata(pathname);

  let output = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(metadata.title)}</title>`);
  output = replaceMetaTag(
    output,
    /<meta name="description" content="[^"]*"\s*\/>/,
    `<meta name="description" content="${escapeHtml(metadata.description)}" />`,
  );

  output = replaceMetaTag(
    output,
    /<meta property="og:title" content="[^"]*"\s*\/>/,
    `<meta property="og:title" content="${escapeHtml(metadata.og.title)}" />`,
  );
  output = replaceMetaTag(
    output,
    /<meta property="og:description" content="[^"]*"\s*\/>/,
    `<meta property="og:description" content="${escapeHtml(metadata.og.description)}" />`,
  );
  output = replaceMetaTag(
    output,
    /<meta property="og:url" content="[^"]*"\s*\/>/,
    `<meta property="og:url" content="${escapeHtml(metadata.og.url)}" />`,
  );
  output = replaceMetaTag(
    output,
    /<meta property="og:image" content="[^"]*"\s*\/>/,
    `<meta property="og:image" content="${escapeHtml(metadata.og.image)}" />`,
  );
  output = replaceMetaTag(
    output,
    /<meta property="og:type" content="[^"]*"\s*\/>/,
    `<meta property="og:type" content="${escapeHtml(metadata.og.type)}" />`,
  );
  output = replaceMetaTag(
    output,
    /<meta property="og:site_name" content="[^"]*"\s*\/>/,
    `<meta property="og:site_name" content="${escapeHtml(metadata.og.siteName)}" />`,
  );
  output = replaceMetaTag(
    output,
    /<meta property="og:locale" content="[^"]*"\s*\/>/,
    `<meta property="og:locale" content="${escapeHtml(metadata.og.locale)}" />`,
  );

  output = replaceMetaTag(
    output,
    /<meta name="twitter:card" content="[^"]*"\s*\/>/,
    `<meta name="twitter:card" content="${escapeHtml(metadata.twitter.card)}" />`,
  );
  output = replaceMetaTag(
    output,
    /<meta name="twitter:title" content="[^"]*"\s*\/>/,
    `<meta name="twitter:title" content="${escapeHtml(metadata.twitter.title)}" />`,
  );
  output = replaceMetaTag(
    output,
    /<meta name="twitter:description" content="[^"]*"\s*\/>/,
    `<meta name="twitter:description" content="${escapeHtml(metadata.twitter.description)}" />`,
  );
  output = replaceMetaTag(
    output,
    /<meta name="twitter:image" content="[^"]*"\s*\/>/,
    `<meta name="twitter:image" content="${escapeHtml(metadata.twitter.image)}" />`,
  );

  if (metadata.robots) {
    output = replaceMetaTag(
      output,
      /<meta name="robots" content="[^"]*"\s*\/>/,
      `<meta name="robots" content="${escapeHtml(metadata.robots)}" />`,
    );
  } else {
    output = output.replace(/\s*<meta name="robots" content="[^"]*"\s*\/>/g, '');
  }

  if (metadata.canonical) {
    if (/<link rel="canonical" href="[^"]*"\s*\/>/.test(output)) {
      output = output.replace(
        /<link rel="canonical" href="[^"]*"\s*\/>/,
        `<link rel="canonical" href="${escapeHtml(metadata.canonical)}" />`,
      );
    } else {
      output = output.replace(
        /(<meta property="og:url" content="[^"]*"\s*\/>)/,
        `$1\n    <link rel="canonical" href="${escapeHtml(metadata.canonical)}" />`,
      );
    }
  } else {
    output = output.replace(/\s*<link rel="canonical" href="[^"]*"\s*\/>/g, '');
  }

  output = output.replace(/\s*<script type="application\/ld\+json" data-prerendered-route="true">[\s\S]*?<\/script>/g, '');
  const jsonLd = metadata.jsonLd?.length
    ? metadata.jsonLd
        .map((block) => `    <script type="application/ld+json" data-prerendered-route="true">${JSON.stringify(block)}</script>`)
        .join('\n')
    : '';

  if (jsonLd) {
    output = output.replace('</head>', `${jsonLd}\n  </head>`);
  }

  return output;
}

async function writeRouteHtml(route, html) {
  const filePath =
    route === '/'
      ? path.join(distDir, 'index.html')
      : path.join(distDir, route.replace(/^\/+/, ''), 'index.html');

  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, html, 'utf8');
}

async function main() {
  const baseHtml = await fs.readFile(baseIndexPath, 'utf8');
  const routes = getPrerenderRoutes();

  for (const route of routes) {
    const html = injectMetadata(baseHtml, route);
    await writeRouteHtml(route, html);
  }

  console.log(`[prerender-route-metadata] generated ${routes.length} route HTML files`);
}

await main();
