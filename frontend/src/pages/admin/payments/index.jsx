import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Loader from '../../../components/common/Loader'
import { getAdminPayments } from '../../../api/adminPayments'

const AdminPaymentsIndex = () => {
  const [loading, setLoading] = useState(true)
  const [payments, setPayments] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })

  useEffect(() => {
    const loadPayments = async () => {
      try {
        setLoading(true)
        const response = await getAdminPayments()

        if (response.success) {
          setPayments(response.data.data || [])
          setMeta({
            current_page: response.data.current_page || 1,
            last_page: response.data.last_page || 1,
            total: response.data.total || 0,
          })
        }
      } catch (error) {
        console.error('Failed to load admin payments:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPayments()
  }, [])

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
          <h2>Payment Logs</h2>
          <p className="admin-page-subtitle">Review transaction references, methods, amounts, and payment states.</p>
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="table-custom">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>User</th>
              <th>Payment ID</th>
              <th>Method</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {payments.length > 0 ? (
              payments.map((payment) => (
                <tr key={payment.id}>
                  <td>#{payment.id}</td>
                  <td>{payment.user?.name || 'Guest'}</td>
                  <td>{payment.payment_id || '-'}</td>
                  <td>{payment.payment_method || '-'}</td>
                  <td>{formatCurrency(payment.total_amount)}</td>
                  <td>{payment.payment_status || '-'}</td>
                  <td>{formatDate(payment.created_at)}</td>
                  <td>
                    <Link to={`/dashboard/orders/${payment.id}`} className="view-link">
                      View order
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="empty-data">
                  No payment records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="admin-pagination-note">
        Showing page {meta.current_page} of {meta.last_page} with {meta.total} payment records.
      </div>
    </div>
  )
}

export default AdminPaymentsIndex
