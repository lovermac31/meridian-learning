"use client";

import { useDemoState } from "@/hooks/useDemoState";
import { currentStory, studentProfile } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Award, Star, Compass, Brain, ShieldCheck, BookOpen } from "lucide-react";

export default function Portfolio() {
  const { state, isLoaded, resetState } = useDemoState();

  if (!isLoaded) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="flex items-center justify-between mb-12 border-b border-border pb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-parchment flex items-center justify-center text-3xl border border-border shadow-sm">
            {studentProfile.avatar}
          </div>
          <div>
            <h1 className="text-3xl font-heading font-bold text-navy">{studentProfile.name}'s Growth Portfolio</h1>
            <p className="text-muted-foreground">{studentProfile.level}</p>
          </div>
        </div>
        <Button variant="outline" onClick={resetState}>Reset Demo</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-heading text-navy flex items-center gap-2">
                <Award className="text-accent" /> Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between bg-parchment p-3 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <Compass className="w-5 h-5 text-primary" />
                  <span className="font-medium text-sm">Fossil Hunter</span>
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary">Lv 1</Badge>
              </div>
              <div className="flex items-center justify-between bg-parchment p-3 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-navy" />
                  <span className="font-medium text-sm">Truth Builder</span>
                </div>
                <Badge variant="secondary" className="bg-navy/10 text-navy">Lv 2</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <h2 className="text-2xl font-heading font-bold text-navy">Recent Journey: {currentStory.title}</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border-l-4 border-l-primary bg-white">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <Compass className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-navy mb-1 text-sm uppercase">Analyze</h3>
                    <p className="text-sm text-muted-foreground">Found {state.fossilWordsFound} / {currentStory.fossilWords.length} hidden vocabulary words.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-accent bg-white">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <Brain className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-navy mb-1 text-sm uppercase">Evaluate</h3>
                    <p className="text-sm text-muted-foreground">Answered the Big Question correctly.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-navy bg-white">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-navy shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-navy mb-1 text-sm uppercase">Justify</h3>
                    <p className="text-sm text-muted-foreground">Successfully connected claim to textual evidence.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-primary bg-white">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <BookOpen className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-navy mb-1 text-sm uppercase">Reflect</h3>
                    <p className="text-sm text-muted-foreground italic line-clamp-2">"{state.reflectionText || 'No reflection recorded.'}"</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 flex justify-end">
            <Link href="/parent-report">
              <Button size="lg" className="bg-navy hover:bg-navy/90 rounded-full px-8">
                Generate Parent Report
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
