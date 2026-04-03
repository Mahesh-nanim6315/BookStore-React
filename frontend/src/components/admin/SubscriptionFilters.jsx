import React from 'react'
import PropTypes from 'prop-types'

const SubscriptionFilters = ({ filters, onChange, onSubmit, onReset }) => {
  return (
    <form className="book-filter-panel" onSubmit={onSubmit}>
      <div className="subscription-admin-filter-grid">
        <input
          type="text"
          name="search"
          placeholder="Search by user, email, or Stripe ID"
          value={filters.search}
          onChange={onChange}
        />

        <select name="plan" value={filters.plan} onChange={onChange}>
          <option value="all">All plans</option>
          <option value="free">Free</option>
          <option value="premium">Premium</option>
          <option value="ultimate">Ultimate</option>
        </select>

        <select name="billing_cycle" value={filters.billing_cycle} onChange={onChange}>
          <option value="all">All billing cycles</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
          <option value="none">None</option>
        </select>

        <select name="status" value={filters.status} onChange={onChange}>
          <option value="all">All states</option>
          <option value="active">Active</option>
          <option value="trialing">Trialing</option>
          <option value="grace_period">Grace period</option>
          <option value="expired">Expired</option>
          <option value="cancelled">Cancelled</option>
          <option value="free">Free</option>
        </select>
      </div>

      <div className="book-filter-actions">
        <button type="submit" className="admin-button admin-button-success">
          Apply Filters
        </button>
        <button type="button" className="admin-button" onClick={onReset}>
          Reset
        </button>
      </div>
    </form>
  )
}

SubscriptionFilters.propTypes = {
  filters: PropTypes.shape({
    search: PropTypes.string.isRequired,
    plan: PropTypes.string.isRequired,
    billing_cycle: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
}

export default SubscriptionFilters
