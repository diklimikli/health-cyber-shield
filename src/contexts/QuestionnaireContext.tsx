import { useState, createContext, useContext, ReactNode } from 'react';
import { type AnswerValue, type Answers } from '@/lib/scoringEngine';

interface QuestionnaireContextType {
  answers: Answers;
  setAnswer: (questionId: string, value: AnswerValue) => void;
  currentSection: number;
  setCurrentSection: (s: number) => void;
  mode: 'executive' | 'detailed';
  setMode: (m: 'executive' | 'detailed') => void;
  isComplete: boolean;
  setIsComplete: (v: boolean) => void;
}

const QuestionnaireContext = createContext<QuestionnaireContextType | null>(null);

export function QuestionnaireProvider({ children }: { children: ReactNode }) {
  const [answers, setAnswers] = useState<Answers>({});
  const [currentSection, setCurrentSection] = useState(0);
  const [mode, setMode] = useState<'executive' | 'detailed'>('detailed');
  const [isComplete, setIsComplete] = useState(false);

  const setAnswer = (questionId: string, value: AnswerValue) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  return (
    <QuestionnaireContext.Provider value={{ answers, setAnswer, currentSection, setCurrentSection, mode, setMode, isComplete, setIsComplete }}>
      {children}
    </QuestionnaireContext.Provider>
  );
}

export function useQuestionnaire() {
  const ctx = useContext(QuestionnaireContext);
  if (!ctx) throw new Error('useQuestionnaire must be used within QuestionnaireProvider');
  return ctx;
}
