import axiosClient from './axiosClient'

export const getAdminSubscriptions = async (params = {}) => {
  const { data } = await axiosClient.get('/admin/subscriptions', { params })
  return data
}

export const cancelAdminSubscription = async (userId) => {
  const { data } = await axiosClient.post(`/admin/subscriptions/${userId}/cancel`)
  return data
}

export const resumeAdminSubscription = async (userId) => {
  const { data } = await axiosClient.post(`/admin/subscriptions/${userId}/resume`)
  return data
}

export const deleteAdminSubscription = async (userId) => {
  const { data } = await axiosClient.delete(`/admin/subscriptions/${userId}`)
  return data
}
