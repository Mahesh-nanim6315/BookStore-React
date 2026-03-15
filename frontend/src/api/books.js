import axiosClient from './axiosClient'

export const fetchBooks = async (params = {}) => {
  const { data } = await axiosClient.get('/books', { params })
  return data
}

export const fetchBook = async (id) => {
  const { data } = await axiosClient.get(`/books/${id}`)
  return data
}

export const createBook = async (payload) => {
  const { data } = await axiosClient.post('/books', payload)
  return data
}

export const updateBook = async (id, payload) => {
  const { data } = await axiosClient.put(`/books/${id}`, payload)
  return data
}

export const deleteBook = async (id) => {
  const { data } = await axiosClient.delete(`/books/${id}`)
  return data
}
