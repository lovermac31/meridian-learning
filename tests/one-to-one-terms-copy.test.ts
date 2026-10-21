/**
 * One-to-one payment terms (directive "CC — Clarify and enforce one-to-one payment terms", 21 Oct 2026).
 * The public copy must match the approved lesson decisions and the checkout at /ai-speaking/lessons:
 * no instalment promise without a mechanism, no "trial" framing, one product called a "plan" only when it is one,
 * the team (not one named teacher) as who teaches, and /legal/terms pointing lesson buyers to the lesson terms.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const SOURCES = ['young-learners-speaking/index.html', 'src/yl/i18n.vi.json', 'src/i18n/content/overhaul.ts', 'src/i18n/content/home.ts'];

test('no instalment promise ("monthly or biweekly") for plans that have no instalment mechanism', () => {
  for (const p of SOURCES) {
    const s = read(p);
    assert.doesNotMatch(s, /monthly or biweekly|biweekly/i, p);
    assert.doesNotMatch(s, /theo tháng hoặc hai tuần/i, p);
  }
});

test('the single lesson is not called a trial; the 8-lesson pack is not called a monthly plan', () => {
  for (const p of SOURCES) {
    const s = read(p);
    assert.doesNotMatch(s, /trial lesson|buổi học thử/i, p);
    assert.doesNotMatch(s, /Monthly plan|Gói tháng/, p);
  }
  assert.match(read('young-learners-speaking/index.html'), /8-lesson package \(use within 35 days\)/);
});

test('long plans say their schedule and terms are agreed in writing before payment', () => {
  assert.match(read('young-learners-speaking/index.html'), /schedule and terms agreed in a written summary before you pay/);
  assert.match(read('src/yl/i18n.vi.json'), /thống nhất trong bản tóm tắt bằng văn bản trước khi bạn trả tiền/);
});

test('lessons are with Mr. Jay\'s team, not a promise of one named teacher', () => {
  const home = read('src/i18n/content/home.ts');
  assert.doesNotMatch(home, /lessons with Mr\. Jay'|coaching with Mr\. Jay'|với thầy Jay'/);
  assert.match(home, /60-minute lessons with Mr\. Jay\\'s team/);
});

test('/legal/terms points lesson buyers to the lesson terms and keeps statutory rights (EN/VI)', () => {
  assert.match(read('src/lib/legalContent.ts'), /ai-speaking\/terms#lessons.*full refund within 14 days of payment if no lesson has been used.*Nothing in this section limits any right/s);
  assert.match(read('src/i18n/content/legal.ts'), /ai-speaking\/terms#lessons.*hoàn toàn bộ trong vòng 14 ngày/s);
});
