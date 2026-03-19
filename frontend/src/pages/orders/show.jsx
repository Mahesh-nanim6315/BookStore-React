import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Loader from '../../components/common/Loader'
import { downloadInvoice, getOrder } from '../../api/orders'

const OrdersShow = () => {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const response = await getOrder(id)
        setOrder(response.data?.order || null)
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load order details.')
      } finally {
        setLoading(false)
      }
    }

    loadOrder()
  }, [id])

  const handleDownloadInvoice = async () => {
    try {
      const response = await downloadInvoice(id)
      const pdf = response.data?.pdf
      const filename = response.data?.filename || `invoice-order-${id}.pdf`
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

  if (!order) {
    return <div className="page"><p>{error || 'Order not found.'}</p></div>
  }

  return (
    <div className="page">
      <div className="order-container">
        <div className="order-header">
          <h2>Order Details</h2>
          <span className="order-status">{order.status}</span>
        </div>

        {error && <p className="wishlist-message wishlist-message--error">{error}</p>}

        <div className="order-info">
          <p><strong>Order ID:</strong> #{order.id}</p>
          <p><strong>Placed On:</strong> {order.created_at ? new Date(order.created_at).toLocaleString() : ''}</p>
          <p><strong>Total Amount:</strong> Rs. {order.total_amount}</p>
          <p><strong>Payment Method:</strong> {order.payment_method || 'N/A'}</p>
          <p><strong>Payment Status:</strong> {order.payment_status}</p>
        </div>

        <h3 className="section-title">Books Ordered</h3>

        <table className="order-table">
          <thead>
            <tr>
              <th>Book</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {(order.items || []).map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.book?.name || 'Book'}</strong><br />
                  <small>{item.format}</small>
                </td>
                <td>Rs. {item.price}</td>
                <td>{item.quantity}</td>
                <td>Rs. {(item.price || 0) * (item.quantity || 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="order-summary">
          <h3>Total: Rs. {order.total_amount}</h3>
        </div>

        <div className="order-actions">
          <Link to="/products" className="btn btn-secondary">
            Continue Shopping
          </Link>
          <button type="button" onClick={handleDownloadInvoice} className="btn btn-primary">
            Download Invoice
          </button>
        </div>
      </div>
    </div>
  )
}

export default OrdersShow
