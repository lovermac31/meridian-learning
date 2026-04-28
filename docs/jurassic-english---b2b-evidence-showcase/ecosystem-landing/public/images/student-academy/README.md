# Student Academy Image Assets

Source folder (Google Drive):
https://drive.google.com/drive/folders/1T9M4ZKwekl5O_2iOETenXj_lyHf_-8Ap

Optimized assets (recommended `.webp`, ~1200–1600px wide for hero, ~800–1200px for section images) should be placed directly into this directory using the exact filenames below. The page already references these paths via `next/image` with `unoptimized` set, so the gradient placeholders disappear once the files exist.

## Required filenames

| Filename | Used in | Recommended subject |
|----------|---------|---------------------|
| `student-academy-hero.webp` | Hero section (`StudentAcademyHero`) | A premium academic / literature / reasoning visual — calm student reading, literature on a desk, parchment-and-deep-green tones |
| `built-for-every-learner.webp` | Inclusive learners section (`BuiltForEveryLearnerSection`) | Calm, structured learning environment — tidy desk, evidence of student work, no faces required |
| `growth-portfolio-evidence.webp` | Growth Portfolio section (`PortfolioEvidenceSection`) | Portfolio / evidence visual — student writing samples, reflection notebooks, vocabulary records |
| `student-academy-final-cta.webp` | Final CTA backdrop (`StudentFinalCTA`) | Subtle academic / literature texture or a wide environmental shot suitable as a darkened background |

## Status

All four files are currently **placeholders** — the page renders gradient cards with file-path captions until the real assets are added. Drop the optimized `.webp` files into this directory using the exact filenames and the placeholders will be replaced automatically.

## Guidelines

- Do **not** hotlink the Google Drive originals from production code.
- Avoid embedded text inside images for important messaging (use real headings on the page instead).
- Keep aspect ratios close to the placeholder targets:
  - Hero: 16:10
  - Built for Every Learner: 4:3
  - Growth Portfolio: 4:3
  - Final CTA: 16:9 or wider — used as a darkened background
- Tone: deep green / navy / parchment / muted gold — premium and academic, not childish.
