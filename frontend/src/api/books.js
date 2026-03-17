import axiosClient from './axiosClient'

export const fetchHomeData = async () => {
  const { data } = await axiosClient.get('/home')
  return data
}

export const fetchBooks = async (params = {}) => {
  const { data } = await axiosClient.get('/admin/books', { params })
  return data
}

export const fetchBook = async (id) => {
  const { data } = await axiosClient.get(`/books/${id}`)
  return data
}

export const createBook = async (payload) => {
  const { data } = await axiosClient.post('/admin/books', payload)
  return data
}

export const updateBook = async (id, payload) => {
  const { data } = await axiosClient.put(`/admin/books/${id}`, payload)
  return data
}

export const fetchAuthors = async () => {
  const { data } = await axiosClient.get('/authors')
  return data
}

export const fetchAuthor = async (id) => {
  const { data } = await axiosClient.get(`/authors/${id}`)
  return data
}

export const fetchCategoryBooks = async (slug) => {
  const { data } = await axiosClient.get(`/category/${slug}/books`)
  return data
}

export const fetchEbooks = async () => {
  const { data } = await axiosClient.get('/ebooks')
  return data
}

export const fetchAudiobooks = async () => {
  const { data } = await axiosClient.get('/audiobooks')
  return data
}

export const fetchPaperbacks = async () => {
  const { data } = await axiosClient.get('/paperbacks')
  return data
}

export const fetchProducts = async (params = {}) => {
  const { data } = await axiosClient.get('/products', { params })
  return data
}

export const deleteBook = async (id) => {
  const { data } = await axiosClient.delete(`/admin/books/${id}`)
  return data
}
