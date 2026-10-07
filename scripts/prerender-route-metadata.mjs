/**
 * prerender-route-metadata.mjs
 *
 * Writes dist/<route>/index.html for every route in getPrerenderRoutes():
 *   1. per-route <head> tags (title, description, canonical, hreflang, OG,
 *      Twitter, robots, JSON-LD) from routeMetadata.ts, and
 *   2. the route's real page body: the React app server-rendered for that
 *      route and locale by dist-ssr/entry-server.js (built from
 *      src/entry-server.tsx), injected as the whole #root element and marked
 *      with data-ssr-route so src/main.tsx hydrates it.
 *
 * Routes in getClientOnlyRoutes() are private, noindex and token/session-gated;
 * their first render depends on request-time state the build cannot know, so
 * they keep the small static fallback and are client-rendered (createRoot).
 *
 * Run after `vite build` and `vite build --ssr src/entry-server.tsx --outDir
 * dist-ssr` (see the `build` script in package.json).
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  getClientOnlyRoutes,
  getPrerenderRoutes,
  resolveRouteMetadata,
} from '../src/lib/routeMetadata.ts';
import { getLocaleDefinition } from '../src/i18n/locales.ts';
import { resolveLocalizedRoute } from '../src/i18n/routing.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '..', 'dist');
const baseIndexPath = path.join(distDir, 'index.html');
const ssrEntryPath = path.resolve(__dirname, '..', 'dist-ssr', 'entry-server.js');

// See getClientOnlyRoutes() in src/lib/routeMetadata.ts.
const CLIENT_ONLY_ROUTES = new Set(getClientOnlyRoutes());

const ROUTE_CONTENT_PATTERN =
  /<!-- prerender-route-content:start -->[\s\S]*?<!-- prerender-route-content:end -->/;

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("'", '&#39;');
}

function buildRouteFallback(pathname, metadata, locale) {
  if (pathname === '/') return null;

  const homePath = locale === 'vi' ? '/vi' : '/';
  const frameworkPath = locale === 'vi' ? '/vi/framework' : '/framework';
  const getStartedPath = locale === 'vi' ? '/vi/get-started' : '/get-started';
  const navLabel = locale === 'vi' ? 'Điều hướng chính' : 'Primary navigation';
  const brandLabel = locale === 'vi' ? 'Tiếng Anh học thuật dựa trên văn học' : 'Literature-based academic English';
  const homeLabel = locale === 'vi' ? 'Trang chủ' : 'Home';
  const frameworkLabel = locale === 'vi' ? 'Khung chương trình' : 'Framework';
  const getStartedLabel = locale === 'vi' ? 'Bắt đầu' : 'Get Started';

  return `      <main data-prerendered-route-path="${escapeAttribute(pathname)}" style="min-height:100vh;background:#101820;color:rgba(255,255,255,0.85);font-family:Aptos,'Segoe UI','Helvetica Neue',Arial,sans-serif;padding:3rem 1.5rem;box-sizing:border-box;">
        <div style="max-width:48rem;margin:0 auto;">
          <p style="margin:0 0 1rem;font-size:0.75rem;font-weight:600;color:#F26419;text-transform:uppercase;letter-spacing:0.2em;">${escapeHtml(brandLabel)}</p>
          <h1 style="margin:0 0 1.25rem;font-family:'Neuland-Inline',Copperplate,'Copperplate Gothic Light','Palatino Linotype',Georgia,serif;font-weight:400;font-size:clamp(2rem,5vw,3.8rem);color:#ffffff;line-height:1.05;">${escapeHtml(metadata.title)}</h1>
          <p style="margin:0 0 1.75rem;max-width:42rem;font-weight:300;line-height:1.7;color:rgba(255,255,255,0.74);">${escapeHtml(metadata.description)}</p>
          <nav aria-label="${escapeAttribute(navLabel)}" style="display:flex;flex-wrap:wrap;gap:1rem;line-height:1.6;">
            <a href="${escapeAttribute(homePath)}" style="color:#F26419;">${escapeHtml(homeLabel)}</a>
            <a href="${escapeAttribute(frameworkPath)}" style="color:#F26419;">${escapeHtml(frameworkLabel)}</a>
            <a href="${escapeAttribute(getStartedPath)}" style="color:#F26419;">${escapeHtml(getStartedLabel)}</a>
          </nav>
        </div>
      </main>`;
}

function replaceRouteContent(html, rootElement) {
  if (!ROUTE_CONTENT_PATTERN.test(html)) {
    throw new Error('Missing prerender route content markers in base index.html');
  }

  return html.replace(
    ROUTE_CONTENT_PATTERN,
    () => `<!-- prerender-route-content:start -->\n    ${rootElement}\n    <!-- prerender-route-content:end -->`,
  );
}

/** Client-only routes: static fallback inside #root, replaced by createRoot. */
function injectRouteFallback(html, pathname, metadata, locale) {
  const fallback = buildRouteFallback(pathname, metadata, locale);
  if (!fallback) return html;

  return replaceRouteContent(
    html,
    `<div id="root" data-prerendered-route-path="${escapeAttribute(pathname)}">\n${fallback}\n    </div>`,
  );
}

/**
 * Server-rendered routes: React may emit hoistable resource hints (e.g. image
 * preloads) ahead of the app markup when rendering a fragment. Those belong in
 * <head>, never inside #root, where they would sit outside the hydrated tree.
 */
function splitLeadingHeadTags(ssrHtml) {
  const headTags = [];
  let rest = ssrHtml;
  let match;
  while ((match = /^\s*(<link\b[^>]*\/?>)/.exec(rest)) !== null) {
    headTags.push(match[1]);
    rest = rest.slice(match[0].length);
  }
  return { headTags, body: rest };
}

const OUTLINED_BOUNDARY_PATTERNS = [
  ['pending Suspense boundary', /<!--\$\?-->/],
  ['client-rendered Suspense boundary', /<!--\$!-->/],
  ['outlined boundary template', /<template id="B:/],
  ['streaming completion script', /\$RC\(/],
];

function assertStaticMarkup(pathname, ssrHtml) {
  for (const [label, pattern] of OUTLINED_BOUNDARY_PATTERNS) {
    if (pattern.test(ssrHtml)) {
      throw new Error(`[prerender-route-metadata] ${pathname}: server render contains a ${label}; the page body would be hidden or client-rendered`);
    }
  }
}

/**
 * The base build loads the main stylesheet asynchronously (asyncCssPlugin in
 * vite.config.ts) because the old fallback was styled inline. A server-rendered
 * body is styled by that stylesheet, so loading it async would paint unstyled
 * content first (FOUC). Server-rendered routes therefore load it render-blocking.
 */
function makeStylesheetsRenderBlocking(html) {
  return html.replace(
    /<link rel="preload" as="style" crossorigin href="([^"]+\.css)" onload="this\.onload=null;this\.rel='stylesheet'"><noscript><link rel="stylesheet" href="\1"><\/noscript>/g,
    (_, href) => `<link rel="stylesheet" crossorigin href="${href}">`,
  );
}

function injectServerRenderedRoute(html, pathname, ssrHtml) {
  assertStaticMarkup(pathname, ssrHtml);
  const { headTags, body } = splitLeadingHeadTags(ssrHtml);
  const attribute = escapeAttribute(pathname);

  let output = replaceRouteContent(
    html,
    `<div id="root" data-prerendered-route-path="${attribute}" data-ssr-route="${attribute}">${body}</div>`,
  );
  output = makeStylesheetsRenderBlocking(output);

  const newHeadTags = headTags.filter((tag) => {
    const href = /href="([^"]*)"/.exec(tag)?.[1];
    return !href || !output.includes(`href="${href}"`);
  });
  if (newHeadTags.length > 0) {
    output = output.replace('</head>', `${newHeadTags.map((tag) => `    ${tag}`).join('\n')}\n  </head>`);
  }

  return output;
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
  const locale = resolveLocalizedRoute(pathname).locale;
  const htmlLang = getLocaleDefinition(locale).htmlLang;

  let output = html.replace(/<html lang="[^"]*">/, `<html lang="${escapeHtml(htmlLang)}">`);
  output = output.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(metadata.title)}</title>`);
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
  if (metadata.og.imageWidth) {
    output = replaceMetaTag(
      output,
      /<meta property="og:image:width" content="[^"]*"\s*\/>/,
      `<meta property="og:image:width" content="${escapeHtml(String(metadata.og.imageWidth))}" />`,
    );
  }
  if (metadata.og.imageHeight) {
    output = replaceMetaTag(
      output,
      /<meta property="og:image:height" content="[^"]*"\s*\/>/,
      `<meta property="og:image:height" content="${escapeHtml(String(metadata.og.imageHeight))}" />`,
    );
  }
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

  // Phase 14 — render <link rel="alternate" hreflang="..."> tags from
  // the metadata's `alternates` array. routeMetadata.ts populates this
  // for every released en/vi route pair (and `x-default` pointing to
  // the canonical English route); routes without a released VI variant
  // get only `en` + `x-default`. We strip any pre-existing alternate
  // tags first so re-runs of the prerender stay idempotent.
  output = output.replace(/\s*<link rel="alternate" hreflang="[^"]*" href="[^"]*"\s*\/>/g, '');
  if (metadata.alternates?.length) {
    const alternateTags = metadata.alternates
      .map(
        (alt) =>
          `    <link rel="alternate" hreflang="${escapeHtml(alt.hrefLang)}" href="${escapeHtml(alt.href)}" />`,
      )
      .join('\n');
    output = output.replace('</head>', `${alternateTags}\n  </head>`);
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

  return { html: output, metadata, locale };
}

async function writeRouteHtml(route, html) {
  const filePath =
    route === '/'
      ? path.join(distDir, 'index.html')
      : path.join(distDir, route.replace(/^\/+/, ''), 'index.html');

  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, html, 'utf8');
}

async function loadServerRenderer() {
  // Match production: Vercel builds with NODE_ENV=production, and React's
  // development server build is slower and warns differently.
  process.env.NODE_ENV ??= 'production';
  try {
    await fs.access(ssrEntryPath);
  } catch {
    throw new Error(
      `[prerender-route-metadata] ${path.relative(process.cwd(), ssrEntryPath)} is missing — run \`vite build --ssr src/entry-server.tsx --outDir dist-ssr\` first (npm run build does this).`,
    );
  }
  const { renderRoute } = await import(pathToFileURL(ssrEntryPath).href);
  return renderRoute;
}

async function main() {
  const baseHtml = await fs.readFile(baseIndexPath, 'utf8');
  const routes = getPrerenderRoutes();
  const renderRoute = await loadServerRenderer();
  let serverRendered = 0;

  // Sequential on purpose: the server entry keeps the route being rendered in
  // module state (src/lib/ssrLocation.ts).
  for (const route of routes) {
    const { html: withMetadata, metadata, locale } = injectMetadata(baseHtml, route);
    let html;
    if (CLIENT_ONLY_ROUTES.has(route)) {
      html = injectRouteFallback(withMetadata, route, metadata, locale);
    } else {
      html = injectServerRenderedRoute(withMetadata, route, await renderRoute(route));
      serverRendered += 1;
    }
    await writeRouteHtml(route, html);
  }

  console.log(
    `[prerender-route-metadata] generated ${routes.length} route HTML files ` +
      `(${serverRendered} server-rendered, ${routes.length - serverRendered} client-only)`,
  );
}

await main();
