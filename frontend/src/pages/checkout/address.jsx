import React from 'react'

const CheckoutAddress = () => {
  return (
    <div className="page">
      <div className="checkout-container">
        <h2>Checkout</h2>

        <div className="checkout-grid">
          <div>
            <div className="checkout-card">
              <h3>📦 Delivery Address Required</h3>
              <div className="cart-info">
                <p>Your cart contains <strong>paperback</strong> items that require shipping.</p>
                <p>Please provide your delivery address below.</p>
              </div>

              <form>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input type="text" name="full_name" required />
                </div>

                <div className="form-group">
                  <label>Phone Number *</label>
                  <input type="tel" name="phone" required />
                </div>

                <div className="form-group">
                  <label>Full Address *</label>
                  <textarea name="address_line" placeholder="House/Flat no, Building, Street, Area..." required></textarea>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>City *</label>
                    <input type="text" name="city" required />
                  </div>
                  <div className="form-group">
                    <label>State *</label>
                    <input type="text" name="state" required />
                  </div>
                </div>

                <div className="form-group">
                  <label>Pincode *</label>
                  <input type="text" name="pincode" required />
                </div>

                <div className="form-group">
                  <label>Country *</label>
                  <input type="text" name="country" defaultValue="India" />
                </div>

                <button type="submit" className="btn-primary">
                  Continue to Payment
                </button>
              </form>
            </div>
          </div>

          <div>
            <div className="checkout-card">
              <h3>Order Summary</h3>

              <div className="summary-item">
                <div className="item-info">
                  <strong>Sample Book</strong>
                  <div className="item-details">
                    <span className="format-badge">
                      <span className="format-icon">📦</span>
                    </span>
                    <span className="quantity">Qty: 1</span>
                    <span className="shipping-badge">Shipping</span>
                  </div>
                </div>
                <div className="item-price">₹0</div>
              </div>

              <hr />

              <div className="order-breakdown">
                <div className="breakdown-item">
                  <span>Subtotal:</span>
                  <span>₹0</span>
                </div>
                <div className="breakdown-item">
                  <span>Tax (5%):</span>
                  <span>₹0</span>
                </div>
                <div className="breakdown-item total">
                  <span>Total Amount:</span>
                  <span>₹0</span>
                </div>
              </div>

              <div className="type-summary">
                <div className="type-item">
                  <span>📦 Paperback (Physical):</span>
                  <span>1 item(s)</span>
                </div>
                <div className="type-item">
                  <span>📖 eBook (Digital):</span>
                  <span>0 item(s)</span>
                </div>
                <div className="type-item">
                  <span>🎧 Audiobook (Digital):</span>
                  <span>0 item(s)</span>
                </div>
              </div>

              <div className="delivery-note">
                <p>📦 <strong>Shipping:</strong> Paperback items will be shipped to your address.</p>
                <p>⚡ <strong>Digital Access:</strong> eBook/Audiobook available immediately.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutAddress




