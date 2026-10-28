import { useEffect, useState, type FormEvent } from 'react';
import { ArrowRight, Check, MessageCircle } from 'lucide-react';
import { PRODUCTS_PATH, productSampleAnchor } from '../i18n/content/products';
import { contactKind, samplePackContent } from '../i18n/content/samplePack';
import { STORY_CLUB_ZALO } from '../i18n/content/storyClub';
import { getLocalizedHref } from '../i18n/localizedHref';
import { getCurrentLocale } from '../i18n/routing';
import { trackCtaClick } from '../lib/analytics';
import { recordClientEvent } from '../lib/tracker';
import { SAMPLE_PACK_ANCHOR } from '../lib/headerCta';
import { readVisitorSource } from '../lib/productsSource';
import { submitSamplePack } from '../lib/samplePackRequest';
import { PRIMARY_BTN } from './HomeOverhaul';

const FIELD =
  'mt-1 block w-full min-h-11 rounded-xl border border-sb-border bg-white px-3 py-2 text-base text-sb-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sb-amber';

type Status = 'idle' | 'sending' | 'sent' | 'failed';

/**
 * The free sample pack (website assessment, 27 Oct 2026): one form, one offer. Name and age are optional; a Zalo number
 * or an email and an explicit consent tick are required. The thank-you screen opens the view-only samples on /products
 * and offers one next step, Story Club on Zalo. `placement` names where it sits (home, products) for the lead record.
 */
export function SamplePackForm({ placement }: { placement: 'home' | 'products' }) {
  const locale = getCurrentLocale();
  const copy = samplePackContent[locale];
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState('');
  useEffect(() => setStartedAt(new Date().toISOString()), []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const contact = String(data.get('contact') ?? '');
    if (!contactKind(contact)) return setError(copy.errors.contact);
    if (data.get('consent') !== 'on') return setError(copy.errors.consent);
    setError(null);
    setStatus('sending');
    let source: string | null = null;
    try {
      source = readVisitorSource(window.location.search, window.sessionStorage);
    } catch {
      source = null;
    }
    try {
      await submitSamplePack({
        name: String(data.get('name') ?? ''),
        contact,
        childAge: String(data.get('childAge') ?? ''),
        teacher: data.get('teacher') === 'on',
        consent: true,
        locale,
        placement,
        source,
        website: String(data.get('website') ?? ''),
        startedAt,
      });
      setStatus('sent');
      recordClientEvent({ event: 'lead_submit' });
      try {
        trackCtaClick({ label: `sample_pack_submit_${placement}`, type: 'primary', segment: 'parent_student' });
      } catch {
        /* Measurement must not block the thank-you screen. */
      }
    } catch {
      setStatus('failed');
      setError(copy.errors.failed);
    }
  };

  return (
    <section id={SAMPLE_PACK_ANCHOR} className="scroll-mt-24 bg-sb-cream px-4 py-12 sm:px-6" aria-labelledby={`${SAMPLE_PACK_ANCHOR}-heading`}>
      <div className="mx-auto max-w-2xl rounded-[1.5rem] border border-sb-border bg-white p-5 shadow-warm sm:p-7">
        <h2 id={`${SAMPLE_PACK_ANCHOR}-heading`} className="text-2xl font-extrabold leading-tight text-sb-forest">{copy.heading}</h2>
        {status === 'sent' ? (
          <div className="mt-4" role="status">
            <p className="font-bold text-sb-forest">{copy.thanks.heading}</p>
            <ul className="mt-3 space-y-2">
              {copy.thanks.items.map((item) => (
                <li key={item.id}>
                  <a className="inline-flex items-center gap-2 font-bold text-sb-amber-deep underline underline-offset-4" href={`${getLocalizedHref(PRODUCTS_PATH, locale)}#${productSampleAnchor(item.id)}`} data-sample-pack={item.id}>
                    <Check aria-hidden="true" className="h-4 w-4" />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            <a
              className={`${PRIMARY_BTN} mt-5`}
              href={STORY_CLUB_ZALO}
              target="_blank"
              rel="noopener noreferrer"
              data-cta="sample-pack-zalo"
              onClick={() => recordClientEvent({ event: 'checkout_start', product_id: 'story-club' })}
            >
              <MessageCircle aria-hidden="true" className="h-4 w-4" />
              {copy.thanks.next}
            </a>
          </div>
        ) : (
          // Before hydration the submit button is disabled (startedAt is set by the first effect), so an early tap or Enter
          // cannot fall back to a native submit; method="post" keeps the contact out of any URL regardless (QA, 27 Oct 2026).
          <form method="post" className="mt-4 space-y-4" onSubmit={onSubmit} noValidate>
            <label className="block text-sm font-bold text-sb-forest">
              {copy.contact}
              <input className={FIELD} name="contact" type="text" inputMode="email" autoComplete="email" required maxLength={254} aria-describedby={error ? `${SAMPLE_PACK_ANCHOR}-error` : undefined} />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-bold text-sb-forest">
                {copy.name}
                <input className={FIELD} name="name" type="text" autoComplete="name" maxLength={120} />
              </label>
              <label className="block text-sm font-bold text-sb-forest">
                {copy.childAge}
                <input className={FIELD} name="childAge" type="text" inputMode="numeric" maxLength={2} pattern="[0-9]*" />
              </label>
            </div>
            <label className="flex items-center gap-3 text-sm text-sb-ink">
              <input type="checkbox" name="teacher" className="h-5 w-5 flex-none accent-sb-amber-deep" />
              <span>{copy.teacher}</span>
            </label>
            {/* Honeypot: people never see or fill it. */}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
            <label className="flex items-start gap-3 text-sm text-sb-ink">
              <input type="checkbox" name="consent" required className="mt-0.5 h-5 w-5 flex-none accent-sb-amber-deep" />
              <span>{copy.consent}</span>
            </label>
            {error ? <p id={`${SAMPLE_PACK_ANCHOR}-error`} className="text-sm font-bold text-red-700" role="alert">{error}</p> : null}
            <button type="submit" className={PRIMARY_BTN} disabled={!startedAt || status === 'sending'}>
              {status === 'sending' ? copy.sending : copy.submit}
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </button>
            <p className="text-xs text-sb-slate">
              {copy.privacy}{' '}
              <a className="underline underline-offset-2" href={getLocalizedHref('/legal/privacy', locale)}>{copy.privacyLink}</a>
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
