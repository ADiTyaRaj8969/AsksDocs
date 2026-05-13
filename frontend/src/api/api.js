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

// On 401 the token is invalid — sign out and reload to show login screen
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
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
