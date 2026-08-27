/**
 * PreferredSourceButton — invites users to add Jurassic English as a Google
 * "Preferred Source". See src/lib/preferredSource.ts for the integration model.
 *
 * Accessibility & graceful failure:
 *  - Always a real <a> to the documented deeplink, so it works with JS disabled
 *    and with no third-party script / CSP change.
 *  - When the optional publisher.js enhancement is enabled AND loads, the click
 *    upgrades to Google's in-page opt-in flow; otherwise the deeplink opens.
 *  - Honest, non-ranking copy (Google's framing): it personalises Top Stories /
 *    AI surfaces for users who opt in — never claims a ranking boost.
 */
import { useEffect, useRef } from 'react';
import { Star, ArrowUpRight } from 'lucide-react';
import {
  ensurePreferredSource,
  PREFERRED_SOURCE_DEEPLINK,
  type PreferredSourceApi,
} from '../lib/preferredSource';
import { trackPreferredSourceClick, type PreferredSourcePlacement } from '../lib/analytics';

type Props = {
  /** Where this instance renders — used for analytics + the Google popup theme. */
  placement: PreferredSourcePlacement;
  /** `compact` = single pill (footer); `full` = self-contained dark band (page). */
  variant?: 'compact' | 'full';
  /** Theme passed to the Google in-page flow when enhanced. */
  theme?: 'light' | 'dark';
  /** Overrides the default heading (full variant only). */
  heading?: string;
  /** Overrides the default supporting copy (full variant only). */
  description?: string;
  /** Overrides the button label. */
  label?: string;
  className?: string;
};

const DEFAULT_HEADING = 'Prefer Jurassic English on Google';
const DEFAULT_DESCRIPTION =
  'Add Jurassic English as one of your preferred sources so our academic-English and reasoning insights surface more prominently in your Google experience.';
const DEFAULT_LABEL = 'Add as a preferred source';

export const PreferredSourceButton = ({
  placement,
  variant = 'compact',
  theme = 'dark',
  heading = DEFAULT_HEADING,
  description = DEFAULT_DESCRIPTION,
  label = DEFAULT_LABEL,
  className = '',
}: Props) => {
  // Lazily prepares the optional in-page flow; resolves null (deeplink mode)
  // when the enhancement is disabled or the script is unavailable.
  const apiRef = useRef<PreferredSourceApi | null>(null);
  useEffect(() => {
    let alive = true;
    ensurePreferredSource({ theme }).then((api) => {
      if (alive) apiRef.current = api;
    });
    return () => {
      alive = false;
    };
  }, [theme]);

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    trackPreferredSourceClick({ placement, variant });
    if (apiRef.current) {
      // Enhanced: Google's in-page opt-in flow. If it throws, fall through to
      // the deeplink by not preventing default.
      try {
        event.preventDefault();
        apiRef.current.addPreferredSource();
      } catch {
        window.open(PREFERRED_SOURCE_DEEPLINK, '_blank', 'noopener,noreferrer');
      }
    }
    // Default (deeplink mode): let the <a> open the deeplink in a new tab.
  };

  const anchor = (extraClass: string) => (
    <a
      href={PREFERRED_SOURCE_DEEPLINK}
      target="_blank"
      rel="noopener noreferrer nofollow"
      onClick={handleClick}
      aria-label={`${label} on Google (opens Google in a new tab)`}
      className={extraClass}
    >
      <Star aria-hidden="true" className="w-4 h-4 shrink-0" />
      <span>{variant === 'compact' ? heading : label}</span>
      <ArrowUpRight aria-hidden="true" className="w-4 h-4 shrink-0 opacity-70" />
    </a>
  );

  if (variant === 'compact') {
    return anchor(
      `inline-flex items-center gap-2 rounded-full border border-jurassic-gold/40 bg-jurassic-gold/5 px-4 py-2 text-sm font-medium text-jurassic-gold transition-colors duration-200 hover:border-jurassic-gold/70 hover:bg-jurassic-gold/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-gold focus-visible:ring-offset-2 focus-visible:ring-offset-jurassic-dark ${className}`,
    );
  }

  return (
    <section
      aria-labelledby="preferred-source-heading"
      className={`bg-jurassic-dark border-t border-white/5 ${className}`}
    >
      <div className="max-w-3xl mx-auto px-6 py-12 md:py-14 text-center">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-jurassic-gold/80">
          Follow our work
        </p>
        <h2
          id="preferred-source-heading"
          className="text-2xl md:text-3xl font-sans font-semibold tracking-tight text-white"
        >
          {heading}
        </h2>
        <p className="mt-3 mx-auto max-w-xl text-sm md:text-base leading-relaxed font-light text-white/65">
          {description}
        </p>
        <div className="mt-6 flex justify-center">
          {anchor(
            'inline-flex items-center gap-2 rounded-full border border-jurassic-gold/50 bg-jurassic-gold/10 px-6 py-3 text-sm font-semibold text-jurassic-gold transition-colors duration-200 hover:border-jurassic-gold hover:bg-jurassic-gold/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-gold focus-visible:ring-offset-2 focus-visible:ring-offset-jurassic-dark',
          )}
        </div>
      </div>
    </section>
  );
};
