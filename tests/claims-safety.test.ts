/**
 * Claims-safety guard for ALL customer-facing copy (EN + VI + ZH): page copy, route metadata,
 * structured data, static pages and transactional emails.
 *
 * Why: score guarantees, unverified credentials ("examiner-built", "former IELTS examiner",
 * "accredited"), implied endorsement / partnership, outcome promises (visas, admissions, pass rates)
 * and unsourced statistics are consumer-protection and trademark risks. The site frames bands as
 * TARGETS and states independence from IELTS / IDP / British Council / Cambridge.
 *
 * Negation is judged PER MATCH (a negation word shortly before the claim, in the same sentence),
 * not per line, so "not score guarantees" passes while "… not endorsed. Band 7 guaranteed!" fails.
 * Code comments are ignored (they are not customer copy).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

// src/lib = route metadata (Google description, social cards) + structured data; api/_lib = emails.
const ROOTS = ['src/i18n/content', 'src/yl', 'src/components', 'src/lib', 'api/_lib', 'young-learners-speaking', 'index.html', 'public'];
const EXT = /\.(ts|tsx|json|html|txt)$/; // .txt: public/llms.txt is customer-facing copy for AI crawlers

function files(p: string): string[] {
  if (!existsSync(p)) return [];
  const st = statSync(p);
  if (st.isFile()) return EXT.test(p) ? [p] : [];
  return readdirSync(p).flatMap((f) => files(join(p, f)));
}

const BANNED: { re: RegExp; label: string }[] = [
  { re: /\bguarantee(d|s)?\b/gi, label: 'guarantee' },
  { re: /money[- ]back/gi, label: 'money-back promise' },
  { re: /(đảm bảo|bảo đảm|cam kết)\s*(đạt\s*|đầu ra\s*)?(điểm|band|\d)/gi, label: 'vi: score/band guarantee' },
  { re: /cam kết đầu ra|bao đậu|bao đỗ/gi, label: 'vi: outcome guarantee' },
  { re: /保证(分数|成绩|达到|通过)|承诺(分数|成绩)|包过|保分/g, label: 'zh: score guarantee' },
  { re: /examiner[- ](grade|built|led|designed)/gi, label: 'examiner credential' },
  { re: /(former|ex-?|certified|official|trained) IELTS examiners?|IELTS[- ]examiner[- ]built|(graded|built|designed) by IELTS (professionals|examiners)/gi, label: 'examiner credential' },
  { re: /(前|资深)雅思考官|cựu giám khảo IELTS/g, label: 'examiner credential (vi/zh)' },
  { re: /\baccredited\b(?! (providers?|programmes?|qualifications?|courses?))|\bwe are accredited\b/gi, label: 'accreditation claim' },
  { re: /\bendorsed by\b|\bofficial (IELTS )?partner\b|authori[sz]ed (IELTS )?(test )?(centre|center|partner)/gi, label: 'endorsement / partnership' },
  { re: /unlocks? the visa|skilled-migration visas/gi, label: 'visa outcome promise' },
  { re: /\b\d{1,3}\s*%\s*of (our |vietnamese )?(students|learners|candidates|graduates)|one in four candidates/gi, label: 'unsourced statistic' },
  { re: /\b\d{1,3}\s*%\s*(pass|success) rate/gi, label: 'pass-rate claim' },
  { re: /100\s*%\s*IELTS[- ]aligned/gi, label: 'absolute alignment claim' },
  { re: /(the )?head start that reaches band/gi, label: 'band outcome headline' },
];

// A negation shortly BEFORE the match (same sentence) turns a claim into a disclaimer.
const NEG_BEFORE = /(\bno\b|\bnot\b|\bnever\b|\bwithout\b|\bcannot\b|can't|\bnor\b|không|chưa|chẳng|\bunlike\b|未|不|非|无|而非)[^.!?。！？]{0,45}$/i;

export function findClaims(text: string): string[] {
  const hits: string[] = [];
  for (const { re, label } of BANNED) {
    re.lastIndex = 0;
    for (let m = re.exec(text); m; m = re.exec(text)) {
      const before = text.slice(Math.max(0, m.index - 60), m.index);
      if (NEG_BEFORE.test(before)) continue;
      // A question ("Is Jurassic English endorsed by IELTS?") asks, it does not claim.
      const rest = text.slice(m.index);
      const end = rest.search(/[.!?。！？]/);
      if (end >= 0 && /[?？]/.test(rest[end])) continue;
      hits.push(`[${label}] …${text.slice(Math.max(0, m.index - 40), m.index + m[0].length + 30).replace(/\s+/g, ' ')}…`);
    }
  }
  return hits;
}

test('customer-facing copy contains no guarantee / credential / endorsement / outcome-promise claims', () => {
  const hits: string[] = [];
  for (const root of ROOTS) {
    for (const f of files(root)) {
      readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
        if (/^\s*(\*|\/\/|\/\*)/.test(line)) return;                 // code comments are not customer copy
        if (/\bre:\s*\/.*\/[gimsuy]*\s*,\s*label:/.test(line)) return; // lint-rule definitions (testimonials.ts)
        for (const h of findClaims(line)) hits.push(`${f}:${i + 1} ${h}`);
      });
    }
  }
  assert.deepEqual(hits, [], `Risky claims found:\n${hits.join('\n')}`);
});

test('the guard catches known-bad phrasing and allows disclaimers (self-test)', () => {
  const bad = [
    'Band 7 Guarantee on annual plans', 'Examiner-grade assessment framework', 'The band that unlocks the visa',
    'cam kết đạt band 7', 'Cam kết đầu ra 7.0', '保证分数', '包过', '前雅思考官授课', '~73% of Vietnamese candidates never reach Band 7',
    '100% IELTS-aligned pathway', 'built by IELTS professionals', 'Money back if you fail', 'Taught by a former IELTS examiner',
    'Endorsed by the British Council', '95% of our students reach Band 7', 'Flint Academy guarantees Band 7',
    'We are an official IELTS partner', 'Jurassic English is not endorsed by IELTS. Band 7 guaranteed!', '98% pass rate',
    'Why wait? We are endorsed by the British Council.',
  ];
  for (const s of bad) assert.ok(findClaims(s).length > 0, `guard missed: ${s}`);
  const ok = [
    'Band goals are training targets, not score guarantees.', 'Mục tiêu band là lộ trình điển hình, không phải cam kết về điểm số.',
    '结果不作保证。', '分数目标是训练目标，而非分数保证。', 'Jurassic English is independent and not endorsed by IELTS, IDP, British Council or Cambridge.',
    'we cannot guarantee its absolute security', 'Delivered through UK-accredited providers', 'We do not claim guaranteed IELTS results.',
    'không được IELTS, IDP, British Council hay Cambridge bảo trợ',
    'Is Jurassic English officially endorsed by IELTS, Cambridge, British Council, or IDP?',
  ];
  for (const s of ok) assert.deepEqual(findClaims(s), [], `false positive: ${s}`);
});
