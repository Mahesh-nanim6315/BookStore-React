import axiosClient from './axiosClient'

export const getOrders = async (params = {}) => {
  const { data } = await axiosClient.get('/orders', { params })
  return data
}

export const getOrder = async (orderId) => {
  const { data } = await axiosClient.get(`/orders/${orderId}`)
  return data
}

export const createOrder = async (orderData) => {
  const { data } = await axiosClient.post('/orders', orderData)
  return data
}

export const getOrderSuccess = async (orderId) => {
  const { data } = await axiosClient.get(`/orders/${orderId}/success`)
  return data
}

export const downloadInvoice = async (orderId) => {
  const { data } = await axiosClient.get(`/orders/${orderId}/invoice`)
  return data
}
