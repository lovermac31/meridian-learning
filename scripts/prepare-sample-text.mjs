import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { PRODUCTS } from '../src/i18n/content/products.ts';
import { SAMPLE_PAGE_COUNTS, SAMPLE_PAGE_REVISIONS } from '../src/i18n/content/samplePages.ts';
import { validateSampleText, SAMPLE_TEXT_MAX_BYTES } from '../src/lib/sampleText.ts';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicPages = path.join(root, 'public/samples/pages');
const hash = (value) => createHash('sha256').update(value).digest('hex');
const config = PRODUCTS.filter(p => p.live).map(p => ({ id: p.id, stem: p.sample, count: SAMPLE_PAGE_COUNTS[p.sample] }));
const args = process.argv.slice(2);
let sourceRoot = process.env.JE_SAMPLE_SOURCE_ROOT;
let explicitGenerate = false; let verifySource = false; let sourceProvided = false;
for (let index = 0; index < args.length; index++) {
  const arg = args[index];
  if (arg === '--generate' && !explicitGenerate) explicitGenerate = true;
  else if (arg === '--verify-source' && !verifySource) verifySource = true;
  else if (arg === '--source-root' && !sourceProvided && index + 1 < args.length && !args[index + 1].startsWith('--')) { sourceRoot = args[++index]; sourceProvided = true; }
  else throw new Error('Unknown or incomplete sample text argument');
}
if (explicitGenerate && verifySource) throw new Error('Choose generation or source verification');
const generate = explicitGenerate || Boolean(sourceRoot);
if (config.length !== 35 || new Set(config.map(p => p.stem)).size !== 35 || config.some(p => !p.count)) throw new Error('Expected 35 approved sample sets');
if ((generate || verifySource) && !sourceRoot) throw new Error('Use --source-root or JE_SAMPLE_SOURCE_ROOT for approved local samples');
if (generate || verifySource) {
  const result = spawnSync('python3', [path.join(root, 'scripts/extract-sample-text.py'), '--source-root', path.resolve(sourceRoot), '--public-pages', publicPages, '--ocr', path.join(root, 'scripts/sample-text-ocr.json')], { input: JSON.stringify(config), encoding: 'utf8', maxBuffer: 16_000_000, timeout: 120_000 });
  if (result.status !== 0) throw new Error((result.stderr || 'Sample extraction failed').trim());
  const documents = JSON.parse(result.stdout);
  if (!Array.isArray(documents) || documents.length !== config.length) throw new Error('Unexpected generated sample set');
  const checked = config.map((item, index) => validateSampleText(documents[index], item.id, item.stem, item.count));
  const contents = checked.map(doc => JSON.stringify(doc, null, 2) + '\n');
  if (contents.some(content => Buffer.byteLength(content) > SAMPLE_TEXT_MAX_BYTES)) throw new Error('Generated sample text exceeds the public asset size limit');
  for (const [index, item] of config.entries()) {
    const doc = checked[index];
    const target = path.join(publicPages, `${item.id}-text.json`);
    const content = contents[index];
    if (verifySource) {
      if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== content) throw new Error(`${item.id}: checked-in text differs from approved sample source`);
    } else fs.writeFileSync(target, content);
  }
}
const expected = new Set(config.map(p => `${p.id}-text.json`));
for (const file of fs.readdirSync(publicPages).filter(p => p.endsWith('-text.json'))) if (!expected.has(file)) throw new Error(`Unexpected text asset ${file}`);
if (Object.keys(SAMPLE_PAGE_REVISIONS).length !== 7) throw new Error('Expected only the seven approved image cache revisions');
for (const [file, revision] of Object.entries(SAMPLE_PAGE_REVISIONS)) {
  if (!/^[a-z0-9-]+-pg[0-9]{2}\.webp$/.test(file) || !/^[a-f0-9]{12}$/.test(revision) || hash(fs.readFileSync(path.join(publicPages, file))).slice(0, 12) !== revision) throw new Error('Approved image cache revision does not match public content');
}
let pages = 0;
for (const item of config) {
  const text = fs.readFileSync(path.join(publicPages, `${item.id}-text.json`), 'utf8');
  if (Buffer.byteLength(text) > SAMPLE_TEXT_MAX_BYTES) throw new Error(`${item.id}: text asset too large`);
  const doc = validateSampleText(JSON.parse(text), item.id, item.stem, item.count);
  const images = fs.readdirSync(publicPages).filter(p => p.startsWith(`${item.stem}-pg`) && p.endsWith('.webp')).sort();
  if (images.join('|') !== doc.pages.map(p => p.image).join('|')) throw new Error(`${item.id}: public page set differs`);
  for (const p of doc.pages) {
    if (p.imageSha256 !== hash(fs.readFileSync(path.join(publicPages, p.image))) || p.textSha256 !== hash(p.text)) throw new Error(`${item.id}: sample page hash mismatch`);
  }
  pages += doc.pageCount;
}
console.log(JSON.stringify({ event: 'sample_text_verified', products: config.length, pages, sourceVerified: Boolean(sourceRoot), mode: verifySource ? 'source-check' : generate ? 'generate' : 'checked-in-validation' }));
