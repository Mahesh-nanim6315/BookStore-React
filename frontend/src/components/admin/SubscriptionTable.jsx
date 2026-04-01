import React from 'react'
import { Link } from 'react-router-dom'
import { formatSubscriptionDate, subscriptionStatusLabelMap } from './subscriptionUtils'

const SubscriptionTable = ({
  subscriptions,
  submissions,
  onCancel,
  onResume,
  onDelete,
}) => {
  return (
    <div className="admin-table-wrap">
      <table className="table-custom">
        <thead>
          <tr>
            <th>User</th>
            <th>Plan</th>
            <th>Billing</th>
            <th>Status</th>
            <th>Renewal / End</th>
            <th>Stripe</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {subscriptions.length > 0 ? (
            subscriptions.map((subscription) => {
              const pendingAction = submissions[subscription.id]

              return (
                <tr key={subscription.id}>
                  <td data-label="User">
                    <div className="book-title-cell">
                      <div className="author-avatar">
                        {subscription.name?.[0] || 'U'}
                      </div>
                      <div>
                        <strong>{subscription.name}</strong>
                        <div className="book-subline">{subscription.email}</div>
                        <div className="book-subline">Joined {formatSubscriptionDate(subscription.created_at)}</div>
                      </div>
                    </div>
                  </td>
                  <td data-label="Plan">
                    <span className={`subscription-admin-plan-tag subscription-admin-plan-tag--${subscription.plan || 'free'}`}>
                      {subscription.plan || 'free'}
                    </span>
                  </td>
                  <td data-label="Billing">{subscription.billing_cycle || '-'}</td>
                  <td data-label="Status">
                    <div className="subscription-admin-status-cell">
                      <span className={`subscription-admin-status subscription-admin-status--${subscription.subscription_state}`}>
                        {subscriptionStatusLabelMap[subscription.subscription_state] || subscription.subscription_state}
                      </span>
                      <small>{subscription.stripe_status || 'No Stripe subscription'}</small>
                    </div>
                  </td>
                  <td data-label="Renewal / End">
                    <div className="subscription-admin-date-cell">
                      <strong>{formatSubscriptionDate(subscription.plan_expires_at || subscription.subscription_ends_at)}</strong>
                      <small>
                        {subscription.trial_ends_at
                          ? `Trial ends ${formatSubscriptionDate(subscription.trial_ends_at)}`
                          : 'Access window on record'}
                      </small>
                    </div>
                  </td>
                  <td data-label="Stripe">
                    <div className="subscription-admin-stripe-id">
                      {subscription.stripe_subscription_id || '-'}
                    </div>
                  </td>
                  <td data-label="Actions">
                    <div className="book-action-row">
                      <Link
                        to={`/dashboard/users/${subscription.id}`}
                        className="admin-icon-action admin-icon-action--view"
                        aria-label={`View ${subscription.name}`}
                        title="View user"
                      >
                        <img src="/images/view.png" alt="" className="admin-icon-action__icon" />
                      </Link>

                      {subscription.can_cancel && (
                        <button
                          type="button"
                          className="admin-button subscription-admin-inline-btn subscription-admin-inline-btn--danger"
                          onClick={() => onCancel(subscription)}
                          disabled={pendingAction === 'cancel'}
                        >
                          {pendingAction === 'cancel' ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}

                      {subscription.can_resume && (
                        <button
                          type="button"
                          className="admin-button admin-button-success subscription-admin-inline-btn"
                          onClick={() => onResume(subscription)}
                          disabled={pendingAction === 'resume'}
                        >
                          {pendingAction === 'resume' ? 'Resuming...' : 'Resume'}
                        </button>
                      )}

                      {subscription.can_delete && (
                        <button
                          type="button"
                          className="admin-button subscription-admin-inline-btn subscription-admin-inline-btn--delete"
                          onClick={() => onDelete(subscription)}
                          disabled={pendingAction === 'delete'}
                        >
                          {pendingAction === 'delete' ? 'Deleting...' : 'Delete'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })
          ) : (
            <tr>
              <td colSpan="7" className="empty-data">
                No subscriptions matched the current filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default SubscriptionTable
