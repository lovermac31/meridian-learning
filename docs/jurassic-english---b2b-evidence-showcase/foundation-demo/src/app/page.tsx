import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Brain, BookOpen, Compass, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full relative overflow-hidden bg-gradient-to-b from-parchment to-white border-b border-border/50">
        <div className="absolute inset-0 bg-[url('/fossil-texture.svg')] opacity-5 pointer-events-none mix-blend-multiply"></div>
        <div className="container mx-auto px-4 md:px-8 py-24 md:py-32 flex flex-col items-center text-center relative z-10">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm text-primary mb-8 font-medium">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
            Jurassic English™ Level 1
          </div>
          <h1 className="text-5xl md:text-7xl font-heading font-bold tracking-tight text-navy mb-6 max-w-4xl">
            First Stories. <br className="hidden md:block" />
            <span className="text-primary">First Thinking.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed font-sans">
            A premium curriculum operating system where English is not just the object of study, but the medium through which children learn to examine meaningful ideas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/student">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                Start Student Demo <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/teacher">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-primary/20 text-navy hover:bg-primary/5">
                View Teacher Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Core Philosophy Section */}
      <section className="w-full py-24 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-navy mb-4">The Jurassic Thinking Cycle™</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Developing critical reasoning, structured reflection, and academic expression through authentic story-based learning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-none shadow-md hover:shadow-xl transition-shadow bg-parchment/30">
              <CardContent className="p-8 flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
                  <Compass className="h-8 w-8" />
                </div>
                <h3 className="font-heading font-bold text-xl mb-3 text-navy">Analyze</h3>
                <p className="text-muted-foreground text-sm">Students actively scan texts to uncover 'fossil words'—building vocabulary in context.</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md hover:shadow-xl transition-shadow bg-parchment/30">
              <CardContent className="p-8 flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 text-accent">
                  <Brain className="h-8 w-8" />
                </div>
                <h3 className="font-heading font-bold text-xl mb-3 text-navy">Evaluate</h3>
                <p className="text-muted-foreground text-sm">Grappling with the 'Big Question'. Making moral and logical choices based on character actions.</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md hover:shadow-xl transition-shadow bg-parchment/30">
              <CardContent className="p-8 flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-2xl bg-navy/10 flex items-center justify-center mb-6 text-navy">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <h3 className="font-heading font-bold text-xl mb-3 text-navy">Justify</h3>
                <p className="text-muted-foreground text-sm">The 'Because Bridge'. Learning to connect claims to textual evidence systematically.</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md hover:shadow-xl transition-shadow bg-parchment/30">
              <CardContent className="p-8 flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
                  <BookOpen className="h-8 w-8" />
                </div>
                <h3 className="font-heading font-bold text-xl mb-3 text-navy">Reflect</h3>
                <p className="text-muted-foreground text-sm">Internalizing the lesson through structured exit reflections and emotional check-ins.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
