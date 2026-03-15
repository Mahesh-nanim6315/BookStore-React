import axiosClient from './axiosClient'

export const fetchAuthors = async () => {
  const { data } = await axiosClient.get('/authors')
  return data
}

export const fetchCategories = async () => {
  const { data } = await axiosClient.get('/categories')
  return data
}

export const fetchGenres = async () => {
  const { data } = await axiosClient.get('/genres')
  return data
}
