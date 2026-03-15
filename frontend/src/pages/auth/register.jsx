import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'

const AuthRegister = () => {
  useEffect(() => {
    const slides = document.querySelectorAll('.auth-slide')
    let slideIndex = 0

    const slideTimer = setInterval(() => {
      if (!slides.length) return
      slides[slideIndex].classList.remove('is-active')
      slideIndex = (slideIndex + 1) % slides.length
      slides[slideIndex].classList.add('is-active')
    }, 4500)

    const quotes = [
      { text: 'Open a book, and you open your mind.', author: 'BookStore' },
      { text: 'Read more, imagine more, become more.', author: 'BookStore' },
      { text: 'Every page is a new beginning.', author: 'BookStore' },
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
      clearInterval(slideTimer)
      clearInterval(quoteTimer)
    }
  }, [])

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
            <p className="auth-quote" id="authQuoteText">Open a book, and you open your mind.</p>
            <span className="auth-quote-author" id="authQuoteAuthor">BookStore</span>
          </div>
        </section>

        <section className="auth-panel">
          <div className="auth-card auth-card--split">
            <h2 className="auth-title">Create Account</h2>

            <form>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input id="name" type="text" name="name" required autoComplete="name" />
                <small className="error"></small>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" name="email" required autoComplete="username" />
                <small className="error"></small>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input id="password" type="password" name="password" required autoComplete="new-password" />
                <small className="error"></small>
              </div>

              <div className="form-group">
                <label htmlFor="password_confirmation">Confirm Password</label>
                <input
                  id="password_confirmation"
                  type="password"
                  name="password_confirmation"
                  required
                  autoComplete="new-password"
                />
                <small className="error"></small>
              </div>

              <div className="auth-switch">
                <span>Already have an account?</span>
                <Link to="/login">Login</Link>
              </div>

              <div className="form-actions form-actions--single">
                <button type="submit" className="btn-primary">
                  Register
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




