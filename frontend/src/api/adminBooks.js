import axiosClient from './axiosClient'

export const getAdminBooks = async (params = {}) => {
  const { data } = await axiosClient.get('/admin/books', { params })
  return data
}

export const getAdminBook = async (id) => {
  const { data } = await axiosClient.get(`/admin/books/${id}`)
  return data
}

export const getAdminBookCreateMeta = async () => {
  const { data } = await axiosClient.get('/admin/books/create')
  return data
}

export const getAdminBookEditMeta = async (id) => {
  const { data } = await axiosClient.get(`/admin/books/${id}/edit`)
  return data
}

export const createAdminBook = async (payload) => {
  const { data } = await axiosClient.post('/admin/books', payload)
  return data
}

export const updateAdminBook = async (id, payload) => {
  const { data } = await axiosClient.put(`/admin/books/${id}`, payload)
  return data
}

export const deleteAdminBook = async (id) => {
  const { data } = await axiosClient.delete(`/admin/books/${id}`)
  return data
}
