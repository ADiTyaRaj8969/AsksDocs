import { GoogleGenerativeAI } from '@google/generative-ai'

const EMBEDDING_MODEL = 'gemini-embedding-001'

function getClient() {
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
}

/**
 * Get embedding for a single text.
 * @param {string} text
 * @param {'RETRIEVAL_DOCUMENT'|'RETRIEVAL_QUERY'} taskType
 * @returns {Promise<number[]>}
 */
export async function getEmbedding(text, taskType = 'RETRIEVAL_DOCUMENT') {
  const genAI = getClient()
  const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL })
  const result = await model.embedContent({
    content:  { parts: [{ text }], role: 'user' },
    taskType,
  })
  return result.embedding.values
}

/**
 * Get embeddings for multiple texts in parallel batches of 5.
 * Batching keeps throughput high while respecting Gemini rate limits.
 * @param {string[]} texts
 * @returns {Promise<number[][]>}
 */
export async function getEmbeddingsBatch(texts) {
  const BATCH_SIZE = 5
  const results = []
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE)
    const batchResults = await Promise.all(
      batch.map(t => getEmbedding(t, 'RETRIEVAL_DOCUMENT'))
    )
    results.push(...batchResults)
  }
  return results
}

/**
 * Get query embedding.
 * @param {string} text
 * @returns {Promise<number[]>}
 */
export async function getQueryEmbedding(text) {
  return getEmbedding(text, 'RETRIEVAL_QUERY')
}
