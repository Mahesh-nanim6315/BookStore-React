import axiosClient from './axiosClient'

export const getAdminAuthors = async (params = {}) => {
  const { data } = await axiosClient.get('/admin/authors', { params })
  return data
}

export const getAdminAuthor = async (id) => {
  const { data } = await axiosClient.get(`/admin/authors/${id}`)
  return data
}

export const getAdminAuthorCreateMeta = async () => {
  const { data } = await axiosClient.get('/admin/authors/create')
  return data
}

export const getAdminAuthorEditMeta = async (id) => {
  const { data } = await axiosClient.get(`/admin/authors/${id}/edit`)
  return data
}

export const createAdminAuthor = async (payload) => {
  const { data } = await axiosClient.post('/admin/authors', payload)
  return data
}

export const updateAdminAuthor = async (id, payload) => {
  const { data } = await axiosClient.put(`/admin/authors/${id}`, payload)
  return data
}

export const deleteAdminAuthor = async (id) => {
  const { data } = await axiosClient.delete(`/admin/authors/${id}`)
  return data
}
