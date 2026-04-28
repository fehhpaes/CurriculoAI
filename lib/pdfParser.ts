// lib/pdfParser.ts
// Extrai texto de PDFs usando pdf.js no browser

export async function extractTextFromPDF(file: File): Promise<string> {
  // Importação dinâmica para evitar erros de SSR
  const pdfjsLib = await import('pdfjs-dist');

  // Configurar o worker
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = '';

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    // Reconstruir texto com espaçamento apropriado
    let pageText = '';
    let lastY: number | undefined;

    for (const item of textContent.items) {
      if ('str' in item) {
        const currentY = 'transform' in item ? (item as any).transform[5] : undefined;
        if (lastY !== undefined && currentY !== undefined && Math.abs(currentY - lastY) > 2) {
          pageText += '\n';
        }
        pageText += item.str + ' ';
        lastY = currentY;
      }
    }

    fullText += `\n--- Página ${pageNum} ---\n${pageText.trim()}\n`;
  }

  return fullText.trim();
}
