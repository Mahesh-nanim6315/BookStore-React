import axiosClient from './axiosClient'

export const CART_UPDATED_EVENT = 'cart:updated'

export const notifyCartUpdated = () => {
  window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT))
}

export const getCart = async () => {
  const { data } = await axiosClient.get('/cart')
  return data
}

export const addToCart = async (bookId, payload) => {
  const { data } = await axiosClient.post(`/cart/add/${bookId}`, payload)
  notifyCartUpdated()
  return data
}

export const removeFromCart = async (itemId) => {
  const { data } = await axiosClient.delete(`/cart/item/${itemId}`)
  notifyCartUpdated()
  return data
}

export const updateCartItem = async (itemId, action) => {
  const { data } = await axiosClient.patch(`/cart/item/${itemId}`, { action })
  notifyCartUpdated()
  return data
}

export const applyCoupon = async (code) => {
  const { data } = await axiosClient.post('/cart/coupon', { code })
  return data
}

export const removeCoupon = async () => {
  const { data } = await axiosClient.delete('/cart/coupon')
  return data
}
