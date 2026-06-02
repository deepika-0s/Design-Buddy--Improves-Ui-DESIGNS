import React, { useRef, useState } from 'react'

export default function UploadZone({ images, onChange }) {
  const inputRef = useRef()
  const [drag, setDrag] = useState(false)

  function handleFiles(files) {
    const remaining = 5 - images.length
    const toAdd = Array.from(files)
      .filter(f => f.type.startsWith('image/'))
      .slice(0, remaining)
      .map(file => ({ file, url: URL.createObjectURL(file), id: Math.random().toString(36).slice(2) }))
    onChange([...images, ...toAdd])
  }

  function remove(id) {
    onChange(images.filter(i => i.id !== id))
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current.click()}
        onDragOver={e => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files) }}
        style={{
          border: `1.5px dashed ${drag ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: 'var(--radius)',
          padding: '1.4rem',
          textAlign: 'center',
          cursor: 'pointer',
          background: drag ? 'rgba(124,92,252,0.06)' : 'var(--surface)',
          transition: 'all 0.2s',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={e => { handleFiles(e.target.files); e.target.value = '' }}
        />
        <div style={{ fontSize: 26, marginBottom: 8 }}>🖼</div>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>
          <span style={{ color: 'var(--accent2)', fontWeight: 500 }}>Drop images here</span> or click to browse
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
          PNG, JPG, WebP · up to 5 images
        </div>
      </div>

      {images.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 8,
          marginTop: 10,
        }}>
          {images.map(img => (
            <div key={img.id} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', aspectRatio: '16/10', background: 'var(--surface2)' }}>
              <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button
                onClick={() => remove(img.id)}
                style={{
                  position: 'absolute', top: 4, right: 4,
                  background: 'rgba(0,0,0,0.75)',
                  border: 'none', color: '#fff',
                  width: 20, height: 20, borderRadius: '50%',
                  cursor: 'pointer', fontSize: 11,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
