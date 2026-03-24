import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import Loader from '../../components/common/Loader'
import { useAuth } from '../../contexts/AuthContext'
import {
  cancelSubscription,
  checkoutSubscription,
  confirmSubscriptionSuccess,
  getPlans,
  resumeSubscription,
} from '../../api/subscriptions'
import { showToast } from '../../utils/toast'

const SubscriptionsIndex = () => {
  const { user, loadUser } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState('')
  const [billingCycle, setBillingCycle] = useState('monthly')
  const [plansData, setPlansData] = useState([])
  const [subscriptionsEnabled, setSubscriptionsEnabled] = useState(true)
  const [freeTrialDays, setFreeTrialDays] = useState(0)
  const [message, setMessage] = useState(location.state?.message || '')
  const [error, setError] = useState('')

  useEffect(() => {
    setMessage(location.state?.message || '')
  }, [location.state])

  const normalizeBoolean = (value) => value === true || value === 1 || value === '1'

  useEffect(() => {
    const loadPlans = async () => {
      try {
        setError('')
        const response = await getPlans()
        setPlansData(response.data?.plans || [])
        setSubscriptionsEnabled(normalizeBoolean(response.data?.subscriptions_enabled))
        setFreeTrialDays(Number(response.data?.free_trial_days || 0))

        const status = searchParams.get('subscription')
        if (status === 'success') {
          const confirm = await confirmSubscriptionSuccess({
            plan: searchParams.get('plan'),
            billing: searchParams.get('billing'),
            session_id: searchParams.get('session_id'),
          })
          await loadUser()
          navigate('/plans', {
            replace: true,
            state: { message: confirm.message || 'Subscription activated successfully.' },
          })
        } else if (status === 'cancelled') {
          navigate('/plans', {
            replace: true,
            state: { message: 'Subscription checkout was cancelled.' },
          })
        }
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load subscription plans.')
      } finally {
        setLoading(false)
      }
    }

    loadPlans()
  }, [loadUser, navigate, searchParams])

  const currentPlan = useMemo(() => (user?.plan || 'free').toLowerCase(), [user?.plan])
  const isOnGracePeriod = !!user?.subscription_on_grace_period
  const currentBillingCycle = user?.billing_cycle || null

  const handleCheckout = async (planKey) => {
    try {
      setSubmitting(planKey)
      setError('')
      const response = await checkoutSubscription({
        plan: planKey,
        billing_cycle: billingCycle,
      })

      if (response.data?.checkout_url) {
        window.location.href = response.data.checkout_url
        return
      }

      if (response.data?.redirect) {
        await loadUser()
        navigate(response.data.redirect)
      }

      showToast.success(response.message || 'Subscription updated successfully!')
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to update subscription.')
      showToast.error(err?.response?.data?.message || 'Failed to update subscription.')
    } finally {
      setSubmitting('')
    }
  }

  const handleCancel = async () => {
    try {
      setSubmitting('cancel')
      setError('')
      const response = await cancelSubscription()
      showToast.success(response.message || 'Subscription cancelled successfully!')
      await loadUser()
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to cancel subscription.')
      showToast.error(err?.response?.data?.message || 'Failed to cancel subscription.')
    } finally {
      setSubmitting('')
    }
  }

  const handleResume = async () => {
    try {
      setSubmitting('resume')
      setError('')
      const response = await resumeSubscription()
      showToast.success(response.message || 'Subscription resumed successfully!')
      await loadUser()
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to resume subscription.')
      showToast.error(err?.response?.data?.message || 'Failed to resume subscription.')
    } finally {
      setSubmitting('')
    }
  }

  if (loading) {
    return <Loader />
  }

  const normalizePlanKey = (name) => name.toLowerCase().split(' ')[0]

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
