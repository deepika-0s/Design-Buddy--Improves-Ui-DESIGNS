import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export const analyzeDesign = async ({ images, prompt, vibe, sessionId }) => {
  const formData = new FormData()
  formData.append('prompt', prompt || '')
  formData.append('vibe', vibe || 'bold')
  formData.append('session_id', sessionId || '')
  images.forEach(img => formData.append('images', img.file))

  const { data } = await api.post('/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return data
}

export const fetchHistory = async (sessionId) => {
  const params = sessionId ? { session_id: sessionId } : {}
  const { data } = await api.get('/history', { params })
  return data.analyses
}

export const fetchAnalysis = async (id) => {
  const { data } = await api.get(`/history/${id}`)
  return data
}

export const deleteAnalysis = async (id) => {
  await api.delete(`/history/${id}`)
}

export const fetchStats = async () => {
  const { data } = await api.get('/stats')
  return data
}
