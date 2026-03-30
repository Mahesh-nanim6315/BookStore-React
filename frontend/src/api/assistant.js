import axios from 'axios'

const assistantClient = axios.create({
  baseURL: import.meta.env.VITE_AGENT_API_BASE_URL || 'http://localhost:8787',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 300000,
  withCredentials: true,
})

assistantClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export const sendAssistantMessage = async (payload) => {
  const token = localStorage.getItem('auth_token')
  const response = await assistantClient.post('/api/chat', {
    ...payload,
    accessToken: payload?.accessToken || token || null,
  })
  return response.data
}

export const getAssistantHealth = async () => {
  const response = await assistantClient.get('/health')
  return response.data
}
