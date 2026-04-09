import { useMemo } from 'react';
import { useQuestionnaire } from '@/contexts/QuestionnaireContext';
import { calculateResults } from '@/lib/scoringEngine';
import { scoringWeights, maturityLevels, redFlags, evidenceChecklist, questions } from '@/data/questionnaireData';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, Shield, TrendingDown, Zap, FileText, ArrowLeft, Target, Clock, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { exportExecutivePDF, exportDetailedPDF } from '@/lib/pdfExport';

export function ResultsDashboard() {
  const { answers, setIsComplete } = useQuestionnaire();
  const results = useMemo(() => calculateResults(answers), [answers]);

  const maturityColorClass: Record<string, string> = {
    critical: 'score-critical',
    significant: 'score-significant',
    moderate: 'score-moderate',
    acceptable: 'score-acceptable',
    good: 'score-good',
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Értékelési Eredmények</h1>
        <Button variant="outline" onClick={() => setIsComplete(false)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Vissza
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportExecutivePDF(results)}>
            <Download className="w-4 h-4 mr-2" /> Vezetői PDF
          </Button>
          <Button variant="default" onClick={() => exportDetailedPDF(results)}>
            <Download className="w-4 h-4 mr-2" /> Részletes PDF
          </Button>
        </div>
      </div>

      {/* Executive Summary */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-lg flex items-center gap-2">
            <Shield className="w-5 h-5" /> Vezetői Összefoglaló
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-5xl font-heading font-bold">{results.totalScore}</div>
              <div className="text-sm text-muted-foreground">/ {results.maxScore} pont</div>
              <div className={cn('mt-2 inline-block px-3 py-1 rounded-full text-sm font-medium', maturityColorClass[results.maturityLevel.color])}>
                {results.maturityLevel.label}
              </div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-heading font-bold text-destructive">{results.triggeredRedFlags.length}</div>
              <div className="text-sm text-muted-foreground">Azonnali Red Flag</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-heading font-bold">{results.answeredCount}</div>
              <div className="text-sm text-muted-foreground">/ {results.totalQuestions} megválaszolt kérdés</div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium">Valós kockázati nyilatkozat:</p>
            <p className="text-sm text-muted-foreground mt-1 italic">
              {results.totalScore <= 25
                ? 'Az intézmény IT biztonsági helyzete kritikus szintű. Azonnali, átfogó beavatkozás szükséges a betegellátás folytonosságának biztosítása érdekében.'
                : results.totalScore <= 50
                ? 'Jelentős biztonsági hiányosságok azonosíthatók, amelyek kezelése sürgős prioritást igényel.'
                : results.totalScore <= 70
                ? 'Mérsékelt biztonsági szint, részleges kontrollokkal. A fennmaradó kockázatok kezelése tervezetten szükséges.'
                : results.totalScore <= 85
                ? 'Elfogadható biztonsági szint, de a fejlesztési lehetőségek kihasználásával tovább erősíthető.'
                : 'Az intézmény jó kontroll szintet mutat. A folyamatos fejlesztés és monitorozás fenntartása javasolt.'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Domain Scores */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-lg flex items-center gap-2">
            <Target className="w-5 h-5" /> Területi Részpontszámok
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {results.domainScores.map(ds => (
              <div key={ds.domain} className="space-y-1.5">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">{ds.labelHu}</span>
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
          <CardTitle className="font-heading text-lg">Érettségi Besorolás</CardTitle>
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
                  <span className="text-sm font-medium">{ml.min}–{ml.max} pont: {ml.label}</span>
                  <p className="text-xs text-muted-foreground">{ml.description}</p>
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
              <AlertTriangle className="w-5 h-5" /> Automatikus Red Flag-ek ({results.triggeredRedFlags.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.triggeredRedFlags.map(rf => (
                <div key={rf.id} className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                  <h4 className="font-medium text-sm text-destructive flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> {rf.titleHu}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1"><strong>Miért kritikus:</strong> {rf.whyCritical}</p>
                  <p className="text-xs text-muted-foreground mt-1"><strong>Lehetséges következmények:</strong> {rf.consequences}</p>
                  <p className="text-xs text-foreground mt-1 font-medium"><strong>Azonnali teendő:</strong> {rf.immediateAction}</p>
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
              <Zap className="w-5 h-5 text-warning" /> Top Gyors Lépések (30 napon belül)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {results.quickWins.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Clock className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                  {w}
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
            <TrendingDown className="w-5 h-5" /> Top 5 Kritikus Kockázat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {results.topRisks.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Badge variant="outline" className="text-[10px] mt-0.5">{i + 1}</Badge>
                {r}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Evidence Checklist */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" /> Bizonyíték Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
            {evidenceChecklist.map((item, i) => (
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
            <AlertTriangle className="w-5 h-5" /> Azonnali Eszkalációs Kritériumok
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Az alábbi feltételek bármelyikének fennállása esetén azonnali vezetői eszkalációt kell kezdeményezni:
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" /> Összpontszám ≤ 25 (Kritikus sebezhetőség)</li>
            <li className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" /> 3 vagy több Red Flag egyszerre</li>
            <li className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" /> Nincs dokumentált restore teszt</li>
            <li className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" /> Nincs kijelölt incidens parancsnok</li>
            <li className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" /> Nincs MFA a beszállítói hozzáférésen</li>
            <li className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" /> Teljes beszállítói függőség (SPOF)</li>
            <li className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" /> Disable Firewall GPO aktív a szervereken</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
