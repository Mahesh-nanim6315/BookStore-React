import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import Loader from '../../components/common/Loader'
import { getCheckout, getPaymentPage, processCheckout, processPayment } from '../../api/checkout'

const CheckoutPayment = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [paymentMethod, setPaymentMethod] = useState('stripe')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [orderData, setOrderData] = useState(null)
  const [checkoutData, setCheckoutData] = useState(location.state?.checkoutData || null)
  const [orderId, setOrderId] = useState(location.state?.orderId || searchParams.get('order') || null)

  useEffect(() => {
    const loadCheckout = async () => {
      try {
        setError('')

        if (orderId) {
          const response = await getPaymentPage(orderId)
          const data = response.data
          setOrderData(data?.order || null)
          return
        }

        const response = await getCheckout()
        const data = response.data
        setCheckoutData(data)

        if (data?.needs_address && !location.state?.orderId) {
          navigate('/checkout', { replace: true })
        }
      } catch (err) {
        console.error('Failed to load payment page:', err)
        setError(err?.response?.data?.message || 'Unable to load payment page.')
      } finally {
        setLoading(false)
      }
    }

    loadCheckout()
  }, [location.state?.orderId, navigate, orderId])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)

    try {
      setError('')
      let nextOrderId = orderId

      if (!nextOrderId) {
        const checkoutResponse = await processCheckout({})
        nextOrderId = checkoutResponse.data?.order?.id
        setOrderId(nextOrderId)
        navigate(`/checkout/payment?order=${nextOrderId}`, {
          replace: true,
          state: {
            mode: 'digital',
          },
        })
        return // Return to wait for redirect
      }

      const paymentResponse = await processPayment(nextOrderId, { payment_method: paymentMethod })
      
      console.log('Payment Response:', paymentResponse)
      
      // Handle API response with checkout_url
      if (paymentResponse.success && paymentResponse.data?.checkout_url) {
        console.log('Redirecting to Stripe checkout:', paymentResponse.data.checkout_url)
        window.location.href = paymentResponse.data.checkout_url
        return
      }

      // Handle API response with redirect (for other payment methods)
      if (paymentResponse.success && paymentResponse.data?.redirect) {
        console.log('Redirecting to:', paymentResponse.data.redirect)
        window.location.href = paymentResponse.data.redirect
        return
      }

      // For COD, redirect to success page
      if (paymentMethod === 'cod') {
        navigate('/checkout/success?order=' + nextOrderId)
        return
      }

      setError('Payment processing failed. Please try again.')
    } catch (err) {
      console.error('Payment Error:', err)
      console.error('Error Response:', err?.response?.data)
      setError(err?.response?.data?.message || 'Could not continue to payment.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <Loader />
  }

  const needsAddress = !!(checkoutData?.needs_address || orderData?.address_id)

  return (
    <div className="page">
      <div className="payment-wrapper">
        <h2>💳 Choose Payment Method</h2>

        {error && <p className="wishlist-message wishlist-message--error">{error}</p>}

        <div className="payment-card">
          <form onSubmit={handleSubmit}>
            <label className="payment-option">
              <input
                type="radio"
                name="payment_method"
                value="stripe"
                checked={paymentMethod === 'stripe'}
                onChange={(event) => setPaymentMethod(event.target.value)}
              />
              <span>💳 Credit / Debit Card (Stripe)</span>
            </label>

            <label className="payment-option">
              <input
                type="radio"
                name="payment_method"
                value="paypal"
                checked={paymentMethod === 'paypal'}
                onChange={(event) => setPaymentMethod(event.target.value)}
              />
              <span>🅿️ PayPal Wallet / Card</span>
            </label>

            <label className="payment-option">
              <input
                type="radio"
                name="payment_method"
                value="cod"
                checked={paymentMethod === 'cod'}
                onChange={(event) => setPaymentMethod(event.target.value)}
                disabled={!needsAddress}
              />
              <span>🚚 Cash on Delivery</span>
            </label>

            {!needsAddress && (
              <p style={{ color: '#64748b', marginTop: '12px' }}>
                Digital-only carts skip the address step and go directly to payment.
              </p>
            )}

            <button type="submit" className="pay-btn" disabled={submitting}>
              {submitting ? 'Processing...' : 'Continue to Payment →'}
            </button>
          </form>
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <Link to={needsAddress ? '/checkout' : '/cart'} style={{ color: '#666' }}>
              ← Back
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPayment
