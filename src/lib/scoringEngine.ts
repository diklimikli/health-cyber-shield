import { questions, scoringWeights, maturityLevels, redFlags, type RiskDomain, type Question } from '@/data/questionnaireData';

export type AnswerValue = string | string[] | number | boolean | null;

export interface Answers {
  [questionId: string]: AnswerValue;
}

export interface DomainScore {
  domain: RiskDomain;
  label: string;
  labelHu: string;
  rawScore: number;
  maxRaw: number;
  normalizedScore: number;
  maxPoints: number;
  percentage: number;
}

export interface TriggeredRedFlag {
  id: string;
  title: string;
  titleHu: string;
  whyCritical: string;
  consequences: string;
  immediateAction: string;
}

export interface AssessmentResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
  domainScores: DomainScore[];
  maturityLevel: typeof maturityLevels[number];
  triggeredRedFlags: TriggeredRedFlag[];
  answeredCount: number;
  totalQuestions: number;
  topRisks: string[];
  quickWins: string[];
}

function scoreQuestion(q: Question, answer: AnswerValue): number {
  if (answer === null || answer === undefined || answer === '') return 0;

  switch (q.type) {
    case 'yesno':
      if (typeof answer === 'boolean' || answer === 'yes' || answer === 'no') {
        const isYes = answer === true || answer === 'yes';
        // For most questions, "yes" is the strong answer
        if (q.id === 'VEN-03') return isYes ? 0 : q.maxPoints; // SPOF question - yes is bad
        return isYes ? q.maxPoints : 0;
      }
      return 0;

    case 'multiple':
      if (Array.isArray(answer)) {
        // Multi-select (e.g., VEN-01)
        if (q.id === 'VEN-01') {
          const count = answer.length;
          if (count >= 7) return 0;
          if (count >= 4) return 2;
          return q.maxPoints;
        }
        return Math.round(q.maxPoints * 0.5);
      }
      if (typeof answer === 'string') {
        const opts = q.options || [];
        const idx = opts.indexOf(answer);
        if (idx === -1) return 0;
        // Generally first option = best, last = worst (except some)
        if (q.id === 'VEN-05') {
          const map: Record<string, number> = { 'Soha': 0, 'Évente': 1, 'Félévente': 1, 'Negyedévente': 2, 'Folyamatos monitoring': 2 };
          return map[answer] ?? 0;
        }
        if (q.id === 'BCK-04' || q.id === 'BCK-05' || q.id === 'BCK-06') {
          if (answer.includes('3 hónap') || answer.includes('6 hónap')) return q.maxPoints;
          if (answer.includes('12 hónap')) return Math.round(q.maxPoints * 0.5);
          return 0;
        }
        if (q.id === 'SOC-03') {
          const map: Record<string, number> = { 'Igen, 24/7 valós idejű': 3, 'Munkaidőben élő, éjjel on-call': 1, 'Csak munkaidőben': 0, 'Nem tudjuk': 0 };
          return map[answer] ?? 0;
        }
        if (q.id === 'SOC-04') {
          const map: Record<string, number> = { '15 percen belül': 3, '30 percen belül': 2, '1 órán belül': 1, '4 órán belül': 0, 'Nincs definiált SLA': 0 };
          return map[answer] ?? 0;
        }
        if (q.id === 'SOC-07') {
          if (answer.includes('365+')) return 2;
          if (answer.includes('180') || answer.includes('365 nap')) return 1;
          return 0;
        }
        if (q.id === 'KIL-01') {
          const map: Record<string, number> = { '4 órán belül': 4, '24 órán belül': 3, '48 órán belül': 1, '1 héten belül': 0, 'Nem tudjuk': 0 };
          return map[answer] ?? 0;
        }
        // Default: first option = best
        if (idx === 0) return q.maxPoints;
        if (idx === opts.length - 1) return 0;
        return Math.round(q.maxPoints * (1 - idx / (opts.length - 1)));
      }
      return 0;

    case 'scale':
      if (typeof answer === 'number') {
        return Math.round((answer / 5) * q.maxPoints);
      }
      return 0;

    case 'freetext':
    case 'evidence':
      // If answered (non-empty), give partial credit
      if (typeof answer === 'string' && answer.trim().length > 10) {
        return Math.round(q.maxPoints * 0.7);
      }
      if (typeof answer === 'string' && answer.trim().length > 0) {
        return Math.round(q.maxPoints * 0.4);
      }
      return 0;

    default:
      return 0;
  }
}

function checkRedFlag(q: Question, answer: AnswerValue): boolean {
  if (!q.redFlagTrigger) return false;
  if (answer === null || answer === undefined || answer === '') return true; // No answer on critical = red flag

  if (q.type === 'yesno') {
    const isNo = answer === false || answer === 'no';
    const isYes = answer === true || answer === 'yes';
    // Most red flags trigger on "no" answer
    if (q.id === 'VEN-03') return isYes; // SPOF = yes is bad
    if (q.id === 'EPT-01') return typeof answer === 'string' && answer.toLowerCase().includes('szerver');
    return isNo;
  }

  if (q.type === 'multiple') {
    if (typeof answer === 'string') {
      if (q.id === 'BCK-04') return answer.includes('Soha') || answer.includes('Több mint');
      if (q.id === 'SOC-04') return answer.includes('Nincs');
      if (q.id === 'VPN-03') return answer.includes('megosztott') || answer.includes('Vegyes');
    }
    if (Array.isArray(answer) && q.id === 'VEN-01') return answer.length >= 7;
  }

  if (q.type === 'freetext') {
    return typeof answer === 'string' && answer.trim().length < 5;
  }

  return false;
}

export function calculateResults(answers: Answers): AssessmentResult {
  const domainRawScores: Record<RiskDomain, { raw: number; maxRaw: number }> = {
    vendor_dependency: { raw: 0, maxRaw: 0 },
    access_control: { raw: 0, maxRaw: 0 },
    backup_dr: { raw: 0, maxRaw: 0 },
    soc_monitoring: { raw: 0, maxRaw: 0 },
    incident_ownership: { raw: 0, maxRaw: 0 },
    endpoint_security: { raw: 0, maxRaw: 0 },
    contractual: { raw: 0, maxRaw: 0 },
  };

  const triggeredRedFlags: TriggeredRedFlag[] = [];
  let answeredCount = 0;

  questions.forEach(q => {
    const answer = answers[q.id] ?? null;
    const score = scoreQuestion(q, answer);

    domainRawScores[q.riskDomain].raw += score;
    domainRawScores[q.riskDomain].maxRaw += q.maxPoints;

    if (answer !== null && answer !== undefined && answer !== '') {
      answeredCount++;
    }

    if (checkRedFlag(q, answer)) {
      const rf = redFlags.find(r => r.triggerQuestionId === q.id);
      if (rf && !triggeredRedFlags.find(t => t.id === rf.id)) {
        triggeredRedFlags.push(rf);
      }
    }
  });

  const domainScores: DomainScore[] = Object.entries(scoringWeights).map(([domain, config]) => {
    const raw = domainRawScores[domain as RiskDomain];
    const percentage = raw.maxRaw > 0 ? (raw.raw / raw.maxRaw) * 100 : 0;
    const normalizedScore = Math.round((percentage / 100) * config.maxPoints);

    return {
      domain: domain as RiskDomain,
      label: config.label,
      labelHu: config.labelHu,
      rawScore: raw.raw,
      maxRaw: raw.maxRaw,
      normalizedScore,
      maxPoints: config.maxPoints,
      percentage: Math.round(percentage),
    };
  });

  const totalScore = domainScores.reduce((sum, d) => sum + d.normalizedScore, 0);
  const maxScore = 100;
  const percentage = Math.round((totalScore / maxScore) * 100);

  const maturityLevel = maturityLevels.find(m => totalScore >= m.min && totalScore <= m.max) || maturityLevels[0];

  const sortedDomains = [...domainScores].sort((a, b) => a.percentage - b.percentage);
  const topRisks = sortedDomains.slice(0, 5).map(d => d.labelHu);

  const quickWins: string[] = [];
  if (!answers['VPN-02'] || answers['VPN-02'] === 'no') quickWins.push('MFA bevezetése minden beszállítói hozzáférésre');
  if (!answers['INC-05'] || answers['INC-05'] === 'no') quickWins.push('RACI mátrix elkészítése a kulcsbeszállítók között');
  if (!answers['INC-06'] || answers['INC-06'] === 'no') quickWins.push('P1/P2/P3 súlyossági besorolási modell létrehozása');
  if (!answers['BCK-08'] || answers['BCK-08'] === 'no') quickWins.push('Ransomware recovery runbook készítése');
  if (!answers['SOC-01'] || (typeof answers['SOC-01'] === 'string' && answers['SOC-01'].length < 10)) quickWins.push('SOC naplóforrás leltár elkészítése');

  return {
    totalScore,
    maxScore,
    percentage,
    domainScores,
    maturityLevel,
    triggeredRedFlags,
    answeredCount,
    totalQuestions: questions.length,
    topRisks,
    quickWins,
  };
}
