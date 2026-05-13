import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { queryDocuments } from '../api/api'
import CitationPanel from './CitationPanel'
import { useToast } from './Toast'
import { useAuth } from '../contexts/AuthContext'

const WELCOME = {
  role: 'assistant',
  content: `Hello! I'm **ASK Docs**, your intelligent document assistant.\n\nUpload a document using the sidebar, then ask me anything about it — I'll answer with contextual accuracy, grounded in your document content.`,
  citations: [],
}

function mdToHtml(raw) {
  const escaped = raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  const lines = escaped.split('\n')
  const out = []
  let inUl = false, inOl = false, inPre = false

  for (let i = 0; i < lines.length; i++) {
    let l = lines[i]

    // fenced code blocks
    if (l.trim().startsWith('```')) {
      if (!inPre) { out.push('<pre>'); inPre = true }
      else         { out.push('</pre>'); inPre = false }
      continue
    }
    if (inPre) { out.push(l + '\n'); continue }

    // close lists on blank line
    if (!l.trim()) {
      if (inUl) { out.push('</ul>'); inUl = false }
      if (inOl) { out.push('</ol>'); inOl = false }
      out.push('<br/>')
      continue
    }

    // headings
    if (/^### /.test(l)) { out.push(`<h3>${l.slice(4)}</h3>`); continue }
    if (/^## /.test(l))  { out.push(`<h2>${l.slice(3)}</h2>`); continue }
    if (/^# /.test(l))   { out.push(`<h1>${l.slice(2)}</h1>`); continue }

    // unordered list
    if (/^[-*] /.test(l)) {
      if (!inUl) { out.push('<ul>'); inUl = true }
      l = `<li>${l.slice(2)}</li>`
      out.push(inlineMd(l)); continue
    }

    // ordered list
    if (/^\d+\. /.test(l)) {
      if (!inOl) { out.push('<ol>'); inOl = true }
      l = `<li>${l.replace(/^\d+\. /, '')}</li>`
      out.push(inlineMd(l)); continue
    }

    // close open lists
    if (inUl) { out.push('</ul>'); inUl = false }
    if (inOl) { out.push('</ol>'); inOl = false }

    out.push('<p>' + inlineMd(l) + '</p>')
  }
  if (inUl) out.push('</ul>')
  if (inOl) out.push('</ol>')
  return out.join('')
}

function inlineMd(s) {
  return s
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g,     '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,         '<em>$1</em>')
    .replace(/`([^`]+)`/g,         '<code>$1</code>')
    .replace(/~~(.+?)~~/g,         '<del>$1</del>')
}

function buildChatHtml(messages, userName, userPhoto) {
  const count = messages.length - 1
  const date  = new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })

  const rows = messages.slice(1).map((msg) => {
    const isUser = msg.role === 'user'

    const avatar = isUser
      ? (userPhoto
          ? `<img src="${userPhoto}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;flex-shrink:0;border:2px solid #f3e8f0"/>`
          : `<div style="width:32px;height:32px;border-radius:50%;background:#8B004A;color:#fff;
               display:flex;align-items:center;justify-content:center;font-size:13px;
               font-weight:700;flex-shrink:0">${(userName || 'U')[0].toUpperCase()}</div>`)
      : `<div style="width:32px;height:32px;border-radius:50%;background:#8B004A;color:#fff;
           display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">✦</div>`

    const name = isUser ? (userName || 'You') : 'ASK Docs'

    const body = isUser
      ? `<p style="margin:0;font-size:13px;line-height:1.65;color:#292524;white-space:pre-wrap">${msg.content.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</p>`
      : mdToHtml(msg.content)

    const citBlock = (!isUser && msg.citations?.length)
      ? `<div style="margin-top:12px;padding-top:10px;border-top:1px dashed #e7d5e0">
           <p style="margin:0 0 6px;font-size:9px;font-weight:700;color:#8B004A;
             text-transform:uppercase;letter-spacing:.08em">Sources</p>
           ${msg.citations.map((c, ci) => `
             <div style="display:flex;align-items:baseline;gap:6px;margin-bottom:4px">
               <span style="min-width:16px;height:16px;border-radius:50%;background:#8B004A;
                 color:#fff;font-size:8px;font-weight:700;display:inline-flex;
                 align-items:center;justify-content:center">${ci+1}</span>
               <span style="font-size:10px;color:#57534e">
                 <strong style="color:#292524">${c.documentName}</strong>
                 &nbsp;·&nbsp; Page ${c.pageNumber}
                 &nbsp;·&nbsp; ${Math.round(c.score * 100)}% match
               </span>
             </div>`).join('')}
         </div>`
      : ''

    return `
      <div style="display:flex;gap:12px;margin-bottom:20px;align-items:flex-start;
        ${isUser ? 'flex-direction:row-reverse' : ''}">
        ${avatar}
        <div style="flex:1;max-width:88%">
          <p style="margin:0 0 5px;font-size:10px;font-weight:700;color:#8B004A;
            text-transform:uppercase;letter-spacing:.07em;
            ${isUser ? 'text-align:right' : ''}">${name}</p>
          <div style="padding:12px 16px;border-radius:${isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px'};
            background:${isUser ? '#f9f0f5' : '#ffffff'};
            border:1px solid ${isUser ? '#e8d0e0' : '#e7e5e4'};
            box-shadow:0 1px 3px rgba(0,0,0,.06)">
            <div class="md">${body}</div>
            ${citBlock}
          </div>
        </div>
      </div>`
  }).join('')

  return `<!DOCTYPE html>
<html lang="en"><head>
  <meta charset="utf-8"/>
  <title>ASK Docs — Chat Export</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;
         background:#f2efe7;color:#1c1917;padding:0}
    .page{max-width:760px;margin:0 auto;background:#fff;min-height:100vh;
          box-shadow:0 0 40px rgba(0,0,0,.08)}
    .header{background:linear-gradient(135deg,#8B004A 0%,#b5196b 100%);
            padding:28px 36px;color:#fff}
    .header-top{display:flex;align-items:center;gap:12px;margin-bottom:10px}
    .logo{width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,.2);
          display:flex;align-items:center;justify-content:center;font-size:18px}
    .header h1{font-size:22px;font-weight:700;letter-spacing:-.3px}
    .header-meta{display:flex;gap:20px;font-size:11px;opacity:.75}
    .header-meta span{display:flex;align-items:center;gap:4px}
    .body{padding:28px 36px}
    .md h1{font-size:16px;font-weight:700;color:#8B004A;margin:10px 0 4px}
    .md h2{font-size:14px;font-weight:700;color:#8B004A;margin:8px 0 4px}
    .md h3{font-size:13px;font-weight:600;color:#57384d;margin:6px 0 3px}
    .md p{font-size:12.5px;line-height:1.7;color:#292524;margin-bottom:6px}
    .md ul,.md ol{padding-left:18px;margin-bottom:8px}
    .md li{font-size:12.5px;line-height:1.6;color:#292524;margin-bottom:2px}
    .md strong{font-weight:700;color:#1c1917}
    .md em{font-style:italic;color:#57534e}
    .md code{background:#fdf4f7;color:#8B004A;padding:1px 5px;border-radius:4px;
             font-size:11px;font-family:'Courier New',monospace;border:1px solid #f3dce8}
    .md pre{background:#1a0a10;color:#f2efe7;padding:14px 16px;border-radius:10px;
            font-size:11px;font-family:'Courier New',monospace;overflow:auto;
            margin:8px 0;line-height:1.6;white-space:pre-wrap;word-break:break-word}
    .md del{text-decoration:line-through;color:#a8a29e}
    .footer{padding:16px 36px;background:#faf8f6;border-top:1px solid #f0ece6;
            text-align:center;font-size:10px;color:#a8a29e}
    @media print{
      body{background:#fff}
      .page{box-shadow:none;max-width:100%}
      .header{-webkit-print-color-adjust:exact;print-color-adjust:exact}
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="header-top">
        <div class="logo">✦</div>
        <div>
          <h1>ASK Docs</h1>
          <p style="font-size:11px;opacity:.7;margin-top:1px">AI Document Assistant</p>
        </div>
      </div>
      <div class="header-meta">
        <span>📅 ${date}</span>
        <span>💬 ${count} message${count !== 1 ? 's' : ''}</span>
        ${userName ? `<span>👤 ${userName}</span>` : ''}
      </div>
    </div>

    <div class="body">
      ${rows}
    </div>

    <div class="footer">
      Generated by ASK Docs &nbsp;·&nbsp; AI-powered document intelligence
    </div>
  </div>
</body></html>`
}

export default function ChatInterface() {
  const toast = useToast()
  const { user } = useAuth()
  const [messages, setMessages] = useState([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  const downloadPDF = () => {
    if (messages.length <= 1) { toast.error('No chat to export yet.'); return }
    const win = window.open('', '_blank')
    if (!win) { toast.error('Allow pop-ups to download the chat PDF.'); return }
    const userName  = user?.firebaseUser?.displayName  || ''
    const userPhoto = user?.firebaseUser?.photoURL     || ''
    win.document.open()
    win.document.write(buildChatHtml(messages, userName, userPhoto))
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 500)
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`
  }, [input])

  const send = async () => {
    const question = input.trim()
    if (!question || loading) return
    setMessages(m => [...m, { role: 'user', content: question, citations: [] }])
    setInput('')
    setLoading(true)
    try {
      const data = await queryDocuments(question)
      setMessages(m => [...m, { role: 'assistant', content: data.answer, citations: data.citations ?? [] }])
    } catch (err) {
      const msg = err.response?.data?.error ?? err.message ?? 'Something went wrong.'
      toast.error(msg)
      setMessages(m => [...m, { role: 'assistant', content: `**Error:** ${msg}`, citations: [] }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <p className="text-[11px] text-stone-400 font-medium">
          {messages.length - 1} message{messages.length - 1 !== 1 ? 's' : ''}
        </p>
        {messages.length > 1 && (
          <div className="flex items-center gap-3">
            <button onClick={downloadPDF}
              className="text-[11px] text-stone-400 hover:text-brand flex items-center gap-1
                transition-colors font-medium">
              <DownloadIcon /> Download PDF
            </button>
            <button onClick={() => setMessages([WELCOME])}
              className="text-[11px] text-stone-400 hover:text-brand flex items-center gap-1
                transition-colors font-medium">
              <ClearIcon /> Clear chat
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-2">
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} />
        ))}
        {loading && <ThinkingBubble />}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="mt-3 shrink-0">
        <div className={`flex gap-2 items-end rounded-2xl border-2 transition-all duration-200
          bg-white shadow-card
          ${input ? 'border-brand/40 shadow-brand-sm' : 'border-stone-200'}`}>
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask a question about your documents…"
            disabled={loading}
            className="flex-1 resize-none bg-transparent px-4 py-3 text-sm text-stone-800
              placeholder-stone-400 focus:outline-none leading-relaxed min-h-[44px] max-h-40"
          />
          <button onClick={send} disabled={!input.trim() || loading}
            className="shrink-0 m-1.5 w-9 h-9 flex items-center justify-center rounded-xl
              bg-brand hover:bg-brand-600 disabled:opacity-30 disabled:pointer-events-none
              text-white transition-all duration-150 active:scale-95 shadow-brand-sm
              disabled:shadow-none glow-brand-sm">
            <SendIcon />
          </button>
        </div>
        <p className="text-[10px] text-stone-400 mt-1.5 text-center">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}

function MessageBubble({ msg }) {
  const [copied, setCopied] = useState(false)
  const isUser = msg.role === 'user'

  const copy = () => {
    navigator.clipboard.writeText(msg.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className={`msg-enter flex ${isUser ? 'justify-end' : 'justify-start'} gap-2.5`}>
      {!isUser && <AssistantAvatar />}

      <div className={`max-w-[85%] group relative`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed
          ${isUser
            ? 'bg-brand text-white rounded-br-none shadow-brand-sm'
            : 'bg-white border border-stone-200/80 text-stone-800 rounded-bl-none shadow-card'}`}>
          {isUser ? (
            <p className="whitespace-pre-wrap">{msg.content}</p>
          ) : (
            <>
              <div className="ai-prose max-w-none text-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.content}
                </ReactMarkdown>
              </div>
              <CitationPanel citations={msg.citations} />
            </>
          )}
        </div>

        <button onClick={copy}
          className={`absolute top-2
            ${isUser ? 'left-0 -translate-x-full pr-1.5' : 'right-0 translate-x-full pl-1.5'}
            opacity-0 group-hover:opacity-100 transition-opacity`}>
          <div className="w-6 h-6 rounded-lg bg-white border border-stone-200 shadow-card
            hover:border-brand/30 flex items-center justify-center transition-colors">
            {copied ? <CheckIcon /> : <CopyIcon />}
          </div>
        </button>
      </div>

      {isUser && <UserAvatar />}
    </div>
  )
}

function ThinkingBubble() {
  return (
    <div className="msg-enter flex justify-start gap-2.5">
      <AssistantAvatar />
      <div className="bg-white border border-stone-200/80 rounded-2xl rounded-bl-none
        px-4 py-3.5 shadow-card">
        <div className="flex gap-1.5 items-center">
          {[0, 1, 2].map(i => (
            <span key={i} className="w-2 h-2 rounded-full bg-brand/60 thinking-dot"
              style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

const AssistantAvatar = () => (
  <div className="w-7 h-7 rounded-xl bg-brand flex items-center justify-center
    shrink-0 mt-0.5 shadow-brand-sm">
    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor"
      strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
    </svg>
  </div>
)

const UserAvatar = () => {
  const { user } = useAuth()
  const photoURL = user?.firebaseUser?.photoURL
  const displayName = user?.firebaseUser?.displayName

  if (photoURL) {
    return (
      <img src={photoURL} alt={displayName || 'You'} referrerPolicy="no-referrer"
        className="w-7 h-7 rounded-xl object-cover shrink-0 mt-0.5 ring-2 ring-brand/20" />
    )
  }

  return (
    <div className="w-7 h-7 rounded-xl bg-brand/20 flex items-center justify-center shrink-0 mt-0.5">
      {displayName
        ? <span className="text-[11px] font-bold text-brand">{displayName[0].toUpperCase()}</span>
        : <svg className="w-4 h-4 text-stone-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
          </svg>
      }
    </div>
  )
}

const SendIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/>
  </svg>
)
const ClearIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/>
  </svg>
)
const CopyIcon = () => (
  <svg className="w-3 h-3 text-stone-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"/>
  </svg>
)
const CheckIcon = () => (
  <svg className="w-3 h-3 text-brand" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
  </svg>
)
const DownloadIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/>
  </svg>
)
