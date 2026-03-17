import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Loader from '../../../components/common/Loader'
import { getAdminOrder } from '../../../api/adminOrders'

const AdminOrdersShow = () => {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState(null)

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true)
        const response = await getAdminOrder(id)
        if (response.success) {
          setOrder(response.data.order)
        }
      } catch (error) {
        console.error('Failed to load admin order:', error)
      } finally {
        setLoading(false)
      }
    }

    loadOrder()
  }, [id])

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(Number(amount || 0))

  if (loading) {
    return <Loader />
  }

  if (!order) {
    return (
      <div className="page">
        <h2>Order not found</h2>
        <Link to="/dashboard/orders" className="view-link">
          Back to orders
        </Link>
      </div>
    )
  }

  const address = order.address
  const items = order.items || []

  return (
    <div className="page">
      <div className="page-header admin-list-header">
        <div>
          <h2>Order Details #{order.id}</h2>
          <p className="admin-page-subtitle">Review customer, shipping, and item-level purchase data.</p>
        </div>

        <Link to="/dashboard/orders" className="view-link">
          Back to orders
        </Link>
      </div>

      <div className="card-section">
        <div className="card-box">
          <h4>Customer Information</h4>
          <p><strong>Name:</strong> {order.user?.name || 'Guest'}</p>
          <p><strong>Email:</strong> {order.user?.email || '-'}</p>
        </div>
      </div>

      <div className="card-section">
        <div className="card-box">
          <h4>Shipping Address</h4>
          {address ? (
            <>
              <p>{address.address_line_1 || '-'}</p>
              <p>{address.address_line_2 || ''}</p>
              <p>{[address.city, address.state].filter(Boolean).join(', ')}</p>
              <p>{address.postal_code || '-'}</p>
            </>
          ) : (
            <p>Digital Order (No Shipping Required)</p>
          )}
        </div>
      </div>

      <div className="card-section">
        <div className="card-box">
          <h4>Order Summary</h4>
          <p><strong>Status:</strong> {order.status || '-'}</p>
          <p><strong>Payment Status:</strong> {order.payment_status || '-'}</p>
          <p><strong>Payment Method:</strong> {order.payment_method || '-'}</p>
          <p><strong>Subtotal:</strong> {formatCurrency(order.subtotal)}</p>
          <p><strong>Tax:</strong> {formatCurrency(order.tax_amount)}</p>
          <p><strong>Discount:</strong> {formatCurrency(order.discount_amount)}</p>
          <p><strong>Total:</strong> {formatCurrency(order.total_amount)}</p>
        </div>
      </div>

      <div className="card-section">
        <div className="card-box">
          <h4>Ordered Items</h4>
          <table className="table-custom">
            <thead>
              <tr>
                <th>Book</th>
                <th>Format</th>
                <th>Quantity</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.book?.name || 'Removed Book'}</td>
                    <td>{item.format || '-'}</td>
                    <td>{item.quantity || 0}</td>
                    <td>{formatCurrency(item.price)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="empty-data">
                    No order items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminOrdersShow
