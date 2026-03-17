import axiosClient from './axiosClient'

export const getAdminReviews = async (params = {}) => {
  const { data } = await axiosClient.get('/admin/reviews', { params })
  return data
}

export const toggleAdminReviewApproval = async (id) => {
  const { data } = await axiosClient.patch(`/admin/reviews/${id}/approve`)
  return data
}

export const deleteAdminReview = async (id) => {
  const { data } = await axiosClient.delete(`/admin/reviews/${id}`)
  return data
}
