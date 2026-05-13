import express from 'express'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { listDocuments, deleteDocumentChunks, getDocumentStats, clearUserData } from '../services/vectorStore.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOAD_DIR = process.env.DATA_DIR
  ? path.join(process.env.DATA_DIR, 'uploads')
  : path.join(__dirname, '..', 'uploads')

const router = express.Router()

// GET /api/documents
router.get('/documents', (req, res) => {
  const userId = req.user.uid
  const docs = listDocuments(userId)
  const documents = docs.map((name) => {
    const stats = getDocumentStats(name, userId)
    const filePath = path.join(UPLOAD_DIR, name)
    let size = 0
    try { size = fs.statSync(filePath).size } catch {}
    return { name, chunks: stats.chunks, size }
  })
  res.json({ documents })
})

// DELETE /api/documents  — wipe ALL data for this user (session reset)
router.delete('/documents', (req, res) => {
  clearUserData(req.user.uid)
  res.json({ message: 'All your documents have been cleared.' })
})

// DELETE /api/documents/:name
router.delete('/documents/:name', (req, res) => {
  const documentName = decodeURIComponent(req.params.name)
  deleteDocumentChunks(documentName, req.user.uid)
  const filePath = path.join(UPLOAD_DIR, documentName)
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  res.json({ message: `Document '${documentName}' deleted successfully.` })
})

export default router
