import axiosClient from './axiosClient'

export const login = async (credentials) => {
  const { data } = await axiosClient.post('/login', {
    ...credentials,
    email: credentials.email?.trim().toLowerCase(),
  })
  return data
}

export const register = async (userData) => {
  const { data } = await axiosClient.post('/register', {
    ...userData,
    email: userData.email?.trim().toLowerCase(),
  })
  return data
}

export const logout = async () => {
  const { data } = await axiosClient.post('/logout')
  return data
}

export const forgotPassword = async (email) => {
  const { data } = await axiosClient.post('/forgot-password', { email: email?.trim().toLowerCase() })
  return data
}

export const resetPassword = async ({ token, email, password, password_confirmation }) => {
  const { data } = await axiosClient.post('/reset-password', {
    token,
    email: email?.trim().toLowerCase(),
    password,
    password_confirmation,
  })
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
