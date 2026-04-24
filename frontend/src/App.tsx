import React, { useState, useRef, useEffect } from 'react'
import { callChat, callAnalyze, callEvents } from './api'
import type { AnalyzeResult } from './api'
import ShapGraph from './components/ShapGraph'
import Sidebar, { type ChatSession } from './components/Sidebar'
import ThemeToggle from './components/ThemeToggle'

// ── Types ─────────────────────────────────────────────────────────────────────
type Role = 'user' | 'assistant'
interface Message {
  id: number
  role: Role
  text: string
  analyzedResult?: AnalyzeResult
  triggeredNodes?: string[]
  loading?: boolean
}

// ── Helpers ───────────────────────────────────────────────────────────────────
let msgId = 0
const newId = () => ++msgId

const SUGGESTIONS = [
  'Analyze market factors',
  'Show upcoming events',
  'Should I buy or sell?',
  'Explain SHAP values',
]

// ── Sub-components ────────────────────────────────────────────────────────────
function Avatar({ role }: { role: Role }) {
  return (
    <div style={{
      width: 32,
      height: 32,
      borderRadius: '50%',
      background: role === 'user' ? 'var(--accent-dim)' : 'var(--bg3)',
      border: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 13,
      fontWeight: 600,
      color: role === 'user' ? 'var(--accent)' : 'var(--text2)',
      flexShrink: 0,
    }}>
      {role === 'user' ? 'U' : 'AI'}
    </div>
  )
}

function TriggeredBadges({ nodes }: { nodes: string[] }) {
  if (!nodes.length) return null
  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
      {nodes.map(n => (
        <span key={n} style={{
          fontSize: 11,
          padding: '2px 8px',
          borderRadius: 4,
          background: 'var(--accent-dim)',
          color: 'var(--accent)',
          border: '1px solid rgba(201,100,66,0.3)',
        }}>
          /{n}
        </span>
      ))}
    </div>
  )
}

function Bubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{
      display: 'flex',
      gap: 12,
      flexDirection: isUser ? 'row-reverse' : 'row',
      alignItems: 'flex-start',
      maxWidth: 760,
      marginLeft: isUser ? 'auto' : 0,
      marginRight: isUser ? 0 : 'auto',
      width: '100%',
    }}>
      <Avatar role={msg.role} />
      <div style={{ flex: 1, minWidth: 0 }}>
        {msg.triggeredNodes && <TriggeredBadges nodes={msg.triggeredNodes} />}
        <div style={{
          padding: '10px 14px',
          borderRadius: isUser ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
          background: isUser ? 'rgba(201,100,66,0.12)' : 'var(--bg2)',
          border: `1px solid ${isUser ? 'rgba(201,100,66,0.25)' : 'var(--border)'}`,
          fontSize: 14,
          lineHeight: 1.65,
          color: 'var(--text)',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}>
          {msg.loading
            ? <span style={{ color: 'var(--text2)' }}>
                <LoadingDots />
              </span>
            : msg.text}
        </div>
        {msg.analyzedResult && <ShapGraph result={msg.analyzedResult} />}
      </div>
    </div>
  )
}

function LoadingDots() {
  const [dots, setDots] = useState('.')
  useEffect(() => {
    const t = setInterval(() => setDots(d => d.length >= 3 ? '.' : d + '.'), 400)
    return () => clearInterval(t)
  }, [])
  return <span>Thinking{dots}</span>
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  // ── Theme state ────────────────────────────────────────────────────────────
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('app-theme')
    return saved ? saved === 'dark' : true
  })
  const [sidebarOpen, setSidebarOpen] = useState(true)
  // ── Chat state ─────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<Message[]>([
    {
      id: newId(),
      role: 'assistant',
      text: 'Hello! I can analyze market factors using Decision Trees + SHAP, fetch events, or answer questions about your data.\n\nTry asking me to "analyze market factors" or "show upcoming events".',
    },
  ])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)

  // ── Chat history state ─────────────────────────────────────────────────────
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('chat-sessions')
    return saved ? JSON.parse(saved) : []
  })
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)

  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('app-theme', isDark ? 'dark' : 'light')
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }, [input])

  // ── Chat history helpers ───────────────────────────────────────────────────
  function saveCurrentChat() {
    if (messages.length <= 1 || currentSessionId) return

    // Auto-generate title from first user message
    const firstUser = messages.find(m => m.role === 'user')
    const title = firstUser ? firstUser.text.slice(0, 40) + (firstUser.text.length > 40 ? '…' : '') : 'New Chat'

    const preview = messages.find(m => m.role === 'user')?.text.slice(0, 60) || 'No preview'

    // Save the entire conversation history, excluding loading states
    const conversationData = messages.map(m => ({
      role: m.role,
      text: m.text,
      analyzedResult: m.analyzedResult,
      triggeredNodes: m.triggeredNodes,
    }))

    const session: ChatSession = {
      id: Date.now().toString(),
      title,
      timestamp: Date.now(),
      preview,
      contextData: conversationData,
    }

    setChatSessions(prev => {
      const updated = [session, ...prev]
      localStorage.setItem('chat-sessions', JSON.stringify(updated))
      return updated
    })
    setCurrentSessionId(session.id)
  }

  function newChat() {
    saveCurrentChat()
    setMessages([
      {
        id: newId(),
        role: 'assistant',
        text: 'Hello! I can analyze market factors using Decision Trees + SHAP, fetch events, or answer questions about your data.\n\nTry asking me to "analyze market factors" or "show upcoming events".',
      },
    ])
    setInput('')
    setCurrentSessionId(null)
  }

  function loadSession(session: ChatSession) {
    const restoredMessages = session.contextData.map((item: any, idx: number) => ({
      id: newId(),
      role: item.role as Role,
      text: item.text,
      analyzedResult: item.analyzedResult,
      triggeredNodes: item.triggeredNodes,
    }))
    setMessages(restoredMessages)
    setCurrentSessionId(session.id)
    setInput('')
  }

  function deleteSession(id: string) {
    setChatSessions(prev => {
      const updated = prev.filter(s => s.id !== id)
      localStorage.setItem('chat-sessions', JSON.stringify(updated))
      return updated
    })
    if (currentSessionId === id) {
      newChat()
    }
  }

  // ── Message sending logic ──────────────────────────────────────────────────
  async function send(text: string) {
    if (!text.trim() || busy) return
    setInput('')
    setBusy(true)

    const userMsg: Message = { id: newId(), role: 'user', text }
    const loadingMsg: Message = { id: newId(), role: 'assistant', text: '', loading: true }
    setMessages(prev => [...prev, userMsg, loadingMsg])

    try {
      // Route via /chat
      const chatResp = await callChat(text)
      const { routed_intent, context_data } = chatResp

      let replyText = ''
      let analyzedResult: AnalyzeResult | undefined
      let triggeredNodes: string[] = []

      // If analysis was triggered, use context_data
      if (routed_intent === 'analyze') {
        analyzedResult = context_data
        triggeredNodes = ['analyze']
        const pred = analyzedResult.prediction
        const top = Object.entries(analyzedResult.shap.values)
          .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
          .slice(0, 2)
          .map(([k, v]) => `${k} (${v > 0 ? '+' : ''}${v.toFixed(3)})`)
          .join(', ')
        replyText = `Decision Tree analysis complete.\n\nPrediction: ${pred.toUpperCase()}\nProbabilities: ${Object.entries(analyzedResult.probabilities).map(([k, v]) => `${k}=${(v * 100).toFixed(0)}%`).join(', ')}\n\nTop SHAP factors: ${top}\n\nThe SHAP graph below shows each factor's contribution to the decision.`
      } else if (routed_intent === 'events') {
        const evData = context_data
        triggeredNodes = ['events']
        const lines = evData.data.map((e: Record<string, string>) => `• ${e.name} — ${e.date} [${e.impact} impact]`).join('\n')
        replyText = `Upcoming market events:\n\n${lines}`
      } else {
        replyText = `I understand you're asking about: "${text}"\n\nI can help with:\n• Market factor analysis (type "analyze")\n• Upcoming events (type "events")\n• Decision intelligence explanations\n\nTry one of the suggestions below!`
      }

      setMessages(prev => prev.map(m =>
        m.id === loadingMsg.id
          ? { ...m, text: replyText, loading: false, analyzedResult, triggeredNodes }
          : m
      ))
    } catch (err) {
      setMessages(prev => prev.map(m =>
        m.id === loadingMsg.id
          ? { ...m, text: `Error: Could not reach backend. Make sure it's running at http://localhost:8000\n\n${err}`, loading: false }
          : m
      ))
    }
    setBusy(false)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: 'var(--bg)',
    }}>
      {/* Sidebar – Conditionally Render */}
      {sidebarOpen && (
        <Sidebar
          sessions={chatSessions}
          currentSessionId={currentSessionId}
          onSelectSession={loadSession}
          onNewChat={newChat}
          onDeleteSession={deleteSession}
        />
      )}

      {/* Main Chat Area */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        background: 'var(--bg)',
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'var(--bg)',
        }}>
          {/* Sidebar Toggle Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--bg2)',
              color: 'var(--text)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              transition: 'all 0.2s ease',
              flexShrink: 0,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--accent)'
              e.currentTarget.style.background = 'var(--accent-dim)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.background = 'var(--bg2)'
            }}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>

          <div style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
          }}>⬡</div>
          <span style={{ fontWeight: 600, fontSize: 15 }}>Decision Intelligence</span>
          <span style={{ fontSize: 12, color: 'var(--text2)', marginLeft: 4 }}>
            Decision Tree + SHAP
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)' }} />
              <span style={{ fontSize: 12, color: 'var(--text2)' }}>localhost:8000</span>
            </div>
            <ThemeToggle isDark={isDark} onChange={setIsDark} />
          </div>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}>
          {messages.map(msg => <Bubble key={msg.id} msg={msg} />)}
          <div ref={bottomRef} />
        </div>

        {/* Suggestion chips — shown when idle */}
        {messages.length <= 2 && (
          <div style={{
            padding: '0 16px 12px',
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}>
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => send(s)}
                style={{
                  padding: '7px 14px',
                  borderRadius: 20,
                  border: '1px solid var(--border)',
                  background: 'var(--bg2)',
                  color: 'var(--text)',
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input bar */}
        <div style={{
          padding: '12px 16px 16px',
          borderTop: '1px solid var(--border)',
          background: 'var(--bg)',
        }}>
          <div style={{
            maxWidth: 760,
            margin: '0 auto',
            display: 'flex',
            gap: 10,
            alignItems: 'flex-end',
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: '10px 12px',
          }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about market factors, events, or SHAP analysis…"
              rows={1}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text)',
                fontSize: 14,
                lineHeight: 1.5,
                resize: 'none',
                maxHeight: 160,
                overflowY: 'auto',
              }}
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || busy}
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                border: 'none',
                background: input.trim() && !busy ? 'var(--accent)' : 'var(--bg3)',
                color: input.trim() && !busy ? '#fff' : 'var(--text2)',
                cursor: input.trim() && !busy ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                flexShrink: 0,
                transition: 'background 0.15s',
              }}
            >
              ↑
            </button>
          </div>
          <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text2)', marginTop: 8 }}>
            Enter to send · Shift+Enter for new line
          </div>
        </div>
      </div>
    </div>
  )
}
