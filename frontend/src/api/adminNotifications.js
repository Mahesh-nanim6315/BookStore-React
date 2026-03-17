import axiosClient from './axiosClient'

export const getAdminNotifications = async () => {
  const { data } = await axiosClient.get('/notifications')
  return data
}

export const markAdminNotificationRead = async (id) => {
  const { data } = await axiosClient.post(`/notifications/${id}/read`)
  return data
}
