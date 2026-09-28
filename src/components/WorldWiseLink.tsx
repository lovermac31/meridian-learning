/**
 * WorldWiseLink / LinkifyWorldWise — outbound links to the parent organisation's
 * website (WORLDWISE_SITE_URL).
 *
 * - Underlined by default so the link is distinguishable without relying on
 *   colour alone (WCAG 1.4.1); colour is inherited so it sits on light and dark
 *   surfaces alike.
 * - Opens in a new tab, announced to assistive technology.
 * - `rel="noopener noreferrer"` only — no `nofollow`: this is the site's own
 *   parent organisation, so the relationship should be followed.
 */
import type { ReactNode } from 'react';
import { WORLDWISE_SITE_URL } from '../lib/contactConfig';
import { splitOnWorldWise } from '../lib/worldwiseLink';

const LINK_CLASS =
  'rounded-sm underline decoration-1 underline-offset-2 transition-colors hover:text-jurassic-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent';

type WorldWiseLinkProps = {
  children: ReactNode;
  className?: string;
};

export const WorldWiseLink = ({ children, className = '' }: WorldWiseLinkProps) => (
  <a
    href={WORLDWISE_SITE_URL}
    target="_blank"
    rel="noopener noreferrer"
    className={`${LINK_CLASS} ${className}`.trim()}
  >
    {children}
    <span className="sr-only"> (opens in a new tab)</span>
  </a>
);

type LinkifyWorldWiseProps = {
  /** A UI string that may name the parent organisation. */
  text: string;
  className?: string;
};

/** Renders `text`, linking its first WorldWise Learning mention. */
export const LinkifyWorldWise = ({ text, className }: LinkifyWorldWiseProps) => {
  const parts = splitOnWorldWise(text);
  if (!parts) return <>{text}</>;
  return (
    <>
      {parts.before}
      <WorldWiseLink className={className}>{parts.brand}</WorldWiseLink>
      {parts.after}
    </>
  );
};
