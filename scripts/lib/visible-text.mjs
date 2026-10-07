/**
 * visible-text.mjs — dependency-free visible-text extraction for built HTML.
 *
 * Used by scripts/validate-prerender-routes.mjs to measure how much real page
 * copy a crawler that does NOT execute JavaScript (Bing, Coc Coc, GPTBot,
 * ClaudeBot, PerplexityBot) receives in the raw HTML <body>.
 *
 * "Visible" here means: text nodes inside <body>, excluding the contents of
 * <script>, <style>, <template>, <noscript>, <svg>, HTML comments, and any
 * element carrying the boolean `hidden` attribute. sr-only text is counted
 * (it is real copy exposed to assistive tech and crawlers). Text hidden only
 * by CSS (e.g. a Tailwind `hidden xl:flex` nav) is counted too: it is in the
 * HTML and shown at some breakpoint.
 *
 * countMainContentWords() measures the page's own content: words inside its
 * single <main> landmark (navbar/footer chrome excluded), counting collapsed
 * `hidden` panels (accordion answers are real copy in the HTML).
 *
 * The input is machine-generated, well-formed markup (React server output +
 * our own templates), so a small tokenizer is sufficient — no HTML parser
 * dependency is pulled into the build.
 */

const SKIP_TAGS = new Set(['script', 'style', 'template', 'noscript', 'svg']);
const VOID_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta',
  'param', 'source', 'track', 'wbr',
]);

const NAMED_ENTITIES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  ndash: '–',
  mdash: '—',
  hellip: '…',
  rsquo: '’',
  lsquo: '‘',
  rdquo: '”',
  ldquo: '“',
  middot: '·',
  trade: '™',
  copy: '©',
  reg: '®',
};

export function decodeEntities(text) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, body) => {
    if (body[0] === '#') {
      const code = body[1] === 'x' || body[1] === 'X'
        ? Number.parseInt(body.slice(2), 16)
        : Number.parseInt(body.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    const named = NAMED_ENTITIES[body.toLowerCase()];
    return named ?? match;
  });
}

function extractBody(html) {
  const bodyStart = html.search(/<body[\s>]/i);
  if (bodyStart === -1) return html;
  const openEnd = html.indexOf('>', bodyStart);
  const bodyEnd = html.lastIndexOf('</body>');
  return html.slice(openEnd + 1, bodyEnd === -1 ? undefined : bodyEnd);
}

/** True when the tag's attribute list has a boolean/valued `hidden` attribute (not a class name). */
function hasHiddenAttribute(attrs) {
  const withoutValues = attrs.replace(/"[^"]*"|'[^']*'/g, '""');
  return /(^|\s)hidden(\s|=|\/|$)/i.test(withoutValues);
}

/**
 * Returns the visible text of the HTML <body> as one whitespace-normalised
 * string. With { includeHiddenAttribute: true }, elements carrying the
 * `hidden` attribute are read too.
 */
export function extractVisibleText(html, { includeHiddenAttribute = false } = {}) {
  const body = extractBody(html).replace(/<!--[\s\S]*?-->/g, ' ');
  const tokenPattern = /<\/?([a-zA-Z][a-zA-Z0-9-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;

  const chunks = [];
  let skipTag = null;
  let skipDepth = 0;
  let cursor = 0;
  let match;

  while ((match = tokenPattern.exec(body)) !== null) {
    if (skipTag === null && match.index > cursor) {
      chunks.push(body.slice(cursor, match.index));
    }
    cursor = tokenPattern.lastIndex;

    const raw = match[0];
    const tag = match[1].toLowerCase();
    const attrs = match[2] ?? '';
    const isClose = raw.startsWith('</');
    const isSelfClosing = /\/\s*>$/.test(raw) || VOID_TAGS.has(tag);

    if (skipTag !== null) {
      if (tag === skipTag) {
        if (isClose) skipDepth -= 1;
        else if (!isSelfClosing) skipDepth += 1;
        if (skipDepth === 0) skipTag = null;
      }
      continue;
    }

    if (isClose || isSelfClosing) {
      chunks.push(' ');
      continue;
    }

    const isHidden = !includeHiddenAttribute && hasHiddenAttribute(attrs);
    if (SKIP_TAGS.has(tag) || isHidden) {
      skipTag = tag;
      skipDepth = 1;
      continue;
    }

    chunks.push(' ');
  }

  if (skipTag === null && cursor < body.length) {
    chunks.push(body.slice(cursor));
  }

  return decodeEntities(chunks.join(' ')).replace(/\s+/g, ' ').trim();
}

/** Words = whitespace-separated tokens containing at least one letter or digit. */
export function countWords(text) {
  if (!text) return 0;
  return text.split(/\s+/).filter((token) => /[\p{L}\p{N}]/u.test(token)).length;
}

export function countVisibleWords(html) {
  return countWords(extractVisibleText(html));
}

/**
 * Words inside the page's <main> landmark(s). Returns { mainCount, words }.
 * Navbar and footer live outside <main>, so a route whose body failed to
 * render (empty <main>) or rendered a placeholder scores near zero here even
 * though its chrome alone exceeds 150 words.
 */
export function countMainContentWords(html) {
  const mains = [...html.matchAll(/<main\b[^>]*>/gi)];
  if (mains.length === 0) return { mainCount: 0, words: 0 };
  const start = mains[0].index;
  const end = html.toLowerCase().lastIndexOf('</main>');
  const inner = end > start ? html.slice(start, end + '</main>'.length) : html.slice(start);
  return {
    mainCount: mains.length,
    words: countWords(extractVisibleText(`<body>${inner}</body>`, { includeHiddenAttribute: true })),
  };
}
