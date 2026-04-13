import type { Language } from './LanguageContext';

const translations = {
  // Header
  'app.title': { hu: 'Kórházi Kiberbiztonsági Értékelés', ro: 'Evaluarea Securității Cibernetice a Spitalului' },
  'app.subtitle': { hu: 'IT & Cybersecurity Audit Kérdőív • NIS2 / DNSC', ro: 'Chestionar Audit IT & Cybersecurity • NIS2 / DNSC' },
  'mode.executive': { hu: 'Vezetői', ro: 'Executiv' },
  'mode.detailed': { hu: 'Részletes Audit', ro: 'Audit Detaliat' },
  'btn.results': { hu: 'Eredmények', ro: 'Rezultate' },
  'btn.viewResults': { hu: 'Eredmények megtekintése', ro: 'Vizualizare rezultate' },
  'nav.prevSection': { hu: 'Előző szekció', ro: 'Secțiunea anterioară' },
  'nav.nextSection': { hu: 'Következő szekció', ro: 'Secțiunea următoare' },
  'mode.criticalQ': { hu: 'kritikus kérdés', ro: 'întrebări critice' },
  'mode.questions': { hu: 'kérdés', ro: 'întrebări' },

  // QuestionCard
  'answer.yes': { hu: 'Igen', ro: 'Da' },
  'answer.no': { hu: 'Nem', ro: 'Nu' },
  'scale.hint': { hu: '1 = leggyengébb, 5 = legerősebb', ro: '1 = cel mai slab, 5 = cel mai puternic' },
  'input.placeholder': { hu: 'Írja be a választ...', ro: 'Introduceți răspunsul...' },
  'evidence.expected': { hu: 'Elvárt bizonyíték', ro: 'Dovadă așteptată' },
  'answer.poor': { hu: 'Gyenge válasz:', ro: 'Răspuns slab:' },
  'answer.strong': { hu: 'Erős válasz:', ro: 'Răspuns puternic:' },

  // ResultsDashboard
  'results.title': { hu: 'Értékelési Eredmények', ro: 'Rezultatele Evaluării' },
  'btn.back': { hu: 'Vissza', ro: 'Înapoi' },
  'btn.pdfDownload': { hu: 'PDF Letöltés', ro: 'Descărcare PDF' },
  'btn.exporting': { hu: 'Exportálás...', ro: 'Se exportă...' },
  'results.executiveSummary': { hu: 'Vezetői Összefoglaló', ro: 'Rezumat Executiv' },
  'results.points': { hu: 'pont', ro: 'puncte' },
  'results.redFlagImmediate': { hu: 'Azonnali Red Flag', ro: 'Red Flag Imediat' },
  'results.answeredQ': { hu: 'megválaszolt kérdés', ro: 'întrebări răspunse' },
  'results.riskStatement': { hu: 'Valós kockázati nyilatkozat:', ro: 'Declarație de risc real:' },
  'results.domainScores': { hu: 'Területi Részpontszámok', ro: 'Scoruri pe Domenii' },
  'results.maturityScale': { hu: 'Érettségi Besorolás', ro: 'Clasificare Maturitate' },
  'results.redFlags': { hu: 'Automatikus Red Flag-ek', ro: 'Red Flag-uri Automate' },
  'results.whyCritical': { hu: 'Miért kritikus:', ro: 'De ce este critic:' },
  'results.consequences': { hu: 'Lehetséges következmények:', ro: 'Consecințe posibile:' },
  'results.immediateAction': { hu: 'Azonnali teendő:', ro: 'Acțiune imediată:' },
  'results.quickWins': { hu: 'Top Gyors Lépések (30 napon belül)', ro: 'Pași Rapizi de Top (în 30 de zile)' },
  'results.topRisks': { hu: 'Top 5 Kritikus Kockázat', ro: 'Top 5 Riscuri Critice' },
  'results.evidenceChecklist': { hu: 'Bizonyíték Checklist', ro: 'Lista de Verificare a Dovezilor' },
  'results.escalation': { hu: 'Azonnali Eszkalációs Kritériumok', ro: 'Criterii de Escaladare Imediată' },
  'results.escalation.desc': {
    hu: 'Az alábbi feltételek bármelyikének fennállása esetén azonnali vezetői eszkalációt kell kezdeményezni:',
    ro: 'În cazul îndeplinirii oricăreia dintre condițiile de mai jos, trebuie inițiată escaladarea imediată către conducere:'
  },

  // Risk statements
  'risk.critical': {
    hu: 'Az intézmény IT biztonsági helyzete kritikus szintű. Azonnali, átfogó beavatkozás szükséges a betegellátás folytonosságának biztosítása érdekében.',
    ro: 'Situația securității IT a instituției este la nivel critic. Este necesară o intervenție imediată și cuprinzătoare pentru asigurarea continuității îngrijirii pacienților.'
  },
  'risk.significant': {
    hu: 'Jelentős biztonsági hiányosságok azonosíthatók, amelyek kezelése sürgős prioritást igényel.',
    ro: 'Au fost identificate lacune semnificative de securitate care necesită prioritate urgentă.'
  },
  'risk.moderate': {
    hu: 'Mérsékelt biztonsági szint, részleges kontrollokkal. A fennmaradó kockázatok kezelése tervezetten szükséges.',
    ro: 'Nivel moderat de securitate, cu controale parțiale. Gestionarea riscurilor rămase necesită planificare.'
  },
  'risk.acceptable': {
    hu: 'Elfogadható biztonsági szint, de a fejlesztési lehetőségek kihasználásával tovább erősíthető.',
    ro: 'Nivel acceptabil de securitate, dar poate fi îmbunătățit prin exploatarea oportunităților de dezvoltare.'
  },
  'risk.good': {
    hu: 'Az intézmény jó kontroll szintet mutat. A folyamatos fejlesztés és monitorozás fenntartása javasolt.',
    ro: 'Instituția prezintă un nivel bun de control. Se recomandă menținerea îmbunătățirii și monitorizării continue.'
  },

  // Escalation items
  'esc.1': { hu: 'Összpontszám ≤ 25 (Kritikus sebezhetőség)', ro: 'Scor total ≤ 25 (Vulnerabilitate critică)' },
  'esc.2': { hu: '3 vagy több Red Flag egyszerre', ro: '3 sau mai multe Red Flag-uri simultan' },
  'esc.3': { hu: 'Nincs dokumentált restore teszt', ro: 'Nu există test de restaurare documentat' },
  'esc.4': { hu: 'Nincs kijelölt incidens parancsnok', ro: 'Nu există comandant de incident desemnat' },
  'esc.5': { hu: 'Nincs MFA a beszállítói hozzáférésen', ro: 'Nu există MFA pentru accesul furnizorilor' },
  'esc.6': { hu: 'Teljes beszállítói függőség (SPOF)', ro: 'Dependență totală de furnizor (SPOF)' },
  'esc.7': { hu: 'Disable Firewall GPO aktív a szervereken', ro: 'GPO Disable Firewall activ pe servere' },

  // Infographic
  'infographic.title': { hu: 'Vizuális Infografika', ro: 'Infografic Vizual' },
  'infographic.coverage': { hu: 'Területi Lefedettség', ro: 'Acoperire pe Domenii' },
  'infographic.completion': { hu: 'Kitöltöttség', ro: 'Completare' },
  'infographic.answered': { hu: 'Megválaszolt', ro: 'Răspunsuri' },
  'infographic.unanswered': { hu: 'Nem válaszolt', ro: 'Fără răspuns' },
  'infographic.totalScore': { hu: 'Összesített pontszám', ro: 'Scor total' },
  'infographic.domainScores': { hu: 'Területi Pontszámok', ro: 'Scoruri pe Domenii' },
  'infographic.scorePct': { hu: 'Pontszám %', ro: 'Scor %' },
  'infographic.score': { hu: 'Pontszám', ro: 'Scor' },
  'infographic.maximum': { hu: 'Maximum', ro: 'Maximum' },
  'infographic.riskHeatmap': { hu: 'Kockázati Hőtérkép', ro: 'Hartă de Risc' },
  'infographic.maturityLevel': { hu: 'Érettségi szint', ro: 'Nivel de maturitate' },
  'infographic.quickSteps': { hu: 'Gyors lépés', ro: 'Pași rapizi' },

  // Roadmap
  'roadmap.title': { hu: '120 Napos Remediációs Ütemterv', ro: 'Plan de Remediere pe 120 de Zile' },
  'roadmap.subtitle': { hu: 'Priorizált feladatlista az értékelés eredményei alapján, 4 fázisra bontva.', ro: 'Lista de sarcini prioritizate pe baza rezultatelor evaluării, împărțită în 4 faze.' },
  'roadmap.tasks': { hu: 'feladat', ro: 'sarcini' },
  'roadmap.milestone': { hu: 'Mérföldkő', ro: 'Jalon' },
  'roadmap.note': {
    hu: 'Az ütemterv az aktuális értékelési eredményeken alapul. A fázisok közötti átmenet feltétele az előző fázis kritikus feladatainak lezárása. Negyedévente ismételt értékelés javasolt a haladás mérésére.',
    ro: 'Planul se bazează pe rezultatele evaluării actuale. Tranziția între faze este condiționată de finalizarea sarcinilor critice din faza anterioară. Se recomandă o reevaluare trimestrială.'
  },
  'roadmap.phase1': { hu: '1. Fázis – Azonnali Beavatkozás', ro: 'Faza 1 – Intervenție Imediată' },
  'roadmap.phase2': { hu: '2. Fázis – Strukturális Javítások', ro: 'Faza 2 – Corectări Structurale' },
  'roadmap.phase3': { hu: '3. Fázis – Fejlesztések', ro: 'Faza 3 – Îmbunătățiri' },
  'roadmap.phase4': { hu: '4. Fázis – Validáció & Érettség', ro: 'Faza 4 – Validare & Maturitate' },
  'priority.critical': { hu: 'Kritikus', ro: 'Critic' },
  'priority.high': { hu: 'Magas', ro: 'Ridicat' },
  'priority.medium': { hu: 'Közepes', ro: 'Mediu' },
} as const;

type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, lang: Language): string {
  return translations[key]?.[lang] ?? key;
}

export { translations };
export type { TranslationKey };
