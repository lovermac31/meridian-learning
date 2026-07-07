import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Cpu,
  FileText,
  GraduationCap,
  PhoneCall,
  Store,
  TrendingUp,
} from 'lucide-react';
import { getCompaniesPageContent } from '../i18n/content/companies';
import type { Locale } from '../i18n/locales';

type CompaniesPageProps = {
  locale: Locale;
  onBack: () => void;
  onGetStarted: () => void;
  onNavigate: (path: string) => void;
};

const PROBLEM_ICONS = [PhoneCall, FileText, TrendingUp];
const AUDIENCE_ICONS = [Building2, Cpu, GraduationCap, Store];

export const CompaniesPage = ({ locale, onBack, onGetStarted, onNavigate }: CompaniesPageProps) => {
  const content = getCompaniesPageContent(locale);

  return (
    <main className="bg-white">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1a0f] via-jurassic-dark to-jurassic-dark" />
        <div className="absolute inset-0 bg-overlay-accent-gold" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/60 transition hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            {content.hero.backCta}
          </button>

          <div className="mt-10 max-w-3xl">
            <span className="inline-flex items-center rounded-full border border-jurassic-gold/40 bg-jurassic-gold/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-jurassic-gold">
              {content.hero.eyebrow}
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight text-white sm:text-5xl">
              {content.hero.title}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-white/75">{content.hero.body}</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onGetStarted}
                className="inline-flex items-center gap-2 rounded-xl bg-jurassic-accent px-6 py-3 text-sm font-bold text-jurassic-dark transition hover:brightness-110"
              >
                {content.hero.primaryCta}
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/pilot-programme')}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                {content.hero.secondaryCta}
              </button>
              <span className="text-xs font-semibold uppercase tracking-wider text-white/45">
                {content.hero.badge}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Problem ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-jurassic-accent">
          {content.problem.eyebrow}
        </p>
        <h2 className="mt-3 max-w-3xl text-3xl font-extrabold text-jurassic-dark">{content.problem.title}</h2>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-jurassic-dark/70">{content.problem.body}</p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {content.problem.modes.map((mode, i) => {
            const Icon = PROBLEM_ICONS[i] ?? PhoneCall;
            return (
              <div key={mode.title} className="rounded-2xl border border-jurassic-dark/10 bg-jurassic-light/40 p-6">
                <Icon className="h-6 w-6 text-jurassic-accent" aria-hidden="true" />
                <h3 className="mt-4 text-lg font-bold text-jurassic-dark">{mode.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-jurassic-dark/70">{mode.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Audiences ────────────────────────────────────────────── */}
      <section className="bg-jurassic-light/50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-jurassic-accent">
            {content.audiences.eyebrow}
          </p>
          <h2 className="mt-3 max-w-3xl text-3xl font-extrabold text-jurassic-dark">{content.audiences.title}</h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-jurassic-dark/70">{content.audiences.body}</p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {content.audiences.cards.map((card, i) => {
              const Icon = AUDIENCE_ICONS[i] ?? Building2;
              return (
                <div key={card.role} className="flex flex-col rounded-2xl border border-jurassic-dark/10 bg-white p-7">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-jurassic-accent/15">
                      <Icon className="h-5 w-5 text-jurassic-accent" aria-hidden="true" />
                    </span>
                    <span className="text-sm font-bold uppercase tracking-wide text-jurassic-dark/60">{card.role}</span>
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-jurassic-dark">{card.headline}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-jurassic-dark/70">{card.body}</p>
                  <ul className="mt-5 space-y-2">
                    {card.signals.map((signal) => (
                      <li key={signal} className="flex items-start gap-2 text-sm text-jurassic-dark/80">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-jurassic-accent" aria-hidden="true" />
                        {signal}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Approach ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-jurassic-accent">
          {content.approach.eyebrow}
        </p>
        <h2 className="mt-3 max-w-3xl text-3xl font-extrabold text-jurassic-dark">{content.approach.title}</h2>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-jurassic-dark/70">{content.approach.body}</p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {content.approach.steps.map((step) => (
            <div key={step.number} className="rounded-2xl border border-jurassic-dark/10 p-6">
              <span className="font-mono text-sm font-bold text-jurassic-accent">{step.number}</span>
              <h3 className="mt-2 text-lg font-bold text-jurassic-dark">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-jurassic-dark/70">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Proof ────────────────────────────────────────────────── */}
      <section className="bg-jurassic-dark py-20">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-jurassic-gold">{content.proof.eyebrow}</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-extrabold text-white">{content.proof.title}</h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/70">{content.proof.body}</p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {content.proof.items.map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <h3 className="text-base font-bold text-jurassic-gold">{item.label}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-jurassic-accent">{content.cta.eyebrow}</p>
        <h2 className="mt-3 text-3xl font-extrabold text-jurassic-dark">{content.cta.title}</h2>
        <p className="mt-4 text-base leading-relaxed text-jurassic-dark/70">{content.cta.body}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={onGetStarted}
            className="inline-flex items-center gap-2 rounded-xl bg-jurassic-accent px-6 py-3 text-sm font-bold text-jurassic-dark transition hover:brightness-110"
          >
            {content.cta.primaryCta}
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onNavigate('/pilot-programme')}
            className="inline-flex items-center gap-2 rounded-xl border border-jurassic-dark/20 px-6 py-3 text-sm font-bold text-jurassic-dark transition hover:bg-jurassic-dark/5"
          >
            {content.cta.secondaryCta}
          </button>
        </div>
        <p className="mt-6 text-xs leading-relaxed text-jurassic-dark/50">{content.cta.note}</p>
      </section>
    </main>
  );
};
