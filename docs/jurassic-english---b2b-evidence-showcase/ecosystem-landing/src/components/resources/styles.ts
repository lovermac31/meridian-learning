// Resource store palette: Ink #101820, Orange #F26419, Gold #D4AF37,
// Cream #F4F1EA. Contrast rules (checked in JE_STOREFRONT_DESIGN_AND_UX_SPEC.md):
// - Orange and gold are never used for text on cream or white (about 2.9:1
//   and 2.0:1). On cream they are borders, rules and badges with ink text.
// - Buttons are orange with ink text (about 6.2:1) or ink with cream text.
// - On ink backgrounds, cream, gold and orange text all pass AA.

export const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#F26419] px-5 py-2.5 text-center text-sm font-extrabold text-[#101820] transition hover:bg-[#D4AF37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#101820] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F4F1EA] disabled:cursor-not-allowed disabled:opacity-60";
export const INK_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#101820] px-5 py-2.5 text-center text-sm font-bold text-[#F4F1EA] transition hover:bg-[#2a3540] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26419] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
export const OUTLINE_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border-2 border-[#101820] bg-transparent px-5 py-2 text-center text-sm font-bold text-[#101820] transition hover:bg-[#101820] hover:text-[#F4F1EA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26419] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
export const TEXT_LINK =
  "font-semibold text-[#101820] underline decoration-[#F26419] decoration-2 underline-offset-4 hover:decoration-[#101820] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26419] rounded-sm";
export const EYEBROW = "text-xs font-bold uppercase tracking-[0.14em] text-[#101820]";
export const H1 = "text-[2rem] font-extrabold leading-[1.1] text-[#101820] sm:text-[2.6rem]";
export const H2 = "text-2xl font-extrabold leading-tight text-[#101820] sm:text-3xl";
export const CARD = "rounded-2xl border border-[#101820]/10 bg-white p-5 shadow-[0_1px_0_rgba(16,24,32,0.04)]";
export const BADGE = "inline-flex items-center rounded-full border border-[#101820]/15 bg-[#F4F1EA] px-2.5 py-0.5 text-xs font-bold text-[#101820]";
export const GOLD_BADGE = "inline-flex items-center rounded-full bg-[#D4AF37] px-2.5 py-0.5 text-xs font-bold text-[#101820]";
export const MUTED = "text-[#3d4852]";
