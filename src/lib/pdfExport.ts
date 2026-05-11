import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import bannerUrl from '@/assets/pdf-header-banner.png';

// Preload banner once and cache its data URL + aspect ratio
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
  const ctx = canvas.getContext('2d');
  ctx!.fillStyle = '#ffffff';
  ctx!.fillRect(0, 0, canvas.width, canvas.height);
  ctx!.drawImage(img, 0, 0);
  bannerCache = {
    dataUrl: canvas.toDataURL('image/jpeg', 0.85),
    ratio: img.naturalHeight / img.naturalWidth,
  };
  return bannerCache;
}

const JPEG_QUALITY = 0.7;
const RENDER_SCALE = 1.5;

export async function exportPDFFromElement(element: HTMLElement, filename: string) {
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 8;
  const contentWidth = pageWidth - margin * 2;

  const banner = await loadBanner();
  const bannerHeight = contentWidth * banner.ratio;
  const headerBottom = margin + bannerHeight + 4;

  const children = Array.from(element.children) as HTMLElement[];
  const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4', compress: true });

  const drawHeader = () => {
    pdf.addImage(banner.dataUrl, 'JPEG', margin, margin, contentWidth, bannerHeight);
  };

  drawHeader();
  let currentY = headerBottom;
  let isFirstPage = true;

  for (let i = 0; i < children.length; i++) {
    const child = children[i];

    const canvas = await html2canvas(child, {
      scale: RENDER_SCALE,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
    });

    const imgData = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
    const imgHeight = (canvas.height * contentWidth) / canvas.width;

    if (!isFirstPage && currentY + imgHeight > pageHeight - margin) {
      pdf.addPage();
      drawHeader();
      currentY = headerBottom;
    }

    if (imgHeight > pageHeight - headerBottom - margin) {
      const pxPerMm = canvas.height / imgHeight;
      let srcY = 0;
      const totalSrcHeight = canvas.height;

      while (srcY < totalSrcHeight) {
        if (srcY > 0) {
          pdf.addPage();
          drawHeader();
          currentY = headerBottom;
        }

        const remainingMm = pageHeight - currentY - margin;
        const sliceHeightPx = Math.min(remainingMm * pxPerMm, totalSrcHeight - srcY);
        const sliceHeightMm = sliceHeightPx / pxPerMm;

        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = Math.ceil(sliceHeightPx);
        const ctx = sliceCanvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
          ctx.drawImage(canvas, 0, srcY, canvas.width, sliceHeightPx, 0, 0, canvas.width, sliceHeightPx);
          const sliceData = sliceCanvas.toDataURL('image/jpeg', JPEG_QUALITY);
          pdf.addImage(sliceData, 'JPEG', margin, currentY, contentWidth, sliceHeightMm);
        }

        srcY += sliceHeightPx;
        currentY += sliceHeightMm;
      }
    } else {
      pdf.addImage(imgData, 'JPEG', margin, currentY, contentWidth, imgHeight);
      currentY += imgHeight + 3;
    }

    isFirstPage = false;
  }

  pdf.save(filename);
}
