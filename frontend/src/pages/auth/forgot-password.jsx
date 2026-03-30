import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { forgotPassword } from '../../api/auth'
import { normalizeApiErrors } from '../../utils/formErrors'

const validationSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email('Enter a valid email address.')
    .required('Email is required.'),
})

const AuthForgotPassword = () => {
  const [successMessage, setSuccessMessage] = useState('')

  return (
    <div className="page">
      <div className="auth-shell">
        <section className="auth-panel">
          <div className="auth-card">
            <h2 className="auth-title">Forgot Password</h2>
            <p>Enter your email to receive a reset link.</p>

            <Formik
              initialValues={{ email: '' }}
              validationSchema={validationSchema}
              onSubmit={async (values, { setErrors, setStatus, resetForm }) => {
                setSuccessMessage('')
                setStatus(null)

                try {
                  const response = await forgotPassword(values.email.trim())

                  if (response.success) {
                    setSuccessMessage(response.message || 'Password reset link sent to your email.')
                    resetForm()
                    return
                  }

                  setStatus(response.message || 'Unable to send reset link.')
                } catch (error) {
                  const nextErrors = normalizeApiErrors(error, 'Unable to send reset link.')
                  setErrors(nextErrors)
                  setStatus(nextErrors.general || null)
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
                  {successMessage && <p className="wishlist-message">{successMessage}</p>}
                  {status && <p className="wishlist-message wishlist-message--error">{status}</p>}

                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      autoComplete="email"
                      className={touched.email && errors.email ? 'error' : ''}
                    />
                    {touched.email && errors.email && <small className="error">{errors.email}</small>}
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn-primary" disabled={isSubmitting}>
                      {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                    </button>
                    <Link to="/login">Back to login</Link>
                  </div>
                </form>
              )}
            </Formik>
          </div>
        </section>
      </div>
    </div>
  )
}

export default AuthForgotPassword
