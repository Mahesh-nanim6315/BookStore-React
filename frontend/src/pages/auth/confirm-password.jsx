import React from 'react'

const AuthConfirmPassword = () => {
  return (
    <div className="page">
      <div className="auth-shell">
        <section className="auth-panel">
          <div className="auth-card">
            <h2 className="auth-title">Confirm Password</h2>
            <form>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input id="password" type="password" name="password" required autoComplete="current-password" />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">Confirm</button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  )
}

export default AuthConfirmPassword




