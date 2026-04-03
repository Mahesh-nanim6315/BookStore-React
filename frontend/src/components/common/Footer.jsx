import React from 'react'

import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h2>BookAI</h2>
          <p>
            Discover books smarter with AI-powered recommendations,
            semantic search, and personalized reading experiences.
          </p>
          <div className="social-icons">
            <button type="button" className="social-icon-button" aria-label="GitHub">
              <i className="fab fa-github"></i>
            </button>
            <button type="button" className="social-icon-button" aria-label="LinkedIn">
              <i className="fab fa-linkedin"></i>
            </button>
            <button type="button" className="social-icon-button" aria-label="Twitter">
              <i className="fab fa-twitter"></i>
            </button>
          </div>
        </div>

        <div className="footer-links">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/products">Browse Books</Link></li>
            <li><Link to="/categories">Categories</Link></li>
            <li><Link to="/assistant">AI Recommendations</Link></li>
          </ul>
        </div>

        <div className="footer-links">
          <h3>Top Categories</h3>
          <ul>
            <li><Link to="/categories">Programming</Link></li>
            <li><Link to="/categories">AI & ML</Link></li>
            <li><Link to="/categories">Self Development</Link></li>
            <li><Link to="/categories">Business</Link></li>
          </ul>
        </div>

        <div className="footer-newsletter">
          <h3>Subscribe</h3>
          <p>Get AI-curated book updates directly to your inbox.</p>
          <form>
            <input type="email" placeholder="Enter your email" required />
            <button type="button">Subscribe</button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 BookAI. All rights reserved.</p>
        <div className="legal-links">
          <button type="button" className="footer-link-button">Privacy Policy</button>
          <button type="button" className="footer-link-button">Terms</button>
          <button type="button" className="footer-link-button">Contact</button>
        </div>
      </div>
    </footer>
  )
}

export default Footer
