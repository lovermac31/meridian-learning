import { STARTERS_HELD_IDS, STARTERS_TEST3_AND_SET_PUBLIC } from '../../src/i18n/content/startersFlags';

// Explicit exceptions for the Starters products held behind STARTERS_TEST3_AND_SET_PUBLIC (Test 3 and the 3-test set). Tests 1 and 2 are
// live products from the launch PR and get no exception; all other product assertions remain strict. When Jay flips the flag the
// list is empty, so every held product is tested like any other live product.
export const DRAFT_HIDDEN_PRODUCT_IDS: readonly string[] = STARTERS_TEST3_AND_SET_PUBLIC ? [] : STARTERS_HELD_IDS;

// The held products' sample assets are in the repo (watermarked pages only) while their cards are not live.
export const isDraftHiddenSampleAsset = (filename: string): boolean =>
  DRAFT_HIDDEN_PRODUCT_IDS.some(id => filename === `${id}-text.json`
    || new RegExp(`^${id}-p(?:[123]|g\\d{2})\\.webp$`).test(filename));
