import { 
  AudienceTag, 
  CTAButtonGroup, 
  EvidenceSafeClaimBox, 
  ThisIsForBlock,
  PathwayFooterWarning
} from "@/components/shared-ui";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, BookOpen, PenTool, MessageSquare, GraduationCap } from "lucide-react";

export default function AcademicThinker() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-primary/5 py-20 px-4 border-b border-primary/10">
        <div className="container mx-auto max-w-4xl text-center">
          <AudienceTag audience="Advanced Learners" />
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6 leading-tight">
            Jurassic English™ Academic Thinker Program<br />
            <span className="text-2xl md:text-3xl font-serif text-accent block mt-4 font-normal">
              For Students Who Can Speak English — But Need to Think, Write, and Argue Academically.
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            A premium academic pathway for literature analysis, CEIW writing, seminar discussion, essay development, and international-school readiness.
          </p>
          <div className="flex justify-center">
            <CTAButtonGroup 
              primaryText="Apply for Academic Thinker Track"
              primaryHref="/join-cohort"
              secondaryText="Book Academic Writing Diagnostic"
              secondaryHref="/book-diagnostic"
            />
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl space-y-24">
          
          {/* The Hidden Problem */}
          <div>
            <h2 className="text-3xl font-bold text-primary mb-8 text-center">The Hidden Problem</h2>
            <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-8">
              Many students appear fluent in everyday conversation but struggle significantly with academic demands.
            </p>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                "Literature essays",
                "Academic vocabulary",
                "Interpretation",
                "Argument structure",
                "Evidence use",
                "Seminar confidence",
                "University-style writing"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg border border-primary/10">
                  <AlertCircle className="w-5 h-5 text-accent shrink-0" />
                  <span className="font-medium text-foreground/80">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <ThisIsForBlock 
                isFor="Advanced students, international-school students, Cambridge/IB/AP learners, university-pathway students, high-performing ESL learners."
                isNotFor="Beginners seeking basic conversational English or general fluency."
              />
            </div>
          </div>

          {/* What Students Learn */}
          <div className="bg-primary text-primary-foreground rounded-2xl p-8 md:p-12 shadow-lg">
            <h2 className="text-3xl font-bold mb-8 text-center text-accent">What Students Learn</h2>
            <div className="grid sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {[
                { icon: BookOpen, text: "Literary interpretation" },
                { icon: PenTool, text: "CEIW writing" },
                { icon: CheckCircle2, text: "Comparative analysis" },
                { icon: MessageSquare, text: "Socratic seminar" },
                { icon: GraduationCap, text: "Academic vocabulary" },
                { icon: PenTool, text: "Essay revision" },
                { icon: BookOpen, text: "Portfolio development" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="bg-primary-foreground/10 p-3 rounded-xl">
                    <item.icon className="w-6 h-6 text-accent" />
                  </div>
                  <span className="font-medium text-lg opacity-90">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ideal Student */}
          <div>
            <h2 className="text-3xl font-bold text-primary mb-8 text-center">The Ideal Candidate</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { title: "Fluency Gap", desc: "Strong spoken English but weak writing structure." },
                { title: "Academic Setting", desc: "Currently attending or preparing for an international school." },
                { title: "Curriculum Goals", desc: "Preparing for IB, Cambridge, or AP-style tasks." },
                { title: "Future Pathway", desc: "Applying to university and needs academic confidence." }
              ].map((item, i) => (
                <Card key={i} className="border-primary/10 shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-primary mb-2 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-accent" />
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Proof */}
          <div>
            <EvidenceSafeClaimBox 
              approvedClaim="Students build a portfolio of essays, seminar reflections, revised paragraphs, and academic writing samples."
              unsupportedClaimToAvoid="Guaranteed admission success."
              evidenceType={["Essays", "Seminar Reflections", "Revised Paragraphs", "Writing Samples"]}
            />
          </div>

          <PathwayFooterWarning 
            text="Need help with IELTS arguments specifically?"
            linkText="Explore Jurassic English™ IELTS Reasoning Lab"
            href="/ielts-reasoning-lab"
          />

        </div>
      </section>
    </div>
  );
}
