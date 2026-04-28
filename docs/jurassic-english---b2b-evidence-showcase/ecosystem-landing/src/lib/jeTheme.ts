// Shared Jurassic English™ visual-theme factory.
//
// /student-academy and /interactive-demo each carry their own inline copy
// of these CSS variables (see `sa-theme` and `id-theme` style blocks in
// their respective page.tsx files). Sprint 2 extracts the canonical
// definitions here so /digital-reasoning-engine, /evidence, and
// /school-framework can share the same token system without copy-paste
// drift.
//
// Usage:
//
//   import { jeThemeCss } from "@/lib/jeTheme";
//   const themeCss = jeThemeCss("dre-theme");
//   ...
//   <style dangerouslySetInnerHTML={{ __html: themeCss }} />
//   <div className="dre-theme bg-background">...</div>
//
// The CSS rules are scoped to a class so a page-scoped theme cannot leak
// to other routes that mount under the same root layout.

export function jeThemeCss(scopeClass: string): string {
  return `
  .${scopeClass} {
    --background:           #ffffff;
    --foreground:           #101820;
    --primary:              #101820;
    --primary-foreground:   #F4F1EA;
    --secondary:            #101820;
    --secondary-foreground: #F4F1EA;
    --accent:               #F26419;
    --accent-foreground:    #ffffff;
    --card:                 #F8F7F4;
    --card-foreground:      #101820;
    --muted:                #F4F1EA;
    --muted-foreground:     #475569;
    --border:               rgba(16, 24, 32, 0.08);
    --input:                rgba(16, 24, 32, 0.08);
    --ring:                 #F26419;
    font-family: Aptos, "Segoe UI", "Helvetica Neue", Arial, sans-serif;
  }
  .${scopeClass} [data-slot="button"] { border-radius: 9999px; }
  .${scopeClass} [data-slot="badge"]  { border-radius: 9999px; }
  .${scopeClass} [data-slot="card"] {
    border-radius: 1rem;
    box-shadow: inset 0 0 0 1px rgba(16, 24, 32, 0.08) !important;
  }
  .${scopeClass} h1, .${scopeClass} h2, .${scopeClass} h3 {
    letter-spacing: -0.025em;
  }
`;
}

// Reusable CTA recipe class strings — mirrors the JE_CTA_* constants used
// inside /student-academy and /interactive-demo so all pages share the
// same conversion-button visual language.
export const JE_CTA_PRIMARY_DARK =
  "inline-flex items-center justify-center bg-accent text-white px-8 py-4 rounded-full text-sm font-bold transition-all duration-500 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.6)]";

export const JE_CTA_GLASS_DARK =
  "inline-flex items-center justify-center bg-white/5 border border-white/10 backdrop-blur-md text-white px-8 py-4 rounded-full text-sm font-bold hover:bg-white/10 transition";

export const JE_CTA_PRIMARY_LIGHT =
  "inline-flex items-center justify-center bg-accent text-white px-6 py-3 rounded-full text-sm font-bold transition-all duration-500 shadow-[0_15px_30px_-12px_rgba(242,100,25,0.3)] hover:shadow-[0_20px_40px_-12px_rgba(242,100,25,0.4)]";

export const JE_CTA_OUTLINE_LIGHT =
  "inline-flex items-center justify-center bg-white border border-primary/15 text-primary px-6 py-3 rounded-full text-sm font-bold hover:bg-primary/5 transition-colors";

export const JE_EYEBROW_LIGHT =
  "inline-flex items-center gap-1.5 bg-[#F8F7F4] border border-foreground/10 text-foreground/70 mb-4 h-7 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] rounded-full";

export const JE_EYEBROW_DARK =
  "inline-flex items-center gap-1.5 bg-white/5 border border-white/10 text-white/85 mb-4 h-7 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] rounded-full";
