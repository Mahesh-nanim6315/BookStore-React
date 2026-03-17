import axiosClient from './axiosClient'

export const getCategories = async () => {
  const { data } = await axiosClient.get('/categories')
  return data
}

export const getCategoryBooks = async (slug) => {
  const { data } = await axiosClient.get(`/category/${slug}/books`)
  return data
}
