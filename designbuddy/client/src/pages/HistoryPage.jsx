import React, { useEffect, useState } from 'react'
import { fetchHistory, deleteAnalysis } from '../api'
import { useSession } from '../hooks/useSession'
import AnalysisCard from '../components/AnalysisCard'

const SCORE_COLOR = s => s >= 75 ? '#34d399' : s >= 50 ? '#fbbf24' : '#f87171'

function HistoryItem({ item, onDelete, onExpand, expanded }) {
  const time = new Date(item.created_at).toLocaleString([], {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', overflow: 'hidden', transition: 'border-color 0.15s',
    }}>
      {/* Summary row */}
      <div
        onClick={onExpand}
        style={{
          padding: '14px 18px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 14,
        }}
      >
        {/* Score badge */}
        {item.score != null && (
          <div style={{
            width: 44, height: 44, borderRadius: 10, flexShrink: 0,
            background: 'var(--surface2)', border: `2px solid ${SCORE_COLOR(item.score)}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15,
            color: SCORE_COLOR(item.score),
          }}>{item.score}</div>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 3 }}>
            {item.prompt ? item.prompt.slice(0, 80) + (item.prompt.length > 80 ? '…' : '') : 'No prompt'}
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{
              fontSize: 10, padding: '2px 8px', borderRadius: 20,
              background: 'rgba(124,92,252,0.12)', color: 'var(--accent2)',
              border: '1px solid rgba(124,92,252,0.2)',
            }}>{item.vibe}</span>
            {item.image_count > 0 && (
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>🖼 {item.image_count} image{item.image_count > 1 ? 's' : ''}</span>
            )}
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>{time}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{expanded ? '▲' : '▼'}</span>
          <button
            onClick={e => { e.stopPropagation(); onDelete(item.id) }}
            style={{
              background: 'transparent', border: '1px solid var(--border)',
              color: 'var(--muted)', padding: '4px 10px', borderRadius: 6,
              cursor: 'pointer', fontSize: 11, transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.target.style.borderColor = 'var(--danger)'; e.target.style.color = 'var(--danger)' }}
            onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--muted)' }}
          >Delete</button>
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '16px 18px' }}>
          <AnalysisCard analysis={item} compact />
        </div>
      )}
    </div>
  )
}

export default function HistoryPage() {
  const sessionId = useSession()
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('mine') // 'mine' | 'all'
  const [expanded, setExpanded] = useState(null)

  async function load() {
    setLoading(true)
    try {
      const sid = filter === 'mine' ? sessionId : null
      const data = await fetchHistory(sid)
      setAnalyses(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filter])

  async function handleDelete(id) {
    await deleteAnalysis(id)
    setAnalyses(prev => prev.filter(a => a.id !== id))
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem' }}>
          Analysis History
        </h1>
        <div style={{ display: 'flex', gap: 6 }}>
          {['mine', 'all'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 16px', borderRadius: 8, fontSize: 13,
                fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                border: '1px solid var(--border)',
                background: filter === f ? 'var(--surface2)' : 'transparent',
                color: filter === f ? 'var(--text)' : 'var(--muted)',
              }}
            >{f === 'mine' ? 'My Session' : 'All'}</button>
          ))}
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted)', fontSize: 14 }}>
          Loading...
        </div>
      )}

      {!loading && analyses.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted)' }}>
          <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.4 }}>✦</div>
          <div style={{ fontSize: 14 }}>No analyses yet. Go analyze something!</div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {analyses.map(item => (
          <HistoryItem
            key={item.id}
            item={item}
            onDelete={handleDelete}
            expanded={expanded === item.id}
            onExpand={() => setExpanded(prev => prev === item.id ? null : item.id)}
          />
        ))}
      </div>
    </div>
  )
}
