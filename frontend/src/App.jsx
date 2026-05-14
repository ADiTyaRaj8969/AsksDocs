import { useEffect, useState } from 'react'
import ChatInterface from './components/ChatInterface'
import DocumentList from './components/DocumentList'
import FileUpload from './components/FileUpload'
import HomePage from './components/HomePage'
import ToastContainer from './components/Toast'
import { useAuth } from './contexts/AuthContext'
import { clearAllDocuments } from './api/api'

export default function App() {
  const { user, ready, logout } = useAuth()
  const [refreshSignal, setRefreshSignal] = useState(0)
  // Default: open on desktop, closed on mobile so chat is visible
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') return true
    return window.matchMedia('(min-width: 1024px)').matches
  })

  // Clear all uploaded documents at the start of every new browser session.
  // sessionStorage resets when the tab is closed, so this runs once per tab open.
  useEffect(() => {
    if (!user) return
    if (sessionStorage.getItem('session_active')) return
    sessionStorage.setItem('session_active', '1')
    clearAllDocuments()
      .then(() => setRefreshSignal(s => s + 1))
      .catch(() => {})
  }, [user])

  if (!ready) return null
  if (!user)  return <><ToastContainer /><HomePage /></>

  const isMobile = () => window.matchMedia('(max-width: 1023px)').matches
  const handleUploaded = () => {
    setRefreshSignal((s) => s + 1)
    if (isMobile()) setSidebarOpen(false)   // jump to chat after upload on mobile
  }

  return (
    <>
      <ToastContainer />
      <div className="h-screen flex flex-col bg-cream-200 overflow-hidden">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <header className="h-14 navbar-blur border-b border-black/[0.07] sticky top-0 z-20 shrink-0">
          <div className="max-w-[1600px] mx-auto h-full px-4 flex items-center gap-3">

            <button onClick={() => setSidebarOpen(o => !o)}
              className="lg:hidden w-8 h-8 flex items-center justify-center rounded-xl
                text-stone-400 hover:text-brand hover:bg-brand/[0.06] transition-colors">
              <MenuIcon />
            </button>

            <a href="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center
                shadow-brand-sm group-hover:opacity-90 transition-opacity">
                <SparkIcon sm />
              </div>
              <div className="leading-none">
                <h1 className="text-sm font-bold text-brand tracking-tight">ASK Docs</h1>
                <p className="text-[9px] text-stone-400 font-medium">AI Document Assistant</p>
              </div>
            </a>

            <div className="ml-auto flex items-center gap-3">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-semibold
                px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>
                RAG Active
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-medium
                px-2.5 py-1 rounded-full bg-white border border-stone-200 text-stone-500">
                Gemini 2.5 Flash
              </span>

              <div className="flex items-center gap-2 pl-3 border-l border-stone-200">
                <HeaderAvatar user={user.firebaseUser} />
                <span className="hidden sm:block text-xs text-stone-500 max-w-[120px] truncate">
                  {user.firebaseUser.displayName}
                </span>
                <button onClick={logout} title="Sign out"
                  className="w-7 h-7 flex items-center justify-center rounded-lg
                    text-stone-400 hover:text-brand hover:bg-brand/[0.06] transition-colors">
                  <SignOutIcon />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* ── Body ──────────────────────────────────────────────────────── */}
        <div className="flex-1 max-w-[1600px] mx-auto w-full flex overflow-hidden relative"
          style={{ height: 'calc(100dvh - 56px)' }}>

          {/* Mobile backdrop — tap to dismiss sidebar */}
          {sidebarOpen && (
            <div onClick={() => setSidebarOpen(false)}
              className="lg:hidden fixed inset-0 top-14 bg-black/40 backdrop-blur-sm z-30" />
          )}

          {/* ── Sidebar ───────────────────────────────────────────────── */}
          <aside className={`
            fixed lg:static top-14 lg:top-auto bottom-0 lg:bottom-auto left-0
            w-72 z-40 lg:z-auto shrink-0
            flex flex-col bg-white lg:bg-white/60 border-r border-stone-200/80
            overflow-y-auto shadow-2xl lg:shadow-none
            transition-transform duration-300 ease-out lg:transition-all
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            ${sidebarOpen ? 'lg:w-72' : 'lg:w-0 lg:overflow-hidden'}
          `}>

            <div className="p-4 space-y-5 w-72">

              {/* Upload section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <UploadSectionIcon />
                  <h2 className="text-[11px] font-bold text-stone-500 uppercase tracking-widest">
                    Upload Document
                  </h2>
                </div>
                <FileUpload onUploaded={handleUploaded} />
              </div>

              <div className="border-t border-stone-200"/>

              {/* Document list section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <DocsSectionIcon />
                  <h2 className="text-[11px] font-bold text-stone-500 uppercase tracking-widest">
                    My Documents
                  </h2>
                </div>
                <DocumentList refreshSignal={refreshSignal} />
              </div>

              <div className="border-t border-stone-200"/>

              {/* How it works card */}
              <div className="rounded-2xl bg-brand/[0.05] border border-brand/15 p-4 space-y-3">
                <p className="text-xs font-semibold text-brand flex items-center gap-1.5">
                  <InfoIcon /> How it works
                </p>
                <ol className="space-y-2">
                  {[
                    'Upload your document (PDF, DOCX, XLSX, image)',
                    'Text is extracted entirely in your browser — the original file never leaves your device',
                    'Text chunks are sent to the server for embedding and are cleared when you close this tab',
                    'Ask questions, get grounded answers with citations',
                  ].map((step, i) => (
                    <li key={i} className="flex gap-2 text-[11px] text-stone-500 leading-snug">
                      <span className="w-4 h-4 rounded-full bg-brand/15 text-brand
                        flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
                <p className="text-[10px] text-stone-400 pt-1">
                  Original file never leaves your device. Text chunks are auto-deleted on tab close.
                </p>
              </div>
            </div>
          </aside>

          {/* ── Chat ──────────────────────────────────────────────────── */}
          <main className="flex-1 flex flex-col p-4 min-w-0 overflow-hidden">
            <div className="flex items-center gap-2 mb-3 shrink-0">
              <button onClick={() => setSidebarOpen(o => !o)}
                className="hidden lg:flex w-7 h-7 items-center justify-center rounded-lg
                  text-stone-400 hover:text-brand hover:bg-brand/[0.06] transition-colors">
                <PanelIcon />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse-brand"/>
                <span className="text-sm font-semibold text-stone-700">Document Chat</span>
              </div>
            </div>

            <div className="flex-1 rounded-2xl border border-stone-200/80 bg-white/60
              shadow-card p-4 flex flex-col min-h-0 overflow-hidden">
              <ChatInterface />
            </div>
          </main>
        </div>
      </div>
    </>
  )
}

/* ── Avatar with onerror fallback ──────────────────────────────────────── */
function HeaderAvatar({ user }) {
  const [imgFailed, setImgFailed] = useState(false)
  if (user.photoURL && !imgFailed) {
    return (
      <img src={user.photoURL} alt="" referrerPolicy="no-referrer"
        onError={() => setImgFailed(true)}
        className="w-7 h-7 rounded-full ring-2 ring-brand/20" />
    )
  }
  return (
    <div className="w-7 h-7 rounded-full bg-brand flex items-center justify-center text-white text-xs font-bold">
      {user.displayName?.[0] ?? '?'}
    </div>
  )
}

/* ── Icons ─────────────────────────────────────────────────────────────── */
const SparkIcon = ({ sm }) => (
  <svg className={sm ? 'w-3.5 h-3.5' : 'w-4 h-4'} fill="none" stroke="white" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
  </svg>
)
const MenuIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/>
  </svg>
)
const PanelIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v12a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18V6zM13.5 4.5l4.5 4.5-4.5 4.5"/>
  </svg>
)
const SignOutIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"/>
  </svg>
)
const UploadSectionIcon = () => (
  <svg className="w-3.5 h-3.5 text-brand" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
  </svg>
)
const DocsSectionIcon = () => (
  <svg className="w-3.5 h-3.5 text-brand" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"/>
  </svg>
)
const InfoIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"/>
  </svg>
)
