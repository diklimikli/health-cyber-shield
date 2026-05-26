import { useState, createContext, useContext, ReactNode } from 'react';
import { type AnswerValue, type Answers } from '@/lib/scoringEngine';
import type { AuditId } from '@/data/auditRegistry';

interface QuestionnaireContextType {
  answers: Answers;
  setAnswer: (questionId: string, value: AnswerValue) => void;
  currentSection: number;
  setCurrentSection: (s: number) => void;
  mode: 'executive' | 'detailed';
  setMode: (m: 'executive' | 'detailed') => void;
  isComplete: boolean;
  setIsComplete: (v: boolean) => void;
  auditType: AuditId | null;
  setAuditType: (a: AuditId | null) => void;
  resetAudit: () => void;
}

const QuestionnaireContext = createContext<QuestionnaireContextType | null>(null);

export function QuestionnaireProvider({ children }: { children: ReactNode }) {
  const [answers, setAnswers] = useState<Answers>({});
  const [currentSection, setCurrentSection] = useState(0);
  const [mode, setMode] = useState<'executive' | 'detailed'>('detailed');
  const [isComplete, setIsComplete] = useState(false);
  const [auditType, setAuditType] = useState<AuditId | null>(null);

  const setAnswer = (questionId: string, value: AnswerValue) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const resetAudit = () => {
    setAnswers({});
    setCurrentSection(0);
    setIsComplete(false);
    setAuditType(null);
  };

  return (
    <QuestionnaireContext.Provider value={{
      answers, setAnswer, currentSection, setCurrentSection, mode, setMode,
      isComplete, setIsComplete, auditType, setAuditType, resetAudit,
    }}>
      {children}
    </QuestionnaireContext.Provider>
  );
}

export function useQuestionnaire() {
  const ctx = useContext(QuestionnaireContext);
  if (!ctx) throw new Error('useQuestionnaire must be used within QuestionnaireProvider');
  return ctx;
}
