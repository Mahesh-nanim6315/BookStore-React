import React from 'react'
import Loader from '../../components/common/Loader'
import useSubscriptionManager, { normalizePlanKey } from '../../hooks/useSubscriptionManager'

const SubscriptionsIndex = () => {
  const {
    user,
    loading,
    submitting,
    billingCycle,
    setBillingCycle,
    plansData,
    subscriptionsEnabled,
    freeTrialDays,
    message,
    error,
    currentPlan,
    currentBillingCycle,
    isOnGracePeriod,
    handleCheckout,
    handleCancel,
    handleResume,
  } = useSubscriptionManager({ basePath: '/plans' })

  if (loading) {
    return <Loader />
  }

  return (
    <div className="page">
      <div className="plans-container">
        <div className="plans-header">
          <h1>Choose Your Reading Plan</h1>
          <p>Unlock unlimited stories and immersive audiobooks.</p>
          <p style={{ marginTop: '8px', color: '#475569' }}>
            Current plan: <strong>{currentPlan}</strong>
            {user?.billing_cycle ? ` (${user.billing_cycle})` : ''}
            {freeTrialDays > 0 ? ` | ${freeTrialDays}-day trial available on paid plans` : ''}
          </p>
          {!subscriptionsEnabled && (
            <p style={{ marginTop: '8px', color: '#b45309', background: '#fef3c7', padding: '8px 12px', borderRadius: '8px' }}>
              Subscriptions are currently disabled. Existing subscribers keep access, but new upgrades are paused.
            </p>
          )}
          {message && <p style={{ marginTop: '8px', color: '#166534' }}>{message}</p>}
          {error && <p style={{ marginTop: '8px', color: '#dc2626' }}>{error}</p>}
        </div>

        <div className="billing-toggle">
          <button
            type="button"
            id="monthlyBtn"
            className={billingCycle === 'monthly' ? 'active' : ''}
            onClick={() => setBillingCycle('monthly')}
          >
            Monthly
          </button>
          <button
            type="button"
            id="yearlyBtn"
            className={billingCycle === 'yearly' ? 'active' : ''}
            onClick={() => setBillingCycle('yearly')}
          >
            Yearly
          </button>
        </div>

        <div className="plans-grid">
          {plansData.map((plan) => {
            const planKey = normalizePlanKey(plan.name)
            const isFreePlan = planKey === 'free'
            const isCurrentPlan = isFreePlan
              ? currentPlan === 'free'
              : currentPlan === planKey && currentBillingCycle === billingCycle && !isOnGracePeriod
            const price = billingCycle === 'yearly' ? plan.yearly : plan.monthly
            const disabled = (!subscriptionsEnabled && planKey !== 'free') || submitting === planKey || isCurrentPlan

            return (
              <div key={planKey} className={`plan-card ${isCurrentPlan ? 'current-plan' : ''}`}>
                {plan.popular && <div className="popular-badge">Most Popular</div>}
                <h2>{plan.name}</h2>
                <div className="price">
                  <span className="amount">${price}</span>
                  <small>/{billingCycle === 'yearly' ? 'year' : 'month'}</small>
                </div>
                <ul>
                  {plan.features.map((feature) => (
                    <li key={feature}>&#10004; {feature}</li>
                  ))}
                </ul>
                {isCurrentPlan && <div className="current-plan-badge">Current Plan</div>}
                <button
                  type="button"
                  className="subscribe-btn"
                  disabled={disabled}
                  onClick={() => handleCheckout(planKey)}
                >
                  {submitting === planKey ? 'Please wait...' : isCurrentPlan ? 'Current Plan' : planKey === 'free' ? 'Switch to Free' : `Choose ${plan.name}`}
                </button>
              </div>
            )
          })}
        </div>

        {user?.plan && user.plan !== 'free' && (
          <div className="subscription-section">
            <div className="subscription-section__header">
              <div>
                <p className="subscription-section__eyebrow">Active Membership</p>
                <h3>Subscription Management</h3>
              </div>
              <div className="subscription-section__summary">
                <span className="subscription-summary-pill">{user.plan}</span>
                {user.billing_cycle && <span className="subscription-summary-pill subscription-summary-pill--muted">{user.billing_cycle}</span>}
              </div>
            </div>
            <p className="subscription-section__copy">
              Your current plan is <strong>{user.plan}</strong>
              {user.billing_cycle ? ` on the ${user.billing_cycle} cycle` : ''}.
              {user.plan_expires_at ? ` Access renews or expires on ${new Date(user.plan_expires_at).toLocaleDateString()}.` : ' You can manage changes below.'}
            </p>
            <div className="subscription-section__actions">
              {!isOnGracePeriod ? (
                <button type="button" className="upgrade-btn" onClick={handleCancel} disabled={submitting === 'cancel'}>
                  {submitting === 'cancel' ? 'Cancelling...' : 'Cancel Subscription'}
                </button>
              ) : (
                <button type="button" className="upgrade-btn" onClick={handleResume} disabled={submitting === 'resume'}>
                  {submitting === 'resume' ? 'Resuming...' : 'Resume Subscription'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SubscriptionsIndex
