/**
 * Acceptance tests — the testimonials guardrails enforced as CI, not guidance.
 * Maps to build-brief §10. Run: npm run test:testimonials
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isPublishable,
  getPublishable,
  loadTestimonials,
  checkClaimDiscipline,
  assertClaimDiscipline,
  getMinorSafetyViolations,
  assertMinorSafe,
  buildAggregateRating,
  buildReviewSchema,
  buildReviewSchemaFromList,
  assertSchemaHonesty,
  MIN_REVIEWS_FOR_SCHEMA,
} from '../src/lib/testimonials';
import type { Testimonial } from '../src/types/testimonial';

/** Fixture builder — defaults to a safe, publishable, claim-clean text entry. */
function mk(o: Partial<Testimonial> = {}): Testimonial {
  return {
    id: 'fixture-id',
    status: 'published',
    consent: { granted: true, date: '2026-01-01', scope: 'text', record: 'consent-rec-1' },
    program: 'speaking-foundations',
    authorDisplay: 'Parent of a 10-year-old',
    locale: 'en',
    quote: 'My child speaks with more confidence now.',
    mediaType: 'text',
    verifiedBadge: true,
    dateGiven: '2026-01-01',
    ...o,
  };
}

test('§10.1 — seeded source examples are NEVER publishable (drafts/no-consent)', () => {
  assert.equal(getPublishable().length, 0);
  for (const t of loadTestimonials()) assert.equal(isPublishable(t), false, t.id);
});

test('§10.1 — isPublishable requires published + consent.granted + a consent record', () => {
  assert.equal(isPublishable(mk()), true);
  assert.equal(isPublishable(mk({ status: 'draft' })), false);
  assert.equal(isPublishable(mk({ status: 'verified' })), false);
  assert.equal(isPublishable(mk({ status: 'archived' })), false); // §10.8 revocation
  assert.equal(
    isPublishable(mk({ consent: { granted: false, date: '', scope: 'text', record: 'r' } })),
    false,
  );
  assert.equal(
    isPublishable(mk({ consent: { granted: true, date: '', scope: 'text', record: '' } })),
    false,
  );
});

test('§10.4 — claim-discipline flags guarantee / score-promise language (en/vi/zh)', () => {
  for (const bad of [
    'We guarantee band 8',
    'guaranteed results for every student',
    '100% pass, no exceptions',
    'My child was promised a band 7',
    'cam kết điểm cao cho con bạn',
    '保证8分',
    '包过',
  ]) {
    assert.equal(checkClaimDiscipline(bad).ok, false, `should flag: ${bad}`);
  }
  for (const good of [
    'My child speaks with more confidence.',
    'She reached band 7 in her own words and loves speaking now.',
    'Con tôi tự tin hơn nhiều khi nói.',
    '孩子现在敢开口表达了。',
  ]) {
    assert.equal(checkClaimDiscipline(good).ok, true, `should pass: ${good}`);
  }
  assert.throws(() => assertClaimDiscipline([mk({ quote: 'We guarantee a band 8' })]));
  assert.doesNotThrow(() => assertClaimDiscipline([mk()]));
});

test('§10.2 — minor-safety flags school/grade, email, phone, and media beyond scope', () => {
  assert.deepEqual(getMinorSafetyViolations(mk()), []);
  assert.ok(getMinorSafetyViolations(mk({ authorDisplay: 'Minh, grade 6 at ABC School' })).length > 0);
  assert.ok(getMinorSafetyViolations(mk({ authorDisplay: 'parent contact a@b.com' })).length > 0);
  assert.ok(getMinorSafetyViolations(mk({ authorDisplay: 'reach me at 0987 654 321' })).length > 0);
  // image without photo consent
  assert.ok(
    getMinorSafetyViolations(
      mk({ mediaType: 'image', consent: { granted: true, date: '', scope: 'text', record: 'r' } }),
    ).length > 0,
  );
  // video without video consent
  assert.ok(
    getMinorSafetyViolations(
      mk({ mediaType: 'video', consent: { granted: true, date: '', scope: 'text+photo', record: 'r' } }),
    ).length > 0,
  );
  // image WITH photo consent is allowed
  assert.deepEqual(
    getMinorSafetyViolations(
      mk({ mediaType: 'image', consent: { granted: true, date: '', scope: 'text+photo', record: 'r' } }),
    ),
    [],
  );
  assert.throws(() =>
    assertMinorSafe([mk({ mediaType: 'video', consent: { granted: true, date: '', scope: 'text', record: 'r' } })]),
  );
  assert.doesNotThrow(() => assertMinorSafe([mk()]));
});

test(`§10.3 — Review/AggregateRating emits ONLY with ≥ ${MIN_REVIEWS_FOR_SCHEMA} verified ratings`, () => {
  // Live source has 0 publishable rated → no schema (honest).
  assert.equal(buildReviewSchema(), null);
  // Below threshold → null.
  assert.equal(buildAggregateRating([mk({ rating: 5 }), mk({ rating: 4 })]), null);
  assert.equal(buildReviewSchemaFromList([mk({ rating: 5 }), mk({ rating: 4 })]), null);
  // At/above threshold → schema with honest aggregate.
  const schema = buildReviewSchemaFromList([
    mk({ id: 'a', rating: 5 }),
    mk({ id: 'b', rating: 4 }),
    mk({ id: 'c', rating: 5 }),
  ]);
  assert.ok(schema, 'expected schema at threshold');
  assert.equal(schema!.reviews.length, 3);
  assert.equal(schema!.aggregateRating.reviewCount, 3);
  assert.equal(schema!.aggregateRating.ratingValue, 4.7);
  assert.equal(schema!.aggregateRating.bestRating, 5);
  assert.equal((schema!.reviews[0] as Record<string, unknown>)['@type'], 'Review');
});

test('§10.3 — assertSchemaHonesty passes for the live source (no schema emitted)', () => {
  assert.doesNotThrow(() => assertSchemaHonesty());
});

test('§10.7 / §10.8 — locale/program filters narrow; archived never publishes', () => {
  assert.deepEqual(getPublishable({ locale: 'vi' }), []);
  assert.deepEqual(getPublishable({ program: 'ielts-reasoning-lab' }), []);
  assert.equal(isPublishable(mk({ status: 'archived' })), false);
});
