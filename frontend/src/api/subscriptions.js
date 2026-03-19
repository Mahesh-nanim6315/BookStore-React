import axiosClient from './axiosClient'

export const getPlans = async () => {
  const { data } = await axiosClient.get('/plans')
  return data
}

export const checkoutSubscription = async (payload) => {
  const { data } = await axiosClient.post('/subscription/checkout', payload)
  return data
}

export const confirmSubscriptionSuccess = async (params = {}) => {
  const { data } = await axiosClient.get('/subscription/success', { params })
  return data
}

export const cancelSubscription = async () => {
  const { data } = await axiosClient.post('/subscription/cancel')
  return data
}

export const resumeSubscription = async () => {
  const { data } = await axiosClient.post('/subscription/resume')
  return data
}
