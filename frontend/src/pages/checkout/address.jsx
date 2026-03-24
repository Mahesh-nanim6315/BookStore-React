import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Loader from '../../components/common/Loader'
import { getCheckout, processCheckout } from '../../api/checkout'

const initialAddress = {
  full_name: '',
  phone: '',
  address_line: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
}

const CheckoutAddress = () => {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [checkout, setCheckout] = useState(null)
  const [formData, setFormData] = useState(initialAddress)
  const navigate = useNavigate()

  useEffect(() => {
    const loadCheckout = async () => {
      try {
        setError('')
        const response = await getCheckout()
        const data = response.data
        setCheckout(data)

        if (!data?.needs_address) {
          navigate('/checkout/payment', {
            replace: true,
            state: {
              checkoutData: data,
              mode: 'digital',
            },
          })
        }
      } catch (err) {
        console.error('Failed to load checkout:', err)
        setError(err?.response?.data?.message || 'Unable to load checkout.')
      } finally {
        setLoading(false)
      }
    }

    loadCheckout()
  }, [navigate])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)

    try {
      setError('')
      const response = await processCheckout(formData)
      const order = response.data?.order

      navigate(`/checkout/payment?order=${order?.id}`, {
        state: {
          checkoutData: checkout,
          orderId: order?.id,
          mode: 'paperback',
        },
      })
    } catch (err) {
      console.error('Failed to process checkout:', err)
      setError(err?.response?.data?.message || 'Could not continue to payment.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <Loader />
  }

  const items = checkout?.cart?.items || []
  const taxRate = checkout?.tax_rate ?? 5
  const paperbackCount = items.filter((item) => item.format === 'paperback').length
  const ebookCount = items.filter((item) => item.format === 'ebook').length
  const audioCount = items.filter((item) => item.format === 'audio').length

  return (
    <div className="page">
      <div className="checkout-container">
        <h2>Checkout</h2>

        {error && <p className="wishlist-message wishlist-message--error">{error}</p>}

        <div className="checkout-grid">
          <div>
            <div className="checkout-card">
              <h3>📦 Delivery Address Required</h3>
              <div className="cart-info">
                <p>Your cart contains <strong>paperback</strong> items that require shipping.</p>
                <p>Please provide your delivery address below.</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label>Phone Number *</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label>Full Address *</label>
                  <textarea
                    name="address_line"
                    placeholder="House/Flat no, Building, Street, Area..."
                    value={formData.address_line}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>City *</label>
                    <input type="text" name="city" value={formData.city} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>State *</label>
                    <input type="text" name="state" value={formData.state} onChange={handleChange} required />
                  </div>
                </div>

                <div className="form-group">
                  <label>Pincode *</label>
                  <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label>Country *</label>
                  <input type="text" name="country" value={formData.country} onChange={handleChange} />
                </div>

                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Continuing...' : 'Continue to Payment'}
                </button>
              </form>
            </div>
          </div>

          <div>
            <div className="checkout-card">
              <h3>Order Summary</h3>

              {items.map((item) => (
                <div className="summary-item" key={item.id}>
                  <div className="item-info">
                    <strong>{item.book?.name || 'Book'}</strong>
                    <div className="item-details">
                      <span className="format-badge">
                        <span className="format-icon">{item.format === 'paperback' ? '📦' : item.format === 'ebook' ? '📖' : '🎧'}</span>
                      </span>
                      <span className="quantity">Qty: {item.quantity}</span>
                      {item.format === 'paperback' && <span className="shipping-badge">Shipping</span>}
                    </div>
                  </div>
                  <div className="item-price">₹{(item.price || 0) * item.quantity}</div>
                </div>
              ))}

              <hr />

              <div className="order-breakdown">
                <div className="breakdown-item">
                  <span>Subtotal:</span>
                  <span>₹{checkout?.subtotal || 0}</span>
                </div>
                <div className="breakdown-item">
                  <span>Tax ({taxRate}%):</span>
                  <span>₹{checkout?.tax || 0}</span>
                </div>
                {!!checkout?.discount && (
                  <div className="breakdown-item discount">
                    <span>Discount:</span>
                    <span>-₹{checkout.discount}</span>
                  </div>
                )}
                <div className="breakdown-item total">
                  <span>Total Amount:</span>
                  <span>₹{checkout?.total || 0}</span>
                </div>
              </div>

              <div className="type-summary">
                <div className="type-item">
                  <span>📦 Paperback (Physical):</span>
                  <span>{paperbackCount} item(s)</span>
                </div>
                <div className="type-item">
                  <span>📖 eBook (Digital):</span>
                  <span>{ebookCount} item(s)</span>
                </div>
                <div className="type-item">
                  <span>🎧 Audiobook (Digital):</span>
                  <span>{audioCount} item(s)</span>
                </div>
              </div>

              <div className="delivery-note">
                <p>📦 <strong>Shipping:</strong> Paperback items will be shipped to your address.</p>
                <p>⚡ <strong>Digital Access:</strong> eBook and audiobook items unlock after payment.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutAddress
