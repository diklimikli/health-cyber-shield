import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, CheckCircle, ArrowRight, Calendar, Flag } from 'lucide-react';
import type { AssessmentResult } from '@/lib/scoringEngine';
import { cn } from '@/lib/utils';

interface Phase {
  id: string;
  title: string;
  timeframe: string;
  days: string;
  color: string;
  badgeClass: string;
  tasks: RoadmapTask[];
}

interface RoadmapTask {
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium';
  domain: string;
  milestone: string;
}

function generateRoadmap(results: AssessmentResult): Phase[] {
  const { triggeredRedFlags, domainScores, quickWins, totalScore } = results;
  const weakDomains = [...domainScores].sort((a, b) => a.percentage - b.percentage);

  // Phase 1: 0-30 days — Critical/Immediate
  const phase1Tasks: RoadmapTask[] = [];

  // Red flags are always phase 1
  triggeredRedFlags.forEach(rf => {
    phase1Tasks.push({
      title: rf.titleHu,
      description: rf.immediateAction,
      priority: 'critical',
      domain: 'Red Flag',
      milestone: 'Red Flag megszüntetése',
    });
  });

  // Quick wins
  quickWins.forEach(w => {
    if (!phase1Tasks.find(t => t.title === w)) {
      phase1Tasks.push({
        title: w,
        description: 'Gyors, alacsony költségű lépés a biztonsági szint azonnali javítására.',
        priority: 'high',
        domain: 'Quick Win',
        milestone: 'Alapvető kontrollok bevezetése',
      });
    }
  });

  // Always add basic incident management if score is low
  if (totalScore <= 50) {
    phase1Tasks.push({
      title: 'Incidens parancsnok kijelölése',
      description: 'Formálisan ki kell jelölni az incidens parancsnokot felelősségi mátrix-szal.',
      priority: 'critical',
      domain: 'Incident Ownership',
      milestone: 'Incidenskezelési alapok lefektetése',
    });
  }

  // Phase 2: 31-60 days — High priority structural fixes
  const phase2Tasks: RoadmapTask[] = [];

  // Weakest domains get structural tasks
  weakDomains.slice(0, 3).forEach(d => {
    if (d.percentage < 50) {
      const tasks = getDomainTasks(d.domain, d.labelHu, 'phase2');
      phase2Tasks.push(...tasks);
    }
  });

  if (phase2Tasks.length === 0) {
    phase2Tasks.push({
      title: 'Biztonsági policy-k felülvizsgálata',
      description: 'Meglévő IT biztonsági szabályzatok aktualizálása az audit eredmények alapján.',
      priority: 'medium',
      domain: 'Governance',
      milestone: 'Dokumentáció frissítése',
    });
  }

  // Phase 3: 61-90 days — Medium priority improvements
  const phase3Tasks: RoadmapTask[] = [];

  weakDomains.slice(0, 5).forEach(d => {
    if (d.percentage < 70) {
      const tasks = getDomainTasks(d.domain, d.labelHu, 'phase3');
      phase3Tasks.push(...tasks);
    }
  });

  if (phase3Tasks.length === 0) {
    phase3Tasks.push({
      title: 'Kockázatkezelési keretrendszer finomítása',
      description: 'A fennmaradó kockázatok rendszeres felülvizsgálati folyamatának kialakítása.',
      priority: 'medium',
      domain: 'Governance',
      milestone: 'Folyamatos fejlesztés elindítása',
    });
  }

  // Phase 4: 91-120 days — Validation and maturity
  const phase4Tasks: RoadmapTask[] = [
    {
      title: 'Belső kontroll audit végrehajtása',
      description: 'Az előző 90 nap intézkedéseinek hatékonyság-vizsgálata és gap analízis.',
      priority: 'medium',
      domain: 'Governance',
      milestone: 'Kontroll validáció',
    },
    {
      title: 'Ismételt kockázatértékelés futtatása',
      description: 'A kérdőív ismételt kitöltése az elért javulás mérésére.',
      priority: 'medium',
      domain: 'Validáció',
      milestone: 'Haladás mérése',
    },
    {
      title: 'Folyamatos monitoring bevezetése',
      description: 'Automatizált riportolás és KPI dashboard kialakítása a biztonsági szint nyomon követésére.',
      priority: 'medium',
      domain: 'SOC/Monitoring',
      milestone: 'Fenntartható működés',
    },
  ];

  return [
    {
      id: 'phase1',
      title: '1. Fázis – Azonnali Beavatkozás',
      timeframe: '0–30 nap',
      days: '30',
      color: 'hsl(var(--destructive))',
      badgeClass: 'bg-destructive/10 text-destructive border-destructive/20',
      tasks: phase1Tasks,
    },
    {
      id: 'phase2',
      title: '2. Fázis – Strukturális Javítások',
      timeframe: '31–60 nap',
      days: '30',
      color: 'hsl(var(--warning, 38 92% 50%))',
      badgeClass: 'bg-warning/10 text-warning border-warning/20',
      tasks: phase2Tasks,
    },
    {
      id: 'phase3',
      title: '3. Fázis – Fejlesztések',
      timeframe: '61–90 nap',
      days: '30',
      color: 'hsl(var(--primary))',
      badgeClass: 'bg-primary/10 text-primary border-primary/20',
      tasks: phase3Tasks,
    },
    {
      id: 'phase4',
      title: '4. Fázis – Validáció & Érettség',
      timeframe: '91–120 nap',
      days: '30',
      color: 'hsl(var(--accent-foreground))',
      badgeClass: 'bg-accent text-accent-foreground border-accent',
      tasks: phase4Tasks,
    },
  ];
}

function getDomainTasks(domain: string, labelHu: string, phase: 'phase2' | 'phase3'): RoadmapTask[] {
  const tasks: Record<string, Record<string, RoadmapTask[]>> = {
    vendor_dependency: {
      phase2: [
        { title: 'Beszállítói kockázatértékelési keretrendszer bevezetése', description: 'Formalizált vendor risk assessment folyamat kidolgozása és alkalmazása minden kritikus beszállítóra.', priority: 'high', domain: labelHu, milestone: 'Vendor kontroll erősítése' },
        { title: 'Beszállítói SLA-k felülvizsgálata', description: 'Meglévő szerződések SLA feltételeinek átvizsgálása és szükség szerinti módosítása.', priority: 'high', domain: labelHu, milestone: 'Szerződéses védelem' },
      ],
      phase3: [
        { title: 'Alternatív beszállító azonosítása SPOF területekre', description: 'Single Point of Failure csökkentése alternatív megoldások feltérképezésével.', priority: 'medium', domain: labelHu, milestone: 'Beszállítói diverzifikáció' },
      ],
    },
    access_control: {
      phase2: [
        { title: 'MFA kiterjesztése minden kritikus rendszerre', description: 'Többfaktoros hitelesítés bevezetése minden adminisztrátori és üzletkritikus rendszer hozzáférésre.', priority: 'high', domain: labelHu, milestone: 'Hozzáférés-biztonság javítása' },
      ],
      phase3: [
        { title: 'Privileged Access Management (PAM) bevezetése', description: 'Kiemelt jogosultságok kezelésének automatizálása és auditálhatóvá tétele.', priority: 'medium', domain: labelHu, milestone: 'PAM implementáció' },
      ],
    },
    backup_dr: {
      phase2: [
        { title: 'DR terv elkészítése és dokumentálása', description: 'Disaster Recovery terv készítése a kritikus rendszerekre, RTO/RPO célértékek meghatározásával.', priority: 'high', domain: labelHu, milestone: 'DR terv létrehozása' },
        { title: 'Backup restore teszt végrehajtása', description: 'Valós restore teszt a mentések visszaállíthatóságának validálására.', priority: 'high', domain: labelHu, milestone: 'Mentés validáció' },
      ],
      phase3: [
        { title: 'Offsite/immutable backup bevezetése', description: 'Ransomware-védett, módosíthatatlan mentések kialakítása offline vagy felhő alapon.', priority: 'medium', domain: labelHu, milestone: 'Mentési stratégia erősítése' },
      ],
    },
    soc_monitoring: {
      phase2: [
        { title: 'SIEM/naplógyűjtés kiterjesztése', description: 'Központi naplógyűjtés bevezetése minden kritikus rendszerre, korrelációs szabályokkal.', priority: 'high', domain: labelHu, milestone: 'Monitoring bővítés' },
      ],
      phase3: [
        { title: 'SOC működési modell kialakítása', description: 'Belső vagy hibrid SOC modell definiálása eszkalációs folyamatokkal.', priority: 'medium', domain: labelHu, milestone: 'SOC érettség növelése' },
      ],
    },
    incident_ownership: {
      phase2: [
        { title: 'Incidenskezelési playbook-ok elkészítése', description: 'Top 5 incidenstípusra részletes válaszlépések dokumentálása.', priority: 'high', domain: labelHu, milestone: 'Incidenskezelési érettség' },
      ],
      phase3: [
        { title: 'Tabletop exercise végrehajtása', description: 'Szimulált incidensgyakorlat a válaszképesség tesztelésére.', priority: 'medium', domain: labelHu, milestone: 'Gyakorlati felkészültség' },
      ],
    },
    endpoint_security: {
      phase2: [
        { title: 'EDR megoldás bevezetése', description: 'Endpoint Detection & Response eszköz telepítése minden szerverre és munkaállomásra.', priority: 'high', domain: labelHu, milestone: 'Végpontvédelem javítása' },
      ],
      phase3: [
        { title: 'Patch management folyamat formalizálása', description: 'Rendszeres, automatizált javítócsomagok telepítése ütemezetten.', priority: 'medium', domain: labelHu, milestone: 'Sérülékenységkezelés' },
      ],
    },
    contractual: {
      phase2: [
        { title: 'Szerződéses biztonsági záradékok felülvizsgálata', description: 'IT biztonsági követelmények beépítése minden beszállítói szerződésbe.', priority: 'high', domain: labelHu, milestone: 'Szerződéses védelem' },
      ],
      phase3: [
        { title: 'NIS2 megfelelőségi gap analízis', description: 'NIS2 irányelv követelményeinek leképezése a jelenlegi kontrollokra.', priority: 'medium', domain: labelHu, milestone: 'Szabályozási megfelelőség' },
      ],
    },
  };

  return tasks[domain]?.[phase] || [];
}

const priorityConfig = {
  critical: { label: 'Kritikus', icon: AlertTriangle, class: 'bg-destructive/10 text-destructive border-destructive/20' },
  high: { label: 'Magas', icon: Flag, class: 'bg-warning/10 text-warning border-warning/20' },
  medium: { label: 'Közepes', icon: Clock, class: 'bg-primary/10 text-primary border-primary/20' },
};

export function RemediationRoadmap({ results }: { results: AssessmentResult }) {
  const phases = useMemo(() => generateRoadmap(results), [results]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="font-heading text-lg flex items-center gap-2">
          <Calendar className="w-5 h-5" /> 120 Napos Remediációs Ütemterv
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Priorizált feladatlista az értékelés eredményei alapján, 4 fázisra bontva.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timeline visual */}
        <div className="flex gap-1 h-3 rounded-full overflow-hidden">
          {phases.map(p => (
            <div
              key={p.id}
              className="flex-1 relative"
              style={{ backgroundColor: p.color }}
            >
              <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white drop-shadow">
                {p.timeframe}
              </span>
            </div>
          ))}
        </div>

        {/* Phase cards */}
        {phases.map((phase, phaseIdx) => (
          <div key={phase.id} className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold text-white" style={{ backgroundColor: phase.color }}>
                {phaseIdx + 1}
              </div>
              <div>
                <h3 className="font-heading font-semibold text-sm">{phase.title}</h3>
                <span className="text-xs text-muted-foreground">{phase.timeframe}</span>
              </div>
              <Badge variant="outline" className={cn('ml-auto text-[10px]', phase.badgeClass)}>
                {phase.tasks.length} feladat
              </Badge>
            </div>

            <div className="ml-4 border-l-2 border-border pl-4 space-y-2">
              {phase.tasks.map((task, i) => {
                const pCfg = priorityConfig[task.priority];
                const PIcon = pCfg.icon;
                return (
                  <div key={i} className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-2">
                      <PIcon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: task.priority === 'critical' ? 'hsl(var(--destructive))' : undefined }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium">{task.title}</span>
                          <Badge variant="outline" className={cn('text-[9px]', pCfg.class)}>
                            {pCfg.label}
                          </Badge>
                          <Badge variant="secondary" className="text-[9px]">{task.domain}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                        <div className="flex items-center gap-1 mt-1.5 text-[10px] text-muted-foreground">
                          <CheckCircle className="w-3 h-3" />
                          <span>Mérföldkő: {task.milestone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {phaseIdx < phases.length - 1 && (
              <div className="flex justify-center">
                <ArrowRight className="w-4 h-4 text-muted-foreground rotate-90" />
              </div>
            )}
          </div>
        ))}

        {/* Summary footer */}
        <div className="p-3 bg-muted rounded-lg text-xs text-muted-foreground">
          <strong>Megjegyzés:</strong> Az ütemterv az aktuális értékelési eredményeken alapul. A fázisok közötti átmenet feltétele az előző fázis kritikus feladatainak lezárása. Negyedévente ismételt értékelés javasolt a haladás mérésére.
        </div>
      </CardContent>
    </Card>
  );
}
