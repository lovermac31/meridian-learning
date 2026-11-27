/**
 * Starters Practice Tests: the two release flags (27 Nov 2026). Both default to false and only Jay flips them, in a PR he merges.
 *
 * Tests 1 and 2 are normal live products (EN) from the launch PR: they have no flag.
 *
 * STARTERS_TEST3_AND_SET_PUBLIC (D3): Test 3 and the 3-test set stay `live: false` (no card, no page, no sitemap entry, no llms line,
 * no search result) until Jay has listened to the Test 3 listening tracks. Flip it only after that. The Test 3 example clip is
 * deliberately NOT in the repo; re-adding it is a separate step after the same listen.
 *
 * STARTERS_VI_PUBLIC: the Vietnamese copy of the four products is a machine draft with no native read. While false, no /vi page,
 * /vi card, Vietnamese JSON-LD or hreflang alternate exists for them; /vi/products/starters-* shows the site's standard "Available soon"
 * holding page (noindex). Flip it only after a native Vietnamese read of every Starters line in products.ts and productSeo.ts.
 */
export const STARTERS_TEST3_AND_SET_PUBLIC = true; // Jay, 27 Nov 2026: "Make the Test 3 and set pages live". The Test 3 example clip is still NOT in the repo.
export const STARTERS_VI_PUBLIC = false;

export const STARTERS_TEST_IDS = ['starters-practice-test-1', 'starters-practice-test-2', 'starters-practice-test-3'] as const;
export const STARTERS_SET_ID = 'starters-practice-tests-pack';
export const STARTERS_IDS: readonly string[] = [...STARTERS_TEST_IDS, STARTERS_SET_ID];
/** The ids held back by STARTERS_TEST3_AND_SET_PUBLIC. */
export const STARTERS_HELD_IDS: readonly string[] = ['starters-practice-test-3', STARTERS_SET_ID];

/** Is this Starters product shown to visitors at all (live)? Tests 1 and 2 always; Test 3 and the set only behind their flag. */
export const startersIsLive = (id: string): boolean => !STARTERS_HELD_IDS.includes(id) || STARTERS_TEST3_AND_SET_PUBLIC;

/** The Starters product a path names (/products/<id>, any locale prefix), or null. */
export const startersIdFromPath = (pathname: string): string | null => {
  const id = pathname.match(/^(?:\/vi)?\/products\/([^/]+)$/)?.[1];
  return id && STARTERS_IDS.includes(id) ? id : null;
};

/** True while the Vietnamese twin of this path must not be routed, indexed or listed. */
export const isStartersVietnameseHeld = (pathname: string): boolean => !STARTERS_VI_PUBLIC && startersIdFromPath(pathname) !== null;
