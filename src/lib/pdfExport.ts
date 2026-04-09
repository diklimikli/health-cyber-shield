import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportPDFFromElement(element: HTMLElement, filename: string) {
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 8;
  const contentWidth = pageWidth - margin * 2;

  // Find all direct child cards/sections to render each independently
  const children = Array.from(element.children) as HTMLElement[];
  const pdf = new jsPDF('p', 'mm', 'a4');

  let currentY = margin;
  let isFirstPage = true;

  for (let i = 0; i < children.length; i++) {
    const child = children[i];

    const canvas = await html2canvas(child, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
    });

    const imgData = canvas.toDataURL('image/png');
    const imgHeight = (canvas.height * contentWidth) / canvas.width;

    // If this block doesn't fit on current page, start a new page
    if (!isFirstPage && currentY + imgHeight > pageHeight - margin) {
      pdf.addPage();
      currentY = margin;
    }

    // If a single block is taller than a page, render it across pages
    if (imgHeight > pageHeight - margin * 2) {
      // Render oversized block across multiple pages
      const usableHeight = pageHeight - margin * 2;
      let srcY = 0;
      const totalSrcHeight = canvas.height;
      const pxPerMm = canvas.height / imgHeight;

      while (srcY < totalSrcHeight) {
        if (srcY > 0) {
          pdf.addPage();
          currentY = margin;
        }

        const remainingMm = pageHeight - currentY - margin;
        const sliceHeightPx = Math.min(remainingMm * pxPerMm, totalSrcHeight - srcY);
        const sliceHeightMm = sliceHeightPx / pxPerMm;

        // Create a cropped canvas for this slice
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = Math.ceil(sliceHeightPx);
        const ctx = sliceCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(canvas, 0, srcY, canvas.width, sliceHeightPx, 0, 0, canvas.width, sliceHeightPx);
          const sliceData = sliceCanvas.toDataURL('image/png');
          pdf.addImage(sliceData, 'PNG', margin, currentY, contentWidth, sliceHeightMm);
        }

        srcY += sliceHeightPx;
        currentY += sliceHeightMm;
      }
    } else {
      pdf.addImage(imgData, 'PNG', margin, currentY, contentWidth, imgHeight);
      currentY += imgHeight + 3; // 3mm gap between sections
    }

    isFirstPage = false;
  }

  pdf.save(filename);
}
