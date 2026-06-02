import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const S = {
  header: {
    padding: '0 2rem',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid var(--border)',
    position: 'sticky',
    top: 0,
    background: 'rgba(10,10,15,0.9)',
    backdropFilter: 'blur(20px)',
    zIndex: 100,
    flexShrink: 0,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
    fontSize: '1.15rem',
    letterSpacing: '-0.02em',
    color: 'var(--text)',
    textDecoration: 'none',
  },
  logoIcon: {
    width: 32, height: 32,
    background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
    borderRadius: 9,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 15,
  },
  nav: { display: 'flex', alignItems: 'center', gap: '4px' },
  navLink: (active) => ({
    padding: '6px 14px',
    borderRadius: 'var(--radius-sm)',
    fontSize: 13,
    fontWeight: 500,
    textDecoration: 'none',
    color: active ? 'var(--text)' : 'var(--muted)',
    background: active ? 'var(--surface2)' : 'transparent',
    border: active ? '1px solid var(--border)' : '1px solid transparent',
    transition: 'all 0.15s',
  }),
  badge: {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.1em',
    background: 'rgba(124,92,252,0.15)',
    color: 'var(--accent2)',
    border: '1px solid rgba(124,92,252,0.3)',
    padding: '3px 10px',
    borderRadius: 20,
  }
}

export default function Header({ stats }) {
  const loc = useLocation()
  return (
    <header style={S.header}>
      <Link to="/" style={S.logo}>
        <div style={S.logoIcon}>✦</div>
        DesignBuddy
      </Link>

      <nav style={S.nav}>
        <Link to="/" style={S.navLink(loc.pathname === '/')}>Analyze</Link>
        <Link to="/history" style={S.navLink(loc.pathname === '/history')}>History</Link>
        {stats && (
          <span style={{ ...S.badge, marginLeft: 8 }}>
            {stats.totalAnalyses} analyses
          </span>
        )}
      </nav>
    </header>
  )
}
