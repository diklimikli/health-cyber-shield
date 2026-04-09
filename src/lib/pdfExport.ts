import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { AssessmentResult } from './scoringEngine';
import { evidenceChecklist } from '@/data/questionnaireData';

function addHeader(doc: jsPDF, title: string, y: number): number {
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, y);
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.5);
  doc.line(14, y + 2, 196, y + 2);
  return y + 10;
}

function addSubHeader(doc: jsPDF, title: string, y: number): number {
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, y);
  return y + 7;
}

function addText(doc: jsPDF, text: string, y: number, opts?: { fontSize?: number; color?: [number, number, number]; bold?: boolean; maxWidth?: number }): number {
  doc.setFontSize(opts?.fontSize ?? 10);
  doc.setFont('helvetica', opts?.bold ? 'bold' : 'normal');
  if (opts?.color) doc.setTextColor(...opts.color);
  else doc.setTextColor(30, 30, 30);

  const maxW = opts?.maxWidth ?? 178;
  const lines = doc.splitTextToSize(text, maxW);
  doc.text(lines, 14, y);
  return y + lines.length * (opts?.fontSize ?? 10) * 0.4 + 2;
}

function checkPage(doc: jsPDF, y: number, needed: number = 20): number {
  if (y + needed > 280) {
    doc.addPage();
    return 20;
  }
  return y;
}

function getRiskStatement(score: number): string {
  if (score <= 25) return 'Az intézmény IT biztonsági helyzete kritikus szintű. Azonnali, átfogó beavatkozás szükséges a betegellátás folytonosságának biztosítása érdekében.';
  if (score <= 50) return 'Jelentős biztonsági hiányosságok azonosíthatók, amelyek kezelése sürgős prioritást igényel.';
  if (score <= 70) return 'Mérsékelt biztonsági szint, részleges kontrollokkal. A fennmaradó kockázatok kezelése tervezetten szükséges.';
  if (score <= 85) return 'Elfogadható biztonsági szint, de a fejlesztési lehetőségek kihasználásával tovább erősíthető.';
  return 'Az intézmény jó kontroll szintet mutat. A folyamatos fejlesztés és monitorozás fenntartása javasolt.';
}

export function exportExecutivePDF(results: AssessmentResult) {
  const doc = new jsPDF();
  let y = 20;

  // Title page
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('IT Biztonsági Értékelés', 14, y);
  y += 10;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Vezetői Összefoglaló', 14, y);
  y += 6;
  doc.setFontSize(9);
  doc.text(`Generálva: ${new Date().toLocaleDateString('hu-HU')}`, 14, y);
  y += 14;

  // Score summary
  y = addHeader(doc, 'Összesített Eredmény', y);
  doc.setFontSize(36);
  doc.setFont('helvetica', 'bold');
  const scoreColor: [number, number, number] = results.totalScore <= 25 ? [220, 38, 38] : results.totalScore <= 50 ? [234, 88, 12] : results.totalScore <= 70 ? [202, 138, 4] : [22, 163, 74];
  doc.setTextColor(...scoreColor);
  doc.text(`${results.totalScore}`, 14, y + 4);
  doc.setFontSize(14);
  doc.setTextColor(100, 116, 139);
  doc.text(`/ ${results.maxScore} pont`, 45, y + 4);
  y += 10;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...scoreColor);
  doc.text(`Besorolás: ${results.maturityLevel.label}`, 14, y);
  y += 6;
  doc.setTextColor(30, 30, 30);
  y = addText(doc, results.maturityLevel.description, y, { fontSize: 9 });
  y += 4;

  // Risk statement
  y = addSubHeader(doc, 'Valós Kockázati Nyilatkozat', y);
  y = addText(doc, getRiskStatement(results.totalScore), y, { fontSize: 10 });
  y += 4;

  // Key metrics
  y = checkPage(doc, y, 30);
  y = addSubHeader(doc, 'Kulcs Mutatók', y);
  autoTable(doc, {
    startY: y,
    head: [['Mutató', 'Érték']],
    body: [
      ['Összpontszám', `${results.totalScore} / ${results.maxScore}`],
      ['Érettségi szint', results.maturityLevel.label],
      ['Red Flag-ek száma', `${results.triggeredRedFlags.length}`],
      ['Megválaszolt kérdések', `${results.answeredCount} / ${results.totalQuestions}`],
    ],
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246], fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    margin: { left: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // Red flags
  if (results.triggeredRedFlags.length > 0) {
    y = checkPage(doc, y, 30);
    y = addHeader(doc, `Red Flag-ek (${results.triggeredRedFlags.length})`, y);
    const rfData = results.triggeredRedFlags.map(rf => [
      rf.titleHu,
      rf.whyCritical,
      rf.immediateAction,
    ]);
    autoTable(doc, {
      startY: y,
      head: [['Red Flag', 'Miért kritikus', 'Azonnali teendő']],
      body: rfData,
      theme: 'striped',
      headStyles: { fillColor: [220, 38, 38], fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      columnStyles: { 0: { cellWidth: 40 }, 1: { cellWidth: 60 }, 2: { cellWidth: 70 } },
      margin: { left: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // Top risks
  y = checkPage(doc, y, 30);
  y = addHeader(doc, 'Top 5 Kritikus Kockázat', y);
  results.topRisks.forEach((r, i) => {
    y = checkPage(doc, y);
    y = addText(doc, `${i + 1}. ${r}`, y, { fontSize: 9 });
  });
  y += 4;

  // Quick wins
  if (results.quickWins.length > 0) {
    y = checkPage(doc, y, 30);
    y = addHeader(doc, 'Gyors Lépések (30 napon belül)', y);
    results.quickWins.forEach(w => {
      y = checkPage(doc, y);
      y = addText(doc, `• ${w}`, y, { fontSize: 9 });
    });
  }

  doc.save('vezeto_osszefoglalo.pdf');
}

export function exportDetailedPDF(results: AssessmentResult) {
  const doc = new jsPDF();
  let y = 20;

  // Title
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('IT Biztonsági Értékelés', 14, y);
  y += 10;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Részletes Audit Jelentés', 14, y);
  y += 6;
  doc.setFontSize(9);
  doc.text(`Generálva: ${new Date().toLocaleDateString('hu-HU')}`, 14, y);
  y += 14;

  // Executive summary section
  y = addHeader(doc, 'Vezetői Összefoglaló', y);
  autoTable(doc, {
    startY: y,
    head: [['Mutató', 'Érték']],
    body: [
      ['Összpontszám', `${results.totalScore} / ${results.maxScore}`],
      ['Százalék', `${results.percentage}%`],
      ['Érettségi szint', results.maturityLevel.label],
      ['Red Flag-ek', `${results.triggeredRedFlags.length}`],
      ['Megválaszolt kérdések', `${results.answeredCount} / ${results.totalQuestions}`],
    ],
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246], fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    margin: { left: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  y = addSubHeader(doc, 'Valós Kockázati Nyilatkozat', y);
  y = addText(doc, getRiskStatement(results.totalScore), y);
  y += 6;

  // Domain scores
  y = checkPage(doc, y, 40);
  y = addHeader(doc, 'Területi Részpontszámok', y);
  const domainData = results.domainScores.map(ds => [
    ds.labelHu,
    `${ds.normalizedScore} / ${ds.maxPoints}`,
    `${ds.percentage}%`,
  ]);
  autoTable(doc, {
    startY: y,
    head: [['Terület', 'Pontszám', 'Százalék']],
    body: domainData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246], fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    margin: { left: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // Red flags
  if (results.triggeredRedFlags.length > 0) {
    y = checkPage(doc, y, 30);
    y = addHeader(doc, `Automatikus Red Flag-ek (${results.triggeredRedFlags.length})`, y);
    results.triggeredRedFlags.forEach(rf => {
      y = checkPage(doc, y, 25);
      y = addSubHeader(doc, `⚠ ${rf.titleHu}`, y);
      y = addText(doc, `Miért kritikus: ${rf.whyCritical}`, y, { fontSize: 8 });
      y = addText(doc, `Következmények: ${rf.consequences}`, y, { fontSize: 8 });
      y = addText(doc, `Azonnali teendő: ${rf.immediateAction}`, y, { fontSize: 8, bold: true });
      y += 3;
    });
  }

  // Top risks
  y = checkPage(doc, y, 30);
  y = addHeader(doc, 'Top 5 Kritikus Kockázat', y);
  results.topRisks.forEach((r, i) => {
    y = checkPage(doc, y);
    y = addText(doc, `${i + 1}. ${r}`, y, { fontSize: 9 });
  });
  y += 4;

  // Quick wins
  if (results.quickWins.length > 0) {
    y = checkPage(doc, y, 30);
    y = addHeader(doc, 'Gyors Lépések (30 napon belül)', y);
    results.quickWins.forEach(w => {
      y = checkPage(doc, y);
      y = addText(doc, `• ${w}`, y, { fontSize: 9 });
    });
    y += 4;
  }

  // Evidence checklist
  y = checkPage(doc, y, 30);
  y = addHeader(doc, 'Bizonyíték Checklist', y);
  const checklistData = evidenceChecklist.map((item, i) => [`${i + 1}.`, item, '☐']);
  autoTable(doc, {
    startY: y,
    head: [['#', 'Dokumentum / Bizonyíték', 'Megvan']],
    body: checklistData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246], fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    columnStyles: { 0: { cellWidth: 10 }, 2: { cellWidth: 18, halign: 'center' } },
    margin: { left: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // Escalation criteria
  y = checkPage(doc, y, 40);
  y = addHeader(doc, 'Azonnali Eszkalációs Kritériumok', y);
  const escalations = [
    'Összpontszám ≤ 25 (Kritikus sebezhetőség)',
    '3 vagy több Red Flag egyszerre',
    'Nincs dokumentált restore teszt',
    'Nincs kijelölt incidens parancsnok',
    'Nincs MFA a beszállítói hozzáférésen',
    'Teljes beszállítói függőség (SPOF)',
    'Disable Firewall GPO aktív a szervereken',
  ];
  escalations.forEach(e => {
    y = checkPage(doc, y);
    y = addText(doc, `⚠ ${e}`, y, { fontSize: 9 });
  });

  doc.save('reszletes_audit_jelentes.pdf');
}
