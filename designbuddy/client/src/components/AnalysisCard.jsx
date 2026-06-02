import React, { useEffect, useRef } from 'react'

const PRIORITY_COLOR = { high: '#ef4444', med: '#fbbf24', low: '#34d399' }

function ScoreBar({ score }) {
  const barRef = useRef()
  useEffect(() => {
    if (barRef.current) {
      setTimeout(() => { barRef.current.style.width = Math.min(100, score) + '%' }, 100)
    }
  }, [score])

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
      <div style={{
        fontFamily: 'var(--font-display)', fontSize: '2.8rem', fontWeight: 800,
        background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        backgroundClip: 'text', lineHeight: 1,
      }}>{score}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 6 }}>
          Design score <span style={{ fontSize: 11, opacity: 0.5 }}>/100</span>
        </div>
        <div style={{ height: 6, background: 'var(--surface2)', borderRadius: 4, overflow: 'hidden' }}>
          <div ref={barRef} style={{
            height: '100%', width: '0%',
            background: 'linear-gradient(90deg, var(--accent), var(--accent2))',
            borderRadius: 4, transition: 'width 1s ease',
          }} />
        </div>
      </div>
    </div>
  )
}

export default function AnalysisCard({ analysis, compact = false }) {
  const { score, summary, issues = [], suggestions = [], codeSnippet, vibe, created_at } = analysis

  const vibeLabel = vibe ? vibe.charAt(0).toUpperCase() + vibe.slice(1) : ''
  const time = created_at ? new Date(created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      maxWidth: compact ? '100%' : '88%',
    }}>
      {/* Header */}
      <div style={{
        padding: '13px 20px',
        background: 'var(--surface2)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13 }}>
          ✦ Design Analysis
          {vibeLabel && (
            <span style={{
              fontSize: 11, fontWeight: 500,
              background: 'rgba(124,92,252,0.15)', color: 'var(--accent2)',
              border: '1px solid rgba(124,92,252,0.25)',
              padding: '2px 9px', borderRadius: 20,
            }}>{vibeLabel}</span>
          )}
        </div>
        {time && <span style={{ fontSize: 11, color: 'var(--muted)' }}>{time}</span>}
      </div>

      {/* Body */}
      <div style={{ padding: '20px' }}>
        {score != null && <ScoreBar score={score} />}

        {summary && (
          <p style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--text2)', marginBottom: 16 }}>{summary}</p>
        )}

        {issues.length > 0 && (
          <>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>
              Issues found
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {issues.map((issue, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 12, padding: '11px 14px',
                  borderRadius: 12, border: '1px solid var(--border)', background: 'var(--surface2)',
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: PRIORITY_COLOR[issue.priority] || PRIORITY_COLOR.med,
                    flexShrink: 0, marginTop: 5,
                  }} />
                  <div style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--text)' }}>{issue.text}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {suggestions.length > 0 && (
          <>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>
              Quick wins
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
              {suggestions.map((s, i) => (
                <span key={i} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  background: 'rgba(124,92,252,0.1)', border: '1px solid rgba(124,92,252,0.25)',
                  color: 'var(--accent2)', padding: '6px 12px', borderRadius: 20, fontSize: 12,
                }}>→ {s}</span>
              ))}
            </div>
          </>
        )}

        {codeSnippet && (
          <>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>
              CSS snippet
            </div>
            <pre style={{
              background: 'var(--surface2)', border: '1px solid var(--border)',
              borderRadius: 10, padding: 14, fontSize: 12, overflowX: 'auto',
              color: '#a5f3fc', fontFamily: 'monospace', lineHeight: 1.75,
            }}>{codeSnippet}</pre>
          </>
        )}
      </div>
    </div>
  )
}
