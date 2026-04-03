import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  cancelSubscription,
  checkoutSubscription,
  confirmSubscriptionSuccess,
  getPlans,
  resumeSubscription,
} from '../api/subscriptions'
import { showToast } from '../utils/toast'

const normalizeBoolean = (value) => value === true || value === 1 || value === '1'

export const normalizePlanKey = (name = '') => name.toLowerCase().split(' ')[0]

const useSubscriptionManager = ({ basePath = '/plans' } = {}) => {
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
          navigate(basePath, {
            replace: true,
            state: { message: confirm.message || 'Subscription activated successfully.' },
          })
          return
        }

        if (status === 'cancelled') {
          navigate(basePath, {
            replace: true,
            state: { message: 'Subscription checkout was cancelled.' },
          })
          return
        }
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load subscription plans.')
      } finally {
        setLoading(false)
      }
    }

    loadPlans()
  }, [basePath, loadUser, navigate, searchParams])

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
        redirect_path: basePath,
      })

      if (response.data?.checkout_url) {
        globalThis.location.href = response.data.checkout_url
        return
      }

      if (response.data?.redirect) {
        await loadUser()
        navigate(response.data.redirect, {
          state: { message: response.message || 'Subscription updated successfully.' },
        })
      }

      showToast.success(response.message || 'Subscription updated successfully!')
    } catch (err) {
      const nextMessage = err?.response?.data?.message || 'Unable to update subscription.'
      setError(nextMessage)
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
      const nextMessage = err?.response?.data?.message || 'Unable to cancel subscription.'
      setError(nextMessage)
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
      const nextMessage = err?.response?.data?.message || 'Unable to resume subscription.'
      setError(nextMessage)
      showToast.error(err?.response?.data?.message || 'Failed to resume subscription.')
    } finally {
      setSubmitting('')
    }
  }

  return {
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
  }
}

export default useSubscriptionManager
