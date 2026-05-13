import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { existsSync } from 'fs'
import { fileURLToPath } from 'url'
import rateLimit from 'express-rate-limit'
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

// Trust the first proxy (HF Spaces / Nginx) so IP-based rate limiting works correctly
app.set('trust proxy', 1)

// ── Security headers ─────────────────────────────────────────────────────────
app.use((_req, res, next) => {
  res.removeHeader('X-Powered-By')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  next()
})

// ── CORS ────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true)
    if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return cb(null, true)
    // HF Spaces injects SPACE_HOST automatically (e.g. aditya-raj19-askdocs.hf.space)
    if (process.env.SPACE_HOST && origin === `https://${process.env.SPACE_HOST}`) return cb(null, true)
    const extra = (process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean)
    if (extra.includes(origin)) return cb(null, true)
    cb(new Error(`CORS policy: origin ${origin} not allowed`))
  },
  credentials: true,
}))

app.use(express.json({ limit: '25mb' }))  // 20 MB doc → up to ~10 MB of text chunks
app.use(express.urlencoded({ extended: true }))

// ── Rate limiting ────────────────────────────────────────────────────────────
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,       // 1 minute window
  max: 10,                   // max 10 uploads per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many uploads. Please wait a minute and try again.' },
})

const queryLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,                   // max 30 queries per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' },
})

const documentsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,                   // max 60 document list/delete ops per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' },
})

// ── Health (public) ─────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', version: '1.0.0', timestamp: new Date().toISOString() })
})

// ── Protected API routes ────────────────────────────────────────────────────
// Rate limiters applied before routers at specific sub-paths
app.use('/api/upload',    uploadLimiter)
app.use('/api/query',     queryLimiter)
app.use('/api/documents', documentsLimiter)

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
  const status = err.status || 500
  // Only expose the message for client errors (4xx); mask internals for 5xx
  const message = status < 500 ? err.message : 'Internal server error'
  res.status(status).json({ error: message || 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`\n  AskDocs API  →  http://localhost:${PORT}`)
  console.log(`Health check →  http://localhost:${PORT}/health\n`)
})
