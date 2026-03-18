import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { applyCoupon, getCart, removeCoupon, removeFromCart, updateCartItem } from '../../api/cart'
import Loader from '../../components/common/Loader'
import { getImageUrl } from '../../utils/imageUtils'

const CartIndex = () => {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [couponCode, setCouponCode] = useState('')
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')

  const loadCart = async () => {
    try {
      setError('')
      const response = await getCart()
      setCart(response.data)
    } catch (err) {
      console.error('Failed to load cart:', err)
      setError('Unable to load your cart right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCart()
  }, [])

  const handleRemoveItem = async (itemId) => {
    try {
      await removeFromCart(itemId)
      await loadCart()
    } catch (err) {
      console.error('Failed to remove item:', err)
      setError('Could not remove that item from your cart.')
    }
  }

  const handleUpdateQuantity = async (itemId, action) => {
    setUpdating(true)
    try {
      await updateCartItem(itemId, action)
      await loadCart()
    } catch (err) {
      console.error('Failed to update quantity:', err)
      setError('Could not update cart quantity.')
    } finally {
      setUpdating(false)
    }
  }

  const handleApplyCoupon = async (event) => {
    event.preventDefault()
    if (!couponCode.trim()) return

    try {
      await applyCoupon(couponCode)
      await loadCart()
      setCouponCode('')
    } catch (err) {
      console.error('Failed to apply coupon:', err)
      setError(err?.response?.data?.message || 'Failed to apply coupon.')
    }
  }

  const handleRemoveCoupon = async () => {
    try {
      await removeCoupon()
      await loadCart()
    } catch (err) {
      console.error('Failed to remove coupon:', err)
      setError('Failed to remove coupon.')
    }
  }

  if (loading) {
    return <Loader />
  }

  const items = cart?.cart?.items || []
  const subtotal = cart?.subtotal || 0
  const tax = cart?.tax || 0
  const discount = cart?.discount || 0
  const total = cart?.total || 0

  return (
    <div className="page">
      <div className="cart-page-shell">
        <div className="cart-page-header">
          <h2>Your Shopping Cart</h2>
          <p>Review your formats, adjust quantity, apply coupons, and continue to checkout.</p>
        </div>

        {error && <p className="wishlist-message wishlist-message--error">{error}</p>}

        {items.length > 0 ? (
          <div className="cart-layout">
            <div className="cart-items-panel">
              {items.map((item) => (
                <div key={item.id} className="cart-item-card">
                  <Link to={`/products/${item.book?.id}`} className="cart-item-image-link">
                    <img
                      src={getImageUrl(item.book?.image)}
                      alt={item.book?.name || 'Book'}
                      className="cart-item-image"
                    />
                  </Link>

                  <div className="cart-item-main">
                    <div className="cart-item-copy">
                      <h4>{item.book?.name || 'Unknown Book'}</h4>
                      <p>Author: {item.book?.author?.name || 'Unknown'}</p>
                      <div className="cart-item-tags">
                        <span className="cart-item-tag">{item.format || 'Unknown'}</span>
                        <span className="cart-item-tag">Rs. {item.price || 0}</span>
                      </div>
                    </div>

                    <div className="cart-item-controls">
                      <div className="cart-qty-control">
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.id, 'decrease')}
                          disabled={updating}
                          className="cart-qty-btn"
                        >
                          -
                        </button>
                        <strong>{item.quantity}</strong>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.id, 'increase')}
                          disabled={updating}
                          className="cart-qty-btn"
                        >
                          +
                        </button>
                      </div>

                      <div className="cart-item-side">
                        <strong className="cart-item-total">Rs. {(item.price || 0) * item.quantity}</strong>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="cart-remove-btn"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary-panel">
              <h3>Summary</h3>
              <div className="cart-summary-row">
                <span>Subtotal</span>
                <span>Rs. {subtotal}</span>
              </div>
              <div className="cart-summary-row">
                <span>Tax (5%)</span>
                <span>Rs. {tax}</span>
              </div>
              {discount > 0 && (
                <div className="cart-summary-row cart-summary-row--discount">
                  <span>Discount</span>
                  <span>- Rs. {discount}</span>
                </div>
              )}
              <div className="cart-summary-row cart-summary-row--total">
                <span>Total</span>
                <span>Rs. {total}</span>
              </div>

              <Link to="/checkout" className="cart-checkout-link">
                <button className="cart-checkout-btn">
                  Proceed to Checkout
                </button>
              </Link>

              {cart?.coupon ? (
                <div className="cart-coupon-box coupon-applied">
                  <p>Coupon applied: <strong>{cart.coupon.code}</strong></p>
                  <button onClick={handleRemoveCoupon} className="cart-coupon-btn">
                    Remove Coupon
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="cart-coupon-box">
                  <input
                    type="text"
                    name="code"
                    placeholder="Try SAVE10 or FLAT100"
                    value={couponCode}
                    onChange={(event) => setCouponCode(event.target.value)}
                    className="cart-coupon-input"
                  />
                  <p className="cart-coupon-hint">
                    Available codes: `SAVE10`, `SAVE20`, `SAVE30`, `SAVE50`, `FLAT50`, `FLAT100`, `FLAT200`
                  </p>
                  <button type="submit" className="cart-coupon-btn">
                    Apply Coupon
                  </button>
                </form>
              )}
            </div>
          </div>
        ) : (
          <div className="cart-empty-state">
            <h3>Your cart is empty</h3>
            <p>Pick a format from Top Books or a product details page to get started.</p>
            <Link to="/products">
              <button className="cart-checkout-btn cart-checkout-btn--secondary">Continue Shopping</button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default CartIndex
