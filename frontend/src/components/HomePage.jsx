import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from './Toast'

export default function HomePage() {
  const { login } = useAuth()
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  const handleSignIn = async () => {
    setLoading(true)
    try { await login() }
    catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') toast.error('Sign-in failed. Please try again.')
    }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-cream-200 font-sans overflow-x-hidden">

      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <nav className="navbar-blur border-b border-black/[0.06] sticky top-0 z-50 h-16">
        <div className="max-w-6xl mx-auto px-5 h-full flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand flex items-center justify-center
              shadow-brand-sm">
              <BrandIcon />
            </div>
            <span className="text-lg font-bold text-brand tracking-tight">ASK Docs</span>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6">
            {['Home', 'Features', 'Security', 'About'].map((link) => (
              <a key={link} href={`#${link.toLowerCase()}`}
                className="text-sm font-medium text-stone-500 hover:text-brand transition-colors">
                {link}
              </a>
            ))}
          </div>

          {/* CTA */}
          <button onClick={handleSignIn} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand text-white
              text-sm font-semibold shadow-brand-sm hover:shadow-brand active:scale-[0.97]
              disabled:opacity-60 disabled:pointer-events-none transition-all duration-150">
            {loading
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
              : <GoogleIcon />}
            {loading ? 'Signing in…' : 'Sign in with Google'}
          </button>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section id="home" className="max-w-6xl mx-auto px-5 pt-20 pb-24 grid lg:grid-cols-2
        gap-12 items-center">
        {/* Left */}
        <div className="space-y-7 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full
            border border-brand/20 bg-brand/[0.06] text-xs font-semibold text-brand">
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse-brand"/>
            Powered by Gemini 2.5 Flash · RAG Architecture
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold leading-[1.06] tracking-tight
            text-stone-900">
            Transform Documents Into{' '}
            <span className="text-gradient-brand">Intelligent Conversations</span>
          </h1>

          <p className="text-lg text-stone-500 leading-relaxed max-w-lg">
            Upload PDFs, DOCX files, research papers, and images. ASK Docs uses
            AI-powered retrieval and semantic understanding to answer questions
            with contextual accuracy.
          </p>

          <div className="flex flex-wrap gap-3">
            <button onClick={handleSignIn} disabled={loading}
              className="group flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand text-white
                font-semibold text-sm shadow-brand hover:shadow-brand-lg active:scale-[0.98]
                disabled:opacity-60 disabled:pointer-events-none transition-all duration-200">
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                : <SparkIcon />}
              {loading ? 'Opening…' : 'Try Now'}
              {!loading && <ArrowIcon />}
            </button>
            <button onClick={handleSignIn} disabled={loading}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-stone-700
                font-semibold text-sm shadow-card hover:shadow-card-hover border border-stone-200/80
                active:scale-[0.98] disabled:opacity-60 transition-all duration-200">
              <GoogleIcon color />
              Continue with Google
            </button>
          </div>

          <div className="flex items-center gap-6 pt-1">
            {[['100%', 'Private'], ['RAG', 'Powered'], ['10-day', 'Session']].map(([val, label]) => (
              <div key={label} className="text-center">
                <p className="text-sm font-bold text-brand">{val}</p>
                <p className="text-[11px] text-stone-400 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — AI visualization */}
        <div className="relative h-[420px] lg:h-[480px] flex items-center justify-center">
          {/* Background glow blobs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
            <div className="absolute top-8 right-12 w-56 h-56 rounded-full
              bg-brand/10 blur-3xl animate-float float-delay-1"/>
            <div className="absolute bottom-12 left-8 w-44 h-44 rounded-full
              bg-brand/8 blur-2xl animate-float-slow float-delay-2"/>
          </div>

          {/* Central AI node */}
          <div className="relative z-10">
            <div className="w-24 h-24 rounded-2xl bg-brand glow-brand
              flex items-center justify-center shadow-brand-lg node-glow">
              <BrainIcon />
            </div>

            {/* Orbiting document cards */}
            <FloatCard top="-top-16" left="-left-28" delay="float-delay-1"
              icon={<PdfBadge/>} label="research.pdf" sub="3,412 chunks" />
            <FloatCard top="-top-20" right="-right-24" delay="float-delay-2"
              icon={<DocBadge/>} label="notes.docx" sub="824 chunks" />
            <FloatCard bottom="-bottom-16" left="-left-32" delay="float-delay-3"
              icon={<ImgBadge/>} label="diagram.png" sub="OCR extracted" />
            <FloatCard bottom="-bottom-14" right="-right-28" delay=""
              icon={<XlsBadge/>} label="data.xlsx" sub="1,150 chunks" />

            {/* Connection lines (SVG) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ left: '-150px', top: '-80px', width: '360px', height: '240px' }}>
              {[
                { x1: 100, y1: 80,  x2: 170, y2: 120 },
                { x1: 240, y1: 80,  x2: 170, y2: 120 },
                { x1: 80,  y1: 180, x2: 170, y2: 120 },
                { x1: 260, y1: 180, x2: 170, y2: 120 },
              ].map((l, i) => (
                <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
                  stroke="rgba(139,0,74,0.25)" strokeWidth="1.5"
                  strokeDasharray="5,4" />
              ))}
            </svg>

            {/* Semantic nodes */}
            {[
              { top: '-top-4', left: '-left-14', delay: 0 },
              { top: 'top-2',  right: '-right-16', delay: 0.3 },
              { bottom: 'bottom-0', left: '-left-10', delay: 0.6 },
            ].map((n, i) => (
              <div key={i} className={`absolute ${n.top ?? ''} ${n.bottom ?? ''} ${n.left ?? ''} ${n.right ?? ''}
                w-3 h-3 rounded-full bg-brand/60 node-glow`}
                style={{ animationDelay: `${n.delay}s` }}/>
            ))}
          </div>

          {/* Answer chip */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 glass rounded-2xl px-4 py-2.5
            flex items-center gap-3 shadow-card min-w-[220px]">
            <div className="w-6 h-6 rounded-lg bg-brand flex items-center justify-center shrink-0">
              <SparkIcon sm />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-stone-700">AI Answer Ready</p>
              <p className="text-[10px] text-stone-400">3 citations · 98% confidence</p>
            </div>
            <div className="ml-auto w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/>
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section id="features" className="bg-white/50 border-y border-black/[0.05] py-20">
        <div className="max-w-6xl mx-auto px-5">
          <SectionLabel>Features</SectionLabel>
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mt-3 mb-2">
            Everything you need to interrogate your documents
          </h2>
          <p className="text-stone-400 text-base mb-12 max-w-xl">
            A complete AI research workspace built on state-of-the-art retrieval technology.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: <BotIcon/>, title: 'RAG-Based AI Chat', desc: 'Retrieval-augmented generation ensures answers are grounded in your documents.' },
              { icon: <SearchIcon/>, title: 'Semantic Search', desc: 'Vector embeddings capture meaning, not just keywords, for precise retrieval.' },
              { icon: <DocsIcon/>, title: 'Multi-Document', desc: 'Ask questions across multiple uploaded documents simultaneously.' },
              { icon: <ParseIcon/>, title: 'PDF & DOCX Parsing', desc: 'Extract text from any format including scanned images via OCR.' },
              { icon: <SummaryIcon/>, title: 'AI Summarization', desc: 'Condense lengthy documents into concise, accurate summaries instantly.' },
              { icon: <CtxIcon/>, title: 'Context-Aware', desc: 'Maintains conversation context for multi-turn document discussions.' },
              { icon: <DbIcon/>, title: 'ChromaDB Vectors', desc: 'Millisecond retrieval over millions of embeddings with ChromaDB.' },
              { icon: <CloudIcon/>, title: 'Secure Workspace', desc: 'Isolated sessions, encrypted processing, zero document retention.' },
            ].map(({ icon, title, desc }) => (
              <div key={title}
                className="group glass rounded-2xl p-5 space-y-3
                  hover:shadow-brand-sm hover:-translate-y-0.5
                  transition-all duration-200 cursor-default">
                <div className="w-10 h-10 rounded-xl bg-brand/[0.08] group-hover:bg-brand/[0.14]
                  flex items-center justify-center text-brand transition-colors">
                  {icon}
                </div>
                <p className="text-sm font-semibold text-stone-800">{title}</p>
                <p className="text-xs text-stone-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Workflow ─────────────────────────────────────────────────────── */}
      <section className="py-20 max-w-6xl mx-auto px-5">
        <SectionLabel>How it works</SectionLabel>
        <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mt-3 mb-12">
          From upload to answer in seconds
        </h2>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {[
            { n: '01', icon: <UploadIcon/>, label: 'Upload Documents', desc: 'PDF · DOCX · XLSX · PNG · JPG' },
            { n: '02', icon: <EmbedIcon/>,  label: 'Embedding Generation', desc: 'Semantic chunk vectors' },
            { n: '03', icon: <VecIcon/>,    label: 'Vector Search', desc: 'Top-K retrieval via ChromaDB' },
            { n: '04', icon: <GeminiIcon/>, label: 'Gemini Processing', desc: 'RAG prompt construction' },
            { n: '05', icon: <AnsIcon/>,    label: 'Intelligent Answer', desc: 'Cited, contextual response' },
          ].map(({ n, icon, label, desc }, i, arr) => (
            <div key={n} className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2 flex-1">
              <div className="relative w-12 h-12 rounded-2xl bg-brand flex items-center justify-center
                text-white shadow-brand-sm shrink-0">
                {icon}
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-cream-200
                  border border-brand/30 text-brand text-[9px] font-bold
                  flex items-center justify-center">{n}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-800">{label}</p>
                <p className="text-[11px] text-stone-400">{desc}</p>
              </div>
              {i < arr.length - 1 && (
                <div className="hidden sm:block w-full h-px bg-gradient-to-r
                  from-brand/30 to-transparent mt-0 flex-1"/>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Security ─────────────────────────────────────────────────────── */}
      <section id="security" className="bg-brand/[0.04] border-y border-brand/10 py-20">
        <div className="max-w-6xl mx-auto px-5">
          <SectionLabel>Security</SectionLabel>
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mt-3 mb-12">
            Built with privacy at every layer
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: <ShieldIcon/>, title: 'Google Authentication', desc: 'Secure OAuth 2.0 sign-in. No passwords stored.' },
              { icon: <LockIcon/>,   title: 'Browser Extraction', desc: 'Your file is never uploaded. Text extracted locally.' },
              { icon: <VaultIcon/>,  title: 'Private Vectors', desc: 'Each session uses isolated vector storage.' },
              { icon: <TimerIcon/>,  title: 'Temporary Sessions', desc: 'Documents cleared automatically. 10-day auth window.' },
            ].map(({ icon, title, desc }) => (
              <div key={title}
                className="glass rounded-2xl p-6 space-y-3 border border-brand/10
                  hover:border-brand/25 hover:shadow-brand-sm transition-all duration-200">
                <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center
                  text-white shadow-brand-sm">
                  {icon}
                </div>
                <p className="text-sm font-semibold text-stone-800">{title}</p>
                <p className="text-xs text-stone-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────────────────── */}
      <section className="py-20 max-w-3xl mx-auto px-5 text-center space-y-7">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-stone-900 tracking-tight">
          Start asking your documents
        </h2>
        <p className="text-stone-400 text-base max-w-xl mx-auto">
          Join researchers, students, and professionals using ASK Docs to unlock
          insight from their documents.
        </p>
        <button onClick={handleSignIn} disabled={loading}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-brand text-white
            font-bold text-sm shadow-brand hover:shadow-brand-lg active:scale-[0.98]
            disabled:opacity-60 transition-all duration-200">
          {loading
            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
            : <SparkIcon />}
          {loading ? 'Opening sign-in…' : 'Get started — it\'s free'}
        </button>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer id="about" className="border-t border-black/[0.07] bg-white/40 py-8">
        <div className="max-w-6xl mx-auto px-5 flex flex-col sm:flex-row items-center
          justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-brand flex items-center justify-center">
              <BrandIcon sm />
            </div>
            <span className="text-sm font-bold text-brand">ASK Docs</span>
          </div>
          <div className="flex items-center gap-5">
            {[
              { href: 'https://github.com/ADiTyaRaj8969/AsksDocs', label: 'GitHub' },
              { href: 'mailto:adivid198986@gmail.com', label: 'Contact' },
            ].map(({ href, label }) => (
              <a key={label} href={href} target="_blank" rel="noreferrer"
                className="text-xs text-stone-400 hover:text-brand transition-colors">
                {label}
              </a>
            ))}
          </div>
          <p className="text-[11px] text-stone-400">
            © 2025 ASK Docs. Your files never leave your device.
          </p>
        </div>
      </footer>
    </div>
  )
}

/* ── Helpers ───────────────────────────────────────────────────────────── */

function SectionLabel({ children }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase
      tracking-widest text-brand">
      <span className="w-4 h-px bg-brand"/>
      {children}
    </span>
  )
}

function FloatCard({ top, bottom, left, right, icon, label, sub, delay }) {
  return (
    <div className={`absolute ${top ?? ''} ${bottom ?? ''} ${left ?? ''} ${right ?? ''}
      glass rounded-2xl px-3 py-2.5 flex items-center gap-2.5 shadow-card
      animate-float ${delay} min-w-[140px]`}>
      <div className="shrink-0">{icon}</div>
      <div>
        <p className="text-[11px] font-semibold text-stone-700 leading-none">{label}</p>
        <p className="text-[9px] text-stone-400 mt-0.5">{sub}</p>
      </div>
    </div>
  )
}

/* ── Badge helpers ─────────────────────────────────────────────────────── */
const PdfBadge = () => <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-600">PDF</span>
const DocBadge = () => <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-600">DOC</span>
const ImgBadge = () => <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-600">IMG</span>
const XlsBadge = () => <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-600">XLS</span>

/* ── Icons ─────────────────────────────────────────────────────────────── */
const BrandIcon = ({ sm }) => (
  <svg className={sm ? 'w-3 h-3' : 'w-4 h-4'} fill="none" stroke="white" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
  </svg>
)
const SparkIcon = ({ sm }) => (
  <svg className={sm ? 'w-3 h-3' : 'w-4 h-4'} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
  </svg>
)
const ArrowIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
  </svg>
)
const BrainIcon = () => (
  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z"/>
  </svg>
)
const GoogleIcon = ({ color } = {}) => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
    <path fill={color ? '#4285F4' : 'white'} d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill={color ? '#34A853' : 'white'} d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill={color ? '#FBBC05' : 'white'} d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill={color ? '#EA4335' : 'white'} d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)
const BotIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/></svg>
const SearchIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 0z"/></svg>
const DocsIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>
const ParseIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75.125v-.375c0-.621.504-1.125 1.125-1.125h.375M20.625 19.5h-1.5C18.504 19.5 18 18.996 18 18.375m2.625.125v-.375c0-.621-.504-1.125-1.125-1.125h-.375M4.875 9h14.25M9.75 4.5v.375c0 .621.504 1.125 1.125 1.125h2.25c.621 0 1.125-.504 1.125-1.125V4.5m-4.5 0h4.5m-4.5 0H9.75m4.5 0H14.25"/></svg>
const SummaryIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"/></svg>
const CtxIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.43.992a6.759 6.759 0 010 .255c-.008.378.137.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
const DbIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"/></svg>
const CloudIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z"/></svg>
const UploadIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/></svg>
const EmbedIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"/></svg>
const VecIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 0z"/></svg>
const GeminiIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/></svg>
const AnsIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"/></svg>
const ShieldIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/></svg>
const LockIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/></svg>
const VaultIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"/></svg>
const TimerIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
