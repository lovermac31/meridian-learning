import { useEffect, useState } from 'react';
import type { Locale } from '../i18n/locales';
import { storyClubOfferLine, storyClubScheduleLine } from '../config/storyClubOffer';

/** `null` on the server and on the first client render (so prerendered HTML and hydration match), the real time after mount. */
export function useNow(): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => { setNow(new Date()); }, []);
  return now;
}

/**
 * The first-session and dated-offer sentences. Prerendered, they state the whole plan (always true when read).
 * In the browser they drop what has already passed, so no deploy is needed after 14 Nov or 21 Nov.
 */
export function StoryClubLiveLine({ locale, kind }: { locale: Locale; kind: 'schedule' | 'offer' | 'both' }) {
  const now = useNow() ?? undefined;
  const parts = [kind !== 'offer' ? storyClubScheduleLine(locale, now) : '', kind !== 'schedule' ? storyClubOfferLine(locale, now) : ''];
  return <>{parts.filter(Boolean).join(' ')}</>;
}
