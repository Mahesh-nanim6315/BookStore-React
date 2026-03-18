import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const AuthLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()
  const { login, isAuthenticated, loading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/dashboard')
    }
  }, [authLoading, isAuthenticated, navigate])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      const response = await login(formData)
      
      if (response.success) {
        navigate('/dashboard')
      } else {
        setErrors(response.errors || { general: 'Login failed' })
      }
    } catch {
      setErrors({ general: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

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

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input 
                  id="email" 
                  type="email" 
                  name="email" 
                  value={formData.email}
                  onChange={handleChange}
                  required 
                  autoComplete="username"
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <small className="error">{errors.email}</small>}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input 
                  id="password" 
                  type="password" 
                  name="password" 
                  value={formData.password}
                  onChange={handleChange}
                  required 
                  autoComplete="current-password"
                  className={errors.password ? 'error' : ''}
                />
                {errors.password && <small className="error">{errors.password}</small>}
              </div>

              <div className="form-remember">
                <input 
                  type="checkbox" 
                  id="remember" 
                  name="remember" 
                  checked={formData.remember}
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
          </div>
        </section>
      </div>
    </div>
  )
}

export default AuthLogin




