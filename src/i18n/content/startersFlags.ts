/**
 * Starters Practice Tests: the two release flags (27 Nov 2026). Only Jay flips them, in a PR he merges. Both are now true.
 *
 * Tests 1 and 2 are normal live products from the launch PR (#383): they have no flag.
 *
 * STARTERS_TEST3_AND_SET_PUBLIC: Test 3 and the 3-test set went live on Jay's go (PR #384), without a recorded listen of the Test 3
 * tracks (his waiver). The Test 3 example clip is deliberately NOT in the repo; adding it is a separate step after a listen.
 *
 * STARTERS_VI_PUBLIC: the Vietnamese copy of the four products was read by a native speaker (Jay's wife, no corrections, 27 Nov 2026)
 * and is published. Set it back to false to return /vi/products/starters-* to the site's "Available soon" holding page (noindex).
 */
export const STARTERS_TEST3_AND_SET_PUBLIC = true; // Jay, 27 Nov 2026: "Make the Test 3 and set pages live". The Test 3 example clip is still NOT in the repo.
export const STARTERS_VI_PUBLIC = true; // Jay, 27 Nov 2026: native Vietnamese read done by his wife, no corrections: "Everything looks good."

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
