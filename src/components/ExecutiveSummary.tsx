import { useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useQuestionnaire } from '@/contexts/QuestionnaireContext';
import { useActiveAudit } from '@/hooks/useActiveAudit';
import { calculateResults } from '@/lib/scoringEngine';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Download, AlertTriangle, ShieldCheck, ShieldAlert, ShieldX, Briefcase, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type StatusLevel = 'critical' | 'improvement' | 'compliant';

function statusFromScore(score: number): { level: StatusLevel; label: string; classes: string; Icon: typeof ShieldCheck } {
  if (score <= 40) return { level: 'critical', label: 'KRITIKUS', classes: 'bg-destructive text-destructive-foreground', Icon: ShieldX };
  if (score <= 70) return { level: 'improvement', label: 'FEJLESZTENDŐ', classes: 'bg-warning text-warning-foreground', Icon: ShieldAlert };
  return { level: 'compliant', label: 'MEGFELELŐ', classes: 'bg-emerald-600 text-white', Icon: ShieldCheck };
}

function maturityFromPct(pct: number): string {
  if (pct <= 20) return 'L1 - Kezdeti';
  if (pct <= 40) return 'L2 - Ismétlődő';
  if (pct <= 60) return 'L3 - Definiált';
  if (pct <= 80) return 'L4 - Mért';
  return 'L5 - Optimalizált';
}

export function ExecutiveSummary() {
  const { answers, setShowExecutive } = useQuestionnaire();
  const audit = useActiveAudit();
  const { toast } = useToast();
  const reportRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<string>('');
  const [exporting, setExporting] = useState(false);

  const results = useMemo(() => calculateResults(answers, {
    questions: audit.questions,
    scoringWeights: audit.scoringWeights,
    maturityLevels: audit.maturityLevels,
    redFlags: audit.redFlags,
    quickWinsBuilder: audit.quickWinsBuilder,
  }), [answers, audit]);

  const status = statusFromScore(results.totalScore);

  // Synthetic compliance matrix derived from the audit domain coverage.
  const complianceMatrix = useMemo(() => {
    const avg = results.domainScores.length
      ? Math.round(results.domainScores.reduce((s, d) => s + d.percentage, 0) / results.domainScores.length)
      : 0;
    const findByKey = (...keys: string[]) => {
      for (const k of keys) {
        const d = results.domainScores.find(x => x.domain.toLowerCase().includes(k));
        if (d) return d.percentage;
      }
      return avg;
    };
    return [
      { framework: 'NIS2', pct: findByKey('incident', 'soc', 'monitor', 'backup') },
      { framework: 'NIST CSF', pct: findByKey('access', 'endpoint', 'identity') },
      { framework: 'GDPR', pct: findByKey('data', 'gdpr', 'privacy', 'contract') },
      { framework: 'SOC-CMM', pct: findByKey('soc', 'monitor', 'detection') },
    ].map(row => ({ ...row, maturity: maturityFromPct(row.pct) }));
  }, [results]);

  const unansweredCount = results.totalQuestions - results.answeredCount;

  const topRisks = useMemo(() => {
    const fromRedFlags = results.triggeredRedFlags.slice(0, 3).map(rf => ({
      title: rf.titleHu,
      detail: rf.consequences,
    }));
    if (fromRedFlags.length >= 3) return fromRedFlags;
    const fillers = results.topRisks
      .filter(r => !fromRedFlags.some(f => f.title.toLowerCase().includes(r.toLowerCase())))
      .slice(0, 3 - fromRedFlags.length)
      .map(r => ({ title: `Alacsony lefedettség: ${r}`, detail: 'A területen feltárt hiányosságok jelentős üzleti kockázatot hordoznak (jogi felelősség, leállási idő, hírnévromlás).' }));
    return [...fromRedFlags, ...fillers];
  }, [results]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      const auditData = {
        auditType: audit.id,
        totalScore: results.totalScore,
        maxScore: results.maxScore,
        maturityLevel: results.maturityLevel.label,
        answeredCount: results.answeredCount,
        totalQuestions: results.totalQuestions,
        domainScores: results.domainScores.map(d => ({
          domain: d.labelHu,
          percentage: d.percentage,
          points: `${d.normalizedScore}/${d.maxPoints}`,
        })),
        triggeredRedFlags: results.triggeredRedFlags.map(rf => ({
          title: rf.titleHu,
          whyCritical: rf.whyCritical,
          consequences: rf.consequences,
        })),
        topRisks: results.topRisks,
        quickWins: results.quickWins,
        complianceMatrix,
        unansweredChecklistItems: unansweredCount,
      };

      try {
        const { data, error } = await supabase.functions.invoke('executive-summary', {
          body: { auditData },
        });
        if (cancelled) return;
        if (error) throw error;
        setSummary(data?.summary || '');
      } catch (e: any) {
        if (cancelled) return;
        console.error(e);
        toast({
          title: 'Hiba a jelentés generálása közben',
          description: e?.message || 'Ismeretlen hiba történt.',
          variant: 'destructive',
        });
        setSummary('');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleExportPdf = async () => {
    if (!reportRef.current || exporting) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
      const imgData = canvas.toDataURL('image/jpeg', 0.85);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save('vezetoi_osszefoglalo.pdf');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <Briefcase className="w-7 h-7 text-primary" />
          <div>
            <h1 className="font-heading text-2xl font-bold leading-tight">Vezetői Jelentés</h1>
            <p className="text-xs text-muted-foreground">Boardroom-ready összefoglaló • NIS2 • NIST • GDPR • SOC-CMM</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => setShowExecutive(false)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Vissza
          </Button>
          <Button onClick={handleExportPdf} disabled={exporting || loading}>
            {exporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            {exporting ? 'Exportálás...' : 'PDF exportálás'}
          </Button>
        </div>
      </div>

      <div ref={reportRef} className="space-y-6 bg-background p-2">
        {/* Status snapshot */}
        <Card className="border-2 border-primary/30 overflow-hidden">
          <div className={cn('px-6 py-3 flex items-center gap-3', status.classes)}>
            <status.Icon className="w-6 h-6" />
            <span className="font-heading font-bold text-lg tracking-wide">ÁLLAPOT PILLANATKÉP</span>
            <Badge className="ml-auto bg-white/20 text-current border-0 backdrop-blur">{status.label}</Badge>
          </div>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-4xl font-heading font-bold">{results.totalScore}</div>
                <div className="text-xs text-muted-foreground mt-1">/ 100 pont</div>
              </div>
              <div>
                <div className="text-4xl font-heading font-bold text-destructive">{results.triggeredRedFlags.length}</div>
                <div className="text-xs text-muted-foreground mt-1">Azonnali kockázat</div>
              </div>
              <div>
                <div className="text-4xl font-heading font-bold">{results.answeredCount}<span className="text-base text-muted-foreground">/{results.totalQuestions}</span></div>
                <div className="text-xs text-muted-foreground mt-1">Lefedettség</div>
              </div>
              <div>
                <div className="text-2xl font-heading font-bold">{results.maturityLevel.label}</div>
                <div className="text-xs text-muted-foreground mt-1">Érettségi szint</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Two-column: risks + compliance matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-lg flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" /> Top 3 Üzleti Kockázat
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topRisks.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nincs azonnali jelentős üzleti kockázat azonosítva.</p>
              ) : (
                <Accordion type="single" collapsible defaultValue="risk-0">
                  {topRisks.map((r, i) => (
                    <AccordionItem key={i} value={`risk-${i}`}>
                      <AccordionTrigger className="text-left text-sm font-medium">
                        <span className="flex items-start gap-2">
                          <Badge variant="destructive" className="text-[10px] mt-0.5">{i + 1}</Badge>
                          {r.title}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="text-xs text-muted-foreground">
                        {r.detail}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-lg flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" /> Megfelelőségi Mátrix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Keretrendszer</TableHead>
                    <TableHead className="text-right">Megfelelés</TableHead>
                    <TableHead>Érettség</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complianceMatrix.map(row => {
                    const s = statusFromScore(row.pct);
                    return (
                      <TableRow key={row.framework}>
                        <TableCell className="font-medium">{row.framework}</TableCell>
                        <TableCell className="text-right">
                          <Badge className={cn('font-mono', s.classes)}>{row.pct}%</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{row.maturity}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* AI generated narrative */}
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> Vezetői Narratíva
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground italic flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  A technikai adatok lefordítása üzleti jelentéssé folyamatban...
                </p>
                <div className="space-y-3">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-11/12" />
                  <Skeleton className="h-3 w-10/12" />
                  <Skeleton className="h-5 w-1/2 mt-4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-11/12" />
                  <Skeleton className="h-5 w-2/5 mt-4" />
                  <Skeleton className="h-24 w-full" />
                </div>
              </div>
            ) : summary ? (
              <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-heading prose-headings:mt-6 prose-headings:mb-3 prose-h2:text-base prose-h2:font-bold prose-h2:border-b prose-h2:pb-2 prose-table:text-xs prose-th:bg-muted prose-th:font-semibold prose-td:py-1.5 prose-li:my-0.5">
                <ReactMarkdown>{summary}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">A jelentés generálása nem sikerült. Próbáld újra később.</p>
            )}
          </CardContent>
        </Card>

        {/* Call to action */}
        <Card className="border-warning/40 bg-warning/5">
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-lg flex items-center gap-2 text-warning-foreground">
              <Briefcase className="w-5 h-5" /> Szükséges Vezetői Döntések
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2"><span className="font-heading font-bold text-warning">→</span><span><strong>Költségvetés jóváhagyása</strong> a kritikus kockázatok 90 napon belüli kezelésére (Top 3 kockázat).</span></li>
              <li className="flex items-start gap-2"><span className="font-heading font-bold text-warning">→</span><span><strong>Felelős vezető (CISO / IT igazgató) kijelölése</strong> a remediációs ütemterv tulajdonosának.</span></li>
              <li className="flex items-start gap-2"><span className="font-heading font-bold text-warning">→</span><span><strong>Külső audit / penetrációs teszt</strong> megrendelése a NIS2 megfelelőség igazolására.</span></li>
              <li className="flex items-start gap-2"><span className="font-heading font-bold text-warning">→</span><span><strong>Negyedéves kockázati review</strong> rögzítése a vezetői napirendben.</span></li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
