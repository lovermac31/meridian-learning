import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolveRouteMetadata } from '../src/lib/routeMetadata';
import { PRODUCT_VIDEOS, STORY_CLUB_VIDEOS } from '../src/i18n/content/productVideos';
import { PRODUCTS_WITH_VIDEO, VIDEO_UPLOAD_DATE, isoDuration, videosForPath } from '../src/lib/videoSeo';
import videoMeta from '../src/content/videoMeta.json';
import videoTranscripts from '../src/content/videoTranscripts.json';
import { mp4DurationSeconds, vttText } from '../scripts/lib/video-files.mjs';

// Video SEO (Jay, 27 Oct 2026): every film on a page has a VideoObject and a video-sitemap entry, built from the
// same manifest as the players, with lengths read from the real files.
const SITE = 'https://jurassicenglish.com';
const pages = [
  ...PRODUCTS_WITH_VIDEO.flatMap((p) => [`/products/${p.id}`, `/vi/products/${p.id}`].map((path) => ({ path, slugs: [p.video!] }))),
  ...['/story-club', '/vi/story-club'].map((path) => ({ path, slugs: STORY_CLUB_VIDEOS })),
];
const local = (url: string) => `public${url.replace(SITE, '')}`;

test('every film page is covered: all products with a film, plus the three Story Club films', () => {
  assert.ok(PRODUCTS_WITH_VIDEO.length >= 27, `${PRODUCTS_WITH_VIDEO.length} products with a film`);
  assert.equal(STORY_CLUB_VIDEOS.length, 3);
});

test('videoMeta.json and videoTranscripts.json match the files in public/videos (re-run generate-video-meta.mjs)', () => {
  for (const slug of Object.keys(PRODUCT_VIDEOS)) {
    const seconds = mp4DurationSeconds(`public/videos/${slug}/video.mp4`);
    assert.ok(seconds > 1, `${slug}: ${seconds}s`);
    assert.equal((videoMeta as Record<string, { seconds: number }>)[slug].seconds, Math.round(seconds * 10) / 10, `${slug}: length`);
    for (const lang of ['en', 'vi'] as const) {
      const text = vttText(`public/videos/${slug}/${lang}.vtt`);
      assert.ok(text.length > 40, `${slug} ${lang}: transcript`);
      assert.equal((videoTranscripts as Record<string, Record<string, string>>)[slug][lang], text, `${slug} ${lang}: transcript`);
    }
  }
});

test('JSON-LD: a VideoObject per film with name, description, absolute poster + mp4, upload date, real duration', () => {
  for (const { path, slugs } of pages) {
    const blocks = resolveRouteMetadata(path).jsonLd as Array<Record<string, any>>;
    const videos = blocks.filter((b) => b['@type'] === 'VideoObject');
    assert.deepEqual(videos.map((v) => v.contentUrl), slugs.map((slug) => `${SITE}/videos/${slug}/video.mp4`), path);
    for (const [i, video] of videos.entries()) {
      const slug = slugs[i];
      assert.ok(video.name && video.description, `${path} ${slug}: name and description`);
      assert.deepEqual(video.thumbnailUrl, [`${SITE}/videos/${slug}/poster.webp`]);
      assert.equal(video.uploadDate, VIDEO_UPLOAD_DATE);
      assert.equal(video.duration, isoDuration((videoMeta as Record<string, { seconds: number }>)[slug].seconds));
      assert.match(video.duration, /^PT(\d+M)?(\d+S)?$/);
      assert.equal(video['@id'], `${SITE}${path}#video-${slug}`);
      assert.ok(existsSync(local(video.contentUrl)) && existsSync(local(video.thumbnailUrl[0])), `${path} ${slug}: files exist`);
    }
    const product = blocks.find((b) => b['@type'] === 'Product');
    if (path.includes('/products/')) assert.deepEqual(product?.subjectOf, { '@id': videos[0]['@id'] }, `${path}: Product → its film`);
  }
});

test('sitemap: the same films, one <video:video> per film, on the page URL', () => {
  for (const { path, slugs } of pages) {
    const videos = videosForPath(path);
    assert.deepEqual(videos.map((v) => v.slug), slugs, path);
    for (const v of videos) {
      assert.equal(v.pageUrl, `${SITE}${path}`);
      assert.ok(v.name.length <= 100 || v.name.slice(0, 100).length === 100);
      assert.ok(v.seconds > 1);
    }
  }
  assert.deepEqual(videosForPath('/products'), [], 'the hub has no film entry');
  assert.deepEqual(videosForPath('/'), []);
});

test('isoDuration', () => {
  assert.equal(isoDuration(28.3), 'PT28S');
  assert.equal(isoDuration(75), 'PT1M15S');
  assert.equal(isoDuration(120), 'PT2M');
});

test('the generator script and the sitemap builder are wired', () => {
  assert.match(readFileSync('scripts/generate-sitemap.mjs', 'utf8'), /xmlns:video="http:\/\/www\.google\.com\/schemas\/sitemap-video\/1\.1"/);
  assert.match(readFileSync('scripts/prerender-route-metadata.mjs', 'utf8'), /withTranscript\(block, locale\)/);
});
