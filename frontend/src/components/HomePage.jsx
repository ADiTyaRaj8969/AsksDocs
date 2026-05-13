import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from './Toast'

export default function HomePage() {
  const { login } = useAuth()
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  const handleTry = async () => {
    setLoading(true)
    try {
      await login()
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        toast.error('Sign-in failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">

        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600
            flex items-center justify-center shadow-2xl shadow-violet-900/50">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor"
              strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12
                  l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09
                  3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">AskDocs</h1>
            <p className="text-sm text-gray-400">Intelligent Document Assistant</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-lg font-semibold text-white">Ask anything about your documents</h2>
            <p className="text-sm text-gray-400">Upload PDFs, DOCX, spreadsheets or images and get grounded answers.</p>
          </div>

          {/* Privacy notice */}
          <div className="rounded-xl bg-violet-950/40 border border-violet-900/30 p-4 space-y-2">
            <p className="text-xs font-semibold text-violet-300 flex items-center gap-1.5">
              <ShieldIcon /> Your documents stay private
            </p>
            <ul className="space-y-1.5">
              {[
                'Text extracted entirely in your browser',
                'Original file never leaves your device',
                'Only text chunks sent to server for AI',
              ].map((item) => (
                <li key={item} className="text-[11px] text-gray-400 flex items-start gap-1.5">
                  <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Try button — primary */}
          <button
            onClick={handleTry}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
              bg-violet-600 hover:bg-violet-500 disabled:opacity-60 disabled:pointer-events-none
              text-white font-semibold text-sm transition-all duration-150 active:scale-[0.98]
              shadow-lg shadow-violet-900/40"
          >
            {loading
              ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <SparkleIcon />}
            {loading ? 'Opening sign-in…' : 'Try AskDocs'}
          </button>

          <p className="text-center text-[11px] text-gray-500">
            Sign in with Google · Session stays for 10 days
          </p>
        </div>
      </div>
    </div>
  )
}

const ShieldIcon = () => (
  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor"
    strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 3.99 15.519
        3.793 15a11.956 11.956 0 01-.196 2.067A11.99 11.99 0 0012 21a11.99 11.99 0
        0020.403-17.067 11.956 11.956 0 01-.196-2.067A11.959 11.959 0 0112 2.764z" />
  </svg>
)

const SparkleIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
  </svg>
)
