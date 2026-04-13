import { MessageCircle } from 'lucide-react';
import { WORLDWISE_ZALO_HREF } from '../lib/contactConfig';

type ZaloContactCtaProps = {
  /** Button label — supply from VI_CTA.zaloLabel or a custom string. */
  label: string;
  /** Optional extra class names applied to the anchor element. */
  className?: string;
};

/**
 * Reusable Zalo CTA button for Vietnamese institutional pages.
 *
 * Renders as an accessible anchor (opens in a new tab) pointing to the
 * WorldWise Learning Zalo profile. Always includes visible Zalo icon and
 * meets WCAG 2.1 AA touch-target sizing (min 44×44 px).
 *
 * Usage:
 *   <ZaloContactCta label={VI_CTA.zaloLabel} />
 */
export function ZaloContactCta({ label, className = '' }: ZaloContactCtaProps) {
  return (
    <a
      href={WORLDWISE_ZALO_HREF}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} (mở Zalo)`}
      className={[
        'inline-flex items-center justify-center gap-2.5',
        'min-h-[44px] rounded-full px-6 py-3',
        'border border-[#0068FF]/30 bg-[#0068FF]/8',
        'text-sm font-semibold text-[#3a9bff]',
        'transition hover:border-[#0068FF]/55 hover:bg-[#0068FF]/14 hover:text-[#5ab0ff]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0068FF] focus-visible:ring-offset-2',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Zalo-brand blue icon mark */}
      <span
        className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0068FF] text-white"
        aria-hidden="true"
      >
        <MessageCircle className="h-3 w-3" />
      </span>
      <span>{label}</span>
    </a>
  );
}
