"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { currentStory } from "@/lib/mock-data";
import { Search, Sparkles } from "lucide-react";

export function Analyze({ onComplete, initialFound = 0 }: { onComplete: (found: number) => void, initialFound?: number }) {
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const targetWords = currentStory.fossilWords;

  const handleWordClick = (word: string, cleanWord: string) => {
    if (targetWords.includes(cleanWord) && !foundWords.includes(cleanWord)) {
      setFoundWords([...foundWords, cleanWord]);
    }
  };

  const renderText = () => {
    return currentStory.text.split(" ").map((word, index) => {
      const cleanWord = word.replace(/[.,]/g, "").toLowerCase();
      const isTarget = targetWords.includes(cleanWord);
      const isFound = foundWords.includes(cleanWord);

      if (isTarget) {
        return (
          <motion.span
            key={index}
            className={`inline-block mx-1 px-1 rounded cursor-pointer transition-colors ${
              isFound 
                ? "bg-accent/30 text-accent-foreground font-bold border-b-2 border-accent" 
                : "hover:bg-primary/10 border-b-2 border-transparent hover:border-primary/30"
            }`}
            onClick={() => handleWordClick(word, cleanWord)}
            whileHover={{ scale: isFound ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {word}
          </motion.span>
        );
      }

      return (
        <span key={index} className="inline-block mx-1">
          {word}
        </span>
      );
    });
  };

  const allFound = foundWords.length === targetWords.length;

  return (
    <div className="flex flex-col items-center max-w-3xl mx-auto p-6">
      <div className="w-full mb-8 flex items-center justify-between bg-parchment p-4 rounded-xl border border-border">
        <div className="flex items-center gap-3 text-navy">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Search className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-xl">Word Fossil Hunt</h2>
            <p className="text-sm text-muted-foreground">Find {targetWords.length} hidden fossil words.</p>
          </div>
        </div>
        <div className="flex gap-2">
          {targetWords.map((_, i) => (
            <div 
              key={i} 
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                i < foundWords.length ? "bg-accent border-accent text-white" : "border-muted-foreground/30 text-transparent"
              }`}
            >
              <Sparkles className="w-4 h-4" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-border text-2xl leading-relaxed text-navy mb-10 font-serif">
        {renderText()}
      </div>

      {allFound && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="text-accent font-bold text-xl flex items-center gap-2">
            <Sparkles /> You found all the fossil words!
          </div>
          <Button 
            size="lg" 
            onClick={() => onComplete(foundWords.length)}
            className="bg-primary hover:bg-primary/90 rounded-full px-8 h-12 text-lg"
          >
            Continue to Evaluate
          </Button>
        </motion.div>
      )}
    </div>
  );
}
