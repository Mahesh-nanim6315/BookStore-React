import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Loader from '../../components/common/Loader'
import { downloadInvoice, getOrders } from '../../api/orders'
import { showToast } from '../../utils/toast'

const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString()}`

const formatStatus = (value) => {
  if (!value) return 'Unknown'
  return value.replaceAll('_', ' ').replaceAll(/\b\w/g, (char) => char.toUpperCase())
}

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
      showToast.info('Generating invoice...')
      const response = await downloadInvoice(orderId)
      const pdf = response.data?.pdf
      const filename = response.data?.filename || `invoice-order-${orderId}.pdf`
      if (!pdf) {
        showToast.error('No invoice data available')
        return
      }

      const link = document.createElement('a')
      link.href = `data:application/pdf;base64,${pdf}`
      link.download = filename
      link.click()
      showToast.success('Invoice downloaded successfully!')
    } catch (err) {
      console.error('Failed to download invoice:', err)
      if (err.response?.status === 500) {
        showToast.error('Server error occurred while generating invoice. Please try again later or contact support.')
      } else if (err.response?.status === 404) {
        showToast.error('Invoice not found for this order.')
      } else if (err.response?.status === 403) {
        showToast.error('You do not have permission to download this invoice.')
      } else {
        showToast.error(err?.response?.data?.message || 'Unable to download invoice. Please try again.')
      }
    }
  }

  const metrics = useMemo(() => {
    const totalSpend = orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0)
    const paidOrders = orders.filter((order) => order.payment_status === 'paid').length

    return [
      { label: 'Total orders', value: orders.length, detail: 'All time purchases' },
      { label: 'Total spend', value: formatCurrency(totalSpend), detail: 'Across all completed checkouts' },
      { label: 'Paid orders', value: paidOrders, detail: 'Settled payments' },
    ]
  }, [orders])

  if (loading) {
    return <Loader />
  }

  return (
    <div className="page">
      <div className="orders-shell">
        <section className="orders-hero">
          <div>
            <p className="orders-eyebrow">Account</p>
            <h1>Order History</h1>
            <p className="orders-subtitle">Track purchases, payment status, invoices, and the latest updates on every order.</p>
          </div>
          <Link to="/products" className="orders-hero-action">
            Continue shopping
          </Link>
        </section>

        {error && <p className="wishlist-message wishlist-message--error">{error}</p>}

        <section className="orders-metrics">
          {metrics.map((metric) => (
            <div key={metric.label} className="orders-metric-card">
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <small>{metric.detail}</small>
            </div>
          ))}
        </section>

        {orders.length > 0 ? (
          <section className="orders-grid">
            {orders.map((order) => (
              <article key={order.id} className="orders-card">
                <div className="orders-card__top">
                  <div>
                    <p className="orders-card__label">Order #{order.id}</p>
                    <h2>{formatCurrency(order.total_amount)}</h2>
                    <span className="orders-card__date">
                      {order.created_at ? new Date(order.created_at).toLocaleString() : ''}
                    </span>
                  </div>
                  <div className="orders-card__status-group">
                    <span className={`orders-pill orders-pill--${order.status || 'unknown'}`}>
                      {formatStatus(order.status)}
                    </span>
                    <span className={`orders-pill orders-pill--payment-${order.payment_status || 'unknown'}`}>
                      {formatStatus(order.payment_status)}
                    </span>
                  </div>
                </div>

                <div className="orders-card__body">
                  <div>
                    <span>Payment method</span>
                    <strong>{formatStatus(order.payment_method || 'not set')}</strong>
                  </div>
                  <div>
                    <span>Items</span>
                    <strong>{order.items_count || 0}</strong>
                  </div>
                </div>

                <div className="orders-card__footer">
                  <Link to={`/orders/${order.id}`} className="orders-button orders-button--primary">
                    View details
                  </Link>
                  <button type="button" onClick={() => handleDownloadInvoice(order.id)} className="orders-button orders-button--ghost">
                    Invoice
                  </button>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="orders-empty">
            <h2>No orders yet</h2>
            <p>Your purchases will appear here after you complete checkout.</p>
            <Link to="/products" className="orders-button orders-button--primary">
              Browse books
            </Link>
          </section>
        )}
      </div>
    </div>
  )
}

export default OrdersIndex
