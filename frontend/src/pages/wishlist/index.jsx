import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Loader from '../../components/common/Loader'
import { getWishlist, removeFromWishlist } from '../../api/wishlist'
import { addToCart } from '../../api/cart'
import { getImageUrl } from '../../utils/imageUtils'

const normalizeWishlistItems = (payload) => {
  const candidates = [
    payload?.data?.wishlist,
    payload?.data,
    payload?.wishlist,
    payload,
  ]

  const items = candidates.find(Array.isArray) || []

  return items.map((item) => ({
    id: item.id,
    book_id: item.book_id || item.book?.id,
    book: item.book || item,
  }))
}

const getCartPayloadForBook = (book) => {
  if (book?.has_paperback) {
    return { format: 'paperback', price: Number(book.paperback_price || book.price || 0) }
  }

  if (book?.has_ebook) {
    return { format: 'ebook', price: Number(book.ebook_price || book.price || 0) }
  }

  if (book?.has_audio) {
    return { format: 'audio', price: Number(book.audio_price || book.price || 0) }
  }

  return { format: 'ebook', price: Number(book?.price || 0) }
}

const WishlistIndex = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cartLoadingId, setCartLoadingId] = useState(null)
  const [removeLoadingId, setRemoveLoadingId] = useState(null)
  const navigate = useNavigate()

  const loadWishlist = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await getWishlist()
      setItems(normalizeWishlistItems(response))
    } catch (err) {
      console.error('Failed to load wishlist:', err)
      setError('Unable to load your wishlist right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWishlist()
  }, [])

  const handleRemove = async (wishlistId) => {
    try {
      setRemoveLoadingId(wishlistId)
      await removeFromWishlist(wishlistId)
      setItems((current) => current.filter((item) => item.id !== wishlistId))
    } catch (err) {
      console.error('Failed to remove wishlist item:', err)
      setError('Could not remove that item from your wishlist.')
    } finally {
      setRemoveLoadingId(null)
    }
  }

  const handleAddToCart = async (bookId) => {
    try {
      setCartLoadingId(bookId)
      const currentItem = items.find((item) => (item.book?.id || item.book_id) === bookId)
      const payload = getCartPayloadForBook(currentItem?.book)
      await addToCart(bookId, payload)
      navigate('/cart')
    } catch (err) {
      console.error('Failed to add wishlist item to cart:', err)
      setError('Could not add that book to your cart.')
    } finally {
      setCartLoadingId(null)
    }
  }

  if (loading) {
    return <Loader />
  }

  return (
    <div className="page">
      <div className="wishlist-container" id="wishlist-section">
        <div className="wishlist-header">
          <h2 className="wishlist-title" id="wishlist-heading">My Wishlist</h2>
          <p className="wishlist-subtitle">Books you heart on Top Books will show up here for quick access later.</p>
        </div>

        {error && <p className="wishlist-message wishlist-message--error">{error}</p>}

        {items.length > 0 ? (
          <div className="wishlist-grid" id="wishlist-grid">
            {items.map((item) => {
              const book = item.book || {}

              return (
                <div className="wishlist-item" key={item.id || item.book_id}>
                  <Link to={`/products/${book.id || item.book_id}`} className="wishlist-image-link">
                    <img
                      src={getImageUrl(book.image)}
                      alt={book.name || 'Wishlist book'}
                      className="wishlist-image"
                    />
                  </Link>

                  <div className="wishlist-body">
                    <h4 className="wishlist-book-title">{book.name || 'Untitled Book'}</h4>
                    {book.author?.name && <p className="wishlist-book-meta">{book.author.name}</p>}
                    <div className="wishlist-actions">
                      <button
                        type="button"
                        className="wishlist-btn add-btn"
                        onClick={() => handleAddToCart(book.id || item.book_id)}
                        disabled={cartLoadingId === (book.id || item.book_id)}
                      >
                        {cartLoadingId === (book.id || item.book_id) ? 'Adding...' : 'Add to Cart'}
                      </button>

                      <button
                        type="button"
                        className="wishlist-btn remove-btn"
                        onClick={() => handleRemove(item.id)}
                        disabled={removeLoadingId === item.id}
                      >
                        {removeLoadingId === item.id ? 'Removing...' : 'Remove'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="wishlist-empty-state">
            <p className="wishlist-empty">Your wishlist is empty.</p>
            <Link to="/products" className="wishlist-btn add-btn">
              Browse Top Books
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default WishlistIndex
