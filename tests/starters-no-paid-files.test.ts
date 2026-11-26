import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { statSync, existsSync } from 'node:fs';
import { DRAFT_HIDDEN_PRODUCT_IDS } from './helpers/draft-hidden-products';
import { SAMPLE_PAGE_COUNTS } from '../src/i18n/content/samplePages';

/**
 * meridian-learning is a PUBLIC repository. Paid Starters material (full test PDFs, answer keys, audio scripts, mark sheets,
 * speaking scripts and cards, the four listening tracks per test, build logs) must never be committed here. The repo may hold
 * only listing copy, the watermarked sample pages, ONE short example clip per test, and delivery wiring. Paid files stay on
 * Drive and on the private delivery path. This test lists every tracked or untracked-but-not-ignored file and fails on any
 * Starters-related file that is not on the explicit allow-list below, and on any paid-looking file name anywhere.
 */
const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], { encoding: 'utf8', maxBuffer: 64_000_000 })
  .split('\n').filter(Boolean).filter(f => existsSync(f));

const PAID_NAME = /(answer[-_ ]?keys?\b|audio[-_ ]?scripts?|mark[-_ ]?sheets?|speaking[-_ ]?(?:script|cards?|pack)|\bPT\d+[-_ ]S\d+\.\d|starters\d?[-_](?:colou?r|gr[ae]y)|starters[-_]practice[-_]test[-_]?\d?[-_](?:full|colou?r|gr[ae]y|web|print|key|script|track)|AUDIO-BUILD-LOG|tracks[-_]t\d|vids[-_]t\d|\bS[1-4]\.[1-4]\.mp3)/i;
const ids = DRAFT_HIDDEN_PRODUCT_IDS;
const MAX_CLIP_BYTES = 400_000; // a 15 to 18 s example clip is about 250 to 280 kB; a full 2-minute track is about 2 MB
const CODE = /\.(?:ts|tsx|mts|mjs|js)$/;

const allowedStartersAsset = (file: string): string | null => {
  for (const id of ids) {
    const pages = SAMPLE_PAGE_COUNTS[id];
    const page = file.match(new RegExp(`^public/samples/pages/${id}-pg(\\d{2})\\.webp$`));
    if (page) return Number(page[1]) >= 1 && Number(page[1]) <= pages ? 'sample page' : `page ${page[1]} is beyond the ${pages} approved sample pages`;
    if (file === `public/samples/pages/${id}-text.json`) return 'sample text';
    if (new RegExp(`^public/samples/(?:small/)?${id}-p[123]\\.webp$`).test(file)) return 'sample thumbnail';
    if (new RegExp(`^public/images/products/(?:w/)?${id}(?:-400|-600)?\\.webp$`).test(file)) return 'product image';
    if (file === `docs/qa/pay-everywhere/qr-fixtures/${id}.png`) return statSync(file).size <= 20_000 ? 'draft placeholder' : 'fixture is too large to be the no-QR placeholder';
    if (file === `public/audio/starters/${id}-clip.mp3` && id !== 'starters-practice-test-3') return statSync(file).size <= MAX_CLIP_BYTES ? 'example clip' : `clip is ${statSync(file).size} bytes: that is a full track, not an example clip`;
  }
  return null;
};

test('no paid Starters file name appears anywhere in the repo', () => {
  const hits = files.filter(f => PAID_NAME.test(f.split('/').slice(-1)[0]) || PAID_NAME.test(f));
  assert.deepEqual(hits, [], `paid-looking files must stay on Drive: ${hits.join(', ')}`);
});

test('Starters files are only listing code, the approved sample pages, product images and one short example clip per test', () => {
  const bad: string[] = [];
  for (const file of files.filter(f => /starters/i.test(f))) {
    if (file === 'tests/starters-no-paid-files.test.ts') continue;
    if (!file.startsWith('public/') && CODE.test(file)) continue; // listing code, API wiring and tests
    const verdict = allowedStartersAsset(file);
    if (verdict === null || !/^(sample page|sample text|sample thumbnail|product image|example clip|draft placeholder)$/.test(verdict)) bad.push(`${file}${verdict ? ` (${verdict})` : ''}`);
  }
  assert.deepEqual(bad, []);
});

test('public/audio/starters holds only the example clips, none longer than the size cap', () => {
  const audio = files.filter(f => f.startsWith('public/audio/starters/'));
  assert.deepEqual(audio.sort(), ids.filter(id => id !== 'starters-practice-tests-pack' && id !== 'starters-practice-test-3').map(id => `public/audio/starters/${id}-clip.mp3`).sort());
  for (const f of audio) assert.ok(statSync(f).size <= MAX_CLIP_BYTES, `${f} is too large to be an example clip`);
});

test('no PDF or audio other than the three example clips is tracked next to a Starters name or folder', () => {
  const media = files.filter(f => /\.(?:pdf|mp3|m4a|wav|zip)$/i.test(f) && /starters|practice[-_ ]?test/i.test(f));
  const allowed = new Set(ids.filter(id => id !== 'starters-practice-tests-pack' && id !== 'starters-practice-test-3').map(id => `public/audio/starters/${id}-clip.mp3`));
  assert.deepEqual(media.filter(f => !allowed.has(f)), []);
});
