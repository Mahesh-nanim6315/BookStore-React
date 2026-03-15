import React from 'react'
import { Link } from 'react-router-dom'

const AuthResetPassword = () => {
  return (
    <div className="page">
      <div className="auth-shell">
        <section className="auth-panel">
          <div className="auth-card">
            <h2 className="auth-title">Reset Password</h2>
            <form>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" name="email" required autoComplete="email" />
                <small className="error"></small>
              </div>
              <div className="form-group">
                <label htmlFor="password">New Password</label>
                <input id="password" type="password" name="password" required autoComplete="new-password" />
                <small className="error"></small>
              </div>
              <div className="form-group">
                <label htmlFor="password_confirmation">Confirm Password</label>
                <input id="password_confirmation" type="password" name="password_confirmation" required autoComplete="new-password" />
                <small className="error"></small>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">Reset Password</button>
                <Link to="/login">Back to login</Link>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  )
}

export default AuthResetPassword




