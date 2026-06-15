/**
 * Phase 2 mount/behavior tests — the testimonials section is rendered to static
 * markup (no DOM needed) and asserted. Verifies the flag gate, the honest empty
 * state, no fabricated/draft content, no review schema, a11y, and locale copy.
 * Run via: npm run test:testimonials
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TestimonialsSection } from '../src/components/TestimonialsSection';
import { buildReviewSchema, getPublishable } from '../src/lib/testimonials';
import type { TestimonialLocale } from '../src/types/testimonial';

function render(enabled: boolean, locale: TestimonialLocale = 'en'): string {
  const prev = process.env.VITE_TESTIMONIALS_ENABLED;
  process.env.VITE_TESTIMONIALS_ENABLED = enabled ? 'true' : 'false';
  try {
    return renderToStaticMarkup(createElement(TestimonialsSection, { locale }));
  } finally {
    if (prev === undefined) delete process.env.VITE_TESTIMONIALS_ENABLED;
    else process.env.VITE_TESTIMONIALS_ENABLED = prev;
  }
}

test('§2.1/2.9 — flag OFF (default) renders no testimonial surface', () => {
  assert.equal(render(false), '');
});

test('§2.2/2.3 — flag ON with no publishable → honest empty state, no fabricated/draft content', () => {
  const html = render(true, 'en');
  assert.match(html, /je-testimonials-empty/);
  assert.match(html, /Real results, shared with consent/); // empty-state title
  assert.match(html, /Book a free evaluation/); // CTA
  // No seeded draft quotes/markers leak into the DOM.
  assert.doesNotMatch(html, /translate every sentence/);
  assert.doesNotMatch(html, /example/i);
  // No published list rendered (no real entries exist).
  assert.doesNotMatch(html, /je-testimonial-card/);
});

test('§2.4/2.5 — section emits NO review schema; buildReviewSchema is null on seed', () => {
  const html = render(true, 'en');
  assert.doesNotMatch(html, /"@type":\s*"Review"/);
  assert.doesNotMatch(html, /AggregateRating/);
  assert.doesNotMatch(html, /reviewRating/);
  assert.equal(buildReviewSchema(), null);
  assert.equal(getPublishable().length, 0);
});

test('§2.6 — empty state is accessible (heading, aria-label, labelled external CTA)', () => {
  const html = render(true, 'en');
  assert.match(html, /<h2/);
  assert.match(html, /aria-label="Parent testimonials"/);
  assert.match(html, /class="t-cta"/);
  assert.match(html, />Book a free evaluation</);
  assert.match(html, /target="_blank"/);
  assert.match(html, /rel="noopener"/);
});

test('§2 — empty-state copy is localized en/vi/zh-CN', () => {
  assert.match(render(true, 'en'), /Real results, shared with consent/);
  assert.match(render(true, 'vi'), /Kết quả thật/);
  assert.match(render(true, 'zh-CN'), /真实结果/);
});
