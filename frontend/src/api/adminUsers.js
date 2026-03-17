import axiosClient from './axiosClient'

export const getAdminUsers = async (params = {}) => {
  const { data } = await axiosClient.get('/admin/users', { params })
  return data
}

export const getAdminUser = async (id) => {
  const { data } = await axiosClient.get(`/admin/users/${id}`)
  return data
}

export const getAdminUserCreateMeta = async () => {
  const { data } = await axiosClient.get('/admin/users/create')
  return data
}

export const getAdminUserEditMeta = async (id) => {
  const { data } = await axiosClient.get(`/admin/users/${id}/edit`)
  return data
}

export const createAdminUser = async (payload) => {
  const { data } = await axiosClient.post('/admin/users', payload)
  return data
}

export const updateAdminUser = async (id, payload) => {
  const { data } = await axiosClient.put(`/admin/users/${id}`, payload)
  return data
}

export const deleteAdminUser = async (id) => {
  const { data } = await axiosClient.delete(`/admin/users/${id}`)
  return data
}
