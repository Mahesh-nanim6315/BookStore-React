import axiosClient from './axiosClient'

export const processPayment = async (orderId, paymentData) => {
  const { data } = await axiosClient.post(`/payments/${orderId}/process`, paymentData)
  return data
}

export const getStripeCheckout = async (orderId) => {
  const { data } = await axiosClient.get(`/payments/stripe/checkout/${orderId}`)
  return data
}

export const getStripeSuccess = async (orderId, params = {}) => {
  const { data } = await axiosClient.get(`/payments/stripe/success/${orderId}`, { params })
  return data
}

export const getStripeCancel = async () => {
  const { data } = await axiosClient.get('/payments/stripe/cancel')
  return data
}

export const getPaypalPay = async (orderId) => {
  const { data } = await axiosClient.get(`/payments/paypal/${orderId}/pay`)
  return data
}

export const getPaypalSuccess = async (orderId, params = {}) => {
  const { data } = await axiosClient.get(`/payments/paypal/${orderId}/success`, { params })
  return data
}
