import React, { useState, useRef, useEffect } from 'react'
import UploadZone from '../components/UploadZone'
import VibeSelector from '../components/VibeSelector'
import AnalysisCard from '../components/AnalysisCard'
import { analyzeDesign } from '../api'
import { useSession } from '../hooks/useSession'

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
      <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', paddingLeft: 4 }}>DesignBuddy AI</div>
      <div style={{ display: 'flex', gap: 5, padding: '14px 18px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '18px 18px 18px 4px' }}>
        {[0, 0.2, 0.4].map((delay, i) => (
          <span key={i} style={{
            width: 7, height: 7, borderRadius: '50%',
            background: 'var(--accent)',
            animation: `bounce 1.2s ${delay}s infinite`,
            display: 'inline-block',
          }} />
        ))}
      </div>
    </div>
  )
}

export default function AnalyzePage() {
  const sessionId = useSession()
  const [images, setImages] = useState([])
  const [vibe, setVibe] = useState('bold')
  const [prompt, setPrompt] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const chatRef = useRef()

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [messages, loading])

  async function handleAnalyze() {
    if (!prompt.trim() && images.length === 0) {
      setError('Please upload a screenshot or describe what you need help with.')
      return
    }
    setError('')

    const userMsg = { type: 'user', prompt, images: images.map(i => i.url), id: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    const imgsCopy = [...images]
    setPrompt('')
    setImages([])

    try {
      const result = await analyzeDesign({ images: imgsCopy, prompt, vibe, sessionId })
      setMessages(prev => [...prev, { type: 'ai', analysis: result, id: Date.now() }])
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || 'Something went wrong.'
      setMessages(prev => [...prev, { type: 'error', text: msg, id: Date.now() }])
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAnalyze()
  }

  const isEmpty = messages.length === 0 && !loading

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>

      {/* ── LEFT PANEL ── */}
      <aside style={{
        width: 340, flexShrink: 0,
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <div style={{
          flex: 1, overflowY: 'auto',
          padding: '1.5rem',
          display: 'flex', flexDirection: 'column', gap: '1.25rem',
        }}>
          {/* Upload */}
          <div>
            <div style={labelStyle}>Upload screenshots</div>
            <UploadZone images={images} onChange={setImages} />
          </div>

          {/* Vibe */}
          <div>
            <div style={labelStyle}>Choose aesthetic vibe</div>
            <VibeSelector value={vibe} onChange={setVibe} />
          </div>

          {/* Prompt */}
          <div>
            <div style={labelStyle}>What do you want improved?</div>
            <div style={{ position: 'relative' }}>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={handleKey}
                maxLength={600}
                rows={4}
                placeholder="e.g. My landing page feels cluttered. The CTA isn't clear. How can I make it more engaging?"
                style={{
                  width: '100%', resize: 'none', outline: 'none',
                  background: 'var(--surface)', border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius)', padding: '13px 16px',
                  color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: 14,
                  lineHeight: 1.65, transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              <span style={{ position: 'absolute', bottom: 10, right: 12, fontSize: 11, color: 'var(--muted)' }}>
                {prompt.length}/600
              </span>
            </div>
          </div>

          {error && (
            <div style={{
              background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)',
              color: 'var(--danger)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: 13,
            }}>{error}</div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading}
            style={{
              width: '100%', padding: 14,
              background: loading ? 'var(--surface2)' : 'linear-gradient(135deg, var(--accent), var(--accent2))',
              border: 'none', borderRadius: 'var(--radius)',
              color: '#fff', fontFamily: 'var(--font-display)',
              fontWeight: 700, fontSize: 14, letterSpacing: '0.03em',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.2s', opacity: loading ? 0.7 : 1,
            }}
          >
            {loading
              ? <><span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span> Analyzing...</>
              : <>✦ Analyze &amp; Improve</>
            }
          </button>

          <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center' }}>
            ⌘ + Enter to analyze
          </div>
        </div>
      </aside>

      {/* ── RIGHT PANEL ── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div ref={chatRef} style={{
          flex: 1, overflowY: 'auto',
          padding: '2rem',
          display: 'flex', flexDirection: 'column', gap: '1.5rem',
        }}>
          {isEmpty && (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              textAlign: 'center', gap: 16, opacity: 0.55,
              minHeight: '60vh',
            }}>
              <div style={{ fontSize: 52 }}>✦</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.5rem' }}>
                Your AI Design Buddy
              </h2>
              <p style={{ fontSize: 14, color: 'var(--muted)', maxWidth: 320, lineHeight: 1.7 }}>
                Upload a screenshot, pick your vibe, describe the problem — and get expert design feedback instantly.
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
                {['Improve my CTA', 'Fix my typography', 'Better color palette', 'Improve mobile layout'].map(s => (
                  <span
                    key={s}
                    onClick={() => setPrompt(s)}
                    style={{
                      fontSize: 12, padding: '6px 14px', borderRadius: 20,
                      border: '1px solid var(--border)', color: 'var(--muted)',
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.color = 'var(--accent2)' }}
                    onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--muted)' }}
                  >{s}</span>
                ))}
              </div>
            </div>
          )}

          {messages.map(msg => {
            if (msg.type === 'user') return (
              <div key={msg.id} className="fade-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                {msg.images?.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {msg.images.map((url, i) => (
                      <img key={i} src={url} alt="" style={{ height: 80, borderRadius: 10, border: '1px solid var(--border)', objectFit: 'cover' }} />
                    ))}
                  </div>
                )}
                {msg.prompt && (
                  <>
                    <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', paddingRight: 4 }}>You</div>
                    <div style={{
                      padding: '14px 18px', borderRadius: '18px 18px 4px 18px',
                      background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                      color: '#fff', fontSize: 14, lineHeight: 1.7, maxWidth: '80%',
                    }}>{msg.prompt}</div>
                  </>
                )}
              </div>
            )

            if (msg.type === 'ai') return (
              <div key={msg.id} className="fade-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', paddingLeft: 4 }}>DesignBuddy AI</div>
                <AnalysisCard analysis={msg.analysis} />
              </div>
            )

            if (msg.type === 'error') return (
              <div key={msg.id} className="fade-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', paddingLeft: 4 }}>Error</div>
                <div style={{
                  padding: '14px 18px', borderRadius: '18px 18px 18px 4px',
                  background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)',
                  color: 'var(--danger)', fontSize: 14, lineHeight: 1.7,
                }}>{msg.text}</div>
              </div>
            )
            return null
          })}

          {loading && <TypingIndicator />}
        </div>
      </main>
    </div>
  )
}

const labelStyle = {
  fontSize: 11, fontWeight: 600,
  letterSpacing: '0.1em', textTransform: 'uppercase',
  color: 'var(--muted)', marginBottom: 8,
}
