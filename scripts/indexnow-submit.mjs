#!/usr/bin/env node
/**
 * indexnow-submit.mjs — notify IndexNow search engines (Bing, Yandex, Naver,
 * Seznam.cz, Yep, Amazon; NOT Google) that jurassicenglish.com URLs changed.
 *
 * DRY RUN BY DEFAULT: prints the payload and sends nothing. Add --submit to
 * POST. Run it only AFTER the deploy is live — engines fetch the URLs (and the
 * key file) from production.
 *
 *   node scripts/indexnow-submit.mjs                      # all URLs in dist/sitemap.xml (dry run)
 *   node scripts/indexnow-submit.mjs --source live        # all URLs in the live sitemap (dry run)
 *   node scripts/indexnow-submit.mjs /methodology /vi/framework            # a changed subset
 *   node scripts/indexnow-submit.mjs --source live --submit                # submit everything
 *   node scripts/indexnow-submit.mjs --submit /methodology https://jurassicenglish.com/companies
 *
 * Before submitting it checks that the live key file
 * (https://jurassicenglish.com/<key>.txt) returns exactly the key; otherwise
 * engines answer 403 and the submission is wasted.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  INDEXNOW_ENDPOINT,
  INDEXNOW_KEY,
  KEY_LOCATION,
  RESPONSE_MEANINGS,
  SITE_ORIGIN,
  buildPayload,
  chunk,
  normalizeUrls,
  parseSitemapUrls,
} from './lib/indexnow.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function parseArgs(argv) {
  const options = { submit: false, source: 'dist', urls: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--submit') options.submit = true;
    else if (arg === '--source') options.source = argv[++index];
    else if (arg.startsWith('--source=')) options.source = arg.slice('--source='.length);
    else if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg.startsWith('--')) throw new Error(`Unknown option ${arg}`);
    else options.urls.push(arg);
  }
  if (!['dist', 'live'].includes(options.source)) {
    throw new Error(`--source must be "dist" or "live" (got "${options.source}")`);
  }
  return options;
}

async function readSitemap(source, fetchImpl) {
  if (source === 'live') {
    const response = await fetchImpl(`${SITE_ORIGIN}/sitemap.xml`);
    if (!response.ok) throw new Error(`Live sitemap returned HTTP ${response.status}`);
    return response.text();
  }
  const file = path.join(ROOT, 'dist', 'sitemap.xml');
  try {
    return await fs.readFile(file, 'utf8');
  } catch {
    throw new Error('dist/sitemap.xml not found — run `npm run build`, pass URLs, or use --source live');
  }
}

async function assertLocalKeyFile() {
  const file = path.join(ROOT, 'public', `${INDEXNOW_KEY}.txt`);
  const contents = (await fs.readFile(file, 'utf8')).trim();
  if (contents !== INDEXNOW_KEY) {
    throw new Error(`public/${INDEXNOW_KEY}.txt does not contain the key`);
  }
}

async function assertLiveKeyFile(fetchImpl) {
  const response = await fetchImpl(KEY_LOCATION, { redirect: 'manual' });
  const body = response.ok ? (await response.text()).trim() : '';
  if (!response.ok || body !== INDEXNOW_KEY) {
    throw new Error(
      `Live key file check failed (${KEY_LOCATION} → HTTP ${response.status}). Deploy first; engines would answer 403.`,
    );
  }
}

/**
 * CLI body. Exported (with an injectable fetch and logger) so
 * tests/indexnow.test.ts can prove the dry run sends nothing and --submit
 * refuses to POST before the live key file checks out.
 */
export async function run(argv, { fetchImpl = fetch, log = console.log } = {}) {
  const options = parseArgs(argv);
  if (options.help) {
    log(
      'Usage: node scripts/indexnow-submit.mjs [--source dist|live] [--submit] [URL or /path ...]\n' +
        'Dry run unless --submit. Without URLs, submits every <loc> in the chosen sitemap.',
    );
    return;
  }

  await assertLocalKeyFile();

  const inputs =
    options.urls.length > 0 ? options.urls : parseSitemapUrls(await readSitemap(options.source, fetchImpl));
  const urls = normalizeUrls(inputs);
  if (urls.length === 0) throw new Error('No URLs to submit');

  const batches = chunk(urls).map(buildPayload);

  if (!options.submit) {
    log(`[indexnow] DRY RUN — ${urls.length} URL(s) in ${batches.length} request(s); nothing sent.`);
    log(`[indexnow] Would POST to ${INDEXNOW_ENDPOINT}:`);
    log(JSON.stringify(batches[0], null, 2));
    log('[indexnow] Re-run with --submit after the deploy is live to send it.');
    return { submitted: false, urls };
  }

  await assertLiveKeyFile(fetchImpl);

  let failed = false;
  for (const [index, payload] of batches.entries()) {
    const response = await fetchImpl(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
    });
    const meaning = RESPONSE_MEANINGS[response.status] ?? 'Unexpected response';
    log(
      `[indexnow] request ${index + 1}/${batches.length}: ${payload.urlList.length} URL(s) → HTTP ${response.status} ${meaning}`,
    );
    if (response.status !== 200 && response.status !== 202) {
      failed = true;
      const text = await response.text().catch(() => '');
      if (text) log(`[indexnow] response body: ${text.slice(0, 500)}`);
    }
  }
  return { submitted: true, urls, failed };
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isCli) {
  run(process.argv.slice(2))
    .then((result) => {
      if (result?.failed) process.exitCode = 1;
    })
    .catch((error) => {
      console.error(`[indexnow] ${error.message}`);
      process.exitCode = 1;
    });
}
