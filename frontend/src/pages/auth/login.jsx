import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'

const AuthLogin = () => {
  useEffect(() => {
    const inputs = document.querySelectorAll('input[type="email"], input[type="password"]')
    inputs.forEach((input) => {
      const onFocus = () => input.parentElement?.classList.add('focused')
      const onBlur = () => input.parentElement?.classList.remove('focused')
      const onInput = () => {
        input.classList.remove('invalid', 'valid')
        if (input.value.trim() === '') return
        if (input.checkValidity()) input.classList.add('valid')
        else input.classList.add('invalid')
      }
      input.addEventListener('focus', onFocus)
      input.addEventListener('blur', onBlur)
      input.addEventListener('input', onInput)
      input._handlers = { onFocus, onBlur, onInput }
    })

    const form = document.querySelector('.auth-card form')
    const submitBtn = form?.querySelector('button[type="submit"]')
    const onSubmit = () => {
      if (submitBtn) {
        submitBtn.classList.add('loading')
        submitBtn.disabled = true
      }
    }
    form?.addEventListener('submit', onSubmit)

    const slides = document.querySelectorAll('.auth-slide')
    let slideIndex = 0
    const slideTimer = setInterval(() => {
      if (!slides.length) return
      slides[slideIndex].classList.remove('is-active')
      slideIndex = (slideIndex + 1) % slides.length
      slides[slideIndex].classList.add('is-active')
    }, 4500)

    const quotes = [
      { text: 'A reader lives a thousand lives before he dies.', author: 'George R.R. Martin' },
      { text: 'Books are a uniquely portable magic.', author: 'Stephen King' },
      { text: 'Today a reader, tomorrow a leader.', author: 'Margaret Fuller' },
    ]

    const quoteText = document.getElementById('authQuoteText')
    const quoteAuthor = document.getElementById('authQuoteAuthor')
    let quoteIndex = 0
    const quoteTimer = setInterval(() => {
      if (!quoteText || !quoteAuthor) return
      quoteIndex = (quoteIndex + 1) % quotes.length
      quoteText.textContent = quotes[quoteIndex].text
      quoteAuthor.textContent = quotes[quoteIndex].author
    }, 5500)

    return () => {
      inputs.forEach((input) => {
        if (input._handlers) {
          input.removeEventListener('focus', input._handlers.onFocus)
          input.removeEventListener('blur', input._handlers.onBlur)
          input.removeEventListener('input', input._handlers.onInput)
        }
      })
      form?.removeEventListener('submit', onSubmit)
      clearInterval(slideTimer)
      clearInterval(quoteTimer)
    }
  }, [])

  return (
    <div className="page">
      <div className="auth-shell">
        <section className="auth-media">
          <img className="auth-slide is-active" src="/images/newslide1.jpg" alt="Books shelf" />
          <img className="auth-slide" src="/images/newslide2.jpg" alt="Books and coffee" />
          <img className="auth-slide" src="/images/bookslide1.jpg" alt="Reading corner" />

          <div className="auth-media-overlay"></div>

          <div className="auth-quote-wrap">
            <p className="auth-quote" id="authQuoteText">A reader lives a thousand lives before he dies.</p>
            <span className="auth-quote-author" id="authQuoteAuthor">George R.R. Martin</span>
          </div>
        </section>

        <section className="auth-panel">
          <div className="auth-card auth-card--split">
            <h2 className="auth-title">Login</h2>

            <form>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" name="email" required autoComplete="username" />
                <small className="error"></small>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input id="password" type="password" name="password" required autoComplete="current-password" />
                <small className="error"></small>
              </div>

              <div className="form-remember">
                <input type="checkbox" id="remember" name="remember" />
                <label htmlFor="remember">Remember me</label>
              </div>

              <div className="auth-switch">
                <span>Don&apos;t have an account?</span>
                <Link to="/register">Register</Link>
              </div>

              <div className="form-actions">
                <Link to="/forgot-password" className="forgot-link">
                  Forgot password?
                </Link>

                <button type="submit" className="btn-primary">
                  Login
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




