import axiosClient from './axiosClient'

export const login = async (credentials) => {
  const { data } = await axiosClient.post('/login', credentials)
  return data
}

export const register = async (userData) => {
  const { data } = await axiosClient.post('/register', userData)
  return data
}

export const logout = async () => {
  const { data } = await axiosClient.post('/logout')
  return data
}

export const forgotPassword = async (email) => {
  const { data } = await axiosClient.post('/forgot-password', { email })
  return data
}

export const resetPassword = async (token, password) => {
  const { data } = await axiosClient.post('/reset-password', { token, password })
  return data
}

export const getUser = async () => {
  const { data } = await axiosClient.get('/user')
  return data
}

export const getDashboardStats = async () => {
  const { data } = await axiosClient.get('/admin/dashboard/stats')
  return data
}

export const getDashboardInfo = async () => {
  const { data } = await axiosClient.get('/admin/dashboard')
  return data
}
