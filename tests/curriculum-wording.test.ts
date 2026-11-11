import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { getSyllabusPageContent } from '../src/i18n/content/syllabus';
import { methodologyPageContent } from '../src/i18n/content/methodology';

// Audit fix 8 (11 Nov 2026): no stale academic year, and the novel-based curriculum is labelled as being rewritten
// onto original Jurassic English stories. Factual wording only; headlines unchanged.
test('no "Academic Year 2025–26" anywhere in src, EN or VI', () => {
  let hits = '';
  // git grep exits 1 when nothing matches, which is the pass case.
  try { hits = execFileSync('git', ['grep', '-n', '-E', 'Academic Year 2025|Năm học 2025', '--', 'src'], { encoding: 'utf8' }).trim(); } catch (error) { if ((error as { status?: number }).status !== 1) throw error; }
  assert.equal(hits, '');
});

test('syllabus pages say the current curriculum is being rewritten onto original Jurassic English stories (EN + VI)', () => {
  for (const [locale, phrase] of [['en', 'being rewritten onto original Jurassic English stories'], ['vi', 'viết lại trên các truyện gốc của Jurassic English']] as const) {
    const c = getSyllabusPageContent(locale);
    assert.match(c.hero.eyebrow, new RegExp(phrase, 'i'));
    assert.match(c.coreTexts.body, new RegExp(phrase, 'i'));
    assert.doesNotMatch(c.cta.published, /2025/);
  }
});

test('methodology no longer claims "real books, not controlled readers"', () => {
  assert.doesNotMatch(methodologyPageContent.literature.body, /controlled readers|real books/i);
  assert.match(methodologyPageContent.literature.body, /being rewritten onto original Jurassic English stories/);
});
