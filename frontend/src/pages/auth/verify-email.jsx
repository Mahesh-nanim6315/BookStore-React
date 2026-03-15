import React from 'react'

const AuthVerifyEmail = () => {
  return (
    <div className="page">
      <div className="auth-shell">
        <section className="auth-panel">
          <div className="auth-card">
            <h2 className="auth-title">Verify Email</h2>
            <p>Please check your inbox and verify your email address.</p>
            <form>
              <div className="form-actions">
                <button type="submit" className="btn-primary">Resend Verification Email</button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  )
}

export default AuthVerifyEmail




