"use client";

import { useDemoState } from "@/hooks/useDemoState";
import { currentStory, studentProfile } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Printer } from "lucide-react";

export default function ParentReport() {
  const { state, isLoaded } = useDemoState();

  if (!isLoaded) return null;

  return (
    <div className="bg-parchment/30 min-h-full py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex justify-end mb-6 print:hidden">
          <Button variant="outline" className="gap-2" onClick={() => window.print()}>
            <Printer className="w-4 h-4" /> Print Report
          </Button>
        </div>

        <div className="bg-white p-8 md:p-16 rounded-xl shadow-lg border border-border print:shadow-none print:border-none print:p-0">
          <div className="text-center mb-12 border-b border-border pb-8">
            <div className="flex items-center justify-center gap-3 text-primary mb-4">
              <BookOpen className="w-8 h-8" />
              <h1 className="font-heading font-bold text-2xl tracking-wide uppercase">Jurassic English™</h1>
            </div>
            <h2 className="text-3xl font-heading font-bold text-navy mb-2">Growth & Reasoning Report</h2>
            <p className="text-muted-foreground text-lg">Prepared for the parents of <span className="font-bold text-navy">{studentProfile.name}</span></p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            <div>
              <h3 className="font-heading font-bold text-xl text-navy mb-4 border-b border-border pb-2">Academic Profile</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li><strong className="text-navy">Level:</strong> {studentProfile.level}</li>
                <li><strong className="text-navy">Recent Focus:</strong> Critical Reasoning & Textual Evidence</li>
                <li><strong className="text-navy">Current Story:</strong> {currentStory.title}</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-heading font-bold text-xl text-navy mb-4 border-b border-border pb-2">Cognitive Development</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-primary" /> 
                  Vocabulary Acquisition: <strong className="text-navy">Excellent</strong>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-accent" /> 
                  Moral Evaluation: <strong className="text-navy">Developing</strong>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-navy" /> 
                  Evidence Justification: <strong className="text-navy">Mastering</strong>
                </li>
              </ul>
            </div>
          </div>

          <h3 className="font-heading font-bold text-xl text-navy mb-6">Recent Journey Insights</h3>
          
          <div className="space-y-6 mb-12">
            <Card className="border-none bg-parchment/50">
              <CardContent className="p-6">
                <h4 className="font-bold text-navy mb-2 uppercase text-sm tracking-wider">Vocabulary & Analysis</h4>
                <p className="text-muted-foreground">
                  {studentProfile.name} successfully scanned the text to uncover <strong className="text-navy">{state.fossilWordsFound}</strong> target "fossil words" in context, demonstrating strong active reading skills.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none bg-parchment/50">
              <CardContent className="p-6">
                <h4 className="font-bold text-navy mb-2 uppercase text-sm tracking-wider">Evaluation & Justification</h4>
                <p className="text-muted-foreground mb-4">
                  When asked <span className="italic">"{currentStory.bigQuestion}"</span>, {studentProfile.name} demonstrated moral reasoning by concluding:
                </p>
                <div className="bg-white p-4 border-l-4 border-primary rounded text-navy font-medium italic mb-4 shadow-sm">
                  "{currentStory.evaluateOptions.find(o => o.id === state.evaluateAnswered)?.text || 'No answer recorded.'}"
                </div>
                <p className="text-muted-foreground">
                  Crucially, they were able to justify this claim using the "Because Bridge" to connect it back to the text:
                </p>
                <div className="bg-white p-4 border-l-4 border-navy rounded text-navy font-medium italic mt-4 shadow-sm">
                  "{currentStory.justifyOptions.find(o => o.id === state.justifyAnswered)?.text || 'No evidence recorded.'}"
                </div>
              </CardContent>
            </Card>

            <Card className="border-none bg-primary/5">
              <CardContent className="p-6">
                <h4 className="font-bold text-primary mb-2 uppercase text-sm tracking-wider">Student's Personal Reflection</h4>
                <p className="text-navy font-serif text-lg italic">
                  "{state.reflectionText || "No reflection recorded."}"
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center pt-8 border-t border-border">
            <p className="text-muted-foreground italic">
              "English is the medium through which we learn to examine meaningful ideas."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
