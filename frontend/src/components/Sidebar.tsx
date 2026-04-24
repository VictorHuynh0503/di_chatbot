import React, { useState } from 'react'

export interface ChatSession {
  id: string
  title: string
  timestamp: number
  preview: string
  contextData: any
}

interface SidebarProps {
  sessions: ChatSession[]
  currentSessionId: string | null
  onSelectSession: (session: ChatSession) => void
  onNewChat: () => void
  onDeleteSession: (id: string) => void
}

export default function Sidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Filter sessions by search query
  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.preview.toLowerCase().includes(searchQuery.toLowerCase())
  )
  return (
    <div
      style={{
        width: 260,
        background: 'var(--bg2)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* New Chat Button */}
      <div style={{ padding: '12px' }}>
        <button
          onClick={onNewChat}
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'var(--accent)',
            color: '#fff',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          + New Chat
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ padding: '8px 12px' }}>
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            paddingLeft: 10,
          }}
        >
          <span style={{ fontSize: 14, color: 'var(--text2)' }}>🔍</span>
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text)',
              fontSize: 12,
              paddingLeft: 8,
              paddingRight: 10,
              padding: '8px 10px',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text2)',
                cursor: 'pointer',
                fontSize: 12,
                padding: '0 4px',
                marginRight: 4,
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Chat History */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px 8px',
        }}
      >
        {filteredSessions.length === 0 ? (
          <div
            style={{
              padding: '16px 12px',
              fontSize: 12,
              color: 'var(--text2)',
              textAlign: 'center',
            }}
          >
            {searchQuery ? 'No matching chats' : 'No chat history yet'}
          </div>
        ) : (
          filteredSessions.map(session => (
            <div
              key={session.id}
              onClick={() => onSelectSession(session)}
              style={{
                padding: '10px 12px',
                marginBottom: 6,
                borderRadius: 8,
                background:
                  currentSessionId === session.id ? 'var(--accent-dim)' : 'var(--bg)',
                border:
                  currentSessionId === session.id
                    ? '1px solid var(--accent)'
                    : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative',
                group: 'group',
              }}
              onMouseEnter={e => {
                if (currentSessionId !== session.id) {
                  e.currentTarget.style.background = 'var(--bg3)'
                  e.currentTarget.style.borderColor = 'var(--border)'
                }
              }}
              onMouseLeave={e => {
                if (currentSessionId !== session.id) {
                  e.currentTarget.style.background = 'var(--bg)'
                  e.currentTarget.style.borderColor = 'transparent'
                }
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: 'var(--text)',
                  marginBottom: 4,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {session.title}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--text2)',
                  marginBottom: 6,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {session.preview}
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    color: 'var(--text2)',
                  }}
                >
                  {new Date(session.timestamp).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <button
                  onClick={e => {
                    e.stopPropagation()
                    onDeleteSession(session.id)
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text2)',
                    cursor: 'pointer',
                    fontSize: 12,
                    padding: '2px 4px',
                    opacity: '0.6',
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '12px',
          borderTop: '1px solid var(--border)',
          fontSize: 10,
          color: 'var(--text2)',
          textAlign: 'center',
        }}
      >
        DI Chatbot v1.0
      </div>
    </div>
  )
}
