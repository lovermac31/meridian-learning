import { brandPathways } from "@/lib/data";
import { BrandPathwayCard } from "@/components/shared-ui";
import { BookOpen } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-24 px-4 relative overflow-hidden">
        {/* Subtle background motif */}
        <div className="absolute top-0 right-0 opacity-5 pointer-events-none">
          <svg width="400" height="400" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,50 a1,1 0 0,0 100,0" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M10,50 a1,1 0 0,0 80,0" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M20,50 a1,1 0 0,0 60,0" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <Badge className="bg-accent/20 text-accent hover:bg-accent/30 mb-6 border-accent/20">
            The Complete Ecosystem
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Jurassic English™<br />
            <span className="text-accent font-serif font-light text-3xl md:text-5xl mt-2 block">From English Fluency to Academic Thought</span>
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            A five-level literature-based learning ecosystem that helps students read deeply, speak clearly, write with evidence, and think in English.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="#pathways" className={buttonVariants({ size: "lg", className: "bg-accent text-accent-foreground hover:bg-accent/90 border-0 shadow-lg shadow-accent/20" })}>
              Find Your Pathway
            </a>
            <Link href="/interactive-demo" className={buttonVariants({ size: "lg", variant: "outline", className: "bg-white text-primary hover:bg-white/90 border-0 shadow-lg shadow-black/10" })}>
              Try the Interactive Demo
            </Link>
            <Link href="/school-framework" className={buttonVariants({ size: "lg", variant: "outline", className: "border-primary-foreground/20 text-primary-foreground hover:bg-white/10" })}>
              See the Framework
            </Link>
          </div>
        </div>
      </section>

      {/* Demo Teaser Section */}
      <section className="py-16 px-4 bg-primary/5 border-b border-primary/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-primary mb-4">See the Thinking Cycle in Action</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Experience how the Digital Reasoning Engine guides students from reading to evidence-based argument. Try our vertical-slice demo for Levels 1 through 5.
          </p>
          <Link href="/interactive-demo" className={buttonVariants({ size: "lg", className: "bg-primary text-primary-foreground hover:bg-primary/90" })}>
            Launch Interactive Demo <BookOpen className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>

      {/* Pathways Section */}
      <section id="pathways" className="py-24 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary mb-4">Choose Your Pathway</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Different goals require different tools. Select the pathway that best describes what you need Jurassic English™ to help you do.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {brandPathways.map(brand => (
              <BrandPathwayCard key={brand.id} brand={brand} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Evidence Policy Banner */}
      <section className="bg-muted py-16 px-4 border-t border-primary/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-bold text-primary mb-4">Our Commitment to Evidence</h2>
          <p className="text-muted-foreground mb-8">
            Jurassic English™ tracks learning through visible student work, diagnostic evidence, and portfolio artifacts — not unsupported guarantees.
          </p>
          <Link href="/evidence" className={buttonVariants({ variant: "outline", className: "border-primary/20 text-primary" })}>
            Read Our Claims Policy
          </Link>
        </div>
      </section>
    </div>
  );
}

// Need to import Badge, missed it at top
import { Badge } from "@/components/ui/badge";
