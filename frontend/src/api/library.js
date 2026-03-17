import axiosClient from './axiosClient'

export const getLibrary = async () => {
  const { data } = await axiosClient.get('/library')
  return data
}

export const addToLibrary = async (bookId) => {
  const { data } = await axiosClient.post(`/library/add/${bookId}`)
  return data
}
