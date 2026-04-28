"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { currentStory } from "@/lib/mock-data";
import { Brain, CheckCircle2 } from "lucide-react";

export function Evaluate({ onComplete }: { onComplete: (answer: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (selected) {
      setSubmitted(true);
      // Brief pause to show correct state before moving on
      setTimeout(() => {
        onComplete(selected);
      }, 1500);
    }
  };

  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto p-6">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 text-accent mb-6">
          <Brain className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-heading font-bold text-navy mb-4">The Big Question</h2>
        <p className="text-xl text-muted-foreground">
          {currentStory.bigQuestion}
        </p>
      </div>

      <div className="w-full space-y-4 mb-8">
        {currentStory.evaluateOptions.map((option) => {
          const isSelected = selected === option.id;
          const isCorrect = option.id === currentStory.correctEvaluateOption;
          
          let stateClass = "border-border hover:border-primary/50 hover:bg-parchment/50 cursor-pointer";
          if (isSelected && !submitted) {
            stateClass = "border-primary bg-primary/5 ring-2 ring-primary/20";
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
              whileHover={!submitted ? { scale: 1.01 } : {}}
              whileTap={!submitted ? { scale: 0.99 } : {}}
            >
              <Card 
                className={`p-6 transition-all border-2 shadow-sm ${stateClass}`}
                onClick={() => !submitted && setSelected(option.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium">{option.text}</span>
                  {submitted && isCorrect && <CheckCircle2 className="text-green-500" />}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Button
        size="lg"
        disabled={!selected || submitted}
        onClick={handleSubmit}
        className="w-full sm:w-auto bg-primary hover:bg-primary/90 rounded-full px-12 h-14 text-lg"
      >
        Lock in Answer
      </Button>
    </div>
  );
}
