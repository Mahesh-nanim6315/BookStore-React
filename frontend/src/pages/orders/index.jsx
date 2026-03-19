import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Loader from '../../components/common/Loader'
import { downloadInvoice, getOrders } from '../../api/orders'

const OrdersIndex = () => {
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const response = await getOrders()
        setOrders(response.data?.orders || [])
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load your orders.')
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [])

  const handleDownloadInvoice = async (orderId) => {
    try {
      const response = await downloadInvoice(orderId)
      const pdf = response.data?.pdf
      const filename = response.data?.filename || `invoice-order-${orderId}.pdf`
      if (!pdf) return

      const link = document.createElement('a')
      link.href = `data:application/pdf;base64,${pdf}`
      link.download = filename
      link.click()
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to download invoice.')
    }
  }

  if (loading) {
    return <Loader />
  }

  return (
    <div className="page">
      <div className="orders-page">
        <h2 className="page-title">My Orders</h2>

        {error && <p className="wishlist-message wishlist-message--error">{error}</p>}

        {orders.length > 0 ? (
          <div className="orders-list">
            {orders.map((order) => (
              <div className="order-card" key={order.id}>
                <div className="order-header">
                  <div>
                    <strong>Order #{order.id}</strong>
                    <p className="order-date">
                      {order.created_at ? new Date(order.created_at).toLocaleString() : ''}
                    </p>
                  </div>

                  <span className="order-status">
                    {order.status}
                  </span>
                </div>

                <div className="order-body">
                  <p><strong>Total:</strong> Rs. {order.total_amount}</p>
                  <p><strong>Payment:</strong> {order.payment_status}</p>
                  <p><strong>Method:</strong> {order.payment_method || 'N/A'}</p>
                  <p><strong>Items:</strong> {order.items_count || 0}</p>
                </div>

                <div className="order-footer">
                  <Link to={`/orders/${order.id}`} className="btnes view-btns">
                    View Details
                  </Link>

                  <button type="button" onClick={() => handleDownloadInvoice(order.id)} className="btnes invoice-btn">
                    Download Invoice
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-orders">
            <p>You haven't placed any orders yet.</p>
            <Link to="/products" className="btnes shop-btns">Browse Books</Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrdersIndex
