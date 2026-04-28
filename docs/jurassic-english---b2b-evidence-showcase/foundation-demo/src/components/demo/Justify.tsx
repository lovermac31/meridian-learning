"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { currentStory } from "@/lib/mock-data";
import { ShieldCheck, CheckCircle2 } from "lucide-react";

export function Justify({ onComplete, previousAnswerId }: { onComplete: (answer: string) => void, previousAnswerId: string | null }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const previousAnswer = currentStory.evaluateOptions.find(o => o.id === previousAnswerId)?.text;

  const handleSubmit = () => {
    if (selected) {
      setSubmitted(true);
      setTimeout(() => {
        onComplete(selected);
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto p-6 w-full">
      <div className="mb-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-navy/10 text-navy mb-6">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-heading font-bold text-navy mb-4">The Because Bridge</h2>
        <p className="text-xl text-muted-foreground">
          Connect your claim to evidence from the text.
        </p>
      </div>

      <div className="w-full flex flex-col md:flex-row gap-8 items-stretch mb-12">
        {/* The Claim */}
        <div className="flex-1">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Your Claim</h3>
          <Card className="p-6 h-full flex items-center justify-center bg-primary text-primary-foreground border-none shadow-md">
            <span className="text-lg font-medium text-center">
              "{previousAnswer || "To help her friend Pip."}"
            </span>
          </Card>
        </div>

        {/* The Bridge */}
        <div className="flex items-center justify-center">
          <div className="bg-accent text-accent-foreground px-6 py-3 rounded-full font-heading font-bold text-lg shadow-sm whitespace-nowrap">
            BECAUSE
          </div>
        </div>

        {/* The Evidence Options */}
        <div className="flex-1 space-y-4">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Text Evidence</h3>
          {currentStory.justifyOptions.map((option) => {
            const isSelected = selected === option.id;
            const isCorrect = option.id === currentStory.correctJustifyOption;
            
            let stateClass = "border-border hover:border-navy/50 hover:bg-parchment/50 cursor-pointer";
            if (isSelected && !submitted) {
              stateClass = "border-navy bg-navy/5 ring-2 ring-navy/20";
            } else if (submitted && isCorrect) {
              stateClass = "border-green-500 bg-green-50 text-green-900";
            } else if (submitted && isSelected && !isCorrect) {
              stateClass = "border-red-300 bg-red-50 text-red-900 opacity-50";
            } else if (submitted && !isSelected) {
              stateClass = "border-border opacity-50";
            }

            return (
              <motion.div
                key={option.id}
                whileHover={!submitted ? { scale: 1.02 } : {}}
                whileTap={!submitted ? { scale: 0.98 } : {}}
              >
                <Card 
                  className={`p-5 transition-all border-2 shadow-sm ${stateClass}`}
                  onClick={() => !submitted && setSelected(option.id)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-md font-medium">{option.text}</span>
                    {submitted && isCorrect && <CheckCircle2 className="text-green-500 ml-2 shrink-0" />}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      <Button
        size="lg"
        disabled={!selected || submitted}
        onClick={handleSubmit}
        className="w-full sm:w-auto bg-navy hover:bg-navy/90 text-white rounded-full px-12 h-14 text-lg shadow-lg shadow-navy/20"
      >
        Complete the Bridge
      </Button>
    </div>
  );
}
