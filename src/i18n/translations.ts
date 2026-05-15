import type { Language } from './LanguageContext';

const translations = {
  // Header
  'app.title': { hu: 'IT Kiberbiztonsági Értékelés', ro: 'Evaluarea Securității Cibernetice IT', en: 'IT Cybersecurity Assessment' },
  'app.subtitle': { hu: 'IT & Cybersecurity Audit Kérdőív • NIS2', ro: 'Chestionar Audit IT & Cybersecurity • NIS2', en: 'IT & Cybersecurity Audit Questionnaire • NIS2' },
  'mode.executive': { hu: 'Vezetői', ro: 'Executiv', en: 'Executive' },
  'mode.detailed': { hu: 'Részletes Audit', ro: 'Audit Detaliat', en: 'Detailed Audit' },
  'btn.results': { hu: 'Eredmények', ro: 'Rezultate', en: 'Results' },
  'btn.viewResults': { hu: 'Eredmények megtekintése', ro: 'Vizualizare rezultate', en: 'View results' },
  'nav.prevSection': { hu: 'Előző szekció', ro: 'Secțiunea anterioară', en: 'Previous section' },
  'nav.nextSection': { hu: 'Következő szekció', ro: 'Secțiunea următoare', en: 'Next section' },
  'mode.criticalQ': { hu: 'kritikus kérdés', ro: 'întrebări critice', en: 'critical questions' },
  'mode.questions': { hu: 'kérdés', ro: 'întrebări', en: 'questions' },

  // QuestionCard
  'answer.yes': { hu: 'Igen', ro: 'Da', en: 'Yes' },
  'answer.no': { hu: 'Nem', ro: 'Nu', en: 'No' },
  'scale.hint': { hu: '1 = leggyengébb, 5 = legerősebb', ro: '1 = cel mai slab, 5 = cel mai puternic', en: '1 = weakest, 5 = strongest' },
  'input.placeholder': { hu: 'Írja be a választ...', ro: 'Introduceți răspunsul...', en: 'Type your answer...' },
  'evidence.expected': { hu: 'Elvárt bizonyíték', ro: 'Dovadă așteptată', en: 'Expected evidence' },
  'answer.poor': { hu: 'Gyenge válasz:', ro: 'Răspuns slab:', en: 'Poor answer:' },
  'answer.strong': { hu: 'Erős válasz:', ro: 'Răspuns puternic:', en: 'Strong answer:' },

  // ResultsDashboard
  'results.title': { hu: 'Értékelési Eredmények', ro: 'Rezultatele Evaluării', en: 'Assessment Results' },
  'btn.back': { hu: 'Vissza', ro: 'Înapoi', en: 'Back' },
  'btn.pdfDownload': { hu: 'PDF Letöltés', ro: 'Descărcare PDF', en: 'Download PDF' },
  'btn.exporting': { hu: 'Exportálás...', ro: 'Se exportă...', en: 'Exporting...' },
  'results.executiveSummary': { hu: 'Vezetői Összefoglaló', ro: 'Rezumat Executiv', en: 'Executive Summary' },
  'results.points': { hu: 'pont', ro: 'puncte', en: 'points' },
  'results.redFlagImmediate': { hu: 'Azonnali Red Flag', ro: 'Red Flag Imediat', en: 'Immediate Red Flag' },
  'results.answeredQ': { hu: 'megválaszolt kérdés', ro: 'întrebări răspunse', en: 'answered questions' },
  'results.riskStatement': { hu: 'Valós kockázati nyilatkozat:', ro: 'Declarație de risc real:', en: 'Real risk statement:' },
  'results.domainScores': { hu: 'Területi Részpontszámok', ro: 'Scoruri pe Domenii', en: 'Domain Scores' },
  'results.maturityScale': { hu: 'Érettségi Besorolás', ro: 'Clasificare Maturitate', en: 'Maturity Classification' },
  'results.redFlags': { hu: 'Automatikus Red Flag-ek', ro: 'Red Flag-uri Automate', en: 'Automatic Red Flags' },
  'results.whyCritical': { hu: 'Miért kritikus:', ro: 'De ce este critic:', en: 'Why critical:' },
  'results.consequences': { hu: 'Lehetséges következmények:', ro: 'Consecințe posibile:', en: 'Possible consequences:' },
  'results.immediateAction': { hu: 'Azonnali teendő:', ro: 'Acțiune imediată:', en: 'Immediate action:' },
  'results.quickWins': { hu: 'Top Gyors Lépések (30 napon belül)', ro: 'Pași Rapizi de Top (în 30 de zile)', en: 'Top Quick Wins (within 30 days)' },
  'results.topRisks': { hu: 'Top 5 Kritikus Kockázat', ro: 'Top 5 Riscuri Critice', en: 'Top 5 Critical Risks' },
  'results.evidenceChecklist': { hu: 'Bizonyíték Checklist', ro: 'Lista de Verificare a Dovezilor', en: 'Evidence Checklist' },
  'results.escalation': { hu: 'Azonnali Eszkalációs Kritériumok', ro: 'Criterii de Escaladare Imediată', en: 'Immediate Escalation Criteria' },
  'results.escalation.desc': {
    hu: 'Az alábbi feltételek bármelyikének fennállása esetén azonnali vezetői eszkalációt kell kezdeményezni:',
    ro: 'În cazul îndeplinirii oricăreia dintre condițiile de mai jos, trebuie inițiată escaladarea imediată către conducere:',
    en: 'If any of the following conditions are met, an immediate executive escalation must be initiated:'
  },

  // Risk statements
  'risk.critical': {
    hu: 'A szervezet IT biztonsági helyzete kritikus szintű. Azonnali, átfogó beavatkozás szükséges az üzletmenet folytonosságának biztosítása érdekében.',
    ro: 'Situația securității IT a organizației este la nivel critic. Este necesară o intervenție imediată și cuprinzătoare pentru asigurarea continuității afacerii.',
    en: 'The organization\'s IT security posture is at a critical level. Immediate, comprehensive action is required to ensure business continuity.'
  },
  'risk.significant': {
    hu: 'Jelentős biztonsági hiányosságok azonosíthatók, amelyek kezelése sürgős prioritást igényel.',
    ro: 'Au fost identificate lacune semnificative de securitate care necesită prioritate urgentă.',
    en: 'Significant security gaps have been identified that require urgent prioritization.'
  },
  'risk.moderate': {
    hu: 'Mérsékelt biztonsági szint, részleges kontrollokkal. A fennmaradó kockázatok kezelése tervezetten szükséges.',
    ro: 'Nivel moderat de securitate, cu controale parțiale. Gestionarea riscurilor rămase necesită planificare.',
    en: 'Moderate security level with partial controls. Residual risks must be managed in a planned manner.'
  },
  'risk.acceptable': {
    hu: 'Elfogadható biztonsági szint, de a fejlesztési lehetőségek kihasználásával tovább erősíthető.',
    ro: 'Nivel acceptabil de securitate, dar poate fi îmbunătățit prin exploatarea oportunităților de dezvoltare.',
    en: 'Acceptable security level that can be further strengthened by leveraging improvement opportunities.'
  },
  'risk.good': {
    hu: 'Az intézmény jó kontroll szintet mutat. A folyamatos fejlesztés és monitorozás fenntartása javasolt.',
    ro: 'Organizația prezintă un nivel bun de control. Se recomandă menținerea îmbunătățirii și monitorizării continue.',
    en: 'The organization shows a good level of control. Continuous improvement and monitoring should be maintained.'
  },

  // Escalation items
  'esc.1': { hu: 'Összpontszám ≤ 25 (Kritikus sebezhetőség)', ro: 'Scor total ≤ 25 (Vulnerabilitate critică)', en: 'Total score ≤ 25 (Critical vulnerability)' },
  'esc.2': { hu: '3 vagy több Red Flag egyszerre', ro: '3 sau mai multe Red Flag-uri simultan', en: '3 or more Red Flags at the same time' },
  'esc.3': { hu: 'Nincs dokumentált restore teszt', ro: 'Nu există test de restaurare documentat', en: 'No documented restore test' },
  'esc.4': { hu: 'Nincs kijelölt incidens parancsnok', ro: 'Nu există comandant de incident desemnat', en: 'No designated incident commander' },
  'esc.5': { hu: 'Nincs MFA a beszállítói hozzáférésen', ro: 'Nu există MFA pentru accesul furnizorilor', en: 'No MFA on vendor access' },
  'esc.6': { hu: 'Teljes beszállítói függőség (SPOF)', ro: 'Dependență totală de furnizor (SPOF)', en: 'Total vendor dependency (SPOF)' },
  'esc.7': { hu: 'Disable Firewall GPO aktív a szervereken', ro: 'GPO Disable Firewall activ pe servere', en: 'Disable Firewall GPO active on servers' },

  // Infographic
  'infographic.title': { hu: 'Vizuális Infografika', ro: 'Infografic Vizual', en: 'Visual Infographic' },
  'infographic.coverage': { hu: 'Területi Lefedettség', ro: 'Acoperire pe Domenii', en: 'Domain Coverage' },
  'infographic.completion': { hu: 'Kitöltöttség', ro: 'Completare', en: 'Completion' },
  'infographic.answered': { hu: 'Megválaszolt', ro: 'Răspunsuri', en: 'Answered' },
  'infographic.unanswered': { hu: 'Nem válaszolt', ro: 'Fără răspuns', en: 'Unanswered' },
  'infographic.totalScore': { hu: 'Összesített pontszám', ro: 'Scor total', en: 'Total score' },
  'infographic.domainScores': { hu: 'Területi Pontszámok', ro: 'Scoruri pe Domenii', en: 'Domain Scores' },
  'infographic.scorePct': { hu: 'Pontszám %', ro: 'Scor %', en: 'Score %' },
  'infographic.score': { hu: 'Pontszám', ro: 'Scor', en: 'Score' },
  'infographic.maximum': { hu: 'Maximum', ro: 'Maximum', en: 'Maximum' },
  'infographic.riskHeatmap': { hu: 'Kockázati Hőtérkép', ro: 'Hartă de Risc', en: 'Risk Heatmap' },
  'infographic.maturityLevel': { hu: 'Érettségi szint', ro: 'Nivel de maturitate', en: 'Maturity level' },
  'infographic.quickSteps': { hu: 'Gyors lépés', ro: 'Pași rapizi', en: 'Quick steps' },

  // Roadmap
  'roadmap.title': { hu: '120 Napos Remediációs Ütemterv', ro: 'Plan de Remediere pe 120 de Zile', en: '120-Day Remediation Roadmap' },
  'roadmap.subtitle': { hu: 'Priorizált feladatlista az értékelés eredményei alapján, 4 fázisra bontva.', ro: 'Lista de sarcini prioritizate pe baza rezultatelor evaluării, împărțită în 4 faze.', en: 'Prioritized task list based on the assessment results, split into 4 phases.' },
  'roadmap.tasks': { hu: 'feladat', ro: 'sarcini', en: 'tasks' },
  'roadmap.milestone': { hu: 'Mérföldkő', ro: 'Jalon', en: 'Milestone' },
  'roadmap.note': {
    hu: 'Az ütemterv az aktuális értékelési eredményeken alapul. A fázisok közötti átmenet feltétele az előző fázis kritikus feladatainak lezárása. Negyedévente ismételt értékelés javasolt a haladás mérésére.',
    ro: 'Planul se bazează pe rezultatele evaluării actuale. Tranziția între faze este condiționată de finalizarea sarcinilor critice din faza anterioară. Se recomandă o reevaluare trimestrială.',
    en: 'The roadmap is based on the current assessment results. Transition between phases is conditional on closing the critical tasks of the previous phase. A quarterly re-assessment is recommended to measure progress.'
  },
  'roadmap.phase1': { hu: '1. Fázis – Azonnali Beavatkozás', ro: 'Faza 1 – Intervenție Imediată', en: 'Phase 1 – Immediate Action' },
  'roadmap.phase2': { hu: '2. Fázis – Strukturális Javítások', ro: 'Faza 2 – Corectări Structurale', en: 'Phase 2 – Structural Improvements' },
  'roadmap.phase3': { hu: '3. Fázis – Fejlesztések', ro: 'Faza 3 – Îmbunătățiri', en: 'Phase 3 – Enhancements' },
  'roadmap.phase4': { hu: '4. Fázis – Validáció & Érettség', ro: 'Faza 4 – Validare & Maturitate', en: 'Phase 4 – Validation & Maturity' },
  'priority.critical': { hu: 'Kritikus', ro: 'Critic', en: 'Critical' },
  'priority.high': { hu: 'Magas', ro: 'Ridicat', en: 'High' },
  'priority.medium': { hu: 'Közepes', ro: 'Mediu', en: 'Medium' },
} as const;

type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, lang: Language): string {
  return translations[key]?.[lang] ?? key;
}

export { translations };
export type { TranslationKey };
