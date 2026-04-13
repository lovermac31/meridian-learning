import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { trackFormStart, trackFormSubmit, trackLowFrictionClick } from '../lib/analytics';
import { getGetStartedContent } from '../i18n/content/getStarted';
import { getCurrentLocale } from '../i18n/routing';
import { getUiString } from '../i18n/ui';
import {
  decisionStageOptions,
  getStartedLabel,
  initialGetStartedValues,
  normalizeGetStartedPayload,
  organizationTypeOptions,
  primaryInterestOptions,
  timelineOptions,
  type GetStartedFormValues,
  validateGetStartedPayload,
} from '../lib/getStartedSchema';

type GetStartedPortalProps = {
  onBack: () => void;
};

type SubmitState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; submissionId: string }
  | { status: 'error'; message: string };

const requiredFieldClass =
  'w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-jurassic-dark shadow-sm outline-none transition focus:border-jurassic-accent';

export const GetStartedPortal = ({ onBack }: GetStartedPortalProps) => {
  const locale = getCurrentLocale();
  const pageContent = getGetStartedContent(locale);
  const [values, setValues] = useState<GetStartedFormValues>({
    ...initialGetStartedValues,
    startedAt: new Date().toISOString(),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitState, setSubmitState] = useState<SubmitState>({ status: 'idle' });
  const hasTrackedFormStart = useRef(false);

  const interestLabel = useMemo(
    () =>
      values.primaryInterest
        ? getStartedLabel(values.primaryInterest, locale)
        : locale === 'vi'
          ? 'yêu cầu của bạn'
          : 'your enquiry',
    [locale, values.primaryInterest]
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('interest');

    // Alias map: URL params that don't map 1:1 to a primaryInterestOption.
    // audit_sprint and discovery_call both resolve to curriculum_review as the
    // closest intake category — operators see the full context in the CRM intake email.
    const INTEREST_ALIASES: Record<string, string> = {
      audit_sprint:    'curriculum_review',
      discovery_call:  'curriculum_review',
      curriculum_overview: 'curriculum_review',
    };

    const interest = raw ? (INTEREST_ALIASES[raw] ?? raw) : null;

    if (
      !interest ||
      !primaryInterestOptions.includes(
        interest as (typeof primaryInterestOptions)[number]
      )
    ) {
      return;
    }

    setValues((current) => {
      if (current.primaryInterest === interest) {
        return current;
      }

      return {
        ...current,
        primaryInterest: interest as GetStartedFormValues['primaryInterest'],
      };
    });
  }, []);

  const updateValue = <K extends keyof GetStartedFormValues>(key: K, value: GetStartedFormValues[K]) => {
    if (!hasTrackedFormStart.current) {
      hasTrackedFormStart.current = true;
      trackFormStart('/get-started');
    }
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateGetStartedPayload(values, locale);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setSubmitState({
        status: 'error',
        message: getUiString(locale, 'getStarted.status.reviewFields'),
      });
      return;
    }

    setSubmitState({ status: 'submitting' });

    try {
      const payload = normalizeGetStartedPayload(values);
      const response = await fetch('/api/get-started', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          startedAt: values.startedAt,
          website: values.website,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || getUiString(locale, 'getStarted.status.submitFailed'));
      }

      trackFormSubmit(data.submissionId);
      setSubmitState({
        status: 'success',
        submissionId: data.submissionId,
      });
    } catch (error: any) {
      setSubmitState({
        status: 'error',
        message: error?.message || getUiString(locale, 'getStarted.status.submitFailedShortly'),
      });
    }
  };

  return (
    <main className="min-h-screen bg-jurassic-soft/40 pt-32 pb-20">
      <section className="max-w-7xl mx-auto px-6">
        <button
          onClick={onBack}
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-jurassic-dark/70 transition hover:text-jurassic-accent"
        >
          <ArrowLeft className="w-4 h-4" />
          {getUiString(locale, 'common.backToMainSite')}
        </button>

        {/* Phase 2 — Audience framing + low-friction alternative */}
        {locale !== 'vi' && (
          <div className="mb-8 rounded-2xl border border-jurassic-accent/15 bg-white px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4 shadow-sm">
            <div className="flex-1">
              <p className="text-sm font-semibold text-jurassic-dark mb-0.5">
                This form is for institutional enquiries — schools, training centres, and organisations.
              </p>
              <p className="text-xs text-jurassic-dark/55">
                Not a decision-maker yet? Request a Curriculum Overview first — no call required.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                trackLowFrictionClick('Request a Curriculum Overview');
                window.location.href = '/get-started?interest=curriculum_overview&mode=overview';
              }}
              className="shrink-0 rounded-full border border-jurassic-accent/40 px-5 py-2.5 text-sm font-semibold text-jurassic-accent hover:bg-jurassic-accent hover:text-white transition-all"
            >
              Request a Curriculum Overview
            </button>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-jurassic-dark p-10 text-white shadow-premium"
          >
            <span className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-4 block">
              {pageContent.badge}
            </span>
            <h1 className="text-5xl font-bold tracking-tight mb-6">{pageContent.title}</h1>
            <p className="text-white/70 leading-relaxed font-light text-lg mb-8">
              {pageContent.intro}
            </p>

            <div className="space-y-4 mb-10">
              {[
                pageContent.audienceCards[0],
                pageContent.audienceCards[1],
                pageContent.audienceCards[2],
                pageContent.audienceCards[3],
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/75"
                >
                  {item}
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-jurassic-accent/20 bg-jurassic-accent/10 p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-jurassic-accent mt-0.5" />
                <div>
                  <p className="font-semibold text-white">{pageContent.professionalIntakeTitle}</p>
                  <p className="text-sm text-white/65 leading-relaxed mt-1">
                    {pageContent.professionalIntakeBody}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-3xl border border-gray-200 bg-white p-8 shadow-premium"
          >
            {submitState.status === 'success' ? (
              <div className="flex min-h-[640px] flex-col justify-center text-center" role="status" aria-live="polite">
                <CheckCircle2 className="w-16 h-16 text-jurassic-accent mx-auto mb-6" />
                <h2 className="text-4xl font-bold text-jurassic-dark mb-4">{pageContent.successTitle}</h2>
                <p className="text-gray-600 leading-relaxed max-w-xl mx-auto">
                  {pageContent.successBody.replace('{{interest}}', interestLabel.toLowerCase())}
                </p>
                <div className="mt-8 rounded-2xl bg-jurassic-soft/40 px-6 py-5 text-left max-w-xl mx-auto">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    {pageContent.submissionReference}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-jurassic-dark">
                    {submitState.submissionId}
                  </p>
                </div>
                <p className="mt-8 text-sm text-gray-500">
                  {pageContent.urgentContact}{' '}
                  <a
                    href="mailto:info@jurassicenglish.com"
                    className="font-semibold text-jurassic-accent hover:underline"
                  >
                    info@jurassicenglish.com
                  </a>
                  .
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-8" aria-describedby="get-started-status">
                <div>
                  <h2 className="text-3xl font-bold text-jurassic-dark">{pageContent.formTitle}</h2>
                  <p className="text-gray-500 text-sm mt-2">
                    {pageContent.formIntro}
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <Field
                    label={getUiString(locale, 'getStarted.labels.fullName')}
                    fieldId="fullName"
                    required
                    error={errors.fullName}
                    input={
                      <input
                        id="fullName"
                        className={requiredFieldClass}
                        value={values.fullName}
                        onChange={(e) => updateValue('fullName', e.target.value)}
                        autoComplete="name"
                        aria-invalid={errors.fullName ? 'true' : 'false'}
                        aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                      />
                    }
                  />
                  <Field
                    label={getUiString(locale, 'getStarted.labels.workEmail')}
                    fieldId="workEmail"
                    required
                    error={errors.workEmail}
                    input={
                      <input
                        id="workEmail"
                        type="email"
                        className={requiredFieldClass}
                        value={values.workEmail}
                        onChange={(e) => updateValue('workEmail', e.target.value)}
                        autoComplete="email"
                        aria-invalid={errors.workEmail ? 'true' : 'false'}
                        aria-describedby={errors.workEmail ? 'workEmail-error' : undefined}
                      />
                    }
                  />
                  <Field
                    label={getUiString(locale, 'getStarted.labels.organizationName')}
                    fieldId="organizationName"
                    required
                    error={errors.organizationName}
                    input={
                      <input
                        id="organizationName"
                        className={requiredFieldClass}
                        value={values.organizationName}
                        onChange={(e) => updateValue('organizationName', e.target.value)}
                        autoComplete="organization"
                        aria-invalid={errors.organizationName ? 'true' : 'false'}
                        aria-describedby={errors.organizationName ? 'organizationName-error' : undefined}
                      />
                    }
                  />
                  <Field
                    label={getUiString(locale, 'getStarted.labels.roleTitle')}
                    fieldId="roleTitle"
                    input={
                      <input
                        id="roleTitle"
                        className={requiredFieldClass}
                        value={values.roleTitle}
                        onChange={(e) => updateValue('roleTitle', e.target.value)}
                      />
                    }
                  />
                  <Field
                    label={getUiString(locale, 'getStarted.labels.organizationType')}
                    fieldId="organizationType"
                    required
                    error={errors.organizationType}
                    input={
                      <select
                        id="organizationType"
                        className={requiredFieldClass}
                        value={values.organizationType}
                        onChange={(e) => updateValue('organizationType', e.target.value as GetStartedFormValues['organizationType'])}
                        aria-invalid={errors.organizationType ? 'true' : 'false'}
                        aria-describedby={errors.organizationType ? 'organizationType-error' : undefined}
                      >
                        <option value="">{getUiString(locale, 'getStarted.placeholders.selectOrganizationType')}</option>
                        {organizationTypeOptions.map((option) => (
                          <option key={option} value={option}>
                            {getStartedLabel(option, locale)}
                          </option>
                        ))}
                      </select>
                    }
                  />
                  <Field
                    label={getUiString(locale, 'getStarted.labels.countryRegion')}
                    fieldId="countryRegion"
                    input={
                      <input
                        id="countryRegion"
                        className={requiredFieldClass}
                        value={values.countryRegion}
                        onChange={(e) => updateValue('countryRegion', e.target.value)}
                      />
                    }
                  />
                  <Field
                    label={getUiString(locale, 'getStarted.labels.ageRange')}
                    fieldId="ageRange"
                    input={
                      <input
                        id="ageRange"
                        className={requiredFieldClass}
                        value={values.ageRange}
                        onChange={(e) => updateValue('ageRange', e.target.value)}
                        placeholder={getUiString(locale, 'getStarted.placeholders.ageRange')}
                      />
                    }
                  />
                  <Field
                    label={getUiString(locale, 'getStarted.labels.learnerCount')}
                    fieldId="learnerCount"
                    input={
                      <input
                        id="learnerCount"
                        className={requiredFieldClass}
                        value={values.learnerCount}
                        onChange={(e) => updateValue('learnerCount', e.target.value)}
                        placeholder={getUiString(locale, 'getStarted.placeholders.learnerCount')}
                      />
                    }
                  />
                  <Field
                    label={getUiString(locale, 'getStarted.labels.primaryInterest')}
                    fieldId="primaryInterest"
                    required
                    error={errors.primaryInterest}
                    input={
                      <select
                        id="primaryInterest"
                        className={requiredFieldClass}
                        value={values.primaryInterest}
                        onChange={(e) => updateValue('primaryInterest', e.target.value as GetStartedFormValues['primaryInterest'])}
                        aria-invalid={errors.primaryInterest ? 'true' : 'false'}
                        aria-describedby={errors.primaryInterest ? 'primaryInterest-error' : undefined}
                      >
                        <option value="">{getUiString(locale, 'getStarted.placeholders.selectPrimaryInterest')}</option>
                        {primaryInterestOptions.map((option) => (
                          <option key={option} value={option}>
                            {getStartedLabel(option, locale)}
                          </option>
                        ))}
                      </select>
                    }
                  />
                  <Field
                    label={getUiString(locale, 'getStarted.labels.timeline')}
                    fieldId="timeline"
                    input={
                      <select
                        id="timeline"
                        className={requiredFieldClass}
                        value={values.timeline}
                        onChange={(e) => updateValue('timeline', e.target.value as GetStartedFormValues['timeline'])}
                      >
                        <option value="">{getUiString(locale, 'getStarted.placeholders.selectTimeline')}</option>
                        {timelineOptions.map((option) => (
                          <option key={option} value={option}>
                            {getStartedLabel(option, locale)}
                          </option>
                        ))}
                      </select>
                    }
                  />
                  <Field
                    label={getUiString(locale, 'getStarted.labels.decisionStage')}
                    fieldId="decisionStage"
                    input={
                      <select
                        id="decisionStage"
                        className={requiredFieldClass}
                        value={values.decisionStage}
                        onChange={(e) => updateValue('decisionStage', e.target.value as GetStartedFormValues['decisionStage'])}
                      >
                        <option value="">{getUiString(locale, 'getStarted.placeholders.selectDecisionStage')}</option>
                        {decisionStageOptions.map((option) => (
                          <option key={option} value={option}>
                            {getStartedLabel(option, locale)}
                          </option>
                        ))}
                      </select>
                    }
                  />
                  <Field
                    label={getUiString(locale, 'getStarted.labels.standardsContext')}
                    fieldId="standardsContext"
                    className="md:col-span-2"
                    input={
                      <input
                        id="standardsContext"
                        className={requiredFieldClass}
                        value={values.standardsContext}
                        onChange={(e) => updateValue('standardsContext', e.target.value)}
                        placeholder={getUiString(locale, 'getStarted.placeholders.standardsContext')}
                      />
                    }
                  />
                  <Field
                    label={getUiString(locale, 'getStarted.labels.challenge')}
                    fieldId="challenge"
                    required
                    error={errors.challenge}
                    className="md:col-span-2"
                    input={
                      <textarea
                        id="challenge"
                        className={`${requiredFieldClass} min-h-[120px]`}
                        value={values.challenge}
                        onChange={(e) => updateValue('challenge', e.target.value)}
                        aria-invalid={errors.challenge ? 'true' : 'false'}
                        aria-describedby={errors.challenge ? 'challenge-error' : undefined}
                      />
                    }
                  />
                  <Field
                    label={getUiString(locale, 'getStarted.labels.successDefinition')}
                    fieldId="successDefinition"
                    className="md:col-span-2"
                    input={
                      <textarea
                        id="successDefinition"
                        className={`${requiredFieldClass} min-h-[110px]`}
                        value={values.successDefinition}
                        onChange={(e) => updateValue('successDefinition', e.target.value)}
                      />
                    }
                  />
                  <Field
                    label={getUiString(locale, 'getStarted.labels.notes')}
                    fieldId="notes"
                    className="md:col-span-2"
                    input={
                      <textarea
                        id="notes"
                        className={`${requiredFieldClass} min-h-[100px]`}
                        value={values.notes}
                        onChange={(e) => updateValue('notes', e.target.value)}
                      />
                    }
                  />
                </div>

                <div className="hidden" aria-hidden="true">
                  <label htmlFor="website">Website</label>
                  <input
                    id="website"
                    value={values.website}
                    onChange={(e) => updateValue('website', e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <div className="space-y-4 rounded-2xl bg-jurassic-soft/35 p-5">
                  <label className="flex items-start gap-3 text-sm text-gray-700" htmlFor="contactConsent">
                    <input
                      id="contactConsent"
                      type="checkbox"
                      checked={values.contactConsent}
                      onChange={(e) => updateValue('contactConsent', e.target.checked)}
                      className="mt-1 accent-[var(--color-jurassic-accent)]"
                      aria-invalid={errors.contactConsent ? 'true' : 'false'}
                      aria-describedby={errors.contactConsent ? 'contactConsent-error' : undefined}
                    />
                    <span>
                      {getUiString(locale, 'getStarted.labels.contactConsent')}
                      {errors.contactConsent ? (
                        <span id="contactConsent-error" className="block text-red-500 mt-1">
                          {errors.contactConsent}
                        </span>
                      ) : null}
                    </span>
                  </label>

                  <label className="flex items-start gap-3 text-sm text-gray-700" htmlFor="newsletterOptIn">
                    <input
                      id="newsletterOptIn"
                      type="checkbox"
                      checked={values.newsletterOptIn}
                      onChange={(e) => updateValue('newsletterOptIn', e.target.checked)}
                      className="mt-1 accent-[var(--color-jurassic-accent)]"
                    />
                    <span>{getUiString(locale, 'getStarted.labels.newsletterOptIn')}</span>
                  </label>
                </div>

                <div id="get-started-status" className="sr-only" role="status" aria-live="polite">
                  {submitState.status === 'submitting' && getUiString(locale, 'getStarted.status.submitting')}
                  {submitState.status === 'success' &&
                    getUiString(locale, 'getStarted.status.success').replace('{{id}}', submitState.submissionId)}
                  {submitState.status === 'error' && submitState.message}
                </div>

                {submitState.status === 'error' ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                    {submitState.message}
                  </div>
                ) : null}

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <button
                    type="submit"
                    disabled={submitState.status === 'submitting'}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-jurassic-accent px-8 py-4 font-bold text-white shadow-premium transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitState.status === 'submitting' ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {getUiString(locale, 'common.submitting')}
                      </>
                    ) : (
                      getUiString(locale, 'common.submitEnquiry')
                    )}
                  </button>
                  <p className="text-sm text-gray-500">
                    {getUiString(locale, 'common.emailDirect')}{' '}
                    <a href="mailto:info@jurassicenglish.com" className="font-semibold text-jurassic-accent hover:underline">
                      info@jurassicenglish.com
                    </a>
                    .
                  </p>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </section>
    </main>
  );
};

type FieldProps = {
  label: string;
  fieldId: string;
  input: ReactNode;
  required?: boolean;
  error?: string;
  className?: string;
};

function Field({ label, fieldId, input, required, error, className }: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={fieldId} className="mb-2 block text-xs font-bold uppercase tracking-widest text-gray-500">
        {label} {required ? <span className="text-jurassic-accent">*</span> : null}
      </label>
      {input}
      {error ? (
        <p id={`${fieldId}-error`} className="mt-2 text-sm text-red-500">
          {error}
        </p>
      ) : null}
    </div>
  );
}
