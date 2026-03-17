import axiosClient from './axiosClient'

export const getCart = async () => {
  const { data } = await axiosClient.get('/cart')
  return data
}

export const addToCart = async (bookId, quantity = 1) => {
  const { data } = await axiosClient.post(`/cart/add/${bookId}`, { quantity })
  return data
}

export const removeFromCart = async (itemId) => {
  const { data } = await axiosClient.delete(`/cart/item/${itemId}`)
  return data
}

export const updateCartItem = async (itemId, quantity) => {
  const { data } = await axiosClient.patch(`/cart/item/${itemId}`, { quantity })
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
