"use client";

import { useDemoState } from "@/hooks/useDemoState";
import { Regulate } from "@/components/demo/Regulate";
import { Analyze } from "@/components/demo/Analyze";
import { Evaluate } from "@/components/demo/Evaluate";
import { Justify } from "@/components/demo/Justify";
import { Reflect } from "@/components/demo/Reflect";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";

export default function StudentDemo() {
  const { state, updateState, isLoaded } = useDemoState();
  const router = useRouter();

  if (!isLoaded) return <div className="p-8 text-center text-muted-foreground">Loading module...</div>;

  const steps = ["REGULATE", "ANALYZE", "EVALUATE", "JUSTIFY", "REFLECT"];
  const currentIndex = steps.indexOf(state.currentStep);
  const progress = ((currentIndex + 1) / steps.length) * 100;

  const handleCompleteRegulate = () => {
    updateState({ currentStep: "ANALYZE" });
  };

  const handleCompleteAnalyze = (found: number) => {
    updateState({ fossilWordsFound: found, currentStep: "EVALUATE" });
  };

  const handleCompleteEvaluate = (answer: string) => {
    updateState({ evaluateAnswered: answer, currentStep: "JUSTIFY" });
  };

  const handleCompleteJustify = (answer: string) => {
    updateState({ justifyAnswered: answer, currentStep: "REFLECT" });
  };

  const handleCompleteReflect = (text: string) => {
    updateState({ reflectionText: text, currentStep: "PORTFOLIO" });
    router.push("/student/portfolio");
  };

  return (
    <div className="min-h-full flex flex-col bg-parchment/30">
      <div className="w-full bg-white border-b border-border p-4 sticky top-16 z-40">
        <div className="container mx-auto max-w-4xl flex items-center justify-between gap-4">
          <span className="text-sm font-heading font-bold text-navy uppercase tracking-wider hidden sm:block">
            {state.currentStep}
          </span>
          <Progress value={progress} className="flex-1 h-2 bg-muted" />
          <span className="text-sm font-medium text-muted-foreground">
            {currentIndex + 1} / {steps.length}
          </span>
        </div>
      </div>

      <div className="flex-1 py-12 px-4">
        {state.currentStep === "REGULATE" && <Regulate onComplete={handleCompleteRegulate} />}
        {state.currentStep === "ANALYZE" && <Analyze onComplete={handleCompleteAnalyze} initialFound={state.fossilWordsFound} />}
        {state.currentStep === "EVALUATE" && <Evaluate onComplete={handleCompleteEvaluate} />}
        {state.currentStep === "JUSTIFY" && <Justify onComplete={handleCompleteJustify} previousAnswerId={state.evaluateAnswered} />}
        {state.currentStep === "REFLECT" && <Reflect onComplete={handleCompleteReflect} />}
      </div>
    </div>
  );
}
