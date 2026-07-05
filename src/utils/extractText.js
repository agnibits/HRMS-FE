/**
 * Extract plain text from an uploaded document, entirely client-side.
 * PDF (pdfjs) and DOCX (mammoth) are lazy-loaded so they never touch the
 * main bundle — the import only runs when a user actually attaches a file.
 */
export async function extractTextFromFile(file) {
  const name = (file.name || '').toLowerCase();

  // Plain text formats — no library needed
  if (
    file.type.startsWith('text/') ||
    /\.(txt|md|csv|rtf)$/.test(name)
  ) {
    return (await file.text()).trim();
  }

  if (name.endsWith('.pdf') || file.type === 'application/pdf') {
    const pdfjs = await import('pdfjs-dist');
    const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
    const data = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data }).promise;
    let text = '';
    for (let p = 1; p <= pdf.numPages; p++) {
      const page = await pdf.getPage(p);
      const content = await page.getTextContent();
      text += content.items.map((it) => it.str).join(' ') + '\n';
    }
    return text.replace(/\n{3,}/g, '\n\n').trim();
  }

  if (name.endsWith('.docx')) {
    const mammoth = await import('mammoth');
    const arrayBuffer = await file.arrayBuffer();
    const { value } = await mammoth.extractRawText({ arrayBuffer });
    return value.trim();
  }

  throw new Error('Unsupported file. Please upload a PDF, DOCX or TXT file.');
}

export const RESUME_ACCEPT = '.pdf,.docx,.txt,.md';
