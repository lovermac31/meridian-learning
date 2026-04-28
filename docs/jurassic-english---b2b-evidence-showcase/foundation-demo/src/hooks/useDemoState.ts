import { useState, useEffect } from 'react';
import { studentProfile } from '@/lib/mock-data';

export type DemoState = {
  fossilWordsFound: number;
  evaluateAnswered: string | null;
  justifyAnswered: string | null;
  reflectionText: string | null;
  currentStep: 'REGULATE' | 'ANALYZE' | 'EVALUATE' | 'JUSTIFY' | 'REFLECT' | 'PORTFOLIO';
};

const defaultState: DemoState = {
  fossilWordsFound: 0,
  evaluateAnswered: null,
  justifyAnswered: null,
  reflectionText: null,
  currentStep: 'REGULATE',
};

export function useDemoState() {
  const [state, setState] = useState<DemoState>(defaultState);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('jurassic-demo-state');
    if (saved) {
      try {
        setState(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved state");
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('jurassic-demo-state', JSON.stringify(state));
    }
  }, [state, isLoaded]);

  const updateState = (updates: Partial<DemoState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const resetState = () => {
    setState(defaultState);
  };

  return { state, updateState, resetState, isLoaded };
}
