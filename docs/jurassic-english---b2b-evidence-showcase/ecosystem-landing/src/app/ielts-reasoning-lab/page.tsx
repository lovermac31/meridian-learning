import { 
  AudienceTag, 
  CTAButtonGroup, 
  ComparisonTable,
  PortfolioEvidenceCard, 
  ThisIsForBlock,
  PathwayFooterWarning
} from "@/components/shared-ui";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Clock, CheckSquare, MessageCircle, PenTool } from "lucide-react";

export default function IELTSReasoningLab() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-primary/5 py-20 px-4 border-b border-primary/10">
        <div className="container mx-auto max-w-4xl text-center">
          <AudienceTag audience="IELTS & University-Pathway Students" />
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6 leading-tight">
            Jurassic English™ IELTS Reasoning Lab<br />
            <span className="text-2xl md:text-3xl font-serif text-accent block mt-4 font-normal">
              Stop Memorizing Templates. Build Arguments That Survive Pressure.
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            An IELTS-focused reasoning program that develops Task 2 argument quality, Speaking Part 3 confidence, CEIW writing structure, and academic vocabulary.
          </p>
          <div className="flex justify-center">
            <CTAButtonGroup 
              primaryText="Join IELTS Reasoning Lab"
              primaryHref="/join-cohort"
              secondaryText="Submit a Writing Diagnostic"
              secondaryHref="/book-diagnostic"
            />
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl space-y-24">
          
          {/* The IELTS Problem */}
          <div>
            <h2 className="text-3xl font-bold text-primary mb-8 text-center">The IELTS Problem</h2>
            <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-8">
              Most preparation focuses on test hacks instead of the underlying academic skills needed to succeed.
            </p>
            <ComparisonTable />

            <div className="mt-8">
              <ThisIsForBlock 
                isFor="IELTS students, university-pathway students, older secondary learners, and adult learners who need to build robust arguments."
                isNotFor="Students looking for quick 'hacks' or guaranteed score jumps without doing the reasoning work."
              />
            </div>
          </div>

          {/* What Students Practice */}
          <div className="bg-primary text-primary-foreground rounded-2xl p-8 md:p-12 shadow-lg">
            <h2 className="text-3xl font-bold mb-8 text-center text-accent">What Students Practice</h2>
            <div className="grid sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {[
                { icon: PenTool, text: "Task 2 argument planning" },
                { icon: CheckSquare, text: "CEIW essay construction" },
                { icon: MessageCircle, text: "Counterargument and concession" },
                { icon: MessageCircle, text: "Speaking Part 3 extension" },
                { icon: CheckCircle2, text: "Evidence logic" },
                { icon: Clock, text: "Timed writing" },
                { icon: PenTool, text: "Diagnostic revision" }
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

          {/* Evidence-Safe Claim Policy */}
          <div>
            <h2 className="text-3xl font-bold text-primary mb-8 text-center">Our Commitment to Honesty</h2>
            <Card className="border-primary/20 shadow-sm bg-primary/5">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-primary text-lg mb-4 flex items-center gap-2">
                      <CheckCircle2 className="text-primary w-5 h-5" /> What We Claim
                    </h3>
                    <p className="text-foreground font-medium leading-relaxed">
                      The IELTS Reasoning Lab is designed to strengthen the reasoning, coherence, vocabulary control, and argument structure behind higher IELTS performance.
                    </p>
                  </div>
                  <div className="w-px h-full bg-primary/20 hidden md:block min-h-[100px]"></div>
                  <div className="flex-1">
                    <h3 className="font-bold text-destructive text-lg mb-4 flex items-center gap-2">
                      What We NEVER Claim
                    </h3>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
                        Guaranteed Band 7.
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
                        Guaranteed Band increase.
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
                        Improve your IELTS score in X weeks.
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Proof Before Claims Placeholder */}
          <div>
            <h2 className="text-3xl font-bold text-primary mb-4 text-center">Proof Before Claims</h2>
            <PortfolioEvidenceCard />
          </div>

          <PathwayFooterWarning 
            text="Looking to build general academic foundations before IELTS?"
            linkText="Explore Jurassic English™ Academic Thinker Program"
            href="/academic-thinker"
          />

        </div>
      </section>
    </div>
  );
}
