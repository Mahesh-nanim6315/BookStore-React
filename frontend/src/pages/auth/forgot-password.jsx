import React from 'react'
import { Link } from 'react-router-dom'

const AuthForgotPassword = () => {
  return (
    <div className="page">
      <div className="auth-shell">
        <section className="auth-panel">
          <div className="auth-card">
            <h2 className="auth-title">Forgot Password</h2>
            <p>Enter your email to receive a reset link.</p>
            <form>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" name="email" required autoComplete="email" />
                <small className="error"></small>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">Send Reset Link</button>
                <Link to="/login">Back to login</Link>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  )
}

export default AuthForgotPassword




