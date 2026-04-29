"use client";

/**
 * Student Academy B2C registration form
 * ─────────────────────────────────────────────────────────────────────────────
 * Renders inside the ecosystem-landing app at `/book-diagnostic`. POSTs to
 * the root jurassic-english API at `/api/student-academy-register` (relative
 * URL — see Path B architecture docs).
 *
 * Visual language:
 *   - Parchment surface, Jurassic deep-green primary, jurassic-accent orange CTA
 *   - Aptos sans body, Neuland-Inline display in the parent header (page level)
 *   - Rounded-2xl card, rounded-md inputs, rounded-full primary CTA
 *
 * Honeypot: invisible `website` field. Anti-spam: hidden `startedAt` ISO string.
 *
 * Google sign-in: hidden by default. Only render the button when
 * NEXT_PUBLIC_SUPABASE_GOOGLE_OAUTH_ENABLED is exactly "true". This is a
 * future hook — Supabase Auth Google provider is not configured yet.
 */

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CheckCircle2, Loader2, AlertTriangle } from "lucide-react";
import { track } from "@vercel/analytics";

// Consolidation Option 3: registration is handled by the existing
// /api/get-started serverless function (no new function added — Vercel
// Hobby caps at 12). The branch is selected by the `source` field below.
const REGISTER_ENDPOINT = "/api/get-started";
const CANONICAL_URL = "https://jurassicenglish.com/student-academy";
const SUPPORT_EMAIL = "info@jurassicenglish.com";

type SubmissionState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string; field?: string };

const PREFERRED_CONTACT_OPTIONS = [
  { value: "", label: "Choose a method" },
  { value: "email", label: "Email" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "zalo", label: "Zalo" },
  { value: "wechat", label: "WeChat" },
  { value: "phone", label: "Phone" },
] as const;

const MAIN_GOAL_OPTIONS = [
  { value: "", label: "Choose a focus area" },
  { value: "reading_confidence", label: "Reading confidence" },
  { value: "academic_writing", label: "Academic writing" },
  { value: "speaking_confidence", label: "Speaking confidence" },
  { value: "ielts_preparation", label: "IELTS preparation" },
  { value: "general_academic_english", label: "General academic English" },
  { value: "not_sure_yet", label: "Not sure yet" },
] as const;

const baseInput =
  "w-full rounded-md border border-primary/15 bg-white px-3.5 py-2.5 text-base text-foreground/90 placeholder:text-foreground/40 transition focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-jurassic-accent/40";
const baseLabel = "block text-sm font-semibold text-foreground/80 mb-1.5";
const baseHelp = "mt-1 text-xs text-foreground/55";

export function RegistrationForm() {
  const formId = useId();
  const startedAtRef = useRef<string>("");
  // Sprint 3C — fire `book_diagnostic_started` exactly once per page
  // session, on the first meaningful focus / input interaction. Tracked
  // via ref so it persists across re-renders without re-firing.
  const trackedStartedRef = useRef<boolean>(false);
  const [state, setState] = useState<SubmissionState>({ kind: "idle" });

  // Capture ISO start time on mount for anti-spam
  useEffect(() => {
    startedAtRef.current = new Date().toISOString();
  }, []);

  // Sprint 3C — abandonment-instrumentation hook. Fires once.
  const handleFirstFocus = (
    event: React.FocusEvent<HTMLFormElement> | React.ChangeEvent<HTMLFormElement>,
  ) => {
    if (trackedStartedRef.current) return;
    const t = event.target as HTMLElement;
    // Ignore focus on the honeypot ("website" field) so bots don't
    // trip the started event.
    if (t && t.getAttribute && t.getAttribute("name") === "website") return;
    trackedStartedRef.current = true;
    track("book_diagnostic_started");
  };

  const showGoogleButton = useMemo(
    () =>
      typeof process !== "undefined" &&
      process.env.NEXT_PUBLIC_SUPABASE_GOOGLE_OAUTH_ENABLED === "true",
    [],
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (state.kind === "submitting") return;

    const form = event.currentTarget;
    const data = new FormData(form);

    // Snake_case payload per Consolidation Option 3 spec. The form
    // submits to /api/get-started, which routes via `source` to the
    // dedicated student-academy helper. The schema validator on the
    // server accepts both snake_case (canonical) and camelCase (legacy)
    // field names for safety during the transition.
    const payload = {
      source: "student-academy" as const,
      parent_or_guardian_full_name: String(data.get("parentFullName") ?? "").trim(),
      email: String(data.get("parentEmail") ?? "").trim(),
      phone: String(data.get("phoneContact") ?? "").trim(),
      preferred_contact_method: String(data.get("preferredContactMethod") ?? "").trim(),
      country: String(data.get("country") ?? "").trim(),
      city: String(data.get("city") ?? "").trim(),
      student_name: String(data.get("studentFirstName") ?? "").trim(),
      student_age: String(data.get("studentAgeOrGrade") ?? "").trim(),
      current_english_level: String(data.get("currentEnglishLevel") ?? "").trim(),
      learning_goal: String(data.get("mainGoal") ?? "").trim(),
      learning_notes: String(data.get("learningNotes") ?? "").trim(),
      preferred_diagnostic_time: String(data.get("preferredDiagnosticTime") ?? "").trim(),
      consent: data.get("consentContact") === "on",
      canonical_access_url: CANONICAL_URL,
      registration_source: "student-academy-book-diagnostic",
      website: String(data.get("website") ?? ""), // honeypot
      startedAt: startedAtRef.current,
      authProvider: "email" as const,
    };

    setState({ kind: "submitting" });

    try {
      const response = await fetch(REGISTER_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result: {
        ok: boolean;
        message?: string;
        error?: string;
        field?: string;
        emailQueued?: boolean;
      } = await response.json().catch(() => ({
        ok: false,
        error: "invalid_response",
      }));

      if (response.ok && result.ok) {
        // Sprint 3C — conversion telemetry. Properties stay strictly
        // metadata: source / registration_source / email_queued. No PII,
        // no exact form fields, no parent/student names, no email,
        // no phone, no notes.
        track("book_diagnostic_submitted", {
          source: "student-academy",
          registration_source: "student-academy-book-diagnostic",
          email_queued: Boolean(result.emailQueued),
        });
        setState({
          kind: "success",
          message:
            result.message ||
            "Your diagnostic request has been received. Please check your email for confirmation and next steps.",
        });
        form.reset();
        return;
      }

      const reasonText = (() => {
        switch (result.error) {
          case "invalid_parent_full_name":
            return "Please enter a parent or guardian name.";
          case "invalid_parent_email":
            return "That email address looks invalid. Please double-check it.";
          case "consent_required":
            return "Please tick the consent box so we know you'd like to be contacted.";
          case "rate_limited":
            return "Too many attempts in a short time. Please wait a few minutes and try again.";
          case "payload_too_large":
            return "Your message is too long. Please shorten the notes and try again.";
          case "storage_unavailable":
            return `Something went wrong on our side. Please try again or contact ${SUPPORT_EMAIL}.`;
          default:
            return `Something went wrong. Please try again or contact ${SUPPORT_EMAIL}.`;
        }
      })();

      setState({ kind: "error", message: reasonText, field: result.field });
    } catch {
      setState({
        kind: "error",
        message: `Something went wrong. Please try again or contact ${SUPPORT_EMAIL}.`,
      });
    }
  };

  if (state.kind === "success") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-2xl border border-primary/10 bg-white p-8 shadow-sm"
      >
        <div className="flex items-start gap-3 mb-4">
          <CheckCircle2
            className="h-6 w-6 text-jurassic-accent shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div>
            <h2 className="text-xl font-semibold text-primary mb-1">
              Diagnostic request received
            </h2>
            <p className="text-sm text-foreground/70">{state.message}</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-foreground/70">
          You can revisit the Student Academy here:{" "}
          <a
            href={CANONICAL_URL}
            className="text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary"
          >
            {CANONICAL_URL.replace(/^https?:\/\//, "")}
          </a>
        </p>
        {/* Phase 6 — secondary low-pressure next step. No score, no sign-up.
            Re-uses the existing /interactive-demo#try-one-thinking-move
            anchor so the success state stays connected to the funnel
            without adding a new route or an upsell. */}
        <p className="mt-2 text-sm text-foreground/70">
          Or try one thinking move while you wait:{" "}
          <a
            href="/interactive-demo#try-one-thinking-move"
            className="text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary"
          >
            interactive-demo
          </a>
        </p>
      </div>
    );
  }

  return (
    <form
      id={formId}
      onSubmit={handleSubmit}
      // Sprint 3C — bubble-listening for first focus (capture phase) and
      // first input change. Either path fires `book_diagnostic_started`
      // exactly once. Honeypot field is filtered inside handleFirstFocus.
      onFocusCapture={handleFirstFocus}
      onChange={handleFirstFocus}
      noValidate
      className="rounded-2xl border border-primary/10 bg-white/80 p-6 sm:p-8 shadow-sm backdrop-blur-sm"
    >
      {/* Optional Google sign-in — hidden until Supabase Auth is configured */}
      {showGoogleButton ? (
        <div className="mb-6 pb-6 border-b border-primary/10">
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-primary/15 bg-white px-4 py-2.5 text-sm font-semibold text-foreground/80 transition hover:bg-primary/5"
          >
            Continue with Google
          </button>
          <p className="mt-2 text-xs text-foreground/55 text-center">
            We will use the email and name from your Google profile. You will
            still complete the student details below.
          </p>
        </div>
      ) : null}

      <fieldset className="space-y-5">
        <legend className="sr-only">Parent / guardian details</legend>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor={`${formId}-parent-name`} className={baseLabel}>
              Parent or guardian full name
              <span className="text-jurassic-accent ml-0.5">*</span>
            </label>
            <input
              id={`${formId}-parent-name`}
              name="parentFullName"
              type="text"
              required
              autoComplete="name"
              maxLength={200}
              className={baseInput}
              placeholder="e.g. Anh Nguyen"
            />
          </div>
          <div>
            <label htmlFor={`${formId}-parent-email`} className={baseLabel}>
              Email address
              <span className="text-jurassic-accent ml-0.5">*</span>
            </label>
            <input
              id={`${formId}-parent-email`}
              name="parentEmail"
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              maxLength={254}
              className={baseInput}
              placeholder="parent@example.com"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor={`${formId}-phone`} className={baseLabel}>
              Phone (optional)
            </label>
            <input
              id={`${formId}-phone`}
              name="phoneContact"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              maxLength={500}
              className={baseInput}
              placeholder="WhatsApp / Zalo / mobile"
            />
          </div>
          <div>
            <label htmlFor={`${formId}-contact-method`} className={baseLabel}>
              Preferred contact method
            </label>
            <select
              id={`${formId}-contact-method`}
              name="preferredContactMethod"
              className={baseInput}
              defaultValue=""
            >
              {PREFERRED_CONTACT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor={`${formId}-country`} className={baseLabel}>
              Country (optional)
            </label>
            <input
              id={`${formId}-country`}
              name="country"
              type="text"
              autoComplete="country-name"
              maxLength={300}
              className={baseInput}
              placeholder="e.g. Vietnam"
            />
          </div>
          <div>
            <label htmlFor={`${formId}-city`} className={baseLabel}>
              City (optional)
            </label>
            <input
              id={`${formId}-city`}
              name="city"
              type="text"
              autoComplete="address-level2"
              maxLength={300}
              className={baseInput}
              placeholder="e.g. Hanoi"
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="mt-8 space-y-5 pt-6 border-t border-primary/10">
        <legend className="text-sm font-semibold text-foreground/70 uppercase tracking-[0.18em] mb-1">
          Student details
        </legend>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor={`${formId}-student-name`} className={baseLabel}>
              Student first name (optional)
            </label>
            <input
              id={`${formId}-student-name`}
              name="studentFirstName"
              type="text"
              maxLength={200}
              className={baseInput}
              placeholder="First name only"
            />
          </div>
          <div>
            <label htmlFor={`${formId}-age-grade`} className={baseLabel}>
              Age or grade
            </label>
            <input
              id={`${formId}-age-grade`}
              name="studentAgeOrGrade"
              type="text"
              maxLength={80}
              className={baseInput}
              placeholder="e.g. Age 11 / Grade 6"
            />
          </div>
        </div>

        <div>
          <label htmlFor={`${formId}-english-level`} className={baseLabel}>
            Current English level (if known)
          </label>
          <input
            id={`${formId}-english-level`}
            name="currentEnglishLevel"
            type="text"
            maxLength={200}
            className={baseInput}
            placeholder="e.g. CEFR A2 / Pre-intermediate / IELTS 4.5"
          />
          <p className={baseHelp}>
            If you are not sure, leave this blank — the diagnostic identifies
            the level.
          </p>
        </div>

        <div>
          <label htmlFor={`${formId}-main-goal`} className={baseLabel}>
            Main goal
          </label>
          <select
            id={`${formId}-main-goal`}
            name="mainGoal"
            className={baseInput}
            defaultValue=""
          >
            {MAIN_GOAL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`${formId}-notes`} className={baseLabel}>
            Notes / learning needs (optional)
          </label>
          <textarea
            id={`${formId}-notes`}
            name="learningNotes"
            rows={4}
            maxLength={2000}
            className={`${baseInput} resize-y`}
            placeholder="Anything that would help us understand your learner — strengths, struggles, neurodivergent profile, school context, language at home, etc."
          />
        </div>

        <div>
          <label htmlFor={`${formId}-preferred-time`} className={baseLabel}>
            Preferred diagnostic time (optional)
          </label>
          <input
            id={`${formId}-preferred-time`}
            name="preferredDiagnosticTime"
            type="text"
            maxLength={500}
            className={baseInput}
            placeholder="e.g. Saturdays 9–11am Hanoi time"
          />
        </div>
      </fieldset>

      {/* Honeypot (anti-spam) — hidden from real users */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", top: "auto", width: "1px", height: "1px", overflow: "hidden" }}>
        <label htmlFor={`${formId}-website`}>Website</label>
        <input
          id={`${formId}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="mt-8 pt-6 border-t border-primary/10">
        <label
          htmlFor={`${formId}-consent`}
          className="flex items-start gap-3 text-sm text-foreground/80 cursor-pointer"
        >
          <input
            id={`${formId}-consent`}
            name="consentContact"
            type="checkbox"
            required
            className="mt-1 h-4 w-4 rounded border-primary/30 text-primary focus:ring-jurassic-accent/40"
          />
          <span>
            I agree to be contacted about Jurassic English<span className="text-jurassic-accent text-xs align-top">™</span>{" "}
            Student Academy.
          </span>
        </label>
        <p className={`${baseHelp} pl-7`}>
          We will only use this information to follow up about your registration
          and the Student Thinking Diagnostic. No marketing lists.
        </p>
      </div>

      {state.kind === "error" ? (
        <div
          role="alert"
          className="mt-6 rounded-md border border-red-200 bg-red-50 p-3 flex items-start gap-2 text-sm text-red-900"
        >
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
          <span>{state.message}</span>
        </div>
      ) : null}

      <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:items-center">
        <button
          type="submit"
          disabled={state.kind === "submitting"}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-jurassic-accent px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-jurassic-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent/60 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {state.kind === "submitting" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Sending…
            </>
          ) : (
            "Send my request"
          )}
        </button>
        <p className="text-xs text-foreground/55">
          We will reply by email at{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-primary underline decoration-primary/40 underline-offset-2"
          >
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </div>
    </form>
  );
}

export default RegistrationForm;
