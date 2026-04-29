import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import {
  StudentAcademyHero,
  QuickStartStripSection,
  StudentProblemSection,
  ThreeBeatSolution,
  ThinkingCycleSection,
  LevelPathwaySection,
  InteractiveDemoCTASection,
  CEIWSection,
  DRESection,
  StudentOutcomesGrid,
  BuiltForEveryLearnerSection,
  DiagnosticCTASection,
  PortfolioEvidenceSection,
  StudentProgramPathways,
  StudentFitBlock,
  FinalConversionReminderSection,
  StudentAcademyFAQ,
  StudentFinalCTA,
} from "@/components/student-academy/sections";
import { StudentAcademyMobileStickyCTA } from "@/components/student-academy/StudentAcademyMobileStickyCTA";

// Sprint 3A — page-level structured data.
//
// Course: describes Jurassic English™ Student Academy as an educational
// program. No offers, prices, ratings, reviews, accreditation claims, or
// guarantee fields per spec — only public-safe facts already visible on
// the rendered page.
const STUDENT_ACADEMY_COURSE_LD = {
  "@context": "https://schema.org",
  "@type": "Course",
  "@id": "https://jurassicenglish.com/#student-academy-course",
  name: "Jurassic English™ Student Academy",
  description:
    "A five-level literature-based academic English program built around authentic literature, regulated thinking, and visible reasoning. Students read real stories, think aloud, write with evidence, and grow through portfolio work.",
  url: "https://jurassicenglish.com/student-academy",
  provider: { "@id": "https://jurassicenglish.com/#organization" },
  educationalLevel:
    "Level 1 to Level 5; CEFR Pre-A1 through C1 reading, speaking, writing, and reasoning.",
  inLanguage: "en",
};

const STUDENT_ACADEMY_WEBPAGE_LD = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://jurassicenglish.com/student-academy#webpage",
  url: "https://jurassicenglish.com/student-academy",
  name: "Jurassic English™ Student Academy | Literature-Based English Thinking for Students",
  description:
    "Jurassic English™ Student Academy helps students read deeper, speak smarter, write stronger, and defend ideas in English through a five-level literature-based academic reasoning pathway.",
  isPartOf: { "@id": "https://jurassicenglish.com/#website" },
  about: { "@id": "https://jurassicenglish.com/#student-academy-course" },
  inLanguage: "en",
};

export const metadata: Metadata = {
  title:
    "Jurassic English™ Student Academy | Literature-Based English Thinking for Students",
  description:
    "Jurassic English™ Student Academy helps students read deeper, speak smarter, write stronger, and defend ideas in English through a five-level literature-based academic reasoning pathway.",
  alternates: {
    canonical: "/student-academy",
  },
  openGraph: {
    title:
      "Jurassic English™ Student Academy | Literature-Based English Thinking",
    description:
      "A literature-based English thinking pathway for students who need more than tutoring: fluency, academic reasoning, structured writing, speaking confidence, and visible progress.",
    type: "website",
    url: "/student-academy",
    images: [
      {
        url: "/images/student-academy-page/student-academy-hero.webp",
        width: 1200,
        height: 630,
        alt: "Jurassic English™ Student Academy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jurassic English™ Student Academy",
    description:
      "Read deeper, speak smarter, write stronger, and defend ideas in English. A five-level literature-based pathway.",
    images: [
      "/images/student-academy-page/student-academy-hero.webp",
    ],
  },
};

const studentAcademyThemeCss = `
  .sa-theme {
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
  .sa-theme [data-slot="button"] { border-radius: 9999px; }
  .sa-theme [data-slot="badge"]  { border-radius: 9999px; }
  .sa-theme [data-slot="card"] {
    border-radius: 1rem;
    box-shadow: inset 0 0 0 1px rgba(16, 24, 32, 0.08) !important;
  }
  .sa-theme h1, .sa-theme h2, .sa-theme h3 {
    letter-spacing: -0.025em;
  }
`;

export default function StudentAcademyPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: studentAcademyThemeCss }} />
      <JsonLd data={STUDENT_ACADEMY_COURSE_LD} id="ld-sa-course" />
      <JsonLd data={STUDENT_ACADEMY_WEBPAGE_LD} id="ld-sa-webpage" />
      {/* Bottom padding (`pb-24`) on mobile keeps page content from being
          hidden behind the StudentAcademyMobileStickyCTA (≈88px tall +
          safe-area inset). At lg+ the sticky bar disappears (`lg:hidden`)
          so the page wrapper releases its bottom padding. */}
      <div className="sa-theme bg-background pb-24 lg:pb-0">
        <StudentAcademyHero />
        <QuickStartStripSection />
        <StudentProblemSection />
        <ThreeBeatSolution />
        <ThinkingCycleSection />
        <LevelPathwaySection />
        <InteractiveDemoCTASection />
        <CEIWSection />
        <DRESection />
        <StudentOutcomesGrid />
        <BuiltForEveryLearnerSection />
        <DiagnosticCTASection />
        <PortfolioEvidenceSection />
        <StudentProgramPathways />
        <StudentFitBlock />
        <FinalConversionReminderSection />
        <StudentAcademyFAQ />
        <StudentFinalCTA />
      </div>
      <StudentAcademyMobileStickyCTA />
    </>
  );
}
