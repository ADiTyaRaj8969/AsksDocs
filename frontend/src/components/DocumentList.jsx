import { useEffect, useRef, useState } from 'react'
import { deleteDocument, fetchDocuments } from '../api/api'
import { useToast } from './Toast'

function fileIcon(name) {
  const ext = name.split('.').pop()?.toLowerCase()
  const configs = {
    pdf:  { bg: 'bg-red-50',     text: 'text-red-500',     label: 'PDF' },
    docx: { bg: 'bg-blue-50',    text: 'text-blue-500',    label: 'DOC' },
    doc:  { bg: 'bg-blue-50',    text: 'text-blue-500',    label: 'DOC' },
    xlsx: { bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'XLS' },
    xls:  { bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'XLS' },
    png:  { bg: 'bg-purple-50',  text: 'text-purple-500',  label: 'IMG' },
    jpg:  { bg: 'bg-purple-50',  text: 'text-purple-500',  label: 'IMG' },
    jpeg: { bg: 'bg-purple-50',  text: 'text-purple-500',  label: 'IMG' },
  }
  return configs[ext] ?? { bg: 'bg-stone-100', text: 'text-stone-500', label: 'DOC' }
}

function formatBytes(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

export default function DocumentList({ refreshSignal, onDocumentSelect }) {
  const toast = useToast()
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState(false)
  const [deletingDoc, setDeletingDoc] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  // Track the confirm-timeout per document so switching docs doesn't clear the wrong timer
  const confirmTimerRef = useRef(null)

  const load = async () => {
    setLoading(true)
    setFetchError(false)
    try { setDocs(await fetchDocuments()) }
    catch {
      setFetchError(true)
      toast.error('Failed to load documents.')
    }
    finally { setLoading(false) }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load() }, [refreshSignal])

  const handleDelete = async (name) => {
    if (confirmDelete !== name) {
      // Cancel any pending confirmation timer before starting a new one
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current)
      setConfirmDelete(name)
      confirmTimerRef.current = setTimeout(() => {
        setConfirmDelete(null)
        confirmTimerRef.current = null
      }, 3000)
      return
    }
    if (confirmTimerRef.current) { clearTimeout(confirmTimerRef.current); confirmTimerRef.current = null }
    setConfirmDelete(null); setDeletingDoc(name)
    try { await deleteDocument(name); toast.success(`"${name}" deleted.`); await load() }
    catch { toast.error('Failed to delete document.') }
    finally { setDeletingDoc(null) }
  }

  if (loading && !docs.length) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-12 rounded-xl bg-stone-100 animate-pulse" />
        ))}
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
          <ErrorIcon />
        </div>
        <p className="text-red-500 text-sm font-medium">Failed to load documents</p>
        <button onClick={load}
          className="text-xs text-brand hover:underline font-medium transition-colors">
          Try again
        </button>
      </div>
    )
  }

  if (!docs.length) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center">
          <EmptyIcon />
        </div>
        <p className="text-stone-500 text-sm font-medium">No documents yet</p>
        <p className="text-stone-400 text-xs">Upload a document to get started</p>
      </div>
    )
  }

  return (
    <ul className="space-y-1">
      {docs.map(doc => {
        const icon = fileIcon(doc.name)
        const isDeleting = deletingDoc === doc.name
        const isConfirm = confirmDelete === doc.name

        return (
          <li key={doc.name}
            className={`group flex items-center gap-2.5 rounded-xl px-3 py-2.5
              transition-all duration-150 cursor-pointer
              ${isDeleting ? 'opacity-40' : 'hover:bg-brand/[0.05] hover:border-brand/15'}
              border border-transparent`}
            onClick={() => onDocumentSelect?.(doc.name)}>

            <div className={`w-8 h-8 rounded-lg ${icon.bg} flex items-center
              justify-center shrink-0 border border-black/5`}>
              <span className={`text-[9px] font-bold ${icon.text}`}>{icon.label}</span>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm text-stone-700 truncate leading-tight font-medium"
                title={doc.name}>{doc.name}</p>
              <p className="text-[10px] text-stone-400 leading-tight mt-0.5">
                {[doc.chunks ? `${doc.chunks} chunks` : null, doc.size ? formatBytes(doc.size) : null]
                  .filter(Boolean).join(' · ')}
              </p>
            </div>

            <button onClick={e => { e.stopPropagation(); handleDelete(doc.name) }}
              disabled={isDeleting}
              className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center
                transition-all duration-150 opacity-0 group-hover:opacity-100
                ${isConfirm
                  ? 'bg-red-50 text-red-500 border border-red-200 opacity-100'
                  : 'hover:bg-red-50 text-stone-400 hover:text-red-500 border border-transparent hover:border-red-200'}`}
              title={isConfirm ? 'Click again to confirm delete' : 'Delete document'}>
              {isConfirm ? <ConfirmIcon /> : <TrashIcon />}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

const EmptyIcon = () => (
  <svg className="w-5 h-5 text-stone-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
  </svg>
)
const ErrorIcon = () => (
  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
  </svg>
)
const TrashIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
  </svg>
)
const ConfirmIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
  </svg>
)
