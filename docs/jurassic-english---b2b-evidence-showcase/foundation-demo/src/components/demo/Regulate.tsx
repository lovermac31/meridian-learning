"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Leaf } from "lucide-react";

export function Regulate({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"breathe-in" | "hold" | "breathe-out">("breathe-in");
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    if (cycles >= 2) return;

    const sequence = async () => {
      setPhase("breathe-in");
      await new Promise((r) => setTimeout(r, 3000));
      setPhase("hold");
      await new Promise((r) => setTimeout(r, 1500));
      setPhase("breathe-out");
      await new Promise((r) => setTimeout(r, 4000));
      setCycles((c) => c + 1);
    };

    sequence();
  }, [cycles]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <div className="mb-12">
        <h2 className="text-3xl font-heading font-bold text-navy mb-4">Regulation Before Reasoning</h2>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          Take a deep breath to settle your mind before we begin our story journey.
        </p>
      </div>

      <div className="relative w-64 h-64 flex items-center justify-center mb-16">
        <motion.div
          animate={{
            scale: phase === "breathe-in" ? 1.5 : phase === "hold" ? 1.5 : 1,
            opacity: phase === "breathe-in" ? 0.8 : phase === "hold" ? 0.6 : 0.3,
          }}
          transition={{
            duration: phase === "breathe-in" ? 3 : phase === "hold" ? 1.5 : 4,
            ease: "easeInOut",
          }}
          className="absolute w-40 h-40 rounded-full bg-primary/20 blur-xl"
        />
        <motion.div
          animate={{
            scale: phase === "breathe-in" ? 1.2 : phase === "hold" ? 1.2 : 0.9,
          }}
          transition={{
            duration: phase === "breathe-in" ? 3 : phase === "hold" ? 1.5 : 4,
            ease: "easeInOut",
          }}
          className="relative z-10 w-32 h-32 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30"
        >
          <Leaf className="w-12 h-12 text-primary-foreground" />
        </motion.div>
        
        <div className="absolute -bottom-16 w-full text-center">
          <p className="text-xl font-medium text-navy transition-all duration-500">
            {phase === "breathe-in" && "Breathe In..."}
            {phase === "hold" && "Hold..."}
            {phase === "breathe-out" && "Breathe Out..."}
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: cycles >= 1 ? 1 : 0, y: cycles >= 1 ? 0 : 10 }}
        transition={{ duration: 0.5 }}
      >
        <Button 
          size="lg" 
          onClick={onComplete}
          className="bg-primary hover:bg-primary/90 rounded-full px-8 h-12 text-lg"
        >
          I'm Ready to Read
        </Button>
      </motion.div>
    </div>
  );
}
