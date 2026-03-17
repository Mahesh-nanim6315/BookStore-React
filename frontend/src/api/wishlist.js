import axiosClient from './axiosClient'

export const getWishlist = async () => {
  const { data } = await axiosClient.get('/wishlist')
  return data
}

export const toggleWishlist = async (bookId) => {
  const { data } = await axiosClient.post('/wishlist/toggle', { book_id: bookId })
  return data
}

export const removeFromWishlist = async (wishlistId) => {
  const { data } = await axiosClient.delete(`/wishlist/${wishlistId}`)
  return data
}
