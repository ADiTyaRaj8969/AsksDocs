import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { queryDocuments } from '../api/api'
import CitationPanel from './CitationPanel'
import { useToast } from './Toast'

const WELCOME = {
  role: 'assistant',
  content: `Hello! I'm **ASK Docs**, your intelligent document assistant.\n\nUpload a document using the sidebar, then ask me anything about it — I'll answer with contextual accuracy, grounded in your document content.`,
  citations: [],
}

export default function ChatInterface() {
  const toast = useToast()
  const [messages, setMessages] = useState([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

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
          <button onClick={() => setMessages([WELCOME])}
            className="text-[11px] text-stone-400 hover:text-brand flex items-center gap-1
              transition-colors font-medium">
            <ClearIcon /> Clear chat
          </button>
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

const UserAvatar = () => (
  <div className="w-7 h-7 rounded-xl bg-stone-200 flex items-center justify-center
    shrink-0 mt-0.5">
    <svg className="w-4 h-4 text-stone-500" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
    </svg>
  </div>
)

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
