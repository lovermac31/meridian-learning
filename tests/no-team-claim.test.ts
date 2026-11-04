import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Jay's ruling, 2 Nov 2026: Jurassic English is a solo practice; lessons are taught one-to-one by Mr. Jay Adams.
const FILES = ['src/content/seoPages.json', 'src/content/seoPagesMeta.json', 'src/i18n/content/productSeo.ts', 'src/i18n/content/products.ts', 'src/lib/insightsContent.ts', 'src/i18n/content/home.ts', 'src/content/crawlResources.json', 'public/llms.txt', 'public/challenges/one-change/index.html'];
// The same claim in every language the site is published in (VI, ES, PT, ID, MS, TH, AR, UR, BN). Faculty-development and admissions "teams" (WorldWise, university offices) are different things and stay.
const TEAM_CLAIMS: Array<[string, RegExp]> = [
  ['vi', /đội ngũ giáo viên IELTS|đội ngũ của thầy Jay|đội ngũ giáo viên|cùng đội ngũ/i],
  ['es', /equipo de docentes profesionales/i],
  ['pt', /equipe de professores|equipe liderada por Mr\. Jay/i],
  ['id', /tim guru IELTS/i],
  ['ms', /pasukan guru IELTS/i],
  ['th', /ทีมครู IELTS/],
  ['ar', /فريقُ مستر جاي/],
  ['ur', /اساتذہ کی ٹیم/],
  ['bn', /শিক্ষকদের দল/],
  ['en', /Mr\. Jay (&amp;|&|and) the teaching team|Jurassic English teaching team|lessons with teachers/i],
];
test('"team of professional IELTS teachers" and "Mr. Jay\'s team" claims do not return', () => {
  for (const file of FILES) {
    const text = readFileSync(file, 'utf8');
    assert.doesNotMatch(text, /team of professional (IELTS )?teachers/i, file);
    assert.doesNotMatch(text, /Mr\. Jay(’|&#39;|')s team|Mr\. Jay\\'s team/i, file);
    for (const [lang, re] of TEAM_CLAIMS) assert.doesNotMatch(text, re, `${file} (${lang})`);
  }
});
