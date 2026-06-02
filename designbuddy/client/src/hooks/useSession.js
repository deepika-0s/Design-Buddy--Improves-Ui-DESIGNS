import { useState, useEffect } from 'react'

function generateId() {
  return 'sess_' + Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function useSession() {
  const [sessionId, setSessionId] = useState(() => {
    const stored = localStorage.getItem('designbuddy_session')
    if (stored) return stored
    const id = generateId()
    localStorage.setItem('designbuddy_session', id)
    return id
  })

  return sessionId
}
