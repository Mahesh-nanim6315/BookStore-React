import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { useAuth } from '../../contexts/AuthContext'
import { getDefaultPostLoginPath } from '../../utils/permissions'
import { strongPassword } from '../../utils/passwordValidation'

const validationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .max(255, 'Name may not be greater than 255 characters.')
    .required('Name is required.'),
  email: Yup.string()
    .trim()
    .email('Enter a valid email address.')
    .max(255, 'Email may not be greater than 255 characters.')
    .required('Email is required.'),
  password: strongPassword(),
  password_confirmation: Yup.string()
    .required('Please confirm your password.')
    .oneOf([Yup.ref('password')], 'Passwords do not match.'),
})

const AuthRegister = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { register, isAuthenticated, loading: authLoading, user } = useAuth()

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(getDefaultPostLoginPath(user), { replace: true })
    }
  }, [authLoading, isAuthenticated, navigate, user])

  return (
    <div className="page">
      <div className="auth-shell">
        <section className="auth-media">
          <video
            className="auth-video"
            autoPlay
            muted
            loop
            playsInline
            poster="/images/newslide2.jpg"
          >
            <source src="/videos/auth-bg.mp4" type="video/mp4" />
          </video>

          <img className="auth-slide is-active" src="/images/newslide2.jpg" alt="Library books" />
          <img className="auth-slide" src="/images/bookslide1.jpg" alt="Books row" />
          <img className="auth-slide" src="/images/newslide1.jpg" alt="Reading mood" />

          <div className="auth-media-overlay"></div>

          <div className="auth-quote-wrap">
            <p className="auth-quote">Open a book, and you open your mind.</p>
            <span className="auth-quote-author">BookStore</span>
          </div>
        </section>

        <section className="auth-panel">
          <div className="auth-card auth-card--split">
            <h2 className="auth-title">Create Account</h2>

            <Formik
              initialValues={{
                name: '',
                email: '',
                password: '',
                password_confirmation: '',
              }}
              validationSchema={validationSchema}
              onSubmit={async (values, { setErrors, setStatus }) => {
                setLoading(true)
                setStatus(null)

                try {
                  const response = await register({
                    ...values,
                    name: values.name.trim(),
                    email: values.email.trim().toLowerCase(),
                  })

                  if (response.success) {
                    navigate(getDefaultPostLoginPath(response.user), { replace: true })
                    return
                  }

                  if (response.errors?.general) {
                    setStatus(response.errors.general)
                  }

                  setErrors(response.errors || {})
                } finally {
                  setLoading(false)
                }
              }}
            >
              {({
                values,
                errors,
                touched,
                status,
                handleChange,
                handleBlur,
                handleSubmit,
              }) => (
                <form onSubmit={handleSubmit} noValidate>
                  {status && <small className="error">{status}</small>}

                  <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                      id="name"
                      type="text"
                      name="name"
                      value={values.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      autoComplete="name"
                      className={touched.name && errors.name ? 'error' : ''}
                    />
                    {touched.name && errors.name && <small className="error">{errors.name}</small>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      autoComplete="username"
                      className={touched.email && errors.email ? 'error' : ''}
                    />
                    {touched.email && errors.email && <small className="error">{errors.email}</small>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">Password</label>
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

                  <div className="auth-switch">
                    <span>Already have an account?</span>
                    <Link to="/login">Login</Link>
                  </div>

                  <div className="form-actions form-actions--single">
                    <button type="submit" className="btn-primary" disabled={loading}>
                      {loading ? 'Creating Account...' : 'Register'}
                    </button>
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

export default AuthRegister
