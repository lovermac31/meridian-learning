import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import test from 'node:test';

// Product films (Jay, 27 Oct 2026): each product's film on its own page above the sample, a "Watch" link only on
// /products, films 01–03 on /story-club; muted, no autoplay, nothing but the poster before play; EN · VI · 中文 picker.

test('films: every mapped film has its video, poster and one subtitle file per listed language, and nothing else', async () => {
  const { PRODUCTS } = await import('../src/i18n/content/products');
  const { PRODUCT_VIDEOS, STORY_CLUB_VIDEOS } = await import('../src/i18n/content/productVideos');
  for (const p of PRODUCTS.filter((entry) => entry.video)) assert.ok(PRODUCT_VIDEOS[p.video!], `${p.id}: film ${p.video} is in the manifest`);
  for (const slug of STORY_CLUB_VIDEOS) assert.ok(PRODUCT_VIDEOS[slug], `story club film ${slug}`);
  assert.deepEqual(readdirSync('public/videos').filter((f) => !f.startsWith('.')).sort(), Object.keys(PRODUCT_VIDEOS).sort(), 'folders ↔ manifest');
  for (const [slug, film] of Object.entries(PRODUCT_VIDEOS)) {
    const dir = `public/videos/${slug}`;
    const expected = ['poster.webp', 'video.mp4', ...film.langs.map((l) => `${l}.vtt`)].sort();
    assert.deepEqual(readdirSync(dir).filter((f) => !f.startsWith('.')).sort(), expected, `${slug}: files`);
    assert.ok(statSync(`${dir}/video.mp4`).size < 6 * 1024 * 1024, `${slug}: web video under 6 MB`);
    assert.equal(readFileSync(`${dir}/poster.webp`).subarray(8, 12).toString(), 'WEBP', `${slug}: poster is WebP`);
    for (const l of film.langs) assert.match(readFileSync(`${dir}/${l}.vtt`, 'utf8'), /^WEBVTT/, `${slug}/${l}.vtt`);
    assert.deepEqual(film.langs, ['en', 'vi', 'zh'], `${slug}: EN, VI and 中文 subtitles`);
  }
});

test('films: each sales film sits on its own product', async () => {
  const { PRODUCTS } = await import('../src/i18n/content/products');
  const mapped = Object.fromEntries(PRODUCTS.filter((p) => p.video).map((p) => [p.id, p.video]));
  // Every product has its own film, in public/videos/<product id>/.
  assert.deepEqual(mapped, Object.fromEntries(PRODUCTS.map((p) => [p.id, p.id])));

});

test('films: the picker starts on the page language, and falls back when a film lacks it', async () => {
  const { defaultVideoLang } = await import('../src/i18n/content/productVideos');
  assert.equal(defaultVideoLang('teacher-pack-l1', 'en'), 'en');
  assert.equal(defaultVideoLang('teacher-pack-l1', 'vi'), 'vi');
  assert.equal(defaultVideoLang('no-such-film', 'vi'), 'en');
});

const videoTag = (html: string) => html.match(/<video\b[^>]*>/)?.[0] ?? '';

test('films: the product page plays the film muted, on demand, above the sample, with the picker on the page language', async () => {
  const { renderRoute } = await import('../src/entry-server');
  for (const [route, lang] of [['/products/teacher-pack-l1', 'en'], ['/vi/products/teacher-pack-l1', 'vi']] as const) {
    const html = await renderRoute(route);
    const tag = videoTag(html);
    assert.match(tag, /\bmuted=""/, `${route}: muted`);
    assert.match(tag, /preload="none"/, `${route}: loads nothing before play`);
    assert.match(tag, /\bcontrols=""/, `${route}: controls`);
    assert.doesNotMatch(tag, /autoplay/i, `${route}: never autoplays`);
    assert.match(tag, /poster="\/videos\/teacher-pack-l1\/poster\.webp"/);
    assert.match(html, /<source src="\/videos\/teacher-pack-l1\/video\.mp4" type="video\/mp4"\/>/);
    assert.match(html, new RegExp(`<track kind="subtitles" srcLang="${lang}" label="[^"]+" src="/videos/teacher-pack-l1/${lang}\\.vtt" default=""/>`), `${route}: ${lang} track is the default`);
    assert.equal((html.match(/default=""/g) ?? []).length, 1, `${route}: one default track`);
    assert.match(html, new RegExp(`<button type="button" lang="${lang}" aria-pressed="true"`), `${route}: picker on ${lang}`);
    assert.match(html, /data-subtitle-lang="en"[\s\S]*data-subtitle-lang="vi"[\s\S]*data-subtitle-lang="zh"[^>]*>中文</, `${route}: EN · VI · 中文 buttons`);
    assert.match(html, /<track kind="subtitles" srcLang="zh" label="中文" src="\/videos\/teacher-pack-l1\/zh\.vtt"\/>/, `${route}: zh track`);
    assert.match(html, /aspect-video/, `${route}: box reserved, no shift`);
    assert.ok(html.indexOf('data-product-video=') < html.indexOf('data-sample="teacher-pack-l1"'), `${route}: film above the sample`);
    assert.match(html, /id="video"[^>]*data-product-video="teacher-pack-l1"/, `${route}: #video anchor`);
  }
  // A product film without its own title shows the product's title.
  const baseline = await renderRoute('/vi/products/baseline');
  assert.match(baseline, /data-product-video="baseline"/, 'baseline film on its page');
  assert.match(videoTag(baseline), /aria-label="[^"]+"/, 'product film is labelled');
});

test('films: /products shows a Watch link to the product page, never a player; /story-club shows films 01–03', async () => {
  const { renderRoute } = await import('../src/entry-server');
  const { PRODUCTS } = await import('../src/i18n/content/products');
  for (const [route, label] of [['/products', 'Watch'], ['/vi/products', 'Xem video']] as const) {
    const html = await renderRoute(route);
    assert.doesNotMatch(html, /<video\b/, `${route}: stays light`);
    const watch = [...html.matchAll(/<a href="([^"]+)"[^>]*data-watch="([^"]+)"[^>]*>[\s\S]*?<\/a>/g)];
    assert.deepEqual(watch.map((m) => m[2]).sort(), PRODUCTS.filter((p) => p.live && p.video).map((p) => p.id).sort(), route);
    for (const m of watch) {
      assert.equal(m[1], `${route === '/vi/products' ? '/vi' : ''}/products/${m[2]}#video`);
      assert.match(m[0], new RegExp(label));
    }
  }
  for (const route of ['/story-club', '/vi/story-club']) {
    const html = await renderRoute(route);
    assert.deepEqual([...html.matchAll(/data-product-video="([^"]+)"/g)].map((m) => m[1]),
      ['je-01-the-one-question', 'je-02-spot-the-clue', 'je-03-why-stories'], route);
  }
  assert.ok(existsSync('src/components/ProductVideo.tsx'));
});
