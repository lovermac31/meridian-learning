import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SearchInsightsPage } from '../src/components/SearchInsightsPage';
import { insightArticles, getInsightArticleBySlug, getPublishedInsightArticles } from '../src/lib/insightsContent';
import { getExpectedPublicIndexableRoutes, getPrerenderRoutes, resolveRouteMetadata } from '../src/lib/routeMetadata';

const slug = 'online-ielts-speaking-coaching';
const route = `/insights/${slug}`;
const render = (pathname = route) => renderToStaticMarkup(createElement(SearchInsightsPage, {
  pathname,
  onNavigate: () => { throw new Error('SSR must not navigate'); },
}));
const body = (html: string) => html.split('<aside')[0];

test('adult buyer guide has an explicit SSR body and an honest ordered acquisition path', () => {
  const html = body(render());
  assert.match(html, /<h1[^>]*>Online IELTS Speaking Coaching for Adults: A Buyer Guide<\/h1>/);
  for (const phrase of [
    'adults aged 18+', 'initially in Vietnam', 'Adults overseas',
    'payment support and timezone compatibility',
    'not the young-learner programme or a parent enquiry page',
    'not a free personalised speaking assessment or an IELTS band score',
    'not an official IELTS result', 'Any practice band estimate is provisional',
    'There are no score guarantees', 'does not imply IELTS endorsement',
    'Typed practice can show', 'cannot establish pronunciation',
    'One session cannot establish lasting improvement',
    'Current price, currency, accepted payment methods',
    'Cancellation, rescheduling and refund terms',
    'A baseline does not oblige you to buy further lessons',
  ]) assert.ok(html.includes(phrase), `SSR contains: ${phrase}`);
  const free = html.indexOf('1. Start with free independent practice');
  const baseline = html.indexOf('2. Consider a paid live speaking baseline');
  const coaching = html.indexOf('3. Decide whether one-to-one coaching fits');
  assert.ok(free >= 0 && baseline > free && coaching > baseline);
  assert.doesNotMatch(html, /<h2[^>]*>1\. Review the evidence/);
});

test('CTAs are crawlable, untracked and do not fabricate commercial terms', () => {
  const html = body(render());
  for (const [href, label] of [
    ['/challenges/one-change', 'Try the free One Change practice challenge'],
    ['/ai-speaking/baseline', 'Review the paid live Speaking Baseline and booking details'],
    ['/ai-speaking/solutions', 'Review one-to-one coaching options and booking details'],
  ]) assert.ok(html.includes(`<a href="${href}">${label}</a>`));
  assert.doesNotMatch(html, /utm_|onclick=|\b(?:PayPal|Stripe|Visa|Mastercard)\b|\d[\d,.]*\s*(?:₫|VND|USD)|\$\d/i);
  assert.doesNotMatch(html, /free (?:live )?baseline|certified IELTS examiner|guaranteed band \d|available (?:today|24\/7)/i);
  assert.match(html, /href="https:\/\/ielts\.org\/take-a-test\/test-types\/ielts-academic-test\/ielts-academic-format-speaking"/);
  assert.match(html, /href="https:\/\/ielts\.org\/cdn\/ielts-guides\/ielts-speaking-key-assessment-criteria\.pdf"/);
});

test('every released article renders its own nonempty body, not a fallback', () => {
  const bodies = getPublishedInsightArticles().map((article) => {
    const html = body(render(`/insights/${article.slug}`));
    assert.doesNotMatch(html, /This article body is not available/);
    assert.match(html, /<h2/);
    return html.slice(html.indexOf('<h2'));
  });
  assert.equal(new Set(bodies).size, bodies.length, 'article bodies are distinct');
  const html = render('/insights/not-a-real-article');
  assert.doesNotMatch(html, /<h2[^>]*>1\. Review the evidence/);
});

test('a future article without an explicit body cannot inherit another article body', () => {
  const source = getInsightArticleBySlug(slug);
  assert.ok(source);
  insightArticles.push({ ...source, slug: 'future-body-not-written', title: 'Future article' });
  try {
    const html = body(render('/insights/future-body-not-written'));
    assert.match(html, /This article body is not available/);
    assert.doesNotMatch(html, /Who this guide is for|1\. Review the evidence|What text can show/);
  } finally {
    insightArticles.pop();
  }
});

test('adult route inherits English canonical, description, Article schema and prerender discovery', () => {
  const article = getInsightArticleBySlug(slug);
  assert.ok(article);
  assert.equal(article.datePublished, '2026-10-14');
  assert.ok(getExpectedPublicIndexableRoutes().includes(route));
  assert.ok(getPrerenderRoutes().includes(route));
  const metadata = resolveRouteMetadata(route);
  assert.equal(metadata.title, `${article.title} | Jurassic English™`);
  assert.equal(metadata.description, article.description);
  assert.equal(metadata.canonical, `https://jurassicenglish.com${route}`);
  assert.equal(metadata.robots, 'index, follow');
  assert.equal(metadata.htmlLang, 'en');
  assert.equal(metadata.og.url, metadata.canonical);
  const schema = metadata.jsonLd?.find((item) => item['@type'] === 'BlogPosting');
  assert.ok(schema);
  assert.equal(schema.headline, article.title);
  assert.equal(schema.datePublished, article.datePublished);
  assert.equal(schema.url, metadata.canonical);
  assert.deepEqual(schema.author, { '@type': 'Organization', name: article.authorName });
  assert.equal(resolveRouteMetadata(`/vi${route}`).robots, 'noindex, nofollow');
  assert.ok(!getExpectedPublicIndexableRoutes().includes(`/vi${route}`));
});

test('insights index discovers adult guide with bounded repeated-card styling', () => {
  const html = render('/insights');
  assert.match(html, /href="\/insights\/online-ielts-speaking-coaching"/);
  assert.match(html, /rounded-lg/);
  assert.doesNotMatch(html, /rounded-2xl/);
  assert.match(render(), /text-3xl[^\"]*sm:text-4xl/);
});
