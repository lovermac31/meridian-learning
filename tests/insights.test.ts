import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createArticleJsonLd,
  createPersonJsonLd,
  INSIGHTS_BASE_PATH,
} from '../src/lib/structuredData';
import {
  insightArticles,
  getPublishedInsightArticles,
  getInsightArticleBySlug,
  getInsightRoutePaths,
} from '../src/lib/insightsContent';

const ORG_ID = 'https://jurassicenglish.com/#organization';

test('createArticleJsonLd emits a valid Article graph tied to the canonical org', () => {
  const ld = createArticleJsonLd({
    headline: 'Why Fluent English Is Not the Same as Academic English',
    description: 'Fluency is not reasoning. Here is the difference and why it matters.',
    slug: 'fluent-vs-academic-english',
    datePublished: '2026-01-15',
    image: '/images/insights/fluent-vs-academic.webp',
    authorName: 'A. Educator',
    section: 'Academic English',
  });
  assert.equal(ld['@context'], 'https://schema.org');
  assert.equal(ld['@type'], 'BlogPosting'); // default subtype
  assert.equal(ld.headline, 'Why Fluent English Is Not the Same as Academic English');
  // dateModified defaults to datePublished
  assert.equal(ld.dateModified, '2026-01-15');
  // image + url are absolutised
  assert.equal(ld.image, 'https://jurassicenglish.com/images/insights/fluent-vs-academic.webp');
  assert.equal(ld.url, 'https://jurassicenglish.com/insights/fluent-vs-academic-english');
  // publisher references the canonical org @id (not a duplicated node)
  assert.deepEqual(ld.publisher, { '@id': ORG_ID });
  // mainEntityOfPage @id matches the article URL
  assert.deepEqual(ld.mainEntityOfPage, {
    '@type': 'WebPage',
    '@id': 'https://jurassicenglish.com/insights/fluent-vs-academic-english',
  });
  // author is a real Person supplied by content (never fabricated by the builder)
  assert.deepEqual(ld.author, { '@type': 'Person', name: 'A. Educator' });
  assert.equal(ld.articleSection, 'Academic English');
  // round-trips as clean JSON (no undefined leaking into required fields)
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(ld)));
});

test('createArticleJsonLd honours subtype + explicit dateModified + author url', () => {
  const ld = createArticleJsonLd({
    headline: 'H', description: 'D', slug: 's',
    datePublished: '2026-02-01', dateModified: '2026-03-02',
    image: 'https://cdn.example.com/x.jpg',
    authorName: 'Author', authorUrl: '/insights/author/author',
    articleType: 'Article',
  });
  assert.equal(ld['@type'], 'Article');
  assert.equal(ld.dateModified, '2026-03-02');
  assert.equal(ld.image, 'https://cdn.example.com/x.jpg'); // already absolute → untouched
  assert.deepEqual(ld.author, {
    '@type': 'Person', name: 'Author',
    url: 'https://jurassicenglish.com/insights/author/author',
  });
});

test('createPersonJsonLd ties the author to the org and omits unset optionals', () => {
  const ld = createPersonJsonLd({ name: 'Author', slug: 'author' });
  assert.equal(ld['@type'], 'Person');
  assert.equal(ld['@id'], 'https://jurassicenglish.com/insights/author/author#person');
  assert.deepEqual(ld.worksFor, { '@id': ORG_ID });
  assert.equal('sameAs' in ld, false); // never invents profiles
  assert.equal('jobTitle' in ld, false);
});

test('insights ships dark: no fabricated content, no indexable routes', () => {
  assert.equal(INSIGHTS_BASE_PATH, '/insights');
  assert.equal(insightArticles.length, 0);
  assert.deepEqual(getPublishedInsightArticles(), []);
  assert.deepEqual(getInsightRoutePaths(), []); // → nothing added to sitemap/prerender
  assert.equal(getInsightArticleBySlug('anything'), undefined);
});
