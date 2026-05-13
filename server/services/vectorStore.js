/**
 * Persistent vector store backed by a JSON file.
 * - In-memory cache: file is read once at startup; all ops hit memory first.
 * - Atomic saves: write to .tmp then rename, so a crash never corrupts the store.
 * - Cosine similarity for nearest-neighbour search.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'vector_db')
const DB_PATH  = path.join(DATA_DIR, 'store.json')

// In-memory store — null means "not loaded yet"
let _store = null

function getStore() {
  if (_store === null) {
    if (!fs.existsSync(DB_PATH)) {
      _store = []
    } else {
      try {
        _store = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'))
      } catch {
        _store = []
      }
    }
  }
  return _store
}

function persist() {
  // Atomic write: tmp file → rename
  fs.mkdirSync(DATA_DIR, { recursive: true })
  const tmp = DB_PATH + '.tmp'
  fs.writeFileSync(tmp, JSON.stringify(_store), 'utf8')
  fs.renameSync(tmp, DB_PATH)
}

// ── Cosine similarity ────────────────────────────────────────────────────────

function cosineSimilarity(a, b) {
  let dot = 0, na = 0, nb = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    na  += a[i] * a[i]
    nb  += b[i] * b[i]
  }
  return na === 0 || nb === 0 ? 0 : dot / (Math.sqrt(na) * Math.sqrt(nb))
}

// ── Public API ───────────────────────────────────────────────────────────────

export function storeChunks(chunks) {
  const store = getStore()
  store.push(...chunks)
  persist()
}

export function searchSimilar(queryEmbedding, topK = 5) {
  const store = getStore()
  if (!store.length) return []

  const scored = store.map((c) => ({
    text:         c.text,
    documentName: c.documentName,
    pageNumber:   c.pageNumber,
    score:        cosineSimilarity(queryEmbedding, c.embedding),
  }))

  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, topK)
}

export function deleteDocumentChunks(documentName) {
  _store = getStore().filter((c) => c.documentName !== documentName)
  persist()
}

export function listDocuments() {
  const store = getStore()
  return [...new Set(store.map(c => c.documentName))]
}

export function getDocumentStats(documentName) {
  const count = getStore().filter((c) => c.documentName === documentName).length
  return { chunks: count }
}
