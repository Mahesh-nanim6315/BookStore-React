import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import SubscriptionFilters from '../../../components/admin/SubscriptionFilters'
import SubscriptionStats from '../../../components/admin/SubscriptionStats'
import SubscriptionTable from '../../../components/admin/SubscriptionTable'
import { defaultSubscriptionSummary } from '../../../components/admin/subscriptionUtils'
import Loader from '../../../components/common/Loader'
import {
  cancelAdminSubscription,
  deleteAdminSubscription,
  getAdminSubscriptions,
  resumeAdminSubscription,
} from '../../../api/adminSubscriptions'
import { showToast } from '../../../utils/toast'

const AdminSubscriptionsIndex = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [submissions, setSubmissions] = useState({})
  const [subscriptions, setSubscriptions] = useState([])
  const [summary, setSummary] = useState(defaultSubscriptionSummary)
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const readFiltersFromParams = () => ({
    search: searchParams.get('search') || '',
    plan: searchParams.get('plan') || 'all',
    billing_cycle: searchParams.get('billing_cycle') || 'all',
    status: searchParams.get('status') || 'all',
  })

  const [filters, setFilters] = useState(readFiltersFromParams)

  const currentPage = Number(searchParams.get('page') || 1)

  const syncSearchParams = (nextFilters, page = 1) => {
    const nextParams = new URLSearchParams()

    if (page > 1) {
      nextParams.set('page', String(page))
    }

    Object.entries(nextFilters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        nextParams.set(key, value)
      }
    })

    setSearchParams(nextParams)
  }

  const loadSubscriptions = async (page = currentPage) => {
    try {
      setLoading(true)
      const response = await getAdminSubscriptions({
        ...filters,
        page,
      })

      if (response.success) {
        setSubscriptions(response.data?.data || [])
        setSummary(response.meta?.summary || defaultSubscriptionSummary)
        setMeta({
          current_page: response.data?.current_page || 1,
          last_page: response.data?.last_page || 1,
          total: response.data?.total || 0,
        })
      }
    } catch (error) {
      console.error('Failed to load subscriptions:', error)
      showToast.error('Failed to load subscriptions. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const nextFilters = readFiltersFromParams()
    setFilters(nextFilters)
    loadSubscriptions(currentPage)
  }, [searchParams])

  const handleFilterChange = (event) => {
    const { name, value } = event.target
    setFilters((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    syncSearchParams(filters, 1)
  }

  const handleReset = () => {
    const nextFilters = {
      search: '',
      plan: 'all',
      billing_cycle: 'all',
      status: 'all',
    }
    setFilters(nextFilters)
    syncSearchParams(nextFilters, 1)
  }

  const handlePageChange = (page) => {
    syncSearchParams(filters, page)
  }

  const withSubmission = async (userId, action, handler) => {
    try {
      setSubmissions((current) => ({ ...current, [userId]: action }))
      await handler()
      await loadSubscriptions(meta.current_page)
    } finally {
      setSubmissions((current) => ({ ...current, [userId]: '' }))
    }
  }

  const handleCancel = async (subscription) => {
    if (!window.confirm(`Cancel ${subscription.name}'s subscription at period end?`)) {
      return
    }

    await withSubmission(subscription.id, 'cancel', async () => {
      const response = await cancelAdminSubscription(subscription.id)
      if (response.success) {
        showToast.success(response.message || 'Subscription scheduled for cancellation.')
        return
      }
      showToast.error(response.message || 'Failed to cancel subscription.')
    })
  }

  const handleResume = async (subscription) => {
    await withSubmission(subscription.id, 'resume', async () => {
      const response = await resumeAdminSubscription(subscription.id)
      if (response.success) {
        showToast.success(response.message || 'Subscription resumed successfully.')
        return
      }
      showToast.error(response.message || 'Failed to resume subscription.')
    })
  }

  const handleDelete = async (subscription) => {
    if (!window.confirm(`Delete ${subscription.name}'s subscription record and reset the user to the free plan?`)) {
      return
    }

    await withSubmission(subscription.id, 'delete', async () => {
      const response = await deleteAdminSubscription(subscription.id)
      if (response.success) {
        showToast.success(response.message || 'Subscription deleted successfully.')
        return
      }
      showToast.error(response.message || 'Failed to delete subscription.')
    })
  }

  if (loading) {
    return <Loader />
  }

  return (
    <div className="page">
      <div className="page-header admin-list-header">
        <div>
          <h2>Subscriptions Management</h2>
          <p className="admin-page-subtitle">
            Monitor every customer plan, filter by billing state, and intervene quickly when a membership needs action.
          </p>
        </div>
      </div>

      <SubscriptionStats summary={summary} />

      <SubscriptionFilters
        filters={filters}
        onChange={handleFilterChange}
        onSubmit={handleSubmit}
        onReset={handleReset}
      />

      <SubscriptionTable
        subscriptions={subscriptions}
        submissions={submissions}
        onCancel={handleCancel}
        onResume={handleResume}
        onDelete={handleDelete}
      />

      <div className="admin-pagination-note">
        Showing page {meta.current_page} of {meta.last_page} with {meta.total} subscription records.
      </div>

      <div className="admin-pagination">
        <div className="pagination-controls">
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(meta.current_page - 1)}
            disabled={meta.current_page === 1}
          >
            Previous
          </button>
          <span className="pagination-page-indicator">
            Page {meta.current_page} of {meta.last_page}
          </span>
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(meta.current_page + 1)}
            disabled={meta.current_page === meta.last_page}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminSubscriptionsIndex
