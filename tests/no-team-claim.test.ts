import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Jay's ruling, 2 Nov 2026: Jurassic English is a solo practice; lessons are taught one-to-one by Mr. Jay Adams.
const FILES = ['src/content/seoPages.json', 'src/content/seoPagesMeta.json', 'src/i18n/content/productSeo.ts', 'src/i18n/content/products.ts', 'src/lib/insightsContent.ts'];
test('"team of professional IELTS teachers" and "Mr. Jay\'s team" claims do not return', () => {
  for (const file of FILES) {
    const text = readFileSync(file, 'utf8');
    assert.doesNotMatch(text, /team of professional (IELTS )?teachers/i, file);
    assert.doesNotMatch(text, /Mr\. Jay(’|&#39;|')s team/i, file);
  }
});
