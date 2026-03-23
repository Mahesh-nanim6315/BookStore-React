import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Loader from '../../../components/common/Loader'
import {
  exportAdminOrdersCsv,
  getAdminOrders,
  updateAdminOrderPaymentStatus,
  updateAdminOrderStatus,
} from '../../../api/adminOrders'
import { showToast } from '../../../utils/toast'

const FILTERS = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled']

const AdminOrdersIndex = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })

  const statusFilter = searchParams.get('status') || 'all'

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true)
        const params = statusFilter !== 'all' ? { status: statusFilter } : {}
        const response = await getAdminOrders(params)

        if (response.success) {
          setOrders(response.data.data || [])
          setMeta({
            current_page: response.data.current_page || 1,
            last_page: response.data.last_page || 1,
            total: response.data.total || 0,
          })
        }
      } catch (error) {
        console.error('Failed to load admin orders:', error)
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [statusFilter])

  const handleStatusFilter = (nextStatus) => {
    if (nextStatus === 'all') {
      setSearchParams({})
      return
    }

    setSearchParams({ status: nextStatus })
  }

  const handleOrderStatusChange = async (orderId, status) => {
    try {
      const response = await updateAdminOrderStatus(orderId, status)
      if (response.success) {
        showToast.success(`Order status updated to ${status}!`)
        setOrders((currentOrders) =>
          currentOrders.map((order) => (order.id === orderId ? { ...order, status } : order)),
        )
      } else {
        showToast.error(response.message || 'Failed to update order status')
      }
    } catch (error) {
      console.error('Failed to update order status:', error)
      showToast.error('Failed to update order status. Please try again.')
    }
  }

  const handlePaymentStatusChange = async (orderId, paymentStatus) => {
    try {
      const response = await updateAdminOrderPaymentStatus(orderId, paymentStatus)
      if (response.success) {
        showToast.success(`Payment status updated to ${paymentStatus}!`)
        setOrders((currentOrders) =>
          currentOrders.map((order) =>
            order.id === orderId ? { ...order, payment_status: paymentStatus } : order,
          ),
        )
      } else {
        showToast.error(response.message || 'Failed to update payment status')
      }
    } catch (error) {
      console.error('Failed to update payment status:', error)
      showToast.error('Failed to update payment status. Please try again.')
    }
  }

  const handleExport = async () => {
    try {
      const response = await exportAdminOrdersCsv()

      if (!response.success || !response.data?.csv_content) {
        return
      }

      const csvString = atob(response.data.csv_content)
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = response.data.filename || 'orders.csv'
      link.click()
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('Failed to export orders:', error)
    }
  }

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(Number(amount || 0))

  const formatDate = (value) =>
    value
      ? new Date(value).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : '-'

  if (loading) {
    return <Loader />
  }

  return (
    <div className="page">
      <div className="page-header admin-list-header">
        <div>
          <h2>Orders Management</h2>
          <p className="admin-page-subtitle">Track orders, update statuses, and review recent purchases.</p>
        </div>

        <button type="button" className="admin-button admin-button-success" onClick={handleExport}>
          Export CSV
        </button>
      </div>

      <div className="admin-filter-row">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            className={`admin-filter-chip ${statusFilter === filter ? 'active' : ''}`}
            onClick={() => handleStatusFilter(filter)}
          >
            {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      <div className="admin-table-wrap">
        <table className="table-custom">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.user?.name || 'Guest'}</td>
                  <td>{formatCurrency(order.total_amount)}</td>
                  <td>
                    <select
                      value={order.payment_status || 'pending'}
                      onChange={(event) =>
                        handlePaymentStatusChange(order.id, event.target.value)
                      }
                      className="status-dropdown"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="failed">Failed</option>
                    </select>
                  </td>
                  <td>
                    <select
                      value={order.status || 'pending'}
                      onChange={(event) => handleOrderStatusChange(order.id, event.target.value)}
                      className="status-dropdown"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>{formatDate(order.created_at)}</td>
                  <td>
                    <Link
                      to={`/dashboard/orders/${order.id}`}
                      className="admin-icon-action admin-icon-action--view"
                      aria-label={`View order ${order.id}`}
                      title="View order"
                    >
                      <img src="/images/view.png" alt="" className="admin-icon-action__icon" />
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="empty-data">
                  No orders found for this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="admin-pagination-note">
        Showing page {meta.current_page} of {meta.last_page} with {meta.total} total orders.
      </div>
    </div>
  )
}

export default AdminOrdersIndex
