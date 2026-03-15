import React from 'react'
import { Link } from 'react-router-dom'

const CheckoutPayment = () => {
  return (
    <div className="page">
      <div className="payment-wrapper">
        <h2>💳 Choose Payment Method</h2>

        <div className="payment-card">
          <form>
            <label className="payment-option">
              <input type="radio" name="payment_method" value="stripe" defaultChecked />
              <span>💳 Credit / Debit Card (Stripe)</span>
            </label>

            <label className="payment-option">
              <input type="radio" name="payment_method" value="paypal" />
              <span>🅿️ PayPal Wallet / Card</span>
            </label>

            <label className="payment-option">
              <input type="radio" name="payment_method" value="cod" />
              <span>🚚 Cash on Delivery</span>
            </label>

            <button type="submit" className="pay-btn">
              Continue to Payment →
            </button>
          </form>
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <Link to="/checkout" style={{ color: '#666' }}>
              ← Back to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPayment




