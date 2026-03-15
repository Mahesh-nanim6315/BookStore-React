import React from 'react'
import { Link } from 'react-router-dom'

const CheckoutSuccess = () => {
  return (
    <div className="page">
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '100px' }}>
        <div style={{ background: '#fff', padding: '40px', borderRadius: '10px', width: '100%', maxWidth: '500px', textAlign: 'center', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '60px', color: '#22c55e', marginBottom: '10px' }}>✔</div>
          <h2>Order Placed Successfully</h2>
          <p>Your order has been confirmed.</p>

          <div style={{ background: '#f9fafb', padding: '15px', borderRadius: '8px', textAlign: 'left', fontSize: '14px', marginBottom: '20px' }}>
            <div><strong>Order ID:</strong> 12345</div>
            <div><strong>Total Amount:</strong> ₹0</div>
            <div><strong>Payment Status:</strong> Paid</div>
            <div><strong>Order Status:</strong> Processing</div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/products" className="btn-primary">
              Continue Shopping
            </Link>
            <Link to="/orders/1" className="btn-secondary">
              View Order
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutSuccess




