import React from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { resetPassword } from '../../api/auth'
import { normalizeApiErrors } from '../../utils/formErrors'

const validationSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email('Enter a valid email address.')
    .required('Email is required.'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters.')
    .required('Password is required.'),
  password_confirmation: Yup.string()
    .required('Please confirm your password.')
    .oneOf([Yup.ref('password')], 'Passwords do not match.'),
})

const AuthResetPassword = () => {
  const { token: tokenParam } = useParams()
  const [searchParams] = useSearchParams()
  const token = tokenParam || searchParams.get('token') || ''
  const emailFromUrl = searchParams.get('email') || ''

  return (
    <div className="page">
      <div className="auth-shell">
        <section className="auth-panel">
          <div className="auth-card">
            <h2 className="auth-title">Reset Password</h2>

            <Formik
              initialValues={{
                email: emailFromUrl,
                password: '',
                password_confirmation: '',
              }}
              validationSchema={validationSchema}
              onSubmit={async (values, { setErrors, setStatus, resetForm }) => {
                setStatus(null)

                if (!token) {
                  setStatus('This password reset link is invalid or incomplete.')
                  return
                }

                try {
                  const response = await resetPassword({
                    token,
                    email: values.email.trim(),
                    password: values.password,
                    password_confirmation: values.password_confirmation,
                  })

                  if (response.success) {
                    setStatus(response.message || 'Password reset successful. You can now sign in.')
                    resetForm({
                      values: {
                        email: values.email.trim(),
                        password: '',
                        password_confirmation: '',
                      },
                    })
                    return
                  }

                  setStatus(response.message || 'Unable to reset password.')
                } catch (error) {
                  const nextErrors = normalizeApiErrors(error, 'Unable to reset password.')
                  setErrors(nextErrors)
                  setStatus(nextErrors.general || null)
                }
              }}
              enableReinitialize
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
                  {status && <p className={status.toLowerCase().includes('successful') ? 'wishlist-message' : 'wishlist-message wishlist-message--error'}>{status}</p>}

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

                  <div className="form-group">
                    <label htmlFor="password">New Password</label>
                    <input
                      id="password"
                      type="password"
                      name="password"
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      autoComplete="new-password"
                      className={touched.password && errors.password ? 'error' : ''}
                    />
                    {touched.password && errors.password && <small className="error">{errors.password}</small>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="password_confirmation">Confirm Password</label>
                    <input
                      id="password_confirmation"
                      type="password"
                      name="password_confirmation"
                      value={values.password_confirmation}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      autoComplete="new-password"
                      className={touched.password_confirmation && errors.password_confirmation ? 'error' : ''}
                    />
                    {touched.password_confirmation && errors.password_confirmation && <small className="error">{errors.password_confirmation}</small>}
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn-primary" disabled={isSubmitting || !token}>
                      {isSubmitting ? 'Resetting...' : 'Reset Password'}
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

export default AuthResetPassword
