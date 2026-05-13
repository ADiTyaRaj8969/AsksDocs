import axios from 'axios'
import { auth } from '../lib/firebase'

const api = axios.create({ baseURL: '/api' })

// Attach a fresh Firebase ID token on every request (auto-refreshes when expired)
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser
  if (user) {
    const token = await user.getIdToken()
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// On 401 try once with a force-refreshed token; only sign out if it fails again
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401 && !err.config._retry) {
      err.config._retry = true
      const user = auth.currentUser
      if (user) {
        try {
          const fresh = await user.getIdToken(true)
          err.config.headers = { ...err.config.headers, Authorization: `Bearer ${fresh}` }
          return api(err.config)
        } catch { /* fall through to sign out */ }
      }
      const { signOut } = await import('firebase/auth')
      await signOut(auth)
      window.location.reload()
    }
    return Promise.reject(err)
  },
)

/**
 * Upload a document by sending only the text chunks extracted in the browser.
 * The original file never leaves the device.
 */
export async function uploadChunks(documentName, chunks) {
  const { data } = await api.post('/upload', { documentName, chunks })
  return data
}

export async function fetchDocuments() {
  const { data } = await api.get('/documents')
  return data.documents
}

export async function deleteDocument(name) {
  const { data } = await api.delete(`/documents/${encodeURIComponent(name)}`)
  return data
}

export async function queryDocuments(question, topK = 5) {
  const { data } = await api.post('/query', { question, top_k: topK })
  return data
}
