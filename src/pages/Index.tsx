import { useState } from 'react';
import { QuestionnaireProvider, useQuestionnaire } from '@/contexts/QuestionnaireContext';
import { LanguageProvider } from '@/i18n/LanguageContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { t } from '@/i18n/translations';
import { sectionTitleRo, sectionDescRo } from '@/i18n/questionnaireRo';
import { sections, questions } from '@/data/questionnaireData';
import { SectionNav } from '@/components/SectionNav';
import { QuestionCard } from '@/components/QuestionCard';
import { ResultsDashboard } from '@/components/ResultsDashboard';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Shield, ChevronLeft, ChevronRight, BarChart3, FileText, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

function QuestionnaireContent() {
  const { currentSection, setCurrentSection, mode, setMode, answers, isComplete, setIsComplete } = useQuestionnaire();
  const { language } = useLanguage();

  if (isComplete) {
    return <ResultsDashboard />;
  }

  const section = sections[currentSection];
  const sectionQuestions = questions.filter(q => q.sectionId === section.id);
  const killerQuestions = questions.filter(q => q.isKillerQuestion);

  const totalAnswered = Object.values(answers).filter(a => a !== null && a !== undefined && a !== '').length;
  const totalQ = questions.length;
  const progress = Math.round((totalAnswered / totalQ) * 100);

  const displayQuestions = mode === 'executive'
    ? sectionQuestions.filter(q => q.riskWeight === 'Critical' || q.isKillerQuestion)
    : sectionQuestions;

  const sectionTitle = language === 'ro' ? (sectionTitleRo[section.titleHu] || section.titleHu) : section.titleHu;
  const sectionDesc = language === 'ro' ? (sectionDescRo[section.description] || section.description) : section.description;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          <div>
            <h1 className="font-heading text-xl font-bold leading-tight">{t('app.title', language)}</h1>
            <p className="text-xs text-muted-foreground">{t('app.subtitle', language)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <LanguageSwitcher />
          <div className="flex gap-1 bg-secondary rounded-md p-0.5">
            <button
              onClick={() => setMode('executive')}
              className={cn('px-3 py-1.5 rounded text-xs font-medium transition-all',
                mode === 'executive' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Zap className="w-3 h-3 inline mr-1" />{t('mode.executive', language)}
            </button>
            <button
              onClick={() => setMode('detailed')}
              className={cn('px-3 py-1.5 rounded text-xs font-medium transition-all',
                mode === 'detailed' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <FileText className="w-3 h-3 inline mr-1" />{t('mode.detailed', language)}
            </button>
          </div>
          <Button onClick={() => setIsComplete(true)} className="gap-1.5">
            <BarChart3 className="w-4 h-4" /> {t('btn.results', language)}
          </Button>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-3">
        <Progress value={progress} className="h-2 flex-1" />
        <span className="text-xs font-heading font-medium text-muted-foreground">{totalAnswered}/{totalQ} ({progress}%)</span>
      </div>

      {/* Section Nav */}
      <SectionNav />

      {/* Section Header */}
      <div className="bg-card border rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-heading">{currentSection + 1}/{sections.length}</Badge>
          <h2 className="font-heading text-base font-bold">{sectionTitle}</h2>
        </div>
        <p className="text-xs text-muted-foreground mt-1 ml-[52px]">{sectionDesc}</p>
        <p className="text-xs text-muted-foreground mt-1 ml-[52px]">
          {mode === 'executive' ? `${displayQuestions.length} ${t('mode.criticalQ', language)}` : `${displayQuestions.length} ${t('mode.questions', language)}`}
        </p>
      </div>

      {/* Questions */}
      <div className="space-y-3">
        {displayQuestions.map((q, idx) => (
          <QuestionCard key={q.id} question={q} index={idx} />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="outline"
          onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
          disabled={currentSection === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> {t('nav.prevSection', language)}
        </Button>
        {currentSection < sections.length - 1 ? (
          <Button onClick={() => setCurrentSection(currentSection + 1)}>
            {t('nav.nextSection', language)} <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={() => setIsComplete(true)} className="gap-1.5">
            <BarChart3 className="w-4 h-4" /> {t('btn.viewResults', language)}
          </Button>
        )}
      </div>
    </div>
  );
}

const Index = () => {
  return (
    <LanguageProvider>
      <QuestionnaireProvider>
        <div className="min-h-screen bg-background">
          <div className="container max-w-5xl mx-auto py-6 px-4">
            <QuestionnaireContent />
          </div>
        </div>
      </QuestionnaireProvider>
    </LanguageProvider>
  );
};

export default Index;
