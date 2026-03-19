import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Loader from '../../components/common/Loader'
import { getOrderSuccess } from '../../api/orders'
import { getPaypalSuccess, getStripeSuccess } from '../../api/payments'

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [order, setOrder] = useState(null)

  useEffect(() => {
    const loadSuccess = async () => {
      const orderId = searchParams.get('order')
      const provider = searchParams.get('provider')

      if (!orderId) {
        setError('Missing order information.')
        setLoading(false)
        return
      }

      try {
        let response

        if (provider === 'stripe') {
          response = await getStripeSuccess(orderId, {
            session_id: searchParams.get('session_id'),
          })
        } else if (provider === 'paypal') {
          response = await getPaypalSuccess(orderId, {
            token: searchParams.get('token'),
          })
        } else {
          response = await getOrderSuccess(orderId)
        }

        setOrder(response.data?.order || null)
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to confirm your order.')
      } finally {
        setLoading(false)
      }
    }

    loadSuccess()
  }, [searchParams])

  if (loading) {
    return <Loader />
  }

  return (
    <div className="page">
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '100px' }}>
        <div style={{ background: '#fff', padding: '40px', borderRadius: '10px', width: '100%', maxWidth: '500px', textAlign: 'center', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '60px', color: '#22c55e', marginBottom: '10px' }}>Success</div>
          <h2>{error ? 'Order Confirmation Failed' : 'Order Placed Successfully'}</h2>
          <p>{error || 'Your order has been confirmed.'}</p>

          {order && (
            <div style={{ background: '#f9fafb', padding: '15px', borderRadius: '8px', textAlign: 'left', fontSize: '14px', marginBottom: '20px' }}>
              <div><strong>Order ID:</strong> {order.id}</div>
              <div><strong>Total Amount:</strong> Rs. {order.total_amount}</div>
              <div><strong>Payment Status:</strong> {order.payment_status}</div>
              <div><strong>Order Status:</strong> {order.status}</div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/products" className="btn-primary">
              Continue Shopping
            </Link>
            <Link to={order ? `/orders/${order.id}` : '/orders'} className="btn-secondary">
              View Order
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutSuccess
