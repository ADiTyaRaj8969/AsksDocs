import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { extractDocument } from '../lib/extractor'
import { chunkPages } from '../lib/chunker'
import { uploadChunks } from '../api/api'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from './Toast'

const ACCEPTED = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-excel': ['.xls'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
}

const STAGES = [
  'Extracting text in browser…',
  'Chunking document…',
  'Embedding & indexing on server…',
  'Done!',
]

export default function FileUpload({ onUploaded }) {
  const toast = useToast()
  const { user, requireLogin } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [stage, setStage] = useState('')
  const [stageIndex, setStageIndex] = useState(0)
  const [fileName, setFileName] = useState('')

  const onDrop = useCallback(async (accepted, rejected) => {
    if (rejected.length) {
      toast.error('Unsupported file type. Use PDF, DOCX, XLSX, PNG or JPG.')
      return
    }
    if (!accepted.length) return

    // Prompt sign-in if not authenticated yet
    const ok = await requireLogin()
    if (!ok) {
      toast.error('Please sign in to upload documents.')
      return
    }

    const file = accepted[0]
    setUploading(true)
    setFileName(file.name)
    setStageIndex(0)
    setStage(STAGES[0])

    try {
      // Stage 1 — extract text entirely in the browser (file never sent to server)
      const pages = await extractDocument(file)
      if (!pages.length) {
        toast.error('No text could be extracted from this document.')
        return
      }

      // Stage 2 — chunk in browser
      setStageIndex(1)
      setStage(STAGES[1])
      const chunks = chunkPages(pages)

      // Stage 3 — send only text chunks to server for embedding
      setStageIndex(2)
      setStage(STAGES[2])
      const result = await uploadChunks(file.name, chunks)

      setStageIndex(3)
      setStage(STAGES[3])
      toast.success(`"${result.documentName}" ready — ${result.chunksCreated} chunks embedded`)
      onUploaded?.()
    } catch (err) {
      toast.error(err.response?.data?.error ?? err.message ?? 'Upload failed.')
    } finally {
      setUploading(false)
      setStage('')
      setFileName('')
      setStageIndex(0)
    }
  }, [onUploaded, toast])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    multiple: false,
    disabled: uploading,
  })

  const progress = uploading ? Math.round((stageIndex / (STAGES.length - 1)) * 100) : 0

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer
          transition-all duration-200 overflow-hidden group
          ${isDragActive
            ? 'border-violet-400 bg-violet-500/10 scale-[1.01]'
            : 'border-white/10 hover:border-violet-500/60 hover:bg-violet-500/5 bg-white/[0.02]'}
          ${uploading ? 'opacity-60 pointer-events-none' : ''}`}
      >
        <input {...getInputProps()} />

        {isDragActive && (
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-indigo-600/10 animate-pulse" />
        )}

        <div className="relative flex flex-col items-center gap-2.5">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center
            transition-colors duration-200
            ${isDragActive ? 'bg-violet-500/30' : 'bg-white/5 group-hover:bg-violet-500/15'}`}>
            <UploadIcon active={isDragActive} />
          </div>

          {isDragActive ? (
            <p className="text-violet-300 font-semibold text-sm">Drop to upload</p>
          ) : (
            <>
              <div>
                <p className="text-gray-200 font-medium text-sm">Drag & drop a document</p>
                <p className="text-gray-500 text-xs mt-0.5">or click to browse</p>
              </div>
              <div className="flex flex-wrap justify-center gap-1">
                {['PDF', 'DOCX', 'XLSX', 'PNG', 'JPG'].map((f) => (
                  <span key={f} className="text-[10px] font-medium px-2 py-0.5 rounded-full
                    bg-white/5 text-gray-400 border border-white/10">
                    {f}
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-emerald-500/80 flex items-center gap-1">
                <span>🔒</span> File processed in browser — never uploaded
              </p>
            </>
          )}
        </div>
      </div>

      {uploading && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-gray-400">
            <span>{stage}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-indigo-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(progress, 5)}%` }}
            />
          </div>
          {fileName && (
            <p className="text-xs text-gray-500 truncate">{fileName}</p>
          )}
        </div>
      )}
    </div>
  )
}

function UploadIcon({ active }) {
  return (
    <svg
      className={`w-5 h-5 transition-colors ${active ? 'text-violet-300' : 'text-gray-400'}`}
      fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  )
}
