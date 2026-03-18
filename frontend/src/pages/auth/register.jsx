import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const AuthRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()
  const { register, isAuthenticated, loading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/dashboard')
    }
  }, [authLoading, isAuthenticated, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      const response = await register(formData)
      
      if (response.success) {
        navigate('/dashboard')
      } else {
        setErrors(response.errors || { general: 'Registration failed' })
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

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input 
                  id="name" 
                  type="text" 
                  name="name" 
                  value={formData.name}
                  onChange={handleChange}
                  required 
                  autoComplete="name"
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <small className="error">{errors.name}</small>}
              </div>

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
                  autoComplete="new-password"
                  className={errors.password ? 'error' : ''}
                />
                {errors.password && <small className="error">{errors.password}</small>}
              </div>

              <div className="form-group">
                <label htmlFor="password_confirmation">Confirm Password</label>
                <input
                  id="password_confirmation"
                  type="password"
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  className={errors.password_confirmation ? 'error' : ''}
                />
                {errors.password_confirmation && <small className="error">{errors.password_confirmation}</small>}
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
          </div>
        </section>
      </div>
    </div>
  )
}

export default AuthRegister




