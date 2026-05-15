import { type Question as QuestionType } from '@/data/questionnaireData';
import { useQuestionnaire } from '@/contexts/QuestionnaireContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { t } from '@/i18n/translations';
import { questionTextRo, questionPurposeRo, questionPoorAnswerRo, questionStrongAnswerRo, questionExpectedEvidenceRo, optionTranslationsRo } from '@/i18n/questionnaireRo';
import { questionTextEn, questionPurposeEn, questionPoorAnswerEn, questionStrongAnswerEn, questionExpectedEvidenceEn, optionTranslationsEn } from '@/i18n/questionnaireEn';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { AlertTriangle, FileText, Info } from 'lucide-react';

interface Props {
  question: QuestionType;
  index: number;
}

export function QuestionCard({ question, index }: Props) {
  const { answers, setAnswer, mode } = useQuestionnaire();
  const { language } = useLanguage();
  const answer = answers[question.id];

  const riskColors: Record<string, string> = {
    Low: 'bg-muted text-muted-foreground',
    Medium: 'bg-accent/20 text-accent-foreground',
    High: 'bg-warning/20 text-warning',
    Critical: 'bg-destructive/20 text-destructive',
  };

  const pick = <T,>(roMap: Record<string, T>, enMap: Record<string, T>, key: string, fallback: T): T =>
    language === 'ro' ? (roMap[key] ?? fallback) : language === 'en' ? (enMap[key] ?? fallback) : fallback;

  const qText = pick(questionTextRo, questionTextEn, question.id, question.text);
  const qPurpose = pick(questionPurposeRo, questionPurposeEn, question.id, question.purpose);
  const qPoor = pick(questionPoorAnswerRo, questionPoorAnswerEn, question.id, question.poorAnswer);
  const qStrong = pick(questionStrongAnswerRo, questionStrongAnswerEn, question.id, question.strongAnswer);
  const qEvidence = pick(questionExpectedEvidenceRo, questionExpectedEvidenceEn, question.id, question.expectedEvidence);

  const trOpt = (opt: string) => language === 'ro' ? (optionTranslationsRo[opt] || opt) : language === 'en' ? (optionTranslationsEn[opt] || opt) : opt;


  return (
    <div className={cn(
      'border rounded-lg p-5 transition-all',
      answer !== undefined && answer !== null && answer !== '' ? 'border-primary/30 bg-primary/5' : 'border-border bg-card'
    )}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3">
          <span className="font-heading text-xs text-muted-foreground mt-1 min-w-[50px]">{question.id}</span>
          <h3 className="text-sm font-medium leading-relaxed">{qText}</h3>
        </div>
        <div className="flex gap-1.5 flex-shrink-0">
          <Badge variant="outline" className={cn('text-[10px]', riskColors[question.riskWeight])}>
            {question.riskWeight}
          </Badge>
          {question.isKillerQuestion && (
            <Badge variant="outline" className="text-[10px] border-destructive text-destructive">
              <AlertTriangle className="w-3 h-3 mr-1" /> Killer
            </Badge>
          )}
        </div>
      </div>

      {mode === 'detailed' && (
        <div className="mb-3 pl-[62px]">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Info className="w-3 h-3 flex-shrink-0" />
            <span className="italic">{qPurpose}</span>
          </p>
        </div>
      )}

      <div className="pl-[62px]">
        {question.type === 'yesno' && (
          <div className="flex gap-2">
            {['yes', 'no'].map(opt => (
              <button
                key={opt}
                onClick={() => setAnswer(question.id, opt)}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-all border',
                  answer === opt
                    ? opt === 'yes' ? 'bg-success text-success-foreground border-transparent' : 'bg-destructive text-destructive-foreground border-transparent'
                    : 'bg-card border-border text-foreground hover:bg-muted'
                )}
              >
                {opt === 'yes' ? t('answer.yes', language) : t('answer.no', language)}
              </button>
            ))}
          </div>
        )}

        {question.type === 'multiple' && question.options && (
          <div className="flex flex-wrap gap-2">
            {question.options.map(opt => {
              const isMultiSelect = question.id === 'VEN-01';
              const isSelected = isMultiSelect
                ? Array.isArray(answer) && answer.includes(opt)
                : answer === opt;

              return (
                <button
                  key={opt}
                  onClick={() => {
                    if (isMultiSelect) {
                      const prev = Array.isArray(answer) ? answer : [];
                      setAnswer(question.id, prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]);
                    } else {
                      setAnswer(question.id, opt);
                    }
                  }}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-xs font-medium transition-all border',
                    isSelected
                      ? 'bg-primary text-primary-foreground border-transparent'
                      : 'bg-card border-border text-foreground hover:bg-muted'
                  )}
                >
                  {trOpt(opt)}
                </button>
              );
            })}
          </div>
        )}

        {question.type === 'scale' && (
          <div className="flex gap-2 items-center">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => setAnswer(question.id, n)}
                className={cn(
                  'w-10 h-10 rounded-md text-sm font-heading font-bold transition-all border',
                  answer === n
                    ? 'bg-primary text-primary-foreground border-transparent'
                    : 'bg-card border-border text-foreground hover:bg-muted'
                )}
              >
                {n}
              </button>
            ))}
            <span className="text-xs text-muted-foreground ml-2">{t('scale.hint', language)}</span>
          </div>
        )}

        {(question.type === 'freetext' || question.type === 'evidence') && (
          <div>
            <Textarea
              value={typeof answer === 'string' ? answer : ''}
              onChange={e => setAnswer(question.id, e.target.value)}
              placeholder={t('input.placeholder', language)}
              className="text-sm min-h-[80px]"
            />
            {question.type === 'evidence' && (
              <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {t('evidence.expected', language)}: {qEvidence}
              </p>
            )}
          </div>
        )}

        {mode === 'detailed' && (
          <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
            <div className="p-2 rounded bg-destructive/5 border border-destructive/10">
              <span className="font-medium text-destructive">{t('answer.poor', language)}</span>
              <p className="text-muted-foreground mt-0.5">{qPoor}</p>
            </div>
            <div className="p-2 rounded bg-success/10 border border-success/20">
              <span className="font-medium text-success">{t('answer.strong', language)}</span>
              <p className="text-muted-foreground mt-0.5">{qStrong}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
