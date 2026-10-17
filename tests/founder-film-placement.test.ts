import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { FOUNDER_FILM_COPY, FOUNDER_FILM_THUMB, FounderFilmLink, founderFilmHref } from '../src/components/FounderFilmLink';

// The founder film is AI-assisted. It is linked from the pages where adults decide whether to trust the
// founder (his own page, the homepage teacher section, the institutional pages), always with the AI label
// in the same unit as the link, never autoplaying and never from children's pages.
const pub = join(process.cwd(), 'public');
const render = (locale: 'en' | 'vi', variant: 'card' | 'inline' | 'dark') =>
  renderToStaticMarkup(createElement(FounderFilmLink, { locale, variant }));

test('each language links to its own film page, and that page exists', () => {
  assert.equal(founderFilmHref('vi'), '/film/jay-adams-rgfr11pf7cqk/');
  assert.equal(founderFilmHref('en'), '/film/jay-adams-rgfr11pf7cqk/en/');
  for (const locale of ['en', 'vi'] as const) {
    assert.ok(existsSync(join(pub, founderFilmHref(locale), 'index.html')), `${locale} film page missing`);
  }
  assert.ok(existsSync(join(pub, FOUNDER_FILM_THUMB)), 'thumbnail missing');
});

test('every variant carries the AI label and the illustrative-scenes note beside the link', () => {
  for (const locale of ['en', 'vi'] as const) {
    for (const variant of ['card', 'inline', 'dark'] as const) {
      const html = renderToStaticMarkup(createElement(FounderFilmLink, { locale, variant }));
      assert.match(html, new RegExp(`href="${founderFilmHref(locale)}"`), `${locale}/${variant} href`);
      assert.ok(html.includes(FOUNDER_FILM_COPY[locale].label), `${locale}/${variant} must show the AI label`);
      assert.ok(html.includes(FOUNDER_FILM_COPY[locale].note), `${locale}/${variant} must say scenes are illustrative`);
      assert.doesNotMatch(html, /<video|autoplay|<iframe/i, 'no embedded or autoplaying video');
    }
  }
  assert.match(render('en', 'card'), /alt="[^"]*AI-generated with Google Vids[^"]*"/, 'thumbnail alt text names it as AI-generated with Google Vids');
});

test('the film is linked from the founder page, homepage teacher section and the three institutional pages', () => {
  const uses = (file: string, variant: string) =>
    assert.match(readFileSync(join('src/components', file), 'utf8'), new RegExp(`<FounderFilmLink[^>]*variant="${variant}"`), `${file} → ${variant}`);
  uses('SearchInsightsPage.tsx', 'card');
  uses('HomeOverhaul.tsx', 'inline');
  uses('WorldWisePage.tsx', 'dark');
  uses('CompaniesPage.tsx', 'dark');
  uses('PilotProgrammePage.tsx', 'dark');
  const insights = readFileSync('src/components/SearchInsightsPage.tsx', 'utf8');
  assert.match(insights, /'\/about\/nathaniel-jay-adams', '\/vi\/ve-thay-jay-adams'/);
});

test('the film token appears in source only through FounderFilmLink, and never on children’s pages', () => {
  const files = (dir: string): string[] => readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? files(p) : /\.(tsx?|json)$/.test(n) ? [p] : [];
  });
  const hits = files('src').filter((f) => readFileSync(f, 'utf8').includes('jay-adams-rgfr11pf7cqk'));
  assert.deepEqual(hits, [join('src', 'components', 'FounderFilmLink.tsx')]);
  for (const kids of ['src/yl', 'src/components/StudentAcademyMural.tsx']) {
    if (!existsSync(kids)) continue;
    const list = statSync(kids).isDirectory() ? files(kids) : [kids];
    for (const f of list) assert.doesNotMatch(readFileSync(f, 'utf8'), /FounderFilmLink/, `${f} is a children’s page`);
  }
});
