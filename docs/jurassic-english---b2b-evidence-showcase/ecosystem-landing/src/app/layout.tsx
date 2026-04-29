import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { LayoutChrome } from "@/components/LayoutChrome";
import { ProductionStyleHeader } from "@/components/ProductionStyleHeader";
import { JsonLd } from "@/components/JsonLd";

// Sprint 3A — site-wide structured data.
//
// Organization + WebSite schemas live in the layout so they appear once on
// every ecosystem-rewritten page without duplication. Conservative field
// set per spec: no offers, ratings, reviews, accreditation claims, or
// guarantee fields. Only public facts already visible on the rendered
// site are included.
const ORGANIZATION_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://jurassicenglish.com/#organization",
  name: "Jurassic English",
  alternateName: "Jurassic English™",
  url: "https://jurassicenglish.com",
  description:
    "A literature-based critical thinking curriculum for students, schools, and centers.",
  parentOrganization: {
    "@type": "Organization",
    name: "World Wise Learning",
  },
};

const WEBSITE_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://jurassicenglish.com/#website",
  url: "https://jurassicenglish.com",
  name: "Jurassic English",
  publisher: { "@id": "https://jurassicenglish.com/#organization" },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Sprint 3C — Geist Mono removed. It was bundled but never visibly used
// across the ecosystem-landing pages, costing ~28KB per page in font
// payload (Sprint 3B audit). globals.css `--font-mono: var(--font-geist-mono)`
// now resolves to undefined; any future code that needs a monospace
// stack should fall back to the system mono via CSS.

export const metadata: Metadata = {
  // Canonical apex domain. www.jurassicenglish.com 308-redirects here.
  // All page-level relative metadata URLs (canonical, OG, Twitter images)
  // resolve against this base.
  metadataBase: new URL("https://jurassicenglish.com"),
  title: "Jurassic English™ Ecosystem",
  description: "From English Fluency to Academic Thought.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Decorative display font (Jurassic English™ wordmark identity).
            Loaded from the same public CDN used by the production site.
            Sprint 3C adds dns-prefetch alongside the existing preconnect
            so older browsers without preconnect support also benefit
            from the resolved-DNS cache before the stylesheet request.

            Phase 7 — load this third-party stylesheet non-blocking.
            It only declares the Neuland-Inline display font used in the
            top-of-page wordmark (ProductionStyleHeader / LayoutChrome /
            StudentAcademyFooter), never on body text or H1 LCP targets,
            so it should not be on the critical render path. We use the
            print-media swap pattern: render the stylesheet with
            `media="print"` so the browser still fetches it, but at low
            priority and without blocking first paint; a tiny inline
            script then promotes the link to `media="all"` after the
            window load event so the font applies to screen. The
            <noscript> fallback preserves the original blocking
            behaviour for users with JS disabled. The fallback stack in
            globals.css (--font-display: Copperplate, Copperplate
            Gothic Light, Palatino Linotype, Georgia, serif) renders
            the wordmark cleanly until the swap fires. */}
        <link rel="dns-prefetch" href="https://db.onlinewebfonts.com" />
        <link
          rel="preconnect"
          href="https://db.onlinewebfonts.com"
          crossOrigin="anonymous"
        />
        {/* Print-media trick: the browser still downloads the stylesheet
            but at *low* priority and without blocking first paint, since
            it's marked as only applying to print. The tiny inline script
            below promotes it to `media="all"` after the document load
            event, which makes it apply to screen and triggers the same
            FOUT-→-Neuland-Inline swap that a normal stylesheet would.
            Single link tag → no duplicate-preload warning. */}
        <link
          rel="stylesheet"
          href="https://db.onlinewebfonts.com/c/3000a0539c78d3cf6ab2d94db856f5ef?family=Neuland-Inline"
          media="print"
        />
        <script
          // Target the stylesheet link specifically (rel="stylesheet"),
          // not the Float-injected preload that may share media="print".
          // querySelector returns the first match in document order; the
          // stylesheet appears later in <head>, so we anchor on rel.
          dangerouslySetInnerHTML={{
            __html:
              "addEventListener('load',function(){var l=document.querySelector('link[rel=\"stylesheet\"][href*=\"Neuland-Inline\"][media=\"print\"]');if(l)l.media='all';});",
          }}
        />
        <noscript>
          <link
            rel="stylesheet"
            href="https://db.onlinewebfonts.com/c/3000a0539c78d3cf6ab2d94db856f5ef?family=Neuland-Inline"
          />
        </noscript>
      </head>
      <body
        className={`${geistSans.variable} antialiased min-h-screen flex flex-col bg-background text-foreground`}
        suppressHydrationWarning
      >
        {/*
          Skip-to-main-content link (WCAG 2.4.1 Bypass Blocks).
          Must be the FIRST focusable element in <body> so that a keyboard
          user pressing Tab once on any ecosystem-rewritten page
          (/student-academy, /interactive-demo, /book-diagnostic,
          /digital-reasoning-engine, /evidence, /school-framework) can jump
          straight to <main id="main-content"> and skip the production-style
          header navigation. Visually hidden via `sr-only` until focused;
          on focus it lifts to a fixed-position high-contrast pill in the
          top-left corner.
        */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          Skip to main content
        </a>
        <JsonLd data={ORGANIZATION_LD} id="ld-organization" />
        <JsonLd data={WEBSITE_LD} id="ld-website" />

        {/*
          Production-style header — visually + behaviorally mirrors the
          jurassicenglish.com homepage navbar so a user reading
          /student-academy etc. (served via Vercel rewrite from
          ecosystem-landing) feels they are still on the same site.
          Replaces the previous parchment chrome + utility-strip pattern.
          See: src/components/ProductionStyleHeader.tsx
        */}
        <ProductionStyleHeader />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <LayoutChrome />

        {/*
          Sprint 3C — Vercel Web Analytics + Speed Insights.
          Both are edge-only beacons; they consume zero serverless
          functions (the 12/12 Hobby cap is preserved). Web Analytics
          captures pageviews + custom track() events. Speed Insights
          captures real-user Core Web Vitals (LCP, CLS, INP, FCP, TTFB).
          Cookieless. No PII. No third-party script.
        */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
