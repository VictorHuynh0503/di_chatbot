import React from 'react'
import type { AnalyzeResult } from '../api'

interface Props {
  result: AnalyzeResult
}

const PRED_COLOR: Record<string, string> = {
  buy:  'var(--green)',
  hold: 'var(--blue)',
  sell: 'var(--red)',
}

const BAR_COLOR = (dir: string) => dir === 'positive' ? 'var(--green)' : 'var(--red)'

export default function ShapGraph({ result }: Props) {
  const { graph, shap, probabilities, prediction } = result
  const factors = graph.nodes.filter(n => n.type === 'factor')
    .sort((a, b) => Math.abs(b.shap_value ?? 0) - Math.abs(a.shap_value ?? 0))

  const maxAbs = Math.max(...factors.map(f => Math.abs(f.shap_value ?? 0)))

  return (
    <div style={{
      background: 'var(--bg2)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '16px',
      marginTop: 8,
      fontSize: 13,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{ color: 'var(--text2)', fontSize: 12 }}>Decision</span>
        <span style={{
          padding: '3px 12px',
          borderRadius: 20,
          background: PRED_COLOR[prediction] + '22',
          color: PRED_COLOR[prediction],
          fontWeight: 600,
          fontSize: 14,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          {prediction}
        </span>
        <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
          {Object.entries(probabilities).map(([label, p]) => (
            <span key={label} style={{
              fontSize: 11,
              padding: '2px 8px',
              borderRadius: 4,
              background: 'var(--bg3)',
              color: label === prediction ? PRED_COLOR[label] : 'var(--text2)',
            }}>
              {label}: {(p * 100).toFixed(0)}%
            </span>
          ))}
        </div>
      </div>

      {/* SHAP factor bars */}
      <div style={{ marginBottom: 10 }}>
        <span style={{ color: 'var(--text2)', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          SHAP factor impact
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {factors.map(f => {
          const pct = maxAbs > 0 ? (Math.abs(f.shap_value ?? 0) / maxAbs) * 100 : 0
          const isPos = (f.shap_value ?? 0) >= 0
          return (
            <div key={f.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ color: 'var(--text)', fontWeight: 500 }}>{f.label}</span>
                <span style={{ color: 'var(--text2)', fontSize: 11 }}>
                  val={f.raw_value} &nbsp;
                  <span style={{ color: BAR_COLOR(f.direction ?? 'positive') }}>
                    {isPos ? '+' : ''}{f.shap_value?.toFixed(4)}
                  </span>
                  &nbsp;({f.importance_pct}%)
                </span>
              </div>
              {/* Zero-centered bar */}
              <div style={{
                position: 'relative',
                height: 8,
                background: 'var(--bg3)',
                borderRadius: 4,
                overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  height: '100%',
                  width: `${pct / 2}%`,
                  left: isPos ? '50%' : `${50 - pct / 2}%`,
                  background: BAR_COLOR(f.direction ?? 'positive'),
                  borderRadius: 4,
                  transition: 'width 0.4s ease',
                }} />
                {/* Centre line */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  width: 1,
                  height: '100%',
                  background: 'var(--border)',
                }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Base value note */}
      <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text2)' }}>
        Base value: {shap.base_value.toFixed(4)} &nbsp;·&nbsp;
        Green = pushes toward prediction &nbsp;·&nbsp; Red = pushes against
      </div>
    </div>
  )
}
