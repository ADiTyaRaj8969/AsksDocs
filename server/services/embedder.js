import path from 'path'
import { fileURLToPath } from 'url'
import { pipeline, env } from '@huggingface/transformers'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Cache the downloaded model under DATA_DIR (a writable/persistent location on
// Render & HF Spaces) so it isn't re-downloaded on every restart.
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'vector_db')
env.cacheDir = path.join(DATA_DIR, 'models')

// Local sentence-embedding model — runs fully in-process, no API key, no quota.
// all-MiniLM-L6-v2 produces 384-dim, L2-normalised vectors (ideal for cosine search).
const EMBEDDING_MODEL = 'Xenova/all-MiniLM-L6-v2'

// Lazily load the model once and cache the promise so concurrent callers share it.
let _extractorPromise = null
function getExtractor() {
  if (!_extractorPromise) {
    _extractorPromise = pipeline('feature-extraction', EMBEDDING_MODEL)
  }
  return _extractorPromise
}

/**
 * Warm the model at startup so the first upload/query isn't slowed by a cold load.
 * @returns {Promise<void>}
 */
export async function warmEmbedder() {
  await getExtractor()
}

/**
 * Get embedding for a single text.
 * The taskType arg is accepted for API compatibility but ignored — this model
 * uses one symmetric embedding space for both documents and queries.
 * @param {string} text
 * @returns {Promise<number[]>}
 */
export async function getEmbedding(text) {
  const extractor = await getExtractor()
  const output = await extractor(text, { pooling: 'mean', normalize: true })
  return Array.from(output.data)
}

/**
 * Get embeddings for multiple texts. Texts are processed in batches to keep
 * memory bounded on large documents while still benefiting from batched inference.
 * @param {string[]} texts
 * @returns {Promise<number[][]>}
 */
export async function getEmbeddingsBatch(texts) {
  const BATCH_SIZE = 32
  const extractor = await getExtractor()
  const results = []

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE)
    const output = await extractor(batch, { pooling: 'mean', normalize: true })
    const [, dim] = output.dims
    for (let j = 0; j < batch.length; j++) {
      results.push(Array.from(output.data.slice(j * dim, (j + 1) * dim)))
    }
  }
  return results
}

/**
 * Get query embedding.
 * @param {string} text
 * @returns {Promise<number[]>}
 */
export async function getQueryEmbedding(text) {
  return getEmbedding(text)
}
