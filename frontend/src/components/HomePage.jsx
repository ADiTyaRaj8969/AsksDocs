import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from './Toast'

export default function HomePage() {
  const { login } = useAuth()
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  const handleTry = async () => {
    setLoading(true)
    try { await login() }
    catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') toast.error('Sign-in failed. Please try again.')
    }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="h-14 border-b border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-md
        sticky top-0 z-20">
        <div className="max-w-5xl mx-auto h-full px-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600
              flex items-center justify-center shadow-lg shadow-violet-900/40">
              <SparkIcon sm />
            </div>
            <span className="text-sm font-bold tracking-tight">AskDocs</span>
          </div>
          <button onClick={handleTry} disabled={loading}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-400
              hover:text-white transition-colors disabled:opacity-50">
            <GoogleIcon /> {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-5 pt-20 pb-16 text-center space-y-7">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full
          border border-violet-700/40 bg-violet-950/40 text-[11px] font-medium text-violet-300">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          Powered by Gemini 2.5 Flash · RAG pipeline
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-[1.08]
          text-white max-w-3xl mx-auto">
          Ask anything.<br />
          <span className="text-violet-400">Your files never leave</span><br />
          your device.
        </h1>

        {/* Sub-headline */}
        <p className="text-base sm:text-lg text-gray-400 max-w-xl mx-auto leading-relaxed">
          Upload a PDF, DOCX, spreadsheet, or image. AskDocs extracts text
          in your <strong className="text-gray-300 font-medium">browser</strong>,
          embeds the chunks, and answers questions with citations — no file ever
          touches the server.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
          <button onClick={handleTry} disabled={loading}
            className="group flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm
              bg-violet-600 hover:bg-violet-500 active:scale-[0.98]
              disabled:opacity-60 disabled:pointer-events-none
              shadow-lg shadow-violet-900/50 transition-all duration-150">
            {loading
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
              : <SparkIcon />}
            {loading ? 'Opening sign-in…' : 'Try AskDocs for free'}
            {!loading && <Arrow />}
          </button>
          <p className="text-[11px] text-gray-600">
            Sign in with Google · Session lasts 10 days
          </p>
        </div>

        {/* App window mock ──────────────────────────────────────────────────── */}
        <div className="mt-10 rounded-2xl border border-white/[0.08] bg-white/[0.02]
          overflow-hidden shadow-2xl shadow-black/60 text-left">
          {/* Browser chrome */}
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.06]
            bg-white/[0.02]">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
            <div className="ml-2 flex-1 h-5 rounded-md bg-white/[0.04] max-w-[220px]
              flex items-center px-2">
              <span className="text-[9px] text-gray-600 truncate">
                aditya-raj19-askdocs.hf.space
              </span>
            </div>
          </div>

          {/* Mock UI */}
          <div className="flex h-56 sm:h-72">
            {/* Sidebar */}
            <div className="w-48 sm:w-60 border-r border-white/[0.06] p-3 space-y-3 shrink-0">
              <div className="rounded-lg border-2 border-dashed border-white/[0.08]
                h-20 flex flex-col items-center justify-center gap-1">
                <div className="w-5 h-5 rounded-md bg-violet-800/40 flex items-center justify-center">
                  <UpIcon />
                </div>
                <span className="text-[9px] text-gray-500">Drag & drop a document</span>
                <div className="flex gap-1">
                  {['PDF','DOCX','XLSX'].map(f => (
                    <span key={f}
                      className="text-[8px] px-1 py-0.5 rounded bg-white/[0.04] text-gray-500 border border-white/[0.06]">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="h-2 rounded bg-white/[0.05] w-3/4" />
                <div className="h-6 rounded-lg bg-violet-900/30 border border-violet-800/30
                  flex items-center px-2 gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-violet-700/60" />
                  <div className="h-1.5 rounded bg-white/10 flex-1" />
                </div>
                <div className="h-6 rounded-lg bg-white/[0.03] flex items-center px-2 gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-white/10" />
                  <div className="h-1.5 rounded bg-white/5 flex-1" />
                </div>
              </div>
            </div>

            {/* Chat area */}
            <div className="flex-1 flex flex-col p-3 gap-3">
              {/* AI message */}
              <div className="flex gap-2">
                <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600
                  flex items-center justify-center shrink-0 mt-0.5">
                  <SparkIcon xs />
                </div>
                <div className="rounded-xl rounded-tl-none bg-white/[0.05] border border-white/[0.07]
                  px-3 py-2 max-w-xs space-y-1.5">
                  <div className="h-1.5 rounded bg-gray-600/60 w-full" />
                  <div className="h-1.5 rounded bg-gray-600/40 w-4/5" />
                  <div className="h-1.5 rounded bg-gray-600/40 w-3/5" />
                </div>
              </div>
              {/* User message */}
              <div className="flex gap-2 justify-end">
                <div className="rounded-xl rounded-tr-none bg-violet-600/70 px-3 py-2 max-w-[160px]">
                  <div className="h-1.5 rounded bg-white/40 w-full" />
                  <div className="h-1.5 rounded bg-white/30 w-3/4 mt-1.5" />
                </div>
                <div className="w-5 h-5 rounded-lg bg-gray-700 shrink-0 mt-0.5" />
              </div>
              {/* Input bar */}
              <div className="mt-auto rounded-xl border border-white/[0.08] bg-white/[0.03]
                flex items-center px-3 py-2 gap-2">
                <div className="flex-1 h-1.5 rounded bg-white/[0.06]" />
                <div className="w-6 h-6 rounded-lg bg-violet-600/70 flex items-center justify-center">
                  <SendIcon />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-5 pb-16">
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              icon: <LockIcon />,
              title: 'Privacy first',
              desc: 'Your file is extracted in the browser. The original never touches our servers.',
            },
            {
              icon: <BoltIcon />,
              title: 'Instant answers',
              desc: 'RAG pipeline with Gemini 2.5 Flash. Grounded responses with page citations.',
            },
            {
              icon: <DocIcon />,
              title: 'Any format',
              desc: 'PDF, DOCX, XLSX, XLS, PNG, JPG — even scanned images via OCR.',
            },
          ].map(({ icon, title, desc }) => (
            <div key={title}
              className="rounded-2xl border border-white/[0.07] bg-white/[0.02]
                p-5 space-y-3 hover:border-violet-700/40 hover:bg-violet-950/10 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-violet-900/40 flex items-center justify-center
                text-violet-400">
                {icon}
              </div>
              <p className="text-sm font-semibold text-gray-100">{title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ──────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-5 pb-16">
        <div className="rounded-2xl border border-violet-800/30 bg-violet-950/30
          p-8 sm:p-10 text-center space-y-5">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Ready to ask your documents?
          </h2>
          <p className="text-sm text-gray-400 max-w-sm mx-auto">
            Free to use. Sign in once with Google and your session stays active for 10 days.
          </p>
          <button onClick={handleTry} disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm
              bg-violet-600 hover:bg-violet-500 active:scale-[0.98]
              disabled:opacity-60 disabled:pointer-events-none
              shadow-lg shadow-violet-900/50 transition-all duration-150">
            {loading
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
              : <SparkIcon />}
            {loading ? 'Opening sign-in…' : 'Get started'}
          </button>
        </div>
      </section>

      <footer className="border-t border-white/[0.04] py-5 text-center
        text-[10px] text-gray-700">
        AskDocs · Your original file never leaves your device
      </footer>
    </div>
  )
}

/* ── Icons ────────────────────────────────────────────────────────────────── */

const SparkIcon = ({ sm, xs } = {}) => (
  <svg className={xs ? 'w-2.5 h-2.5' : sm ? 'w-3 h-3' : 'w-4 h-4'} fill="none"
    stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
  </svg>
)
const Arrow = () => (
  <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5"
    fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
  </svg>
)
const UpIcon = () => (
  <svg className="w-3 h-3 text-violet-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
  </svg>
)
const SendIcon = () => (
  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/>
  </svg>
)
const LockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
  </svg>
)
const BoltIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/>
  </svg>
)
const DocIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
  </svg>
)
const GoogleIcon = () => (
  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)
