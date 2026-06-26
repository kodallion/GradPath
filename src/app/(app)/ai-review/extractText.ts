"use client";

// Client-side text extraction for PDF and DOCX, so the existing
// /api/ai/review route can stay text-only.

export async function extractText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    return extractPdf(file);
  }
  if (name.endsWith(".docx") || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    return extractDocx(file);
  }
  if (name.endsWith(".doc")) {
    // legacy .doc isn't reliably parseable in-browser; ask for PDF/DOCX or paste
    throw new Error("Legacy .doc files can't be read here. Please upload a PDF or .docx, or paste the text.");
  }
  if (name.endsWith(".txt") || file.type === "text/plain") {
    return file.text();
  }
  throw new Error("Unsupported file. Upload a PDF or .docx, or paste your text.");
}

async function extractPdf(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  // Configure worker via CDN to avoid bundler worker issues
  // @ts-expect-error - workerSrc exists at runtime
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
  const buf = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buf }).promise;
  let out = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((it: unknown) => (it as { str?: string }).str || "");
    out += strings.join(" ") + "\n\n";
  }
  return out.trim();
}

async function extractDocx(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  const buf = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buf });
  return (result.value || "").trim();
}
