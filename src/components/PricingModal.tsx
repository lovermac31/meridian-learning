import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, Loader2 } from 'lucide-react';
import type { Locale } from '../i18n/locales';
import { getCurrentLocale } from '../i18n/routing';
import { getUiString } from '../i18n/ui';
import {
  buyerTypeOptions,
  initialPricingValues,
  interestAreaOptions,
  normalizePricingRegistration,
  preferredContactMethodOptions,
  pricingLabel,
  validatePricingRegistration,
  type PricingRegistrationValues,
} from '../lib/pricingRegistrationSchema';

type PricingModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type SubmitState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success' }
  | { status: 'error'; message: string };

const fieldClass =
  'w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-white/30 outline-none transition focus:border-jurassic-accent/60 focus:bg-white/[0.07]';

export function PricingModal({ isOpen, onClose }: PricingModalProps) {
  const locale = getCurrentLocale();
  const [values, setValues] = useState<PricingRegistrationValues>({
    ...initialPricingValues,
    startedAt: new Date().toISOString(),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitState, setSubmitState] = useState<SubmitState>({ status: 'idle' });
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setValues({ ...initialPricingValues, startedAt: new Date().toISOString() });
      setErrors({});
      setSubmitState({ status: 'idle' });
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !panelRef.current) return;
    const panel = panelRef.current;
    const focusable = panel.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusable.length > 0) focusable[0].focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  const updateValue = <K extends keyof PricingRegistrationValues>(
    key: K,
    value: PricingRegistrationValues[K]
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validatePricingRegistration(values, locale);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setSubmitState({
        status: 'error',
        message: getUiString(locale, 'pricingModal.status.reviewFields'),
      });
      return;
    }

    setSubmitState({ status: 'submitting' });

    try {
      const payload = normalizePricingRegistration(values);
      const response = await fetch('/api/pricing-registration', {
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
        throw new Error(data.error || getUiString(locale, 'pricingModal.status.submitFailed'));
      }

      setSubmitState({ status: 'success' });
    } catch (error: any) {
      setSubmitState({
        status: 'error',
        message: error?.message || getUiString(locale, 'pricingModal.status.submitFailedShortly'),
      });
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleOverlayClick}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-label={getUiString(locale, 'pricingModal.dialogLabel')}
        >
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-[480px] max-h-[calc(100vh-3rem)] overflow-y-auto rounded-3xl border border-white/10 bg-gradient-to-b from-[#0f1a26] to-[#131f2e] shadow-[0_32px_64px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)] scrollbar-thin"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 rounded-full bg-white/5 p-2 text-white/50 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent"
              aria-label={getUiString(locale, 'pricingModal.closeModal')}
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-7 pb-8">
              {submitState.status === 'success' ? (
                <SuccessState onClose={onClose} locale={locale} />
              ) : (
                <>
                  <ModalHeader locale={locale} />
                  <RegistrationForm
                    locale={locale}
                    values={values}
                    errors={errors}
                    submitState={submitState}
                    updateValue={updateValue}
                    onSubmit={handleSubmit}
                  />
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ModalHeader({ locale }: { locale: Locale }) {
  return (
    <div className="mb-6">
      <span className="text-jurassic-accent font-bold uppercase tracking-[0.2em] text-[10px] mb-2 block">
        {getUiString(locale, 'pricingModal.badge')}
      </span>
      <h2 className="text-2xl font-bold text-white tracking-tight">
        {getUiString(locale, 'pricingModal.title')}
      </h2>
      <p className="mt-3 text-sm text-white/55 leading-relaxed">
        {getUiString(locale, 'pricingModal.intro')}
      </p>
      <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
        <p className="text-xs text-white/40 leading-relaxed">
          {getUiString(locale, 'pricingModal.auditNote')}
        </p>
      </div>
    </div>
  );
}

type RegistrationFormProps = {
  locale: Locale;
  values: PricingRegistrationValues;
  errors: Record<string, string>;
  submitState: SubmitState;
  updateValue: <K extends keyof PricingRegistrationValues>(
    key: K,
    value: PricingRegistrationValues[K]
  ) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

function RegistrationForm({
  locale,
  values,
  errors,
  submitState,
  updateValue,
  onSubmit,
}: RegistrationFormProps) {
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4" aria-describedby="pricing-status">
      <div className="grid gap-3 grid-cols-2">
        <ModalField
          label={getUiString(locale, 'pricingModal.labels.fullName')}
          fieldId="pr-fullName"
          required
          error={errors.fullName}
          input={
            <input
              id="pr-fullName"
              className={fieldClass}
              value={values.fullName}
              onChange={(e) => updateValue('fullName', e.target.value)}
              autoComplete="name"
              aria-invalid={errors.fullName ? 'true' : 'false'}
              aria-describedby={errors.fullName ? 'pr-fullName-error' : undefined}
            />
          }
        />
        <ModalField
          label={getUiString(locale, 'pricingModal.labels.workEmail')}
          fieldId="pr-workEmail"
          required
          error={errors.workEmail}
          input={
            <input
              id="pr-workEmail"
              type="email"
              className={fieldClass}
              value={values.workEmail}
              onChange={(e) => updateValue('workEmail', e.target.value)}
              autoComplete="email"
              aria-invalid={errors.workEmail ? 'true' : 'false'}
              aria-describedby={errors.workEmail ? 'pr-workEmail-error' : undefined}
            />
          }
        />
        <ModalField
          label={getUiString(locale, 'pricingModal.labels.roleTitle')}
          fieldId="pr-roleTitle"
          required
          error={errors.roleTitle}
          input={
            <input
              id="pr-roleTitle"
              className={fieldClass}
              value={values.roleTitle}
              onChange={(e) => updateValue('roleTitle', e.target.value)}
              aria-invalid={errors.roleTitle ? 'true' : 'false'}
              aria-describedby={errors.roleTitle ? 'pr-roleTitle-error' : undefined}
            />
          }
        />
        <ModalField
          label={getUiString(locale, 'pricingModal.labels.organizationName')}
          fieldId="pr-organizationName"
          required
          error={errors.organizationName}
          input={
            <input
              id="pr-organizationName"
              className={fieldClass}
              value={values.organizationName}
              onChange={(e) => updateValue('organizationName', e.target.value)}
              autoComplete="organization"
              aria-invalid={errors.organizationName ? 'true' : 'false'}
              aria-describedby={errors.organizationName ? 'pr-organizationName-error' : undefined}
            />
          }
        />
        <ModalField
          label={getUiString(locale, 'pricingModal.labels.countryRegion')}
          fieldId="pr-countryRegion"
          required
          error={errors.countryRegion}
          input={
            <input
              id="pr-countryRegion"
              className={fieldClass}
              value={values.countryRegion}
              onChange={(e) => updateValue('countryRegion', e.target.value)}
              aria-invalid={errors.countryRegion ? 'true' : 'false'}
              aria-describedby={errors.countryRegion ? 'pr-countryRegion-error' : undefined}
            />
          }
        />
        <ModalField
          label={getUiString(locale, 'pricingModal.labels.organizationSize')}
          fieldId="pr-organizationSize"
          input={
            <input
              id="pr-organizationSize"
              className={fieldClass}
              value={values.organizationSize}
              onChange={(e) => updateValue('organizationSize', e.target.value)}
              placeholder={getUiString(locale, 'pricingModal.placeholders.organizationSize')}
            />
          }
        />
        <ModalField
          label={getUiString(locale, 'pricingModal.labels.phoneWhatsapp')}
          fieldId="pr-phoneWhatsapp"
          input={
            <input
              id="pr-phoneWhatsapp"
              className={fieldClass}
              value={values.phoneWhatsapp}
              onChange={(e) => updateValue('phoneWhatsapp', e.target.value)}
              autoComplete="tel"
              placeholder={getUiString(locale, 'pricingModal.placeholders.phoneWhatsapp')}
            />
          }
        />
      </div>

      <ModalField
        label={getUiString(locale, 'pricingModal.labels.buyerType')}
        fieldId="pr-buyerType"
        required
        error={errors.buyerType}
        input={
          <select
            id="pr-buyerType"
            className={fieldClass}
            value={values.buyerType}
            onChange={(e) =>
              updateValue('buyerType', e.target.value as PricingRegistrationValues['buyerType'])
            }
            aria-invalid={errors.buyerType ? 'true' : 'false'}
            aria-describedby={errors.buyerType ? 'pr-buyerType-error' : undefined}
          >
            <option value="">{getUiString(locale, 'pricingModal.placeholders.selectBuyerType')}</option>
            {buyerTypeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {pricingLabel(opt, locale)}
              </option>
            ))}
          </select>
        }
      />

      <ModalField
        label={getUiString(locale, 'pricingModal.labels.interestArea')}
        fieldId="pr-interestArea"
        required
        error={errors.interestArea}
        input={
          <select
            id="pr-interestArea"
            className={fieldClass}
            value={values.interestArea}
            onChange={(e) =>
              updateValue('interestArea', e.target.value as PricingRegistrationValues['interestArea'])
            }
            aria-invalid={errors.interestArea ? 'true' : 'false'}
            aria-describedby={errors.interestArea ? 'pr-interestArea-error' : undefined}
          >
            <option value="">{getUiString(locale, 'pricingModal.placeholders.selectInterestArea')}</option>
            {interestAreaOptions.map((opt) => (
              <option key={opt} value={opt}>
                {pricingLabel(opt, locale)}
              </option>
            ))}
          </select>
        }
      />

      <div className="grid gap-3 grid-cols-2">
        <ModalField
          label={getUiString(locale, 'pricingModal.labels.preferredContactMethod')}
          fieldId="pr-preferredContactMethod"
          input={
            <select
              id="pr-preferredContactMethod"
              className={fieldClass}
              value={values.preferredContactMethod}
              onChange={(e) =>
                updateValue(
                  'preferredContactMethod',
                  e.target.value as PricingRegistrationValues['preferredContactMethod']
                )
              }
            >
              <option value="">{getUiString(locale, 'pricingModal.placeholders.selectContactMethod')}</option>
              {preferredContactMethodOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {pricingLabel(opt, locale)}
                </option>
              ))}
            </select>
          }
        />
        <ModalField
          label={getUiString(locale, 'pricingModal.labels.timeline')}
          fieldId="pr-timeline"
          input={
            <input
              id="pr-timeline"
              className={fieldClass}
              value={values.timeline}
              onChange={(e) => updateValue('timeline', e.target.value)}
              placeholder={getUiString(locale, 'pricingModal.placeholders.timeline')}
            />
          }
        />
      </div>

      <ModalField
        label={getUiString(locale, 'pricingModal.labels.message')}
        fieldId="pr-message"
        input={
          <textarea
            id="pr-message"
            className={`${fieldClass} min-h-[72px] resize-none`}
            value={values.message}
            onChange={(e) => updateValue('message', e.target.value)}
            placeholder={getUiString(locale, 'pricingModal.placeholders.message')}
          />
        }
      />

      <div className="hidden" aria-hidden="true">
        <label htmlFor="pr-website">Website</label>
        <input
          id="pr-website"
          value={values.website}
          onChange={(e) => updateValue('website', e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <label className="flex items-start gap-2.5 text-xs text-white/45 leading-relaxed cursor-pointer" htmlFor="pr-contactConsent">
        <input
          id="pr-contactConsent"
          type="checkbox"
          checked={values.contactConsent}
          onChange={(e) => updateValue('contactConsent', e.target.checked)}
          className="mt-0.5 accent-[var(--color-jurassic-accent)]"
          aria-invalid={errors.contactConsent ? 'true' : 'false'}
          aria-describedby={errors.contactConsent ? 'pr-contactConsent-error' : undefined}
        />
        <span>
          {getUiString(locale, 'pricingModal.labels.contactConsent')}
          {errors.contactConsent ? (
            <span id="pr-contactConsent-error" className="block text-red-400 mt-1">
              {errors.contactConsent}
            </span>
          ) : null}
        </span>
      </label>

      <div id="pricing-status" className="sr-only" role="status" aria-live="polite">
        {submitState.status === 'submitting'
          ? getUiString(locale, 'pricingModal.status.submitting')
          : submitState.status === 'error'
            ? getUiString(locale, 'pricingModal.status.submissionIssue')
            : ''}
      </div>

      {submitState.status === 'error' ? (
        <div className="rounded-xl border border-red-400/20 bg-red-400/10 px-3.5 py-2.5 text-xs text-red-300" role="alert">
          {submitState.message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={submitState.status === 'submitting'}
        className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-jurassic-accent px-6 py-3.5 text-sm font-bold text-white shadow-[0_4px_16px_rgba(242,100,25,0.25)] transition hover:shadow-[0_4px_24px_rgba(242,100,25,0.35)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitState.status === 'submitting' ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {getUiString(locale, 'common.submitting')}
          </>
        ) : (
          getUiString(locale, 'common.requestAccess')
        )}
      </button>

      <p className="text-center text-[11px] text-white/30">
        {getUiString(locale, 'common.orEmail')}{' '}
        <a
          href="mailto:info@jurassicenglish.com"
          className="text-jurassic-accent/70 hover:text-jurassic-accent transition"
        >
          info@jurassicenglish.com
        </a>
      </p>
    </form>
  );
}

function SuccessState({ onClose, locale }: { onClose: () => void; locale: Locale }) {
  return (
    <div className="flex flex-col items-center text-center py-6" role="status" aria-live="polite">
      <CheckCircle2 className="w-12 h-12 text-jurassic-accent mb-5" />
      <h2 className="text-xl font-bold text-white mb-3">
        {getUiString(locale, 'pricingModal.successTitle')}
      </h2>
      <p className="text-sm text-white/55 leading-relaxed max-w-sm">
        {getUiString(locale, 'pricingModal.successBody')}
      </p>
      <button
        onClick={onClose}
        className="mt-8 rounded-2xl border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
      >
        {getUiString(locale, 'common.close')}
      </button>
    </div>
  );
}

type ModalFieldProps = {
  label: string;
  fieldId: string;
  input: React.ReactNode;
  required?: boolean;
  error?: string;
};

function ModalField({ label, fieldId, input, required, error }: ModalFieldProps) {
  return (
    <div>
      <label
        htmlFor={fieldId}
        className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.15em] text-white/35"
      >
        {label}
        {required ? <span className="text-jurassic-accent ml-0.5">*</span> : null}
      </label>
      {input}
      {error ? (
        <p id={`${fieldId}-error`} className="mt-1 text-[11px] text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
