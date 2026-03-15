import React from 'react'
import { Link } from 'react-router-dom'

const CartIndex = () => {
  const items = []

  return (
    <div className="page">
      <div style={{ marginTop: '100px', padding: '30px', maxWidth: '1200px', marginLeft: 'auto', marginRight: 'auto' }}>
        <h2 style={{ marginBottom: '20px' }}>🛒 Your Shopping Cart</h2>

        {items.length > 0 ? (
          <div style={{ display: 'flex', gap: '30px' }}>
            <div style={{ flex: 2, background: '#fff', padding: '20px', borderRadius: '8px' }}>
              {items.map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: '20px', padding: '15px 0', borderBottom: '1px solid #eee' }}>
                  <img src={item.image} width="100" height="130" style={{ objectFit: 'cover' }} alt={item.name} />
                  <div style={{ flex: 1 }}>
                    <h4>{item.name}</h4>
                    <p>Format: {item.format}</p>
                    <p>Price: ₹{item.price}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button style={{ padding: '4px 10px' }}>−</button>
                      <strong>{item.quantity}</strong>
                      <button style={{ padding: '4px 10px' }}>+</button>
                    </div>
                  </div>
                  <div>
                    <strong>₹{item.price * item.quantity}</strong>
                  </div>
                  <button style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
                </div>
              ))}
            </div>

            <div style={{ flex: 1, background: '#f9f9f9', padding: '20px', borderRadius: '8px', height: 'fit-content' }}>
              <h3>Summary</h3>
              <p>Subtotal: ₹0</p>
              <p>Tax (5%): ₹0</p>
              <hr />
              <h3>Total: ₹0</h3>
              <button style={{ width: '100%', padding: '12px', background: '#ddba1d', border: 'none', cursor: 'pointer' }}>
                Proceed to Checkout
              </button>
              <form style={{ marginTop: '15px' }}>
                <input type="text" name="code" placeholder="Enter coupon" style={{ width: '100%', padding: '8px', marginBottom: '8px' }} />
                <button style={{ width: '100%', padding: '8px' }}>Apply Coupon</button>
              </form>
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




