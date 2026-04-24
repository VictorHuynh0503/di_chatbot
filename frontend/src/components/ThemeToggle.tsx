import React from 'react'

interface ThemeToggleProps {
  isDark: boolean
  onChange: (isDark: boolean) => void
}

export default function ThemeToggle({ isDark, onChange }: ThemeToggleProps) {
  return (
    <button
      onClick={() => onChange(!isDark)}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
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
      {isDark ? '☀️' : '🌙'}
    </button>
  )
}
