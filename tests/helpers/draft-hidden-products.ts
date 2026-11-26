// Explicit exceptions for unreleased Starters previews; all other product assertions remain strict.
export const DRAFT_HIDDEN_PRODUCT_IDS: readonly string[] = [
  'starters-practice-test-1',
  'starters-practice-test-2',
];

export const isDraftHiddenSampleAsset = (filename: string): boolean =>
  DRAFT_HIDDEN_PRODUCT_IDS.some(id => filename === `${id}-text.json`
    || new RegExp(`^${id}-p(?:[123]|g\\d{2})\\.webp$`).test(filename));
