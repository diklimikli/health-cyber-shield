import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import bannerUrl from '@/assets/pdf-header-banner.png';
import type { AssessmentResult } from './scoringEngine';
import type { Language } from '@/i18n/LanguageContext';
import { t } from '@/i18n/translations';
import {
  redFlagTitleRo,
  redFlagWhyCriticalRo,
  redFlagConsequencesRo,
  redFlagImmediateActionRo,
  maturityLabelRo,
  domainLabelRo,
  evidenceChecklistRo,
  quickWinsRo,
} from '@/i18n/questionnaireRo';
import {
  redFlagTitleEn,
  redFlagWhyCriticalEn,
  redFlagConsequencesEn,
  redFlagImmediateActionEn,
  maturityLabelEn,
  domainLabelEn,
  evidenceChecklistEn,
  quickWinsEn,
} from '@/i18n/questionnaireEn';
import { evidenceChecklist } from '@/data/questionnaireData';

const pickI18n = (ro: Record<string, string>, en: Record<string, string>, key: string, fb: string, lang: Language) =>
  lang === 'ro' ? (ro[key] || fb) : lang === 'en' ? (en[key] || fb) : fb;

// ---------- Banner cache ----------
let bannerCache: { dataUrl: string; ratio: number } | null = null;
async function loadBanner(): Promise<{ dataUrl: string; ratio: number }> {
  if (bannerCache) return bannerCache;
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = bannerUrl;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Banner load failed'));
  });
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);
  bannerCache = {
    dataUrl: canvas.toDataURL('image/jpeg', 0.85),
    ratio: img.naturalHeight / img.naturalWidth,
  };
  return bannerCache;
}

// ---------- HTML escape ----------
const esc = (s: string) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

// ---------- Localization helpers ----------
function trDomain(labelHu: string, lang: Language) {
  return lang === 'ro' ? domainLabelRo[labelHu] || labelHu : labelHu;
}
function trMaturity(label: string, lang: Language) {
  return lang === 'ro' ? maturityLabelRo[label] || label : label;
}
function trQuickWin(w: string, lang: Language) {
  return lang === 'ro' ? quickWinsRo[w] || w : w;
}
function trRedFlagTitle(rf: { id: string; titleHu: string }, lang: Language) {
  return lang === 'ro' ? redFlagTitleRo[rf.id] || rf.titleHu : rf.titleHu;
}
function trRedFlagWhy(rf: { id: string; whyCritical: string }, lang: Language) {
  return lang === 'ro' ? redFlagWhyCriticalRo[rf.id] || rf.whyCritical : rf.whyCritical;
}
function trRedFlagCons(rf: { id: string; consequences: string }, lang: Language) {
  return lang === 'ro' ? redFlagConsequencesRo[rf.id] || rf.consequences : rf.consequences;
}
function trRedFlagAction(rf: { id: string; immediateAction: string }, lang: Language) {
  return lang === 'ro' ? redFlagImmediateActionRo[rf.id] || rf.immediateAction : rf.immediateAction;
}

function getRiskStatement(score: number, lang: Language) {
  if (score <= 25) return t('risk.critical', lang);
  if (score <= 50) return t('risk.significant', lang);
  if (score <= 70) return t('risk.moderate', lang);
  if (score <= 85) return t('risk.acceptable', lang);
  return t('risk.good', lang);
}

function maturityGradient(color: string) {
  switch (color) {
    case 'critical':
      return 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)';
    case 'significant':
      return 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)';
    case 'moderate':
      return 'linear-gradient(135deg, #eab308 0%, #a16207 100%)';
    case 'acceptable':
      return 'linear-gradient(135deg, #84cc16 0%, #4d7c0f 100%)';
    case 'good':
      return 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)';
    default:
      return 'linear-gradient(135deg, #64748b 0%, #334155 100%)';
  }
}

// ---------- HTML builder ----------
const COMMON_STYLE = (gradient: string) => `
  *{box-sizing:border-box;}
  .pdf-block{font-family:'Inter',Arial,sans-serif;color:#1e293b;background:#ffffff;font-size:14px;line-height:1.5;width:794px;padding:0 24px;}
  .pdf-block h1{color:#0f172a;font-size:26px;font-weight:800;border-bottom:2px solid #e2e8f0;padding-bottom:10px;margin:0 0 14px 0;}
  .pdf-block h2{color:#1e3a8a;font-size:18px;font-weight:700;margin:0 0 10px 0;border-bottom:1px solid #e2e8f0;padding-bottom:5px;}
  .pdf-block h3{color:#0f172a;margin:0 0 8px 0;}
  .pdf-block p{margin:4px 0;}
  .pdf-block ul,.pdf-block ol{margin:0;padding-left:20px;}
  .pdf-block li{margin-bottom:6px;}
  .pdf-block .meta{display:flex;justify-content:space-between;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px;}
  .pdf-block .dashboard{display:flex;gap:16px;}
  .pdf-block .score-box{flex:1;background:${gradient};color:#fff;border-radius:8px;padding:18px;text-align:center;}
  .pdf-block .score-box h3{color:#fff;margin:0;font-size:13px;text-transform:uppercase;letter-spacing:0.05em;}
  .pdf-block .score-num{font-size:42px;font-weight:800;margin:8px 0;}
  .pdf-block .score-desc{font-weight:600;font-size:15px;}
  .pdf-block .statement{flex:2;background:#fef2f2;border-left:5px solid #ef4444;border-radius:4px;padding:18px;}
  .pdf-block .statement h3{color:#991b1b;}
  .pdf-block .escalation{background:#fff5f5;border:1px solid #fee2e2;border-radius:8px;padding:14px 18px;}
  .pdf-block .escalation h3{color:#991b1b;}
  .pdf-block .escalation ul{display:grid;grid-template-columns:1fr 1fr;gap:4px 14px;}
  .pdf-block .grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
  .pdf-block .panel{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;}
  .pdf-block .panel.green{background:#f0fdf4;border-color:#bbf7d0;}
  .pdf-block .panel.green h3{color:#166534;}
  .pdf-block .panel.green ol{color:#14532d;font-weight:500;}
  .pdf-block .bar-row{margin-bottom:10px;}
  .pdf-block .bar-label{display:flex;justify-content:space-between;font-weight:600;font-size:12px;margin-bottom:4px;}
  .pdf-block .bar-bg{background:#e2e8f0;border-radius:4px;height:9px;width:100%;}
  .pdf-block .bar-fill{background:#ef4444;height:100%;border-radius:4px;}
  .pdf-block .flag-card{background:#fff;border:1px solid #e2e8f0;border-left:4px solid #ef4444;border-radius:4px;padding:14px;}
  .pdf-block .flag-title{font-weight:700;font-size:14px;color:#991b1b;margin-bottom:8px;}
  .pdf-block .flag-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;font-size:12.5px;}
  .pdf-block .flag-col strong{color:#334155;display:block;margin-bottom:2px;}
  .pdf-block table.checklist{width:100%;border-collapse:collapse;font-size:12px;}
  .pdf-block table.checklist th,.pdf-block table.checklist td{border:1px solid #e2e8f0;padding:7px 10px;text-align:left;}
  .pdf-block table.checklist th{background:#f1f5f9;font-weight:700;}
  .pdf-block table.checklist td:first-child{width:28px;text-align:center;font-size:15px;color:#94a3b8;}
`;

function buildBlocks(results: AssessmentResult, lang: Language): string[] {
  const checklist = lang === 'ro' ? evidenceChecklistRo : evidenceChecklist;
  const escalationItems = [1, 2, 3, 4, 5, 6, 7].map(n => esc(t(`esc.${n}` as any, lang)));

  const today = new Date().toLocaleDateString(lang === 'ro' ? 'ro-RO' : 'hu-HU');
  const titleText = lang === 'ro' ? 'RAPORT AUDIT SECURITATE IT' : 'IT BIZTONSÁGI AUDIT JELENTÉS';
  const dateLabel = lang === 'ro' ? 'Data' : 'Dátum';
  const scoreLabel = lang === 'ro' ? 'Indicator de Securitate' : 'Biztonsági Mutató';
  const statementLabel = lang === 'ro' ? 'Declarație de risc real' : 'Valós kockázati nyilatkozat';
  const checklistColLabel = lang === 'ro' ? 'Cerință / Document' : 'Követelmény / Dokumentum';
  const checklistDesc =
    lang === 'ro'
      ? 'Documentele și configurațiile de solicitat pentru a urmări procesul de remediere.'
      : 'Az audit javítási folyamatának nyomon követéséhez bekérendő dokumentumok és konfigurációk listája.';

  const blocks: string[] = [];

  // Header + meta combined
  blocks.push(`
    <h1>${esc(titleText)}</h1>
    <div class="meta">
      <div><p><strong>${esc(t('app.title', lang))}</strong></p><p style="color:#64748b;">${esc(t('app.subtitle', lang))}</p></div>
      <div style="text-align:right;"><p><strong>${esc(dateLabel)}:</strong> ${esc(today)}</p></div>
    </div>
  `);

  // Dashboard
  blocks.push(`
    <div class="dashboard">
      <div class="score-box">
        <h3>${esc(scoreLabel)}</h3>
        <div class="score-num">${results.totalScore} / ${results.maxScore}</div>
        <div class="score-desc">${esc(trMaturity(results.maturityLevel.label, lang))}</div>
      </div>
      <div class="statement">
        <h3>${esc(statementLabel)}</h3>
        <p style="margin:0;color:#451a03;font-size:14px;font-weight:500;">${esc(getRiskStatement(results.totalScore, lang))}</p>
      </div>
    </div>
  `);

  // Escalation
  blocks.push(`
    <div class="escalation">
      <h3>🚨 ${esc(t('results.escalation', lang))}</h3>
      <ul>${escalationItems.map(i => `<li>${i}</li>`).join('')}</ul>
    </div>
  `);

  // Domain scores
  blocks.push(`
    <div class="panel">
      <h3>${esc(t('results.domainScores', lang))} (${results.answeredCount}/${results.totalQuestions})</h3>
      ${results.domainScores
        .map(
          ds => `
        <div class="bar-row">
          <div class="bar-label"><span>${esc(trDomain(ds.labelHu, lang))}</span><span>${ds.percentage}%</span></div>
          <div class="bar-bg"><div class="bar-fill" style="width:${ds.percentage}%;"></div></div>
        </div>`
        )
        .join('')}
    </div>
  `);

  // Quick wins
  blocks.push(`
    <div class="panel green">
      <h3>${esc(t('results.quickWins', lang))}</h3>
      <ol>${
        results.quickWins.length
          ? results.quickWins.map(w => `<li>${esc(trQuickWin(w, lang))}</li>`).join('')
          : `<li style="color:#64748b;">—</li>`
      }</ol>
    </div>
  `);

  // Red flags
  if (results.triggeredRedFlags.length) {
    blocks.push(`<h2>⚠️ ${esc(t('results.redFlags', lang))} (${results.triggeredRedFlags.length})</h2>`);
    results.triggeredRedFlags.forEach((rf, i) => {
      blocks.push(`
        <div class="flag-card">
          <div class="flag-title">${i + 1}. ${esc(trRedFlagTitle(rf, lang))}</div>
          <div class="flag-grid">
            <div class="flag-col">
              <strong>${esc(t('results.whyCritical', lang))}</strong>
              ${esc(trRedFlagWhy(rf, lang))}
            </div>
            <div class="flag-col">
              <strong>${esc(t('results.consequences', lang))}</strong>
              ${esc(trRedFlagCons(rf, lang))}<br>
              <span style="color:#b91c1c;"><strong>${esc(t('results.immediateAction', lang))}</strong> ${esc(trRedFlagAction(rf, lang))}</span>
            </div>
          </div>
        </div>
      `);
    });
  }

  // Checklist — split into chunks of 10 rows, each chunk with its own header table
  blocks.push(`
    <h2>📋 ${esc(t('results.evidenceChecklist', lang))}</h2>
    <p style="margin:0 0 6px 0;color:#64748b;font-size:12.5px;">${esc(checklistDesc)}</p>
  `);
  const CHUNK = 10;
  for (let i = 0; i < checklist.length; i += CHUNK) {
    const rows = checklist.slice(i, i + CHUNK);
    blocks.push(`
      <table class="checklist">
        <thead><tr><th></th><th>${esc(checklistColLabel)}</th></tr></thead>
        <tbody>${rows.map(item => `<tr><td>☐</td><td>${esc(item)}</td></tr>`).join('')}</tbody>
      </table>
    `);
  }

  return blocks;
}

// ---------- Render ----------
const JPEG_QUALITY = 0.72;
const RENDER_SCALE = 1.6;
const BLOCK_GAP_MM = 4;

export async function exportResultsPDF(
  results: AssessmentResult,
  language: Language,
  filename: string
) {
  const banner = await loadBanner();
  const gradient = maturityGradient(results.maturityLevel.color);
  const blocks = buildBlocks(results, language);

  // Offscreen host with shared style
  const host = document.createElement('div');
  host.style.position = 'fixed';
  host.style.left = '-10000px';
  host.style.top = '0';
  host.style.width = '794px';
  host.style.background = '#ffffff';
  const styleEl = document.createElement('style');
  styleEl.textContent = COMMON_STYLE(gradient);
  host.appendChild(styleEl);
  document.body.appendChild(host);

  try {
    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4', compress: true });
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 8;
    const contentWidth = pageWidth - margin * 2;
    const bannerHeight = contentWidth * banner.ratio;
    const contentTop = margin + bannerHeight + 4;
    const usableHeight = pageHeight - contentTop - margin;

    const drawHeader = () => {
      pdf.addImage(banner.dataUrl, 'JPEG', margin, margin, contentWidth, bannerHeight);
    };

    let pageInitialized = false;
    let cursorY = contentTop;

    const newPage = () => {
      if (pageInitialized) pdf.addPage();
      drawHeader();
      pageInitialized = true;
      cursorY = contentTop;
    };

    newPage();

    for (const html of blocks) {
      // Render this block
      const wrap = document.createElement('div');
      wrap.className = 'pdf-block';
      wrap.innerHTML = html;
      host.appendChild(wrap);
      // Allow layout
      await new Promise(r => requestAnimationFrame(() => r(null)));

      const canvas = await html2canvas(wrap, {
        scale: RENDER_SCALE,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 794,
      });
      host.removeChild(wrap);

      const pxPerMm = canvas.width / contentWidth;
      const blockHeightMm = canvas.height / pxPerMm;

      if (blockHeightMm <= usableHeight) {
        // Atomic — fit on one page
        if (cursorY + blockHeightMm > contentTop + usableHeight + 0.01) {
          newPage();
        }
        const data = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
        pdf.addImage(data, 'JPEG', margin, cursorY, contentWidth, blockHeightMm);
        cursorY += blockHeightMm + BLOCK_GAP_MM;
      } else {
        // Block taller than a page — slice it (rare fallback)
        let srcY = 0;
        const totalH = canvas.height;
        let firstSlice = true;
        while (srcY < totalH) {
          const remainingMm =
            contentTop + usableHeight - (firstSlice ? cursorY : contentTop);
          if (remainingMm < 20) {
            newPage();
            continue;
          }
          const slicePx = Math.min(Math.floor(remainingMm * pxPerMm), totalH - srcY);
          const slice = document.createElement('canvas');
          slice.width = canvas.width;
          slice.height = slicePx;
          const ctx = slice.getContext('2d')!;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, slice.width, slice.height);
          ctx.drawImage(canvas, 0, srcY, canvas.width, slicePx, 0, 0, canvas.width, slicePx);
          const data = slice.toDataURL('image/jpeg', JPEG_QUALITY);
          const sliceMm = slicePx / pxPerMm;
          const drawY = firstSlice ? cursorY : contentTop;
          pdf.addImage(data, 'JPEG', margin, drawY, contentWidth, sliceMm);
          srcY += slicePx;
          if (srcY < totalH) {
            newPage();
            firstSlice = false;
          } else {
            cursorY = drawY + sliceMm + BLOCK_GAP_MM;
          }
        }
      }
    }

    pdf.save(filename);
  } finally {
    document.body.removeChild(host);
  }
}

