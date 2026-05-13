import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { extractDocument } from '../lib/extractor'
import { chunkPages } from '../lib/chunker'
import { uploadChunks } from '../api/api'
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
  'Embedding & indexing…',
  'Done!',
]

export default function FileUpload({ onUploaded }) {
  const toast = useToast()
  const [uploading, setUploading] = useState(false)
  const [stage, setStage] = useState('')
  const [stageIndex, setStageIndex] = useState(0)
  const [fileName, setFileName] = useState('')

  const onDrop = useCallback(async (accepted, rejected) => {
    if (rejected.length) { toast.error('Unsupported file type. Use PDF, DOCX, XLSX, PNG or JPG.'); return }
    if (!accepted.length) return

    const file = accepted[0]
    setUploading(true); setFileName(file.name); setStageIndex(0); setStage(STAGES[0])

    try {
      const pages = await extractDocument(file)
      if (!pages.length) { toast.error('No text could be extracted.'); return }

      setStageIndex(1); setStage(STAGES[1])
      const chunks = chunkPages(pages)

      setStageIndex(2); setStage(STAGES[2])
      const result = await uploadChunks(file.name, chunks)

      setStageIndex(3); setStage(STAGES[3])
      toast.success(`"${result.documentName}" ready — ${result.chunksCreated} chunks embedded`)
      onUploaded?.()
    } catch (err) {
      toast.error(err.response?.data?.error ?? err.message ?? 'Upload failed.')
    } finally {
      setUploading(false); setStage(''); setFileName(''); setStageIndex(0)
    }
  }, [onUploaded, toast])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: ACCEPTED, multiple: false, disabled: uploading,
  })

  const progress = uploading ? Math.round((stageIndex / (STAGES.length - 1)) * 100) : 0

  return (
    <div className="space-y-3">
      <div {...getRootProps()}
        className={`relative border-2 border-dashed rounded-2xl p-4 text-center
          cursor-pointer transition-all duration-200 overflow-hidden group
          ${isDragActive
            ? 'border-brand bg-brand/[0.06] scale-[1.01]'
            : 'border-stone-300 hover:border-brand/60 hover:bg-brand/[0.03] bg-cream-100/50'}
          ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
        <input {...getInputProps()} />

        {isDragActive && (
          <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-brand/10 animate-pulse"/>
        )}

        <div className="relative flex flex-col items-center gap-2">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center
            transition-colors duration-200
            ${isDragActive ? 'bg-brand/20' : 'bg-stone-100 group-hover:bg-brand/10'}`}>
            <UploadIcon active={isDragActive} />
          </div>

          {isDragActive ? (
            <p className="text-brand font-semibold text-sm">Drop to upload</p>
          ) : (
            <>
              <div>
                <p className="text-stone-700 font-medium text-sm">Drag & drop a document</p>
                <p className="text-stone-400 text-xs mt-0.5">or click to browse</p>
              </div>
              <div className="flex flex-wrap justify-center gap-1">
                {['PDF', 'DOCX', 'XLSX', 'PNG', 'JPG'].map(f => (
                  <span key={f} className="text-[9px] font-bold px-2 py-0.5 rounded-full
                    bg-white border border-stone-200 text-stone-500">
                    {f}
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-emerald-600 flex items-center gap-1 font-medium">
                <LockIcon /> Original file stays on your device — only text is sent
              </p>
            </>
          )}
        </div>
      </div>

      {uploading && (
        <div className="space-y-2 bg-white rounded-xl border border-stone-200 p-3">
          <div className="flex justify-between text-xs">
            <span className="text-stone-600 font-medium">{stage}</span>
            <span className="text-brand font-bold">{progress}%</span>
          </div>
          <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
            <div className="h-full bg-brand rounded-full transition-all duration-500 shadow-brand-sm"
              style={{ width: `${Math.max(progress, 5)}%` }} />
          </div>
          {fileName && (
            <p className="text-[10px] text-stone-400 truncate">{fileName}</p>
          )}
        </div>
      )}
    </div>
  )
}

const UploadIcon = ({ active }) => (
  <svg className={`w-5 h-5 transition-colors ${active ? 'text-brand' : 'text-stone-400'}`}
    fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
  </svg>
)

const LockIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
  </svg>
)
