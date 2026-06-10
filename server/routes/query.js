import express from 'express'
import { getQueryEmbedding } from '../services/embedder.js'
import { searchSimilar } from '../services/vectorStore.js'
import { generateAnswer } from '../services/llm.js'

const router = express.Router()

// POST /api/query
router.post('/query', async (req, res) => {
  const { question } = req.body
  const top_k = Math.min(Math.max(parseInt(req.body.top_k, 10) || 5, 1), 20)

  if (!question?.trim()) {
    return res.status(400).json({ error: 'Question cannot be empty.' })
  }

  if (question.length > 2000) {
    return res.status(400).json({ error: 'Question is too long (max 2000 characters).' })
  }

  try {
    // 1. Embed the query
    const queryEmbedding = await getQueryEmbedding(question.trim())

    // 2. Retrieve top-k similar chunks scoped to this user
    const similarChunks = searchSimilar(queryEmbedding, req.user.uid, top_k)

    if (!similarChunks.length) {
      return res.json({
        answer: 'No relevant documents found. Please upload documents before querying.',
        citations: [],
      })
    }

    // 3. Generate grounded answer
    const answer = await generateAnswer(question.trim(), similarChunks)

    // 4. Deduplicate citations by (doc, page)
    const seen = new Set()
    const citations = []
    for (const chunk of similarChunks) {
      const key = `${chunk.documentName}::${chunk.pageNumber}`
      if (!seen.has(key)) {
        seen.add(key)
        citations.push({
          documentName: chunk.documentName,
          pageNumber:   chunk.pageNumber,
          chunkText:    chunk.text.length > 250 ? chunk.text.slice(0, 250) + '…' : chunk.text,
          score:        Math.round(chunk.score * 100) / 100,
        })
      }
    }

    res.json({ answer, citations })
  } catch (err) {
    console.error('[Query Error]', err)
    const msg = err.message?.toLowerCase() || ''
    const isQuota = err.status === 429 || msg.includes('quota') || msg.includes('rate limit') || msg.includes('429')
    res.status(500).json({
      error: isQuota
        ? 'AI service quota exceeded. Please try again later.'
        : 'Failed to process query.',
    })
  }
})

export default router
