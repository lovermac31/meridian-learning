import { useMemo, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
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
  const [values, setValues] = useState<GetStartedFormValues>({
    ...initialGetStartedValues,
    startedAt: new Date().toISOString(),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitState, setSubmitState] = useState<SubmitState>({ status: 'idle' });

  const interestLabel = useMemo(
    () => (values.primaryInterest ? getStartedLabel(values.primaryInterest) : 'your enquiry'),
    [values.primaryInterest]
  );

  const updateValue = <K extends keyof GetStartedFormValues>(key: K, value: GetStartedFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateGetStartedPayload(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setSubmitState({
        status: 'error',
        message: 'Please review the highlighted fields and try again.',
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
        throw new Error(data.error || 'We could not submit your enquiry. Please try again.');
      }

      setSubmitState({
        status: 'success',
        submissionId: data.submissionId,
      });
    } catch (error: any) {
      setSubmitState({
        status: 'error',
        message: error?.message || 'We could not submit your enquiry. Please try again shortly.',
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
          Back to main site
        </button>

        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-jurassic-dark p-10 text-white shadow-premium"
          >
            <span className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-4 block">
              Get Started
            </span>
            <h1 className="text-5xl font-bold tracking-tight mb-6">Start the Jurassic English conversation.</h1>
            <p className="text-white/70 leading-relaxed font-light text-lg mb-8">
              This intake form helps us route your enquiry to the right pathway for teacher
              training, school licensing, curriculum review, academic consulting, or
              institutional partnership discussions.
            </p>

            <div className="space-y-4 mb-10">
              {[
                'For schools, academies, educators, and institutional partners',
                'Takes around 3 minutes to complete',
                'Choose the path that best matches your implementation goal',
                'Reviewed by the Jurassic English team for the next best response',
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
                  <p className="font-semibold text-white">Professional intake only</p>
                  <p className="text-sm text-white/65 leading-relaxed mt-1">
                    We collect only the information needed to respond to your enquiry and recommend
                    the most appropriate offer path for your institution or team.
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
              <div className="flex min-h-[640px] flex-col justify-center text-center">
                <CheckCircle2 className="w-16 h-16 text-jurassic-accent mx-auto mb-6" />
                <h2 className="text-4xl font-bold text-jurassic-dark mb-4">Enquiry received</h2>
                <p className="text-gray-600 leading-relaxed max-w-xl mx-auto">
                  Thank you. We’ve received your {interestLabel.toLowerCase()} enquiry and will
                  review it shortly.
                </p>
                <div className="mt-8 rounded-2xl bg-jurassic-soft/40 px-6 py-5 text-left max-w-xl mx-auto">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    Submission reference
                  </p>
                  <p className="mt-2 text-lg font-semibold text-jurassic-dark">
                    {submitState.submissionId}
                  </p>
                </div>
                <p className="mt-8 text-sm text-gray-500">
                  If your request is urgent, you can also contact{' '}
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
              <form onSubmit={handleSubmit} noValidate className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-jurassic-dark">Institutional intake form</h2>
                  <p className="text-gray-500 text-sm mt-2">
                    Select the offer path that best fits your current goal, then add the context we need to respond accurately.
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <Field
                    label="Full name"
                    required
                    error={errors.fullName}
                    input={
                      <input
                        className={requiredFieldClass}
                        value={values.fullName}
                        onChange={(e) => updateValue('fullName', e.target.value)}
                        autoComplete="name"
                      />
                    }
                  />
                  <Field
                    label="Work email"
                    required
                    error={errors.workEmail}
                    input={
                      <input
                        type="email"
                        className={requiredFieldClass}
                        value={values.workEmail}
                        onChange={(e) => updateValue('workEmail', e.target.value)}
                        autoComplete="email"
                      />
                    }
                  />
                  <Field
                    label="Organization name"
                    required
                    error={errors.organizationName}
                    input={
                      <input
                        className={requiredFieldClass}
                        value={values.organizationName}
                        onChange={(e) => updateValue('organizationName', e.target.value)}
                        autoComplete="organization"
                      />
                    }
                  />
                  <Field
                    label="Role / title"
                    input={
                      <input
                        className={requiredFieldClass}
                        value={values.roleTitle}
                        onChange={(e) => updateValue('roleTitle', e.target.value)}
                      />
                    }
                  />
                  <Field
                    label="Organization type"
                    required
                    error={errors.organizationType}
                    input={
                      <select
                        className={requiredFieldClass}
                        value={values.organizationType}
                        onChange={(e) => updateValue('organizationType', e.target.value as GetStartedFormValues['organizationType'])}
                      >
                        <option value="">Select organization type</option>
                        {organizationTypeOptions.map((option) => (
                          <option key={option} value={option}>
                            {getStartedLabel(option)}
                          </option>
                        ))}
                      </select>
                    }
                  />
                  <Field
                    label="Country / region"
                    input={
                      <input
                        className={requiredFieldClass}
                        value={values.countryRegion}
                        onChange={(e) => updateValue('countryRegion', e.target.value)}
                      />
                    }
                  />
                  <Field
                    label="Age range served"
                    input={
                      <input
                        className={requiredFieldClass}
                        value={values.ageRange}
                        onChange={(e) => updateValue('ageRange', e.target.value)}
                        placeholder="e.g. 6–12, secondary, mixed"
                      />
                    }
                  />
                  <Field
                    label="Approximate learner count"
                    input={
                      <input
                        className={requiredFieldClass}
                        value={values.learnerCount}
                        onChange={(e) => updateValue('learnerCount', e.target.value)}
                        placeholder="e.g. 250"
                      />
                    }
                  />
                  <Field
                    label="Primary interest"
                    required
                    error={errors.primaryInterest}
                    input={
                      <select
                        className={requiredFieldClass}
                        value={values.primaryInterest}
                        onChange={(e) => updateValue('primaryInterest', e.target.value as GetStartedFormValues['primaryInterest'])}
                      >
                        <option value="">Select primary interest</option>
                        {primaryInterestOptions.map((option) => (
                          <option key={option} value={option}>
                            {getStartedLabel(option)}
                          </option>
                        ))}
                      </select>
                    }
                  />
                  <Field
                    label="Implementation timeline"
                    input={
                      <select
                        className={requiredFieldClass}
                        value={values.timeline}
                        onChange={(e) => updateValue('timeline', e.target.value as GetStartedFormValues['timeline'])}
                      >
                        <option value="">Select timeline</option>
                        {timelineOptions.map((option) => (
                          <option key={option} value={option}>
                            {getStartedLabel(option)}
                          </option>
                        ))}
                      </select>
                    }
                  />
                  <Field
                    label="Decision stage"
                    input={
                      <select
                        className={requiredFieldClass}
                        value={values.decisionStage}
                        onChange={(e) => updateValue('decisionStage', e.target.value as GetStartedFormValues['decisionStage'])}
                      >
                        <option value="">Select decision stage</option>
                        {decisionStageOptions.map((option) => (
                          <option key={option} value={option}>
                            {getStartedLabel(option)}
                          </option>
                        ))}
                      </select>
                    }
                  />
                  <Field
                    label="Standards context"
                    className="md:col-span-2"
                    input={
                      <input
                        className={requiredFieldClass}
                        value={values.standardsContext}
                        onChange={(e) => updateValue('standardsContext', e.target.value)}
                        placeholder="e.g. CEFR, IB, Cambridge, national curriculum"
                      />
                    }
                  />
                  <Field
                    label="What challenge are you trying to solve?"
                    required
                    error={errors.challenge}
                    className="md:col-span-2"
                    input={
                      <textarea
                        className={`${requiredFieldClass} min-h-[120px]`}
                        value={values.challenge}
                        onChange={(e) => updateValue('challenge', e.target.value)}
                      />
                    }
                  />
                  <Field
                    label="What would success look like?"
                    className="md:col-span-2"
                    input={
                      <textarea
                        className={`${requiredFieldClass} min-h-[110px]`}
                        value={values.successDefinition}
                        onChange={(e) => updateValue('successDefinition', e.target.value)}
                      />
                    }
                  />
                  <Field
                    label="Additional notes"
                    className="md:col-span-2"
                    input={
                      <textarea
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
                  <label className="flex items-start gap-3 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={values.contactConsent}
                      onChange={(e) => updateValue('contactConsent', e.target.checked)}
                      className="mt-1 accent-[var(--color-jurassic-accent)]"
                    />
                    <span>
                      I agree to be contacted about this enquiry.
                      {errors.contactConsent ? (
                        <span className="block text-red-500 mt-1">{errors.contactConsent}</span>
                      ) : null}
                    </span>
                  </label>

                  <label className="flex items-start gap-3 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={values.newsletterOptIn}
                      onChange={(e) => updateValue('newsletterOptIn', e.target.checked)}
                      className="mt-1 accent-[var(--color-jurassic-accent)]"
                    />
                    <span>Send me occasional Jurassic English insights and updates.</span>
                  </label>
                </div>

                {submitState.status === 'error' ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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
                        Submitting
                      </>
                    ) : (
                      'Submit enquiry'
                    )}
                  </button>
                  <p className="text-sm text-gray-500">
                    Prefer direct contact? Email{' '}
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
  input: ReactNode;
  required?: boolean;
  error?: string;
  className?: string;
};

function Field({ label, input, required, error, className }: FieldProps) {
  return (
    <div className={className}>
      <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-gray-500">
        {label} {required ? <span className="text-jurassic-accent">*</span> : null}
      </label>
      {input}
      {error ? <p className="mt-2 text-sm text-red-500">{error}</p> : null}
    </div>
  );
}
