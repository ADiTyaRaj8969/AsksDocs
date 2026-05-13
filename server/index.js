import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { existsSync } from 'fs'
import { fileURLToPath } from 'url'
import uploadRouter from './routes/upload.js'
import queryRouter from './routes/query.js'
import documentsRouter from './routes/documents.js'
import { requireAuth } from './middleware/auth.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

if (!process.env.GEMINI_API_KEY) {
  console.error('  GEMINI_API_KEY is not set. Add it to server/.env')
  process.exit(1)
}

const app = express()
const PORT = process.env.PORT || 5000

// ── CORS ────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true)
    if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return cb(null, true)
    const extra = (process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean)
    if (extra.includes(origin)) return cb(null, true)
    cb(new Error(`CORS policy: origin ${origin} not allowed`))
  },
  credentials: true,
}))

app.use(express.json({ limit: '4mb' }))  // chunks are text — 4 MB is generous
app.use(express.urlencoded({ extended: true }))

// ── Health (public) ─────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', version: '1.0.0', timestamp: new Date().toISOString() })
})

// ── Protected API routes ────────────────────────────────────────────────────
app.use('/api', requireAuth, uploadRouter)
app.use('/api', requireAuth, queryRouter)
app.use('/api', requireAuth, documentsRouter)

// ── Serve React build in production ────────────────────────────────────────
const DIST = path.join(__dirname, '..', 'frontend', 'dist')

if (existsSync(DIST)) {
  app.use(express.static(DIST))
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API route not found' })
    }
    res.sendFile(path.join(DIST, 'index.html'))
  })
} else {
  app.get('/', (_req, res) => {
    res.json({ status: 'ok', message: 'AskDocs API running. Frontend not built yet.' })
  })
}

// ── Global error handler ────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[Error]', err.message)
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`\n  AskDocs API  →  http://localhost:${PORT}`)
  console.log(`Health check →  http://localhost:${PORT}/health\n`)
})
