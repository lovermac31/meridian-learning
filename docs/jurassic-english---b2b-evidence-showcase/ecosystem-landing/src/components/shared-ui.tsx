"use client";

import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, ArrowRight, BookOpen, GraduationCap, Users, UserPlus, LibraryBig } from "lucide-react";
import { brandPathways } from "@/lib/data";
import { useState } from "react";

export function AudienceTag({ audience }: { audience: string }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
      <Users className="w-4 h-4" />
      For {audience}
    </div>
  );
}

export function EvidenceSafeClaimBox({ 
  approvedClaim, 
  unsupportedClaimToAvoid, 
  evidenceType 
}: { 
  approvedClaim: string; 
  unsupportedClaimToAvoid?: string;
  evidenceType: string[];
}) {
  return (
    <Card className="bg-muted/30 border-primary/20 shadow-sm mt-8">
      <CardHeader>
        <CardTitle className="text-lg text-primary flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-primary" />
          Evidence-Safe Promise
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-foreground font-medium">{approvedClaim}</p>
        
        {unsupportedClaimToAvoid && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground bg-white/50 p-3 rounded-md">
            <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <p><strong>We do not claim:</strong> {unsupportedClaimToAvoid}</p>
          </div>
        )}
        
        <div className="pt-2">
          <p className="text-sm font-semibold text-primary mb-2">Tracked via:</p>
          <div className="flex flex-wrap gap-2">
            {evidenceType.map((type, idx) => (
              <Badge variant="outline" key={idx} className="bg-white border-primary/20 text-primary">
                {type}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ThisIsForBlock({ isFor, isNotFor }: { isFor: string; isNotFor: string }) {
  // Sprint 3C — promoted from <h4> to <h3>. The component sits inside
  // sections whose headings are <h2>; the previous <h4> caused a
  // heading-order skip flagged by Lighthouse on /digital-reasoning-engine
  // and /school-framework. <h3> is the correct next level.
  return (
    <div className="grid md:grid-cols-2 gap-4 my-8">
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-5">
        <h3 className="font-semibold flex items-center gap-2 text-primary mb-2 text-base">
          <CheckCircle2 className="w-4 h-4" /> This is for:
        </h3>
        <p className="text-sm text-muted-foreground">{isFor}</p>
      </div>
      <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-5">
        <h3 className="font-semibold flex items-center gap-2 text-destructive mb-2 text-base">
          <XCircle className="w-4 h-4" /> This is not:
        </h3>
        <p className="text-sm text-muted-foreground">{isNotFor}</p>
      </div>
    </div>
  );
}

export function BrandPathwayCard({ brand }: { brand: typeof brandPathways[0] }) {
  const getIcon = () => {
    switch(brand.id) {
      case 'student-academy': return <BookOpen className="w-6 h-6 text-primary" />;
      case 'school-framework': return <LibraryBig className="w-6 h-6 text-primary" />;
      case 'dre': return <Users className="w-6 h-6 text-primary" />;
      case 'academic-thinker': return <GraduationCap className="w-6 h-6 text-primary" />;
      case 'ielts-lab': return <UserPlus className="w-6 h-6 text-primary" />;
      default: return <BookOpen className="w-6 h-6 text-primary" />;
    }
  };

  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow border-primary/10">
      <CardHeader>
        <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center mb-4">
          {getIcon()}
        </div>
        <div className="text-sm font-medium text-primary/70 mb-2">{brand.audience}</div>
        <CardTitle className="text-xl">{brand.name}</CardTitle>
        <CardDescription className="text-foreground/80 font-medium pt-2">
          {brand.headline}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground text-sm">{brand.promise}</p>
      </CardContent>
      <CardFooter>
        <Link href={brand.route} className={buttonVariants({ className: "w-full bg-primary hover:bg-primary/90 text-primary-foreground group" })}>
            {brand.primaryCta}
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Link>
      </CardFooter>
    </Card>
  );
}

export function CTAButtonGroup({ 
  primaryText, 
  primaryHref, 
  secondaryText, 
  secondaryHref 
}: { 
  primaryText: string; 
  primaryHref: string; 
  secondaryText: string; 
  secondaryHref: string; 
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mt-8">
      <Link href={primaryHref} className={buttonVariants({ size: "lg", className: "bg-primary hover:bg-primary/90 text-primary-foreground" })}>
        {primaryText}
      </Link>
      <Link href={secondaryHref} className={buttonVariants({ size: "lg", variant: "outline", className: "border-primary/20 hover:bg-primary/5 text-primary" })}>
        {secondaryText}
      </Link>
    </div>
  );
}

export function LevelPathwayTable() {
  const levels = [
    { level: "Level 1", name: "Foundation", focus: "First Stories, First Thinking", cefr: "Pre-A1 / A1", ceiw: "Claim Only" },
    { level: "Level 2", name: "Early Reasoner", focus: "Stories to Evidence", cefr: "A1+ / A2", ceiw: "Claim + Evidence" },
    { level: "Level 3", name: "Developing Analyst", focus: "Opinion to Interpretation", cefr: "A2+ / B1", ceiw: "C + E + Interpretation" },
    { level: "Level 4", name: "Academic Builder", focus: "Interpretation to Argument", cefr: "B1+ / B2", ceiw: "C-E-I + Warrant" },
    { level: "Level 5", name: "Advanced Thinker", focus: "Systems & Exam Transfer", cefr: "B2+ / C1", ceiw: "C-E-I-W + Impact" },
  ];

  return (
    <div className="overflow-x-auto rounded-lg border border-primary/10 my-8 shadow-sm">
      <table className="w-full text-sm text-left">
        <thead className="bg-primary/5 text-primary uppercase font-semibold">
          <tr>
            <th className="px-6 py-4 border-r border-primary/10 whitespace-nowrap">Level</th>
            <th className="px-6 py-4 border-r border-primary/10">Cognitive Focus</th>
            <th className="px-6 py-4 border-r border-primary/10 whitespace-nowrap">CEFR Band</th>
            <th className="px-6 py-4 whitespace-nowrap">CEIW Depth</th>
          </tr>
        </thead>
        <tbody>
          {levels.map((row, i) => (
            <tr key={i} className="border-b border-primary/5 bg-card last:border-0 hover:bg-primary/5 transition-colors">
              <td className="px-6 py-4 border-r border-primary/10">
                <div className="font-bold text-primary">{row.level}</div>
                <div className="text-xs text-muted-foreground">{row.name}</div>
              </td>
              <td className="px-6 py-4 text-foreground/90 border-r border-primary/10">{row.focus}</td>
              <td className="px-6 py-4 text-muted-foreground border-r border-primary/10">{row.cefr}</td>
              <td className="px-6 py-4 font-medium text-accent">{row.ceiw}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DREFlowDiagram() {
  const steps = ["Prompt", "Claim", "Evidence", "Interpretation", "Warrant", "Reflection", "Portfolio"];
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 my-8 p-6 bg-primary/5 rounded-xl border border-primary/10">
      {steps.map((step, idx) => (
        <div key={idx} className="flex items-center">
          <div className="bg-white border border-primary/20 px-4 py-2 rounded-lg text-sm font-medium text-primary shadow-sm">
            {step}
          </div>
          {idx < steps.length - 1 && (
            <ArrowRight className="w-4 h-4 mx-2 text-primary/40" />
          )}
        </div>
      ))}
    </div>
  );
}

export function ProofRoadmap() {
  const roadmap = [
    { stage: "Pilot cohort", data: "writing samples, speaking samples, parent feedback" },
    { stage: "Repeat cohort", data: "before/after comparison" },
    { stage: "Center implementation", data: "group progress and retention" },
    { stage: "Institutional review", data: "portfolio evidence and teacher assessment" },
    { stage: "Published case studies", data: "anonymized learner outcomes" },
  ];

  return (
    <div className="space-y-4 my-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-primary/20 before:to-transparent">
      {roadmap.map((item, i) => (
        <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-primary/10 text-primary shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-primary/10 bg-card shadow-sm">
            {/* Sprint 3C — promoted from <h4> to <h3>. ProofRoadmap is
                rendered under an <h2> on /evidence; <h4> caused a
                Lighthouse heading-order skip. <h3> is the correct next
                level. */}
            <h3 className="font-bold text-primary text-base">{item.stage}</h3>
            <p className="text-sm text-muted-foreground mt-1">{item.data}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ComparisonTable() {
  const comparisons = [
    { weak: "memorized templates", strong: "argument development" },
    { weak: "generic phrases", strong: "precise academic language" },
    { weak: "repeated mock tests", strong: "targeted reasoning repair" },
    { weak: "scripted speaking", strong: "flexible justification" },
    { weak: "grammar-only correction", strong: "logic + evidence + coherence" },
  ];

  return (
    <div className="overflow-x-auto rounded-lg border border-primary/10 my-8 shadow-sm">
      <table className="w-full text-sm text-left">
        <thead className="text-primary uppercase font-semibold">
          <tr>
            <th className="px-6 py-4 bg-muted/50 border-r border-primary/10 w-1/2">Weak IELTS Preparation</th>
            <th className="px-6 py-4 bg-primary/5 w-1/2">Reasoning Lab Approach</th>
          </tr>
        </thead>
        <tbody>
          {comparisons.map((row, i) => (
            <tr key={i} className="border-b border-primary/5 bg-card last:border-0">
              <td className="px-6 py-4 text-muted-foreground border-r border-primary/10">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-destructive/70" />
                  {row.weak}
                </div>
              </td>
              <td className="px-6 py-4 font-medium text-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  {row.strong}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PortfolioEvidenceCard() {
  return (
    <Card className="my-8 border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="text-lg">Pilot Evidence Publication Status</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Pilot evidence will be published only after sufficient student samples, before/after writing comparisons, speaking reflections, and cohort completion data have been collected.
        </p>
      </CardContent>
    </Card>
  );
}

export function FAQSection({ faqs }: { faqs: { question: string; answer: string }[] }) {
  return (
    <Accordion className="w-full my-8">
      {faqs.map((faq, i) => (
        <AccordionItem key={i} value={`item-${i}`}>
          <AccordionTrigger className="text-left font-semibold text-primary">{faq.question}</AccordionTrigger>
          <AccordionContent className="text-muted-foreground leading-relaxed">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export function BuyerRouter() {
  const [audience, setAudience] = useState<string | null>(null);
  const [need, setNeed] = useState<string | null>(null);

  const getRoute = () => {
    if (!audience || !need) return null;
    if (audience === "parent" && need === "progress") return "/student-academy";
    if (audience === "school" && need === "framework") return "/school-framework";
    if (audience === "teacher" && need === "tools") return "/digital-reasoning-engine";
    if (audience === "advanced" && need === "writing") return "/academic-thinker";
    if (audience === "ielts" && need === "ielts") return "/ielts-reasoning-lab";
    return "/student-academy"; // Fallback
  };

  const route = getRoute();

  return (
    <Card className="max-w-2xl mx-auto my-12 border-primary/20 shadow-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-primary">Find Your Pathway</CardTitle>
        <CardDescription>Tell us who you are and what you need.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-4">Who are you?</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "parent", label: "Parent / Student" },
              { id: "school", label: "School / Center Leader" },
              { id: "teacher", label: "Teacher / Curriculum Team" },
              { id: "ielts", label: "IELTS Student" },
              { id: "advanced", label: "Advanced Academic Learner" },
            ].map(opt => (
              <Button 
                key={opt.id} 
                variant={audience === opt.id ? "default" : "outline"} 
                onClick={() => setAudience(opt.id)}
                className="text-sm rounded-full"
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground mb-4">What do you need?</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "progress", label: "Student progress" },
              { id: "framework", label: "Curriculum framework" },
              { id: "tools", label: "Digital reasoning tools" },
              { id: "writing", label: "Academic writing" },
              { id: "ielts", label: "IELTS preparation" },
            ].map(opt => (
              <Button 
                key={opt.id} 
                variant={need === opt.id ? "default" : "outline"} 
                onClick={() => setNeed(opt.id)}
                className="text-sm rounded-full"
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
      {route && (
        <CardFooter className="bg-primary/5 flex justify-center py-6 rounded-b-xl border-t border-primary/10">
          <Link href={route} className={buttonVariants({ size: "lg", className: "w-full sm:w-auto" })}>
              Take me to my pathway
              <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}

export function PathwayFooterWarning({ 
  text, 
  linkText, 
  href 
}: { 
  text: string; 
  linkText: string; 
  href: string; 
}) {
  return (
    <div className="mt-20 py-8 border-t border-primary/10 text-center">
      <p className="text-muted-foreground mb-4">{text}</p>
      <Link href={href} className={buttonVariants({ variant: "link", className: "text-primary font-medium p-0 h-auto" })}>
          {linkText} <ArrowRight className="w-4 h-4 ml-1" />
      </Link>
    </div>
  );
}
