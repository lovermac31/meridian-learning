# Persistent Site Chrome Typography Standard

_Established 2026-06-15 · applies to **all persistent site chrome** across both apps: the main SPA (`src/components/Navbar.tsx`, `Footer.tsx`) and the rewrite-served ecosystem-landing (`ProductionStyleHeader.tsx`, `LayoutChrome.tsx`, `StudentAcademyFooter.tsx`, `MobileNav.tsx`)._

Persistent chrome must read as a serious education-technology / academic brand — crisp, clean, corporate. Use the clean sans system (`--font-sans`, Aptos stack) with restrained weights and subtle spacing; never a heavy display font.

## Standards

| Element | Font | Size | Weight | Notes |
|---|---|---|---|---|
| **Wordmark in chrome** (navbar, secondary header, footers) | `font-sans` | `text-2xl` | **600** (`font-semibold`) | `tracking-tight`; preserve brand name, orange ™, colors, hierarchy |
| **Nav links** | `font-sans` | `text-sm` (14px) | **500** (`font-medium`) | `tracking-[0.01em]`; restrained hover (underline / color shift) |
| **CTA in chrome** | `font-sans` | `text-sm` (14px) | **600** (`font-semibold`) | Never 700–900 |
| **Micro-label / badge** | `font-sans` | ≤12px uppercase | 700 (`font-bold`) | Permitted only for tiny uppercase chips/labels, for legibility |

Footers must look aligned with the polished header; the secondary/production-style header must not regress into the old heavy Jurassic display look.

## Display-font boundary rule

- **Allowed:** `--font-display` (Neuland-Inline) only in intentional hero / brand display moments — e.g. `Hero.tsx`, large isolated brand showcases, non-navigation display branding.
- **Not allowed:** display fonts in persistent nav / footer / secondary header / mobile menu / site chrome. Chrome wordmarks use `font-sans font-semibold tracking-tight`.
- **Avoid** `font-bold` / `font-extrabold` / `font-black` in nav/chrome, except tiny ≤12px uppercase micro-labels.
