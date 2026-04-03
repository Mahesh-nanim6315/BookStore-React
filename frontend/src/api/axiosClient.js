import axios from 'axios'
import { clearAuthSession, getStoredToken } from '../utils/authStorage'

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Add request interceptor to include auth token
axiosClient.interceptors.request.use(
  (config) => {
    const token = getStoredToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add response interceptor to handle auth errors
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 503) {
      const message = error.response?.data?.message || ''
      const isMaintenance = /maintenance/i.test(message)

      if (isMaintenance && globalThis.location.pathname !== '/maintenance') {
        globalThis.location.href = '/maintenance'
      }
    }

    if (error.response?.status === 401) {
      // Token expired or invalid
      const url = error.config?.url || ''
      const hasToken = !!getStoredToken()
      clearAuthSession()
      // Don't force-login redirect on logout attempts or when already logged out
      if (!url.includes('/logout') && hasToken) {
        globalThis.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export default axiosClient
