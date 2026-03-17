import React, { useEffect, useState } from 'react'
import Loader from '../../../components/common/Loader'
import {
  deleteAdminReview,
  getAdminReviews,
  toggleAdminReviewApproval,
} from '../../../api/adminReviews'

const initialFilters = {
  search: '',
  status: '',
}

const truncateComment = (comment) => {
  if (!comment) {
    return 'No comment provided.'
  }

  return comment.length > 120 ? `${comment.slice(0, 120)}...` : comment
}

const ReviewStars = ({ rating }) => {
  const total = Number(rating || 0)
  return <span className="review-stars">{'★'.repeat(total)}{'☆'.repeat(Math.max(0, 5 - total))}</span>
}

const AdminReviewsIndex = () => {
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState([])
  const [filters, setFilters] = useState(initialFilters)
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })

  const loadReviews = async (nextFilters = filters, page = 1) => {
    try {
      setLoading(true)
      const response = await getAdminReviews({ ...nextFilters, page })

      if (response.success) {
        setReviews(response.data.data || [])
        setMeta({
          current_page: response.data.current_page || 1,
          last_page: response.data.last_page || 1,
          total: response.data.total || 0,
        })
      }
    } catch (error) {
      console.error('Failed to load admin reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReviews(initialFilters, 1)
  }, [])

  const handleFilterChange = (event) => {
    const { name, value } = event.target
    setFilters((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    loadReviews(filters, 1)
  }

  const handleReset = () => {
    setFilters(initialFilters)
    loadReviews(initialFilters, 1)
  }

  const handleApproveToggle = async (reviewId) => {
    try {
      const response = await toggleAdminReviewApproval(reviewId)

      if (response.success) {
        setReviews((current) =>
          current.map((review) =>
            review.id === reviewId ? response.data.review : review,
          ),
        )
      }
    } catch (error) {
      console.error('Failed to update review approval:', error)
    }
  }

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Delete this review?')) {
      return
    }

    try {
      await deleteAdminReview(reviewId)
      loadReviews(filters, meta.current_page)
    } catch (error) {
      console.error('Failed to delete review:', error)
    }
  }

  if (loading) {
    return <Loader />
  }

  return (
    <div className="page">
      <div className="page-header admin-list-header">
        <div>
          <h2>Reviews Management</h2>
          <p className="admin-page-subtitle">
            Search by user or book, filter by approval state, and moderate feedback without leaving the dashboard.
          </p>
        </div>
      </div>

      <form className="book-filter-panel" onSubmit={handleSubmit}>
        <div className="book-filter-grid review-filter-grid">
          <input
            type="text"
            name="search"
            placeholder="Search by book or user"
            value={filters.search}
            onChange={handleFilterChange}
          />

          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">All statuses</option>
            <option value="0">Pending</option>
            <option value="1">Approved</option>
          </select>
        </div>

        <div className="book-filter-actions">
          <button type="submit" className="admin-button admin-button-success">
            Apply Filters
          </button>
          <button type="button" className="admin-button" onClick={handleReset}>
            Reset
          </button>
        </div>
      </form>

      <div className="admin-table-wrap">
        <table className="table-custom">
          <thead>
            <tr>
              <th>User</th>
              <th>Book</th>
              <th>Rating</th>
              <th>Comment</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <tr key={review.id}>
                  <td>
                    <div className="review-identity">
                      <strong>{review.user?.name || 'Guest'}</strong>
                      <div className="book-subline">{review.user?.email || 'No email'}</div>
                    </div>
                  </td>
                  <td>
                    <div className="review-identity">
                      <strong>{review.book?.name || 'Removed Book'}</strong>
                      <div className="book-subline">Review #{review.id}</div>
                    </div>
                  </td>
                  <td>
                    <div className="review-rating-cell">
                      <ReviewStars rating={review.rating} />
                      <span className="book-subline">{review.rating || 0}/5</span>
                    </div>
                  </td>
                  <td className="review-comment-cell">{truncateComment(review.comment)}</td>
                  <td>
                    <span className={`review-status-badge ${review.is_approved ? 'approved' : 'pending'}`}>
                      {review.is_approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <div className="book-action-row">
                      <button
                        type="button"
                        className="admin-button review-action-button"
                        onClick={() => handleApproveToggle(review.id)}
                      >
                        {review.is_approved ? 'Mark Pending' : 'Approve'}
                      </button>
                      <button
                        type="button"
                        className="admin-button book-delete-button"
                        onClick={() => handleDelete(review.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="empty-data">
                  No reviews found for the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="admin-pagination-note">
        Showing page {meta.current_page} of {meta.last_page} with {meta.total} reviews.
      </div>
    </div>
  )
}

export default AdminReviewsIndex
