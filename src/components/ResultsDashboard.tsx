import { useMemo, useRef, useState } from 'react';
import { useQuestionnaire } from '@/contexts/QuestionnaireContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { t } from '@/i18n/translations';
import { redFlagTitleRo, redFlagWhyCriticalRo, redFlagConsequencesRo, redFlagImmediateActionRo, maturityLabelRo, maturityDescRo, domainLabelRo, evidenceChecklistRo, quickWinsRo } from '@/i18n/questionnaireRo';
import { redFlagTitleEn, redFlagWhyCriticalEn, redFlagConsequencesEn, redFlagImmediateActionEn, maturityLabelEn, maturityDescEn, domainLabelEn, evidenceChecklistEn, quickWinsEn } from '@/i18n/questionnaireEn';
import { calculateResults } from '@/lib/scoringEngine';
import { scoringWeights, maturityLevels, redFlags, evidenceChecklist, questions } from '@/data/questionnaireData';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, Shield, TrendingDown, Zap, FileText, ArrowLeft, Target, Clock, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { cn } from '@/lib/utils';
import { exportResultsPDF } from '@/lib/pdfExport';


export function ResultsDashboard() {
  const { answers, setIsComplete } = useQuestionnaire();
  const { language } = useLanguage();
  const results = useMemo(() => calculateResults(answers), [answers]);
  const contentRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const maturityColorClass: Record<string, string> = {
    critical: 'score-critical',
    significant: 'score-significant',
    moderate: 'score-moderate',
    acceptable: 'score-acceptable',
    good: 'score-good',
  };

  const handleExport = async (filename: string) => {
    if (exporting) return;
    setExporting(true);
    try {
      await exportResultsPDF(results, language, filename);
    } finally {
      setExporting(false);
    }
  };

  const pickStr = (ro: Record<string, string>, en: Record<string, string>, key: string, fb: string) =>
    language === 'ro' ? (ro[key] || fb) : language === 'en' ? (en[key] || fb) : fb;

  const trMaturityLabel = (label: string) => pickStr(maturityLabelRo, maturityLabelEn, label, label);
  const trMaturityDesc = (desc: string) => pickStr(maturityDescRo, maturityDescEn, desc, desc);
  const trDomainLabel = (labelHu: string) => pickStr(domainLabelRo, domainLabelEn, labelHu, labelHu);
  const trRedFlagTitle = (rf: { id: string; titleHu: string }) => pickStr(redFlagTitleRo, redFlagTitleEn, rf.id, rf.titleHu);
  const trQuickWin = (w: string) => pickStr(quickWinsRo, quickWinsEn, w, w);

  const getRiskStatement = () => {
    if (results.totalScore <= 25) return t('risk.critical', language);
    if (results.totalScore <= 50) return t('risk.significant', language);
    if (results.totalScore <= 70) return t('risk.moderate', language);
    if (results.totalScore <= 85) return t('risk.acceptable', language);
    return t('risk.good', language);
  };

  const evChecklist = language === 'ro' ? evidenceChecklistRo : language === 'en' ? evidenceChecklistEn : evidenceChecklist;
  const pdfFilename = language === 'ro' ? 'evaluare_securitate_it.pdf' : language === 'en' ? 'it_security_assessment.pdf' : 'it_biztonsagi_ertekeles.pdf';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="font-heading text-2xl font-bold">{t('results.title', language)}</h1>
        <div className="flex gap-2 flex-wrap">
          <LanguageSwitcher />
          <Button variant="outline" onClick={() => setIsComplete(false)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> {t('btn.back', language)}
          </Button>
          <Button variant="default" onClick={() => handleExport(pdfFilename)} disabled={exporting}>
            {exporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            {exporting ? t('btn.exporting', language) : t('btn.pdfDownload', language)}
          </Button>
        </div>
      </div>

      <div ref={contentRef} className="space-y-6">
        {/* Executive Summary */}
        <Card className="border-2 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-lg flex items-center gap-2">
              <Shield className="w-5 h-5" /> {t('results.executiveSummary', language)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-5xl font-heading font-bold">{results.totalScore}</div>
                <div className="text-sm text-muted-foreground">/ {results.maxScore} {t('results.points', language)}</div>
                <div className={cn('mt-2 inline-block px-3 py-1 rounded-full text-sm font-medium', maturityColorClass[results.maturityLevel.color])}>
                  {trMaturityLabel(results.maturityLevel.label)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-heading font-bold text-destructive">{results.triggeredRedFlags.length}</div>
                <div className="text-sm text-muted-foreground">{t('results.redFlagImmediate', language)}</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-heading font-bold">{results.answeredCount}</div>
                <div className="text-sm text-muted-foreground">/ {results.totalQuestions} {t('results.answeredQ', language)}</div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">{t('results.riskStatement', language)}</p>
              <p className="text-sm text-muted-foreground mt-1 italic">{getRiskStatement()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Domain Scores */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-lg flex items-center gap-2">
              <Target className="w-5 h-5" /> {t('results.domainScores', language)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.domainScores.map(ds => (
                <div key={ds.domain} className="space-y-1.5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">{trDomainLabel(ds.labelHu)}</span>
                    <span className="font-heading font-bold">{ds.normalizedScore} / {ds.maxPoints} pt <span className="text-muted-foreground font-normal">({ds.percentage}%)</span></span>
                  </div>
                  <Progress value={ds.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Maturity Scale */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-lg">{t('results.maturityScale', language)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {maturityLevels.map(ml => (
                <div key={ml.label} className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border transition-all',
                  results.maturityLevel.label === ml.label ? 'border-primary bg-primary/5' : 'border-transparent'
                )}>
                  <div className={cn('w-3 h-3 rounded-full flex-shrink-0', maturityColorClass[ml.color])} />
                  <div className="flex-1">
                    <span className="text-sm font-medium">{ml.min}–{ml.max} {t('results.points', language)}: {trMaturityLabel(ml.label)}</span>
                    <p className="text-xs text-muted-foreground">{trMaturityDesc(ml.description)}</p>
                  </div>
                  {results.maturityLevel.label === ml.label && <CheckCircle className="w-4 h-4 text-primary" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Red Flags */}
        {results.triggeredRedFlags.length > 0 && (
          <Card className="border-destructive/30">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-lg flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" /> {t('results.redFlags', language)} ({results.triggeredRedFlags.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {results.triggeredRedFlags.map(rf => (
                  <div key={rf.id} className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                    <h4 className="font-medium text-sm text-destructive flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> {trRedFlagTitle(rf)}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      <strong>{t('results.whyCritical', language)}</strong> {language === 'ro' ? (redFlagWhyCriticalRo[rf.id] || rf.whyCritical) : rf.whyCritical}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      <strong>{t('results.consequences', language)}</strong> {language === 'ro' ? (redFlagConsequencesRo[rf.id] || rf.consequences) : rf.consequences}
                    </p>
                    <p className="text-xs text-foreground mt-1 font-medium">
                      <strong>{t('results.immediateAction', language)}</strong> {language === 'ro' ? (redFlagImmediateActionRo[rf.id] || rf.immediateAction) : rf.immediateAction}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Wins */}
        {results.quickWins.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-warning" /> {t('results.quickWins', language)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {results.quickWins.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Clock className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                    {trQuickWin(w)}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Top Risks */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-lg flex items-center gap-2">
              <TrendingDown className="w-5 h-5" /> {t('results.topRisks', language)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {results.topRisks.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Badge variant="outline" className="text-[10px] mt-0.5">{i + 1}</Badge>
                  {trDomainLabel(r)}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Evidence Checklist */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-lg flex items-center gap-2">
              <FileText className="w-5 h-5" /> {t('results.evidenceChecklist', language)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
              {evChecklist.map((item, i) => (
                <label key={i} className="flex items-start gap-2 text-xs p-1.5 hover:bg-muted rounded cursor-pointer">
                  <input type="checkbox" className="mt-0.5 rounded border-border" />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Escalation Criteria */}
        <Card className="border-warning/30">
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-lg flex items-center gap-2 text-warning">
              <AlertTriangle className="w-5 h-5" /> {t('results.escalation', language)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">{t('results.escalation.desc', language)}</p>
            <ul className="space-y-2 text-sm">
              {[1, 2, 3, 4, 5, 6, 7].map(n => (
                <li key={n} className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                  {t(`esc.${n}` as any, language)}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
