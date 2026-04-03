import React, { useEffect, useState } from 'react'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { useNavigate } from 'react-router-dom'
import Loader from '../../components/common/Loader'
import { getCheckout, processCheckout } from '../../api/checkout'
import { normalizeApiErrors } from '../../utils/formErrors'

const initialAddress = {
  full_name: '',
  phone: '',
  address_line: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
}

const addressValidationSchema = Yup.object({
  full_name: Yup.string()
    .trim()
    .min(2, 'Full name must be at least 2 characters.')
    .max(255, 'Full name may not be greater than 255 characters.')
    .required('Full name is required.'),
  phone: Yup.string()
    .trim()
    .matches(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number.')
    .required('Phone number is required.'),
  address_line: Yup.string()
    .trim()
    .min(8, 'Address must be at least 8 characters.')
    .max(500, 'Address may not be greater than 500 characters.')
    .required('Address is required.'),
  city: Yup.string()
    .trim()
    .matches(/^[A-Za-z\s.'-]{2,100}$/, 'Enter a valid city.')
    .required('City is required.'),
  state: Yup.string()
    .trim()
    .matches(/^[A-Za-z\s.'-]{2,100}$/, 'Enter a valid state.')
    .required('State is required.'),
  pincode: Yup.string()
    .trim()
    .matches(/^[1-9]\d{5}$/, 'Enter a valid 6-digit Indian PIN code.')
    .required('Pincode is required.'),
  country: Yup.string()
    .trim()
    .matches(/^[A-Za-z\s.'-]{2,100}$/, 'Enter a valid country.')
    .required('Country is required.'),
})

const CheckoutAddress = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [checkout, setCheckout] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const loadCheckout = async () => {
      try {
        setError('')
        const response = await getCheckout()
        const data = response.data
        setCheckout(data)

        if (!data?.needs_address) {
          navigate('/checkout/payment', {
            replace: true,
            state: {
              checkoutData: data,
              mode: 'digital',
            },
          })
        }
      } catch (err) {
        console.error('Failed to load checkout:', err)
        setError(err?.response?.data?.message || 'Unable to load checkout.')
      } finally {
        setLoading(false)
      }
    }

    loadCheckout()
  }, [navigate])

  if (loading) {
    return <Loader />
  }

  const items = checkout?.cart?.items || []
  const taxRate = checkout?.tax_rate ?? 5
  const paperbackCount = items.filter((item) => item.format === 'paperback').length
  const ebookCount = items.filter((item) => item.format === 'ebook').length
  const audioCount = items.filter((item) => item.format === 'audio').length
  const getFormatLabel = (format) => {
    if (format === 'paperback') {
      return 'Package'
    }

    if (format === 'ebook') {
      return 'eBook'
    }

    return 'Audio'
  }

  return (
    <div className="page">
      <div className="checkout-container">
        <h2>Checkout</h2>

        {error && <p className="wishlist-message wishlist-message--error">{error}</p>}

        <div className="checkout-grid">
          <div>
            <div className="checkout-card">
              <h3>Delivery Address Required</h3>
              <div className="cart-info">
                <p>Your cart contains <strong>paperback</strong> items that require shipping.</p>
                <p>Please provide your delivery address below.</p>
              </div>

              <Formik
                initialValues={initialAddress}
                validationSchema={addressValidationSchema}
                onSubmit={async (values, { setErrors, setStatus }) => {
                  setError('')
                  setStatus(null)

                  try {
                    const payload = {
                      full_name: values.full_name.trim(),
                      phone: values.phone.trim(),
                      address_line: values.address_line.trim(),
                      city: values.city.trim(),
                      state: values.state.trim(),
                      pincode: values.pincode.trim(),
                      country: values.country.trim(),
                    }

                    const response = await processCheckout(payload)
                    const order = response.data?.order

                    navigate(`/checkout/payment?order=${order?.id}`, {
                      state: {
                        checkoutData: checkout,
                        orderId: order?.id,
                        mode: 'paperback',
                      },
                    })
                  } catch (err) {
                    console.error('Failed to process checkout:', err)
                    const nextErrors = normalizeApiErrors(err, 'Could not continue to payment.')
                    setErrors(nextErrors)
                    setStatus(nextErrors.general || null)
                    setError(nextErrors.general || 'Could not continue to payment.')
                  }
                }}
              >
                {({
                  values,
                  errors,
                  touched,
                  status,
                  isSubmitting,
                  handleChange,
                  handleBlur,
                  handleSubmit,
                }) => (
                  <form onSubmit={handleSubmit} noValidate>
                    {status && <p className="wishlist-message wishlist-message--error">{status}</p>}

                    <div className="form-group">
                      <label htmlFor="full_name">Full Name *</label>
                      <input id="full_name" type="text" name="full_name" value={values.full_name} onChange={handleChange} onBlur={handleBlur} />
                      {touched.full_name && errors.full_name && <small className="error">{errors.full_name}</small>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="phone">Phone Number *</label>
                      <input id="phone" type="tel" name="phone" value={values.phone} onChange={handleChange} onBlur={handleBlur} />
                      {touched.phone && errors.phone && <small className="error">{errors.phone}</small>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="address_line">Full Address *</label>
                      <textarea
                        id="address_line"
                        name="address_line"
                        placeholder="House/Flat no, Building, Street, Area..."
                        value={values.address_line}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      ></textarea>
                      {touched.address_line && errors.address_line && <small className="error">{errors.address_line}</small>}
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="city">City *</label>
                        <input id="city" type="text" name="city" value={values.city} onChange={handleChange} onBlur={handleBlur} />
                        {touched.city && errors.city && <small className="error">{errors.city}</small>}
                      </div>
                      <div className="form-group">
                        <label htmlFor="state">State *</label>
                        <input id="state" type="text" name="state" value={values.state} onChange={handleChange} onBlur={handleBlur} />
                        {touched.state && errors.state && <small className="error">{errors.state}</small>}
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="pincode">Pincode *</label>
                      <input id="pincode" type="text" name="pincode" value={values.pincode} onChange={handleChange} onBlur={handleBlur} />
                      {touched.pincode && errors.pincode && <small className="error">{errors.pincode}</small>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="country">Country *</label>
                      <input id="country" type="text" name="country" value={values.country} onChange={handleChange} onBlur={handleBlur} />
                      {touched.country && errors.country && <small className="error">{errors.country}</small>}
                    </div>

                    <button type="submit" className="btn-primary" disabled={isSubmitting}>
                      {isSubmitting ? 'Continuing...' : 'Continue to Payment'}
                    </button>
                  </form>
                )}
              </Formik>
            </div>
          </div>

          <div>
            <div className="checkout-card">
              <h3>Order Summary</h3>

              {items.map((item) => (
                <div className="summary-item" key={item.id}>
                  <div className="item-info">
                    <strong>{item.book?.name || 'Book'}</strong>
                    <div className="item-details">
                      <span className="format-badge">
                        <span className="format-icon">{getFormatLabel(item.format)}</span>
                      </span>
                      <span className="quantity">Qty: {item.quantity}</span>
                      {item.format === 'paperback' && <span className="shipping-badge">Shipping</span>}
                    </div>
                  </div>
                  <div className="item-price">Rs {(item.price || 0) * item.quantity}</div>
                </div>
              ))}

              <hr />

              <div className="order-breakdown">
                <div className="breakdown-item">
                  <span>Subtotal:</span>
                  <span>Rs {checkout?.subtotal || 0}</span>
                </div>
                <div className="breakdown-item">
                  <span>Tax ({taxRate}%):</span>
                  <span>Rs {checkout?.tax || 0}</span>
                </div>
                {!!checkout?.discount && (
                  <div className="breakdown-item discount">
                    <span>Discount:</span>
                    <span>-Rs {checkout.discount}</span>
                  </div>
                )}
                <div className="breakdown-item total">
                  <span>Total Amount:</span>
                  <span>Rs {checkout?.total || 0}</span>
                </div>
              </div>

              <div className="type-summary">
                <div className="type-item">
                  <span>Paperback (Physical):</span>
                  <span>{paperbackCount} item(s)</span>
                </div>
                <div className="type-item">
                  <span>eBook (Digital):</span>
                  <span>{ebookCount} item(s)</span>
                </div>
                <div className="type-item">
                  <span>Audiobook (Digital):</span>
                  <span>{audioCount} item(s)</span>
                </div>
              </div>

              <div className="delivery-note">
                <p><strong>Shipping:</strong> Paperback items will be shipped to your address.</p>
                <p><strong>Digital Access:</strong> eBook and audiobook items unlock after payment.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutAddress
