import axios from 'axios'

const assistantClient = axios.create({
  baseURL: import.meta.env.VITE_AGENT_API_BASE_URL || 'http://localhost:8787',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 300000,
})

export const sendAssistantMessage = async (payload) => {
  const response = await assistantClient.post('/api/chat', payload)
  return response.data
}

export const getAssistantHealth = async () => {
  const response = await assistantClient.get('/health')
  return response.data
}
