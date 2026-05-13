/**
 * Client-side document text extraction.
 * The original file NEVER leaves the browser — only extracted text chunks
 * are sent to the server.
 *
 * Supported formats: PDF, DOCX, XLSX/XLS, PNG/JPG/JPEG (OCR via Tesseract)
 */

// ── PDF ───────────────────────────────────────────────────────────────────────

async function extractPDF(file) {
  const pdfjsLib = await import('pdfjs-dist')

  // Point the worker at the bundled worker asset
  const workerUrl = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).href
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  const pages = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const text = content.items.map((item) => item.str).join(' ').trim()
    if (text.length > 0) {
      pages.push({ text, pageNumber: i, documentName: file.name })
    }
  }

  // If PDF had no extractable text (scanned), fall back to Tesseract OCR
  const totalText = pages.map((p) => p.text).join('')
  if (totalText.length < 100) {
    return extractPDFWithOCR(file, pdf)
  }

  return pages
}

async function extractPDFWithOCR(file, pdf) {
  const { createWorker } = await import('tesseract.js')
  const worker = await createWorker('eng')
  const pages = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale: 2 })

    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    const ctx = canvas.getContext('2d')
    await page.render({ canvasContext: ctx, viewport }).promise

    const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'))
    const { data: { text } } = await worker.recognize(blob)
    if (text.trim()) {
      pages.push({ text: text.trim(), pageNumber: i, documentName: file.name })
    }
  }

  await worker.terminate()
  return pages
}

// ── DOCX ──────────────────────────────────────────────────────────────────────

async function extractDOCX(file) {
  const mammoth = await import('mammoth')
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })
  const text = result.value?.trim()
  if (!text) return []
  return [{ text, pageNumber: 1, documentName: file.name }]
}

// ── XLSX / XLS ────────────────────────────────────────────────────────────────

async function extractExcel(file) {
  const XLSX = await import('xlsx')
  const arrayBuffer = await file.arrayBuffer()
  const workbook = XLSX.read(arrayBuffer, { type: 'array' })

  const pages = []
  workbook.SheetNames.forEach((sheetName, index) => {
    const sheet = workbook.Sheets[sheetName]
    const csv = XLSX.utils.sheet_to_csv(sheet)
    const text = `Sheet: ${sheetName}\n\n${csv}`.trim()
    if (text.length > 10) {
      pages.push({
        text,
        pageNumber: index + 1,
        documentName: file.name,
      })
    }
  })
  return pages
}

// ── Images (Tesseract OCR) ────────────────────────────────────────────────────

async function extractImage(file) {
  const { createWorker } = await import('tesseract.js')
  const worker = await createWorker('eng')

  const { data: { text } } = await worker.recognize(file)
  await worker.terminate()

  if (!text?.trim()) return []
  return [{ text: text.trim(), pageNumber: 1, documentName: file.name }]
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Extract text pages from a File object entirely in the browser.
 * Returns: { text, pageNumber, documentName }[]
 */
export async function extractDocument(file) {
  const ext = file.name.split('.').pop().toLowerCase()

  switch (ext) {
    case 'pdf':
      return extractPDF(file)
    case 'docx':
      return extractDOCX(file)
    case 'xlsx':
    case 'xls':
      return extractExcel(file)
    case 'png':
    case 'jpg':
    case 'jpeg':
      return extractImage(file)
    default:
      throw new Error(`Unsupported file type: .${ext}`)
  }
}
