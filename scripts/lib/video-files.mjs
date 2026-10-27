/**
 * Reading the films in public/videos/<slug>/ without ffmpeg (video SEO, Jay 27 Oct 2026): the length of video.mp4
 * from its movie header box, and the spoken text of a <lang>.vtt for a VideoObject transcript.
 */
import fs from 'node:fs';
import path from 'node:path';

/** Seconds in an MP4, from the moov/mvhd box (version 0 or 1). */
export function mp4DurationSeconds(file) {
  const buffer = fs.readFileSync(file);
  const at = buffer.indexOf('mvhd');
  if (at < 4) throw new Error(`No mvhd box in ${file}`);
  const version = buffer[at + 4];
  const timescale = version === 1 ? buffer.readUInt32BE(at + 24) : buffer.readUInt32BE(at + 16);
  const duration = version === 1 ? Number(buffer.readBigUInt64BE(at + 28)) : buffer.readUInt32BE(at + 20);
  return duration / timescale;
}

/** ISO 8601 duration, whole seconds rounded: 41.6 → "PT42S", 75 → "PT1M15S". */
export function isoDuration(seconds) {
  const total = Math.max(1, Math.round(seconds));
  const minutes = Math.floor(total / 60);
  return `PT${minutes ? `${minutes}M` : ''}${total % 60 ? `${total % 60}S` : ''}`;
}

/** The cue text of a WebVTT file as one plain paragraph (no header, notes, timings or cue numbers). */
export function vttText(file) {
  const blocks = fs.readFileSync(file, 'utf8').replace(/\r/g, '').split(/\n\n+/);
  return blocks
    .filter((block) => block.includes('-->'))
    .map((block) => block.split('\n').filter((line) => !line.includes('-->') && !/^\d+$/.test(line.trim())).join(' '))
    .join(' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export const videoDir = (root, slug) => path.join(root, 'public', 'videos', slug);
