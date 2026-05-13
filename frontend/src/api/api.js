import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

// Attach the Firebase / Google ID token on every request
api.interceptors.request.use((config) => {
  try {
    const stored = sessionStorage.getItem('askdocs_user')
    if (stored) {
      const { token } = JSON.parse(stored)
      if (token) config.headers.Authorization = `Bearer ${token}`
    }
  } catch {
    // ignore parse errors
  }
  return config
})

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      sessionStorage.removeItem('askdocs_user')
      window.location.reload()
    }
    return Promise.reject(err)
  },
)

/**
 * Upload a document by sending only the text chunks extracted in the browser.
 * The original file never leaves the device.
 *
 * @param {string} documentName
 * @param {{ text: string, pageNumber: number }[]} chunks
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
