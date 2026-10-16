import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

// The founder film lives at an unlisted address under public/film/<token>/. It must stay out of search
// (noindex meta + X-Robots-Tag), out of the sitemap and robots.txt, and every page must be complete and self-contained.
const FILM = join(process.cwd(), 'public', 'film');
const tokens = existsSync(FILM) ? readdirSync(FILM).filter((d) => statSync(join(FILM, d)).isDirectory()) : [];

function pages(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return pages(p);
    return name === 'index.html' ? [p] : [];
  });
}

test('the film section exists with the Vietnamese page first, 9 more languages, and the deck in all 10', () => {
  assert.equal(tokens.length, 1, 'exactly one unlisted film folder');
  const root = join(FILM, tokens[0]);
  for (const sub of ['', 'en', 'es', 'pt', 'id', 'ms', 'th', 'ar', 'ur', 'bn',
    'deck', 'deck/en', 'deck/es', 'deck/pt', 'deck/id', 'deck/ms', 'deck/th', 'deck/ar', 'deck/ur', 'deck/bn']) {
    assert.ok(existsSync(join(root, sub, 'index.html')), `missing ${sub || '(vi)'} page`);
  }
  assert.match(readFileSync(join(root, 'index.html'), 'utf8'), /<html lang="vi"/);
});

test('every film page is noindex, canonical to its own unlisted URL, with share previews and no inline JS', () => {
  for (const file of pages(join(FILM, tokens[0]))) {
    const html = readFileSync(file, 'utf8');
    assert.match(html, /<meta name="robots" content="noindex, nofollow">/, `${file} must be noindex`);
    assert.match(html, new RegExp(`<link rel="canonical" href="https://jurassicenglish\\.com/film/${tokens[0]}/`), file);
    assert.match(html, /<meta property="og:image" content="https:\/\/jurassicenglish\.com\/film\//, file);
    assert.match(html, /<meta name="twitter:card" content="summary_large_image">/, file);
    const scripts = [...html.matchAll(/<script\b([^>]*)>/g)].map((m) => m[1]);
    for (const attrs of scripts) {
      assert.ok(/type="application\/ld\+json"/.test(attrs) || /\bsrc="/.test(attrs), `${file}: inline script not allowed`);
    }
  }
});

test('every local asset a film page references exists', () => {
  const pub = join(process.cwd(), 'public');
  for (const file of pages(join(FILM, tokens[0]))) {
    const html = readFileSync(file, 'utf8');
    for (const [, ref] of html.matchAll(/(?:src|href|poster)="(\/film\/[^"#?]+)"/g)) {
      const target = ref.endsWith('/') ? join(pub, ref, 'index.html') : join(pub, ref);
      assert.ok(existsSync(target), `${file} references missing ${ref}`);
    }
  }
});

test('the film stays out of search: X-Robots-Tag header, not in the sitemap, not named in robots.txt', () => {
  const vercel = JSON.parse(readFileSync('vercel.json', 'utf8'));
  const rule = vercel.headers.find((h: { source: string }) => h.source === '/film/(.*)');
  assert.ok(rule, 'vercel.json needs a /film/(.*) header rule');
  assert.ok(rule.headers.some((h: { key: string; value: string }) => h.key === 'X-Robots-Tag' && h.value.includes('noindex')));
  assert.doesNotMatch(readFileSync('scripts/generate-sitemap.mjs', 'utf8'), /\/film\//);
  assert.doesNotMatch(readFileSync('public/robots.txt', 'utf8'), new RegExp(tokens[0]));
});

test('the deck plays the film with subtitles in all 10 languages, and RTL decks are marked rtl', () => {
  const deck = join(FILM, tokens[0], 'deck');
  for (const [sub, lang] of [['', 'vi'], ['en', 'en'], ['ar', 'ar'], ['ur', 'ur'], ['th', 'th']]) {
    const html = readFileSync(join(deck, sub, 'index.html'), 'utf8');
    const tracks = [...html.matchAll(/<track kind="subtitles"[^>]*src="([^"]+)"/g)].map((m) => m[1]);
    assert.equal(tracks.length, 10, `${lang} deck needs 10 subtitle tracks`);
    assert.match(html, new RegExp(`<track kind="subtitles" srclang="${lang}"[^>]* default>`), `${lang} deck defaults to its own subtitles`);
    assert.equal((html.match(/<option value="\/film\//g) || []).length, 10, `${lang} deck language menu lists 10 languages`);
    if (lang === 'ar' || lang === 'ur') assert.match(html, /<html lang="(ar|ur)" dir="rtl">/);
  }
});
