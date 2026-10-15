import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { StudentAcademyOverhaul } from "@/components/student-academy/StudentAcademyOverhaul";

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
    "A five-level literature-based English program for ages 6–14. Students read real storybooks, explain their ideas with Point + Proof + Explain, and build a written Growth Portfolio of vocabulary logs and revised paragraphs.",
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
    "Literature-based English for ages 6–14: real storybooks, confident speaking, evidence-backed writing and a written monthly Growth Portfolio. Start with a 45-minute Reading & Thinking Placement Consultation.",
  isPartOf: { "@id": "https://jurassicenglish.com/#website" },
  about: { "@id": "https://jurassicenglish.com/#student-academy-course" },
  inLanguage: "en",
};

// Phase 5 Sprint F — BreadcrumbList JSON-LD: Home → Student Academy.
// Two-level breadcrumb. /student-academy is the program landing page
// itself, so there is no deeper hierarchy to encode here.
const STUDENT_ACADEMY_BREADCRUMB_LD = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "@id": "https://jurassicenglish.com/student-academy#breadcrumb",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://jurassicenglish.com/",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Student Academy",
      item: "https://jurassicenglish.com/student-academy",
    },
  ],
};

export const metadata: Metadata = {
  title:
    "Jurassic English™ Student Academy | Literature-Based English Thinking for Students",
  description:
    "Literature-based English for ages 6–14: real storybooks, confident speaking, evidence-backed writing and a written monthly Growth Portfolio. Start with a 45-minute Reading & Thinking Placement Consultation.",
  alternates: {
    canonical: "/student-academy",
  },
  openGraph: {
    title:
      "Jurassic English™ Student Academy | Literature-Based English Thinking",
    description:
      "A literature-based English thinking pathway for students who need more than tutoring: fluency, academic reasoning, structured writing, speaking confidence, and visible progress.",
    type: "website",
    siteName: "Jurassic English™",
    url: "/student-academy",
    images: [
      {
        url: "/images/overhaul/hero-story-expedition.webp",
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
      "/images/overhaul/hero-story-expedition.webp",
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
      <JsonLd data={STUDENT_ACADEMY_BREADCRUMB_LD} id="ld-sa-breadcrumb" />
      <div className="sa-theme">
        <StudentAcademyOverhaul />
      </div>
    </>
  );
}
