import axiosClient from './axiosClient'

export const getCheckout = async () => {
  const { data } = await axiosClient.get('/checkout')
  return data
}

export const processCheckout = async (checkoutData) => {
  const { data } = await axiosClient.post('/checkout/process', checkoutData)
  return data
}

export const getPaymentPage = async (orderId) => {
  const { data } = await axiosClient.get(`/checkout/payment/${orderId}`)
  return data
}

export const processPayment = async (orderId, paymentData) => {
  const { data } = await axiosClient.post(`/checkout/payment/${orderId}`, paymentData)
  return data
}

export const buyNow = async (bookId) => {
  const { data } = await axiosClient.post(`/checkout/buy-now/${bookId}`)
  return data
}

export const getAddressBuyNow = async (orderId) => {
  const { data } = await axiosClient.get(`/checkout/${orderId}/address`)
  return data
}

export const storeBuyNowAddress = async (orderId, addressData) => {
  const { data } = await axiosClient.post(`/checkout/${orderId}/address`, addressData)
  return data
}
