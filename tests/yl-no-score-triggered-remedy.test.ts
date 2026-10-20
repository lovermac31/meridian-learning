/**
 * Owner decision (19 Oct 2026, option A of the QC content audit): the 6-month and
 * annual plans' extra coaching is triggered by effort and agreed practice goals,
 * never by an exam score. A remedy triggered by "not reaching Band 7" reads as a
 * results commitment (cam kết đầu ra); this keeps it from coming back in EN/VI/ZH.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { STRINGS } from '../src/yl/i18n.ts';

const ROOT = resolve(import.meta.dirname, '..');
const sources = {
  'young-learners-speaking/index.html': readFileSync(resolve(ROOT, 'young-learners-speaking/index.html'), 'utf8'),
  en: Object.values(STRINGS.en).join('\n'),
  vi: Object.values(STRINGS.vi).join('\n'),
  'zh-CN': Object.values(STRINGS['zh-CN']).join('\n'),
};
const SCORE_TRIGGER = /without reaching Band|Band 7 Target Pathway|re-sit preparation|chưa đạt Band|ôn thi lại|未达到 ?Band|重考/i;

for (const [name, text] of Object.entries(sources)) {
  test(`${name}: no remedy is triggered by an exam score`, () => {
    assert.doesNotMatch(text, SCORE_TRIGGER);
  });
}

test('the effort-based progress review is stated in every language', () => {
  assert.match(sources['young-learners-speaking/index.html'], /up to 4 extra coaching sessions at no extra tuition/);
  assert.match(sources.vi, /tối đa 4 buổi/);
  assert.match(sources['zh-CN'], /最多 4 节辅导课/);
});
