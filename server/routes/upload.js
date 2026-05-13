import express from 'express'
import { getEmbeddingsBatch } from '../services/embedder.js'
import { storeChunks, deleteDocumentChunks } from '../services/vectorStore.js'

const router = express.Router()

const MAX_CHUNKS = 5000
const MAX_CHUNK_TEXT_LEN = 8000

// POST /api/upload
// Body: { documentName: string, chunks: [{ text, pageNumber }] }
// The original file is NEVER sent — text is extracted client-side.
router.post('/upload', async (req, res) => {
  const { documentName, chunks } = req.body

  if (!documentName || typeof documentName !== 'string' || !documentName.trim()) {
    return res.status(400).json({ error: 'documentName is required.' })
  }

  if (!Array.isArray(chunks) || chunks.length === 0) {
    return res.status(400).json({ error: 'chunks array is required and must not be empty.' })
  }

  if (chunks.length > MAX_CHUNKS) {
    return res.status(400).json({ error: `Too many chunks (max ${MAX_CHUNKS}).` })
  }

  // Validate each chunk
  for (let i = 0; i < chunks.length; i++) {
    const c = chunks[i]
    if (typeof c.text !== 'string' || !c.text.trim()) {
      return res.status(400).json({ error: `Chunk ${i} has empty text.` })
    }
    if (c.text.length > MAX_CHUNK_TEXT_LEN) {
      return res.status(400).json({ error: `Chunk ${i} text exceeds ${MAX_CHUNK_TEXT_LEN} chars.` })
    }
    if (typeof c.pageNumber !== 'number' || c.pageNumber < 1) {
      return res.status(400).json({ error: `Chunk ${i} has invalid pageNumber.` })
    }
  }

  // Sanitise document name — strip any path components
  const safeName = documentName.trim().replace(/[/\\]/g, '_').slice(0, 255)

  try {
    // Remove stale data if the document is being re-uploaded
    deleteDocumentChunks(safeName)

    // Embed all chunks (sequential to respect Gemini rate limits)
    const texts = chunks.map((c) => c.text)
    const embeddings = await getEmbeddingsBatch(texts)

    const chunksWithEmbeddings = chunks.map((c, i) => ({
      id:           `${safeName}__${i}`,
      text:         c.text,
      pageNumber:   c.pageNumber,
      documentName: safeName,
      embedding:    embeddings[i],
    }))

    storeChunks(chunksWithEmbeddings)

    res.json({
      message:      'Document processed successfully.',
      documentName: safeName,
      chunksCreated: chunks.length,
    })
  } catch (err) {
    console.error('[Upload Error]', err)
    res.status(500).json({ error: err.message || 'Failed to process document.' })
  }
})

export default router
