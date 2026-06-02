import React from 'react'

const VIBES = [
  { id: 'minimal',       emoji: '◾', name: 'Minimal',      desc: 'Clean, white space',   accent: 'var(--accent3)' },
  { id: 'bold',          emoji: '⚡', name: 'Bold & Dark',  desc: 'Dramatic, high impact', accent: 'var(--accent)' },
  { id: 'glassmorphism', emoji: '💎', name: 'Glass',        desc: 'Frosted, layered',     accent: '#38bdf8' },
  { id: 'neomorphism',   emoji: '🪨', name: 'Neumorphic',   desc: 'Soft, embossed',       accent: '#888' },
  { id: 'brutalist',     emoji: '🔲', name: 'Brutalist',    desc: 'Raw, typographic',     accent: 'var(--warn)' },
  { id: 'soft',          emoji: '🌸', name: 'Soft & Pastel',desc: 'Gentle, friendly',     accent: '#f472b6' },
]

export default function VibeSelector({ value, onChange }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
      {VIBES.map(v => {
        const sel = value === v.id
        return (
          <div
            key={v.id}
            onClick={() => onChange(v.id)}
            style={{
              border: `1.5px solid ${sel ? v.accent : 'var(--border)'}`,
              borderRadius: 12,
              padding: '10px 12px',
              cursor: 'pointer',
              background: sel ? `rgba(${hexToRgb(v.accent)}, 0.07)` : 'var(--surface)',
              transition: 'all 0.15s',
            }}
          >
            <div style={{ fontSize: 18, marginBottom: 4 }}>{v.emoji}</div>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>{v.name}</div>
            <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{v.desc}</div>
          </div>
        )
      })}
    </div>
  )
}

function hexToRgb(color) {
  // Rough fallback for CSS vars — just return a neutral
  if (color.startsWith('var')) return '124,92,252'
  const hex = color.replace('#','')
  if (hex.length === 3) {
    const [r,g,b] = hex.split('').map(c => parseInt(c+c,16))
    return `${r},${g},${b}`
  }
  const r = parseInt(hex.slice(0,2),16)
  const g = parseInt(hex.slice(2,4),16)
  const b = parseInt(hex.slice(4,6),16)
  return `${r},${g},${b}`
}
