import axiosClient from './axiosClient'

export const createReview = async (bookId, reviewData) => {
  const { data } = await axiosClient.post(`/reviews/books/${bookId}`, reviewData)
  return data
}

export const editReview = async (reviewId) => {
  const { data } = await axiosClient.get(`/reviews/${reviewId}/edit`)
  return data
}

export const updateReview = async (reviewId, reviewData) => {
  const { data } = await axiosClient.put(`/reviews/${reviewId}`, reviewData)
  return data
}

export const deleteReview = async (reviewId) => {
  const { data } = await axiosClient.delete(`/reviews/${reviewId}`)
  return data
}
