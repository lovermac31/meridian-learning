/**
 * worldwiseLink — locates the parent-organisation name inside a UI string so
 * the renderer can turn that mention into a link to the WorldWise Learning site.
 *
 * Both spellings in use across the site are recognised ("World Wise Learning",
 * "WorldWise Learning"). Only the FIRST mention in a string is returned: one
 * link per line of copy is enough, and it keeps legal/attribution lines from
 * becoming a row of identical links.
 *
 * Deliberately does NOT match the e-mail domain (`legal@worldwiselearning.com`):
 * that is a mailbox on a different TLD, not a reference to the website.
 */
const BRAND_PATTERN = /World ?Wise Learning/;

export type BrandSplit = {
  /** Text before the brand mention. */
  before: string;
  /** The brand mention exactly as written in the source string. */
  brand: string;
  /** Text after the brand mention (e.g. " Ltd", ". All rights reserved."). */
  after: string;
};

/** Split `text` around its first WorldWise Learning mention, or null if none. */
export function splitOnWorldWise(text: string): BrandSplit | null {
  const match = BRAND_PATTERN.exec(text);
  if (!match) return null;
  return {
    before: text.slice(0, match.index),
    brand: match[0],
    after: text.slice(match.index + match[0].length),
  };
}
