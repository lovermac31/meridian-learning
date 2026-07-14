/**
 * brand-typography.test.ts — regression guard for the brand's display fonts.
 *
 * INCIDENT this prevents from recurring (2026-07-13, fixed in PR #60):
 * commit ea61a05 switched the YL header wordmark (.brand strong) to "Aptos" —
 * a Microsoft Office font that no @font-face loads and that web visitors do
 * not have installed — so "JURASSIC ENGLISH™" silently rendered in a generic
 * system sans on production until a human noticed.
 *
 * The rule these tests enforce: a BRAND-CRITICAL element's first font-family
 * must be the intended display font, AND that font must actually be loaded by
 * an @font-face on the same page (or be a genuinely web-safe fallback).
 * Nav/body text may use system stacks freely — only brand surfaces are pinned.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ylPage = readFileSync(resolve(ROOT, 'young-learners-speaking/index.html'), 'utf8');
const homePage = readFileSync(resolve(ROOT, 'index.html'), 'utf8');

/** Families safe to fall back to without an @font-face (installed broadly). */
const WEB_SAFE = new Set([
  'copperplate', 'copperplate gothic light', 'georgia', 'serif',
  'palatino linotype', 'times', 'times new roman',
  'system-ui', '-apple-system', 'blinkmacsystemfont', 'segoe ui',
  'helvetica neue', 'helvetica', 'arial', 'sans-serif',
  'trebuchet ms', 'avenir next', 'monospace',
]);

function familiesOf(fontFamilyValue: string): string[] {
  return fontFamilyValue
    .split(',')
    .map((f) => f.trim().replace(/^["']|["']$/g, '').toLowerCase())
    .filter(Boolean);
}

function fontFaceFamilies(html: string): Set<string> {
  const out = new Set<string>();
  for (const m of html.matchAll(/@font-face\{[^}]*font-family:\s*["']?([^"';]+)["']?\s*;/g)) {
    out.add(m[1].trim().toLowerCase());
  }
  // tolerate multi-line @font-face blocks (homepage formats it across lines)
  for (const m of html.matchAll(/@font-face[^}]*font-family:\s*["']?([^"';,}]+)["']?/gs)) {
    out.add(m[1].trim().toLowerCase());
  }
  return out;
}

function ruleFontFamily(html: string, selectorRe: RegExp, label: string): string {
  const m = html.match(selectorRe);
  assert.ok(m, `${label}: selector rule not found — if the selector was renamed, update this guard`);
  const fam = m[1];
  assert.ok(fam, `${label}: no font-family captured`);
  return fam;
}

test('YL header wordmark (.brand strong) uses Neuland-Inline first', () => {
  const fam = ruleFontFamily(ylPage, /\.brand strong\{[^}]*?font-family:([^;}]+)/, 'YL .brand strong');
  const families = familiesOf(fam);
  assert.equal(
    families[0],
    'neuland-inline',
    `YL brand wordmark must lead with "Neuland-Inline", got "${families[0]}" — this exact regression shipped in ea61a05 (Aptos) and reached production`
  );
});

test('every font in the YL wordmark stack is loaded or web-safe', () => {
  const faces = fontFaceFamilies(ylPage);
  const fam = ruleFontFamily(ylPage, /\.brand strong\{[^}]*?font-family:([^;}]+)/, 'YL .brand strong');
  for (const f of familiesOf(fam)) {
    assert.ok(
      faces.has(f) || WEB_SAFE.has(f),
      `"${f}" in the YL wordmark stack is neither @font-face-loaded on the page nor web-safe — visitors will see an unintended fallback`
    );
  }
});

test('YL page declares the Neuland-Inline @font-face', () => {
  assert.ok(
    fontFaceFamilies(ylPage).has('neuland-inline'),
    'YL page must inline the Neuland-Inline @font-face (same declaration as the main site) or the wordmark falls back'
  );
});

test('YL hero display font (Lilita One) is @font-face-loaded', () => {
  assert.ok(
    fontFaceFamilies(ylPage).has('lilita one'),
    'YL page must keep the inlined Lilita One @font-face used by the hero/display typography'
  );
});

test('homepage declares the Neuland-Inline @font-face', () => {
  assert.ok(
    fontFaceFamilies(homePage).has('neuland-inline'),
    'main site index.html must keep the inline Neuland-Inline @font-face (brand wordmark + hero fallback depend on it)'
  );
});

test('homepage static fallback hero references Neuland-Inline', () => {
  assert.match(
    homePage,
    /font-family:\s*['"]Neuland-Inline['"]/,
    'the no-JS fallback hero in index.html must reference Neuland-Inline'
  );
});
