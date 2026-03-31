import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { useAuth } from '../../contexts/AuthContext'
import { getDefaultPostLoginPath } from '../../utils/permissions'

const validationSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email('Enter a valid email address.')
    .required('Email is required.'),
  password: Yup.string().required('Password is required.'),
})

const AuthLogin = () => {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { login, isAuthenticated, loading: authLoading, user } = useAuth()

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(getDefaultPostLoginPath(user), { replace: true })
    }
  }, [authLoading, isAuthenticated, navigate, user])

  return (
    <div className="page">
      <div className="auth-shell">
        <section className="auth-media">
          <img className="auth-slide is-active" src="/images/newslide1.jpg" alt="Books shelf" />
          <img className="auth-slide" src="/images/newslide2.jpg" alt="Books and coffee" />
          <img className="auth-slide" src="/images/bookslide1.jpg" alt="Reading corner" />
          <div className="auth-media-overlay"></div>

          <div className="auth-quote-wrap">
            <p className="auth-quote">A reader lives a thousand lives before he dies.</p>
            <span className="auth-quote-author">George R.R. Martin</span>
          </div>
        </section>

        <section className="auth-panel">
          <div className="auth-card auth-card--split">
            <h2 className="auth-title">Login</h2>

            <Formik
              initialValues={{
                email: '',
                password: '',
                remember: false,
              }}
              validationSchema={validationSchema}
              onSubmit={async (values, { setErrors, setStatus }) => {
                setLoading(true)
                setStatus(null)

                try {
                  const response = await login({
                    ...values,
                    email: values.email.trim(),
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
                    <div className="password-field">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        autoComplete="current-password"
                        className={touched.password && errors.password ? 'error' : ''}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword((current) => !current)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        aria-pressed={showPassword}
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    {touched.password && errors.password && <small className="error">{errors.password}</small>}
                  </div>

                  <div className="form-remember">
                    <input
                      type="checkbox"
                      id="remember"
                      name="remember"
                      checked={values.remember}
                      onChange={handleChange}
                    />
                    <label htmlFor="remember">Remember me</label>
                  </div>

                  <div className="auth-switch">
                    <span>Don't have an account?</span>
                    <Link to="/register">Register</Link>
                  </div>

                  <div className="form-actions">
                    <Link to="/forgot-password" className="forgot-link">
                      Forgot password?
                    </Link>

                    <button type="submit" className="btn-primary" disabled={loading}>
                      {loading ? 'Logging in...' : 'Login'}
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

export default AuthLogin
