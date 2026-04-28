"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, RefreshCw, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function RegulateWidget({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState<"ready" | "breathe" | "done">("ready");

  const startBreathing = () => {
    setStage("breathe");
    setTimeout(() => {
      setStage("done");
      setTimeout(onComplete, 1500);
    }, 4000);
  };

  return (
    <Card className="max-w-md mx-auto text-center border-primary/20 shadow-md">
      <CardHeader>
        <CardTitle className="text-xl text-primary">1. Regulate</CardTitle>
        <p className="text-sm text-muted-foreground">Reasoning requires a calm nervous system.</p>
      </CardHeader>
      <CardContent className="flex justify-center py-8">
        <AnimatePresence mode="wait">
          {stage === "ready" && (
            <motion.div key="ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Button onClick={startBreathing} size="lg" className="rounded-full bg-primary hover:bg-primary/90">
                Start Focus Exercise
              </Button>
            </motion.div>
          )}
          {stage === "breathe" && (
            <motion.div
              key="breathe"
              initial={{ scale: 1, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 3, ease: "easeInOut" }}
              className="w-24 h-24 rounded-full bg-accent/20 border-4 border-accent flex items-center justify-center"
            >
              <span className="text-accent font-semibold">Breathe In...</span>
            </motion.div>
          )}
          {stage === "done" && (
            <motion.div key="done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-primary">
              <CheckCircle2 className="w-12 h-12 mb-2" />
              <p className="font-semibold">Ready to reason.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

export function AuthenticReader({ text, highlightText }: { text: string; highlightText?: string }) {
  // A simple visual representation of the Encounter stage
  return (
    <Card className="border-primary/10 shadow-sm bg-primary/5">
      <CardHeader>
        <CardTitle className="text-lg text-primary flex items-center gap-2">
          2. Encounter & Analyze
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="p-6 bg-card rounded border border-primary/10 font-serif text-lg leading-relaxed text-foreground/90">
          {highlightText ? (
            <p>
              {text.split(highlightText)[0]}
              <span className="bg-accent/30 font-semibold px-1 rounded">{highlightText}</span>
              {text.split(highlightText)[1]}
            </p>
          ) : (
            <p>{text}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export type CEIWLevel = 1 | 2 | 3 | 4 | 5;

export function DREBuilder({ level, onSubmit, examples }: { level: CEIWLevel; onSubmit: (data: any) => void; examples?: any }) {
  const [claim, setClaim] = useState("");
  const [evidence, setEvidence] = useState("");
  const [interpretation, setInterpretation] = useState("");
  const [warrant, setWarrant] = useState("");
  const [impact, setImpact] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ claim, evidence, interpretation, warrant, impact });
  };

  const fillExample = () => {
    if (!examples) return;
    if (examples.claim) setClaim(examples.claim);
    if (examples.evidence) setEvidence(examples.evidence);
    if (examples.interpretation) setInterpretation(examples.interpretation);
    if (examples.warrant) setWarrant(examples.warrant);
    if (examples.impact) setImpact(examples.impact);
  };

  return (
    <Card className="border-primary/20 shadow-lg">
      <CardHeader className="bg-primary/5 border-b border-primary/10 rounded-t-xl">
        <CardTitle className="text-xl text-primary flex justify-between items-center">
          <span>Digital Reasoning Engine</span>
          <span className="text-sm px-3 py-1 bg-primary text-primary-foreground rounded-full">Level {level} Active</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground pt-2 flex justify-between items-center">
          <span>
            {level === 1 && "Construct a basic claim."}
            {level === 2 && "Support your claim with text evidence."}
            {level === 3 && "Explain what your evidence means."}
            {level === 4 && "Select a logical principle (warrant) to defend your reasoning."}
            {level === 5 && "Evaluate the systemic impact of this reasoning."}
          </span>
          {examples && (
            <Button variant="outline" size="sm" onClick={fillExample} type="button" className="text-xs h-8">
              <RefreshCw className="w-3 h-3 mr-2" /> Fill Example
            </Button>
          )}
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* C: Claim (Levels 1-5) */}
          {level >= 1 && (
            <div className="space-y-2">
              <label className="text-sm font-bold text-primary flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs">C</span>
                Claim
              </label>
              <input
                type="text"
                required
                placeholder="What is your position?"
                className="w-full p-3 rounded-md border border-input bg-background text-sm"
                value={claim}
                onChange={(e) => setClaim(e.target.value)}
              />
            </div>
          )}

          {/* E: Evidence (Levels 2-5) */}
          {level >= 2 && (
            <div className="space-y-2">
              <label className="text-sm font-bold text-accent flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-accent text-primary-foreground flex items-center justify-center text-xs">E</span>
                Evidence
              </label>
              <textarea
                required
                placeholder="Quote the text exactly..."
                className="w-full p-3 rounded-md border border-input bg-background text-sm min-h-[80px]"
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
              />
            </div>
          )}

          {/* I: Interpretation (Levels 3-5) */}
          {level >= 3 && (
            <div className="space-y-2">
              <label className="text-sm font-bold text-primary flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs">I</span>
                Interpretation
              </label>
              <textarea
                required
                placeholder="What does this evidence mean in your own words?"
                className="w-full p-3 rounded-md border border-input bg-background text-sm min-h-[80px]"
                value={interpretation}
                onChange={(e) => setInterpretation(e.target.value)}
              />
            </div>
          )}

          {/* W: Warrant (Levels 4-5) */}
          {level >= 4 && (
            <div className="space-y-2">
              <label className="text-sm font-bold text-destructive flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-destructive text-primary-foreground flex items-center justify-center text-xs">W</span>
                Warrant (Underlying Principle)
              </label>
              <select
                required
                className="w-full p-3 rounded-md border border-input bg-background text-sm"
                value={warrant}
                onChange={(e) => setWarrant(e.target.value)}
              >
                <option value="" disabled>Select a logical principle...</option>
                <option value="cause-effect">Cause and Effect (If X happens, Y follows)</option>
                <option value="ethics">Ethical Obligation (We have a duty to do X)</option>
                <option value="analogy">Analogy (X is similar to Y)</option>
              </select>
            </div>
          )}

          {/* Impact (Level 5) */}
          {level >= 5 && (
            <div className="space-y-2">
              <label className="text-sm font-bold text-primary flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs">+</span>
                Impact & Counter-Warrant
              </label>
              <textarea
                required
                placeholder="Acknowledge a counter-argument and explain the systemic impact..."
                className="w-full p-3 rounded-md border border-input bg-background text-sm min-h-[80px]"
                value={impact}
                onChange={(e) => setImpact(e.target.value)}
              />
            </div>
          )}

          <Button type="submit" className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">
            Generate Portfolio Artifact <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
