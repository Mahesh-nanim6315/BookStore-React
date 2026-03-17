import axiosClient from './axiosClient'

export const getAdminOrders = async (params = {}) => {
  const { data } = await axiosClient.get('/admin/orders', { params })
  return data
}

export const getAdminOrder = async (orderId) => {
  const { data } = await axiosClient.get(`/admin/orders/${orderId}`)
  return data
}

export const updateAdminOrderStatus = async (orderId, status) => {
  const { data } = await axiosClient.put(`/admin/orders/${orderId}/status`, { status })
  return data
}

export const updateAdminOrderPaymentStatus = async (orderId, payment_status) => {
  const { data } = await axiosClient.put(`/admin/orders/${orderId}/payment-status`, { payment_status })
  return data
}

export const exportAdminOrdersCsv = async () => {
  const { data } = await axiosClient.get('/admin/orders/export/csv')
  return data
}
