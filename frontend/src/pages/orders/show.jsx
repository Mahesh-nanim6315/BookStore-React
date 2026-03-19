import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Loader from '../../components/common/Loader'
import { downloadInvoice, getOrder } from '../../api/orders'
import { getImageUrl } from '../../utils/imageUtils'

const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString()}`

const formatStatus = (value) => {
  if (!value) return 'Unknown'
  return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

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

  const orderSummary = useMemo(() => {
    if (!order) return []

    return [
      { label: 'Total amount', value: formatCurrency(order.total_amount) },
      { label: 'Payment method', value: formatStatus(order.payment_method || 'not set') },
      { label: 'Payment status', value: formatStatus(order.payment_status) },
      { label: 'Order status', value: formatStatus(order.status) },
    ]
  }, [order])

  if (loading) {
    return <Loader />
  }

  if (!order) {
    return <div className="page"><p>{error || 'Order not found.'}</p></div>
  }

  return (
    <div className="page">
      <div className="order-detail-shell">
        <section className="order-detail-hero">
          <div>
            <p className="orders-eyebrow">Order details</p>
            <h1>Order #{order.id}</h1>
            <p className="orders-subtitle">
              {order.created_at ? `Placed on ${new Date(order.created_at).toLocaleString()}` : 'Order timeline unavailable'}
            </p>
          </div>
          <div className="order-detail-hero__actions">
            <button type="button" onClick={handleDownloadInvoice} className="orders-button orders-button--primary">
              Download invoice
            </button>
            <Link to="/orders" className="orders-button orders-button--ghost">
              Back to orders
            </Link>
          </div>
        </section>

        {error && <p className="wishlist-message wishlist-message--error">{error}</p>}

        <section className="order-detail-layout">
          <div className="order-detail-main">
            <div className="order-detail-card">
              <div className="profile-section-head">
                <div>
                  <p className="orders-eyebrow">Purchased items</p>
                  <h2>Books in this order</h2>
                </div>
              </div>

              <div className="order-item-list">
                {(order.items || []).map((item) => (
                  <div key={item.id} className="order-item-row">
                    <div className="order-item-row__cover">
                      <img src={getImageUrl(item.book?.image)} alt={item.book?.name || 'Book'} />
                    </div>
                    <div className="order-item-row__copy">
                      <strong>{item.book?.name || 'Book'}</strong>
                      <span>{item.format}</span>
                    </div>
                    <div className="order-item-row__meta">
                      <span>Qty {item.quantity}</span>
                      <strong>{formatCurrency((item.price || 0) * (item.quantity || 0))}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="order-detail-side">
            <div className="order-detail-card">
              <div className="profile-section-head">
                <div>
                  <p className="orders-eyebrow">Summary</p>
                  <h2>Status and totals</h2>
                </div>
              </div>

              <div className="order-summary-grid">
                {orderSummary.map((item) => (
                  <div key={item.label} className="order-summary-card">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>

              <div className="order-status-strip">
                <span className={`orders-pill orders-pill--${order.status || 'unknown'}`}>
                  {formatStatus(order.status)}
                </span>
                <span className={`orders-pill orders-pill--payment-${order.payment_status || 'unknown'}`}>
                  {formatStatus(order.payment_status)}
                </span>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </div>
  )
}

export default OrdersShow
