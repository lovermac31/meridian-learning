"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

export function Reflect({ onComplete }: { onComplete: (text: string) => void }) {
  const [text, setText] = useState("");
  const [emoji, setEmoji] = useState<string | null>(null);

  const emojis = ["😊", "🤔", "😲", "🌟"];

  const handleSubmit = () => {
    if (text.trim() || emoji) {
      onComplete(`${emoji ? emoji + " " : ""}${text}`);
    }
  };

  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto p-6 w-full">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-6">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-heading font-bold text-navy mb-4">Exit Reflection</h2>
        <p className="text-xl text-muted-foreground">
          How did today's story make you feel? What did you learn?
        </p>
      </div>

      <div className="w-full bg-white p-6 rounded-2xl shadow-sm border border-border mb-8">
        <div className="mb-6">
          <label className="block text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
            Choose a feeling
          </label>
          <div className="flex gap-4">
            {emojis.map(e => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className={`text-4xl p-3 rounded-xl transition-all ${
                  emoji === e 
                    ? "bg-accent/20 scale-110 ring-2 ring-accent" 
                    : "hover:bg-parchment hover:scale-105"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
            Write your thought
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="I learned that being brave means..."
            className="w-full min-h-[120px] p-4 text-lg rounded-xl border-2 border-border focus:border-primary focus:ring-primary/20 transition-colors resize-none font-sans"
          />
        </div>
      </div>

      <Button
        size="lg"
        disabled={!text.trim() && !emoji}
        onClick={handleSubmit}
        className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-12 h-14 text-lg shadow-lg shadow-primary/20"
      >
        Save to Growth Portfolio
      </Button>
    </div>
  );
}
