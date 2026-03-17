import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getCart, removeFromCart, updateCartItem, applyCoupon, removeCoupon } from '../../api/cart'

const CartIndex = () => {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [couponCode, setCouponCode] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = async () => {
    try {
      const response = await getCart()
      setCart(response.data)
    } catch (error) {
      console.error('Failed to load cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveItem = async (itemId) => {
    try {
      await removeFromCart(itemId)
      await loadCart()
    } catch (error) {
      console.error('Failed to remove item:', error)
    }
  }

  const handleUpdateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return
    
    setUpdating(true)
    try {
      await updateCartItem(itemId, quantity)
      await loadCart()
    } catch (error) {
      console.error('Failed to update quantity:', error)
    } finally {
      setUpdating(false)
    }
  }

  const handleApplyCoupon = async (e) => {
    e.preventDefault()
    if (!couponCode.trim()) return

    try {
      await applyCoupon(couponCode)
      await loadCart()
      setCouponCode('')
    } catch (error) {
      console.error('Failed to apply coupon:', error)
    }
  }

  const handleRemoveCoupon = async () => {
    try {
      await removeCoupon()
      await loadCart()
    } catch (error) {
      console.error('Failed to remove coupon:', error)
    }
  }

  if (loading) {
    return (
      <div className="page">
        <div style={{ marginTop: '100px', padding: '30px', textAlign: 'center' }}>
          Loading cart...
        </div>
      </div>
    )
  }

  const items = cart?.items || []

  return (
    <div className="page">
      <div style={{ marginTop: '100px', padding: '30px', maxWidth: '1200px', marginLeft: 'auto', marginRight: 'auto' }}>
        <h2 style={{ marginBottom: '20px' }}>🛒 Your Shopping Cart</h2>

        {items.length > 0 ? (
          <div style={{ display: 'flex', gap: '30px' }}>
            <div style={{ flex: 2, background: '#fff', padding: '20px', borderRadius: '8px' }}>
              {items.map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: '20px', padding: '15px 0', borderBottom: '1px solid #eee' }}>
                  <img 
                    src={item.book?.cover_image || '/images/default-book.jpg'} 
                    width="100" 
                    height="130" 
                    style={{ objectFit: 'cover' }} 
                    alt={item.book?.title || 'Book'} 
                  />
                  <div style={{ flex: 1 }}>
                    <h4>{item.book?.title || 'Unknown Book'}</h4>
                    <p>Author: {item.book?.author?.name || 'Unknown'}</p>
                    <p>Format: {item.format || 'Unknown'}</p>
                    <p>Price: ₹{item.price || 0}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button 
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={updating}
                        style={{ padding: '4px 10px' }}
                      >
                        −
                      </button>
                      <strong>{item.quantity}</strong>
                      <button 
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={updating}
                        style={{ padding: '4px 10px' }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div>
                    <strong>₹{(item.price || 0) * item.quantity}</strong>
                  </div>
                  <button 
                    onClick={() => handleRemoveItem(item.id)}
                    style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div style={{ flex: 1, background: '#f9f9f9', padding: '20px', borderRadius: '8px', height: 'fit-content' }}>
              <h3>Summary</h3>
              <p>Subtotal: ₹{cart?.subtotal || 0}</p>
              <p>Tax (5%): ₹{cart?.tax || 0}</p>
              {cart?.discount && (
                <p>Discount: -₹{cart.discount}</p>
              )}
              <hr />
              <h3>Total: ₹{cart?.total || 0}</h3>
              
              <Link to="/checkout">
                <button style={{ width: '100%', padding: '12px', background: '#ddba1d', border: 'none', cursor: 'pointer' }}>
                  Proceed to Checkout
                </button>
              </Link>

              {cart?.coupon ? (
                <div style={{ marginTop: '15px' }}>
                  <p>Coupon applied: {cart.coupon.code}</p>
                  <button onClick={handleRemoveCoupon} style={{ width: '100%', padding: '8px' }}>
                    Remove Coupon
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} style={{ marginTop: '15px' }}>
                  <input 
                    type="text" 
                    name="code" 
                    placeholder="Enter coupon" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    style={{ width: '100%', padding: '8px', marginBottom: '8px' }} 
                  />
                  <button type="submit" style={{ width: '100%', padding: '8px' }}>
                    Apply Coupon
                  </button>
                </form>
              )}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <h3>Your cart is empty 😔</h3>
            <Link to="/products">
              <button style={{ marginTop: '20px', padding: '10px 20px' }}>Continue Shopping</button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default CartIndex




