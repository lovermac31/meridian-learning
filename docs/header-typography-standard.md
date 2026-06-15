# Header Typography Standard

_Established 2026-06-15 · applies to the site header / primary navigation (`src/components/Navbar.tsx`)._

The header must read as a serious education-technology / academic brand — crisp, clean, corporate. Use the clean sans system with restrained weights and subtle spacing; never a heavy display font.

## Standards

| Element | Font | Size | Weight | Notes |
|---|---|---|---|---|
| Brand wordmark | `--font-sans` (Aptos system stack) | `text-2xl` | **600** (`font-semibold`) | `tracking-tight`; keep the name + orange ™ accent |
| Nav links | `--font-sans` | `text-sm` (14px) | **500** (`font-medium`) | `tracking-[0.01em]`; restrained hover (underline / color shift) |
| CTA button | `--font-sans` | `text-sm` (14px) | **600** (`font-semibold`) | Never 700–900 |
| Promo micro-chip | `--font-sans` | `text-[10px]` uppercase | 700 (`font-bold`) | Permitted only for tiny ≤10px uppercase chips, for legibility |

## Rules

- **No display fonts in nav/header text.** `--font-display` (Neuland-Inline) is reserved for intentional brand/hero display areas only (e.g. `Hero.tsx`) — never the persistent header wordmark or nav links.
- **Avoid 700/800/900 weights** in navigation. Max 600 for the wordmark and CTA, 500 for nav links. (Tiny ≤10px uppercase micro-chips may use 700.)
- **Letter-spacing stays subtle:** `0.005em–0.02em` for nav links; `tracking-tight` for the wordmark.
- **Header chrome stays subtle:** hairline border + a light `0 1px 3px` shadow, not the dramatic `shadow-premium`.
