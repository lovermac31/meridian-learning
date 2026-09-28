/**
 * Claims-safety guard for ALL customer-facing copy (EN + VI + ZH).
 *
 * Why: score guarantees, unverifiable credentials ("examiner-built", "accredited"), implied endorsement and
 * outcome promises (visas, admissions, unsourced statistics) are consumer-protection and trademark risks.
 * The site's reviewed wording frames bands as TARGETS and states independence from IELTS / IDP /
 * British Council / Cambridge. This test fails the build if risky phrasing returns.
 *
 * Negated disclaimers ("not score guarantees", "không phải cam kết", "结果不作保证") are allowed.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

// src/lib holds route metadata (Google description + social cards) and structured data: customer-facing too.
const ROOTS = ['src/i18n/content', 'src/yl', 'src/components', 'src/lib', 'young-learners-speaking', 'index.html'];
const EXT = /\.(ts|tsx|json|html)$/;

function files(p: string): string[] {
  const st = statSync(p);
  if (st.isFile()) return EXT.test(p) ? [p] : [];
  return readdirSync(p).flatMap((f) => files(join(p, f)));
}

// A line containing any of these is a disclaimer, not a claim.
const NEGATION = /\b(no|not|never|without|cannot|can't)\b[^.]{0,40}(guarantee|endorse|promise)|không phải cam kết|không được[^.]{0,60}bảo trợ|không (bảo đảm|đảm bảo|cam kết)|不作保证|不保证|并非|未获得|而非承诺|lint|\bre:\s*\/|label: '/i;

const BANNED: { re: RegExp; label: string }[] = [
  { re: /\bguarantee(d|s)?\b/i, label: 'score/result guarantee' },
  { re: /(đảm bảo|bảo đảm|cam kết)\s*(đạt\s*)?(điểm|band)/i, label: 'vi: guarantee of score/band' },
  { re: /保证(分数|成绩|达到)|承诺(分数|成绩)/, label: 'zh: guarantee of score' },
  { re: /examiner[- ](grade|built)/i, label: 'unverified examiner credential' },
  { re: /(graded|built) by IELTS professionals|IELTS[- ]examiner[- ]built/i, label: 'unverified examiner credential' },
  { re: /\baccredited, not\b|\bwe are accredited\b/i, label: 'unverified accreditation' },
  { re: /unlocks? the visa|skilled-migration visas/i, label: 'visa outcome promise' },
  { re: /\b(7[34]|~7[34])\s*%\s*of (vietnamese )?candidates|one in four candidates/i, label: 'unsourced statistic' },
  { re: /100\s*%\s*IELTS[- ]aligned/i, label: 'absolute alignment claim' },
  { re: /(the )?head start that reaches band/i, label: 'band outcome headline' },
];

test('customer-facing copy contains no guarantee / credential / outcome-promise claims', () => {
  const hits: string[] = [];
  for (const root of ROOTS) {
    for (const f of files(root)) {
      readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
        if (NEGATION.test(line)) return;
        if (/^\s*(\*|\/\/|\/\*)/.test(line)) return;   // code comments are not customer copy
        for (const { re, label } of BANNED) if (re.test(line)) hits.push(`${f}:${i + 1} [${label}] ${line.trim().slice(0, 120)}`);
      });
    }
  }
  assert.deepEqual(hits, [], `Risky claims found:\n${hits.join('\n')}`);
});

test('the guard itself catches known-bad phrasing (self-test)', () => {
  const bad = ['built by IELTS professionals', 'Band 7 Guarantee on annual plans', 'Examiner-grade assessment framework', 'The band that unlocks the visa',
    'cam kết đạt band 7', '保证分数', '~73% of Vietnamese candidates never reach Band 7', '100% IELTS-aligned pathway'];
  for (const s of bad) assert.ok(!NEGATION.test(s) && BANNED.some(({ re }) => re.test(s)), `guard missed: ${s}`);
  const ok = ['Band goals are training targets, not score guarantees.', 'Mục tiêu band là lộ trình điển hình, không phải cam kết',
    '结果不作保证。', 'Jurassic English is independent and not endorsed by IELTS', 'we cannot guarantee its absolute security'];
  for (const s of ok) assert.ok(NEGATION.test(s) || !BANNED.some(({ re }) => re.test(s)), `false positive: ${s}`);
});
