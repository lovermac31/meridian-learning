/**
 * generate-video-meta.mjs — writes src/content/videoMeta.json (length of each film, read from its mp4) and
 * src/content/videoTranscripts.json (EN + VI subtitle text). Run after adding or replacing a film:
 *   node --import tsx scripts/generate-video-meta.mjs
 * tests/video-seo.test.ts fails when either file no longer matches public/videos.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PRODUCT_VIDEOS } from '../src/i18n/content/productVideos.ts';
import { mp4DurationSeconds, videoDir, vttText } from './lib/video-files.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const meta = {};
const transcripts = {};
for (const slug of Object.keys(PRODUCT_VIDEOS).sort()) {
  const dir = videoDir(root, slug);
  meta[slug] = { seconds: Math.round(mp4DurationSeconds(path.join(dir, 'video.mp4')) * 10) / 10 };
  transcripts[slug] = Object.fromEntries(['en', 'vi'].map((lang) => [lang, vttText(path.join(dir, `${lang}.vtt`))]));
}
fs.writeFileSync(path.join(root, 'src/content/videoMeta.json'), `${JSON.stringify(meta, null, 2)}\n`);
fs.writeFileSync(path.join(root, 'src/content/videoTranscripts.json'), `${JSON.stringify(transcripts, null, 2)}\n`);
console.log(`[video-meta] ${Object.keys(meta).length} films`);
