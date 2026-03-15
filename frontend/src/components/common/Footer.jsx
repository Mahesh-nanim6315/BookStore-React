import React from 'react'

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
            <a href="#"><i className="fab fa-github"></i></a>
            <a href="#"><i className="fab fa-linkedin"></i></a>
            <a href="#"><i className="fab fa-twitter"></i></a>
          </div>
        </div>

        <div className="footer-links">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/books">Browse Books</a></li>
            <li><a href="/categories">Categories</a></li>
            <li><a href="/recommendations">AI Recommendations</a></li>
          </ul>
        </div>

        <div className="footer-links">
          <h3>Top Categories</h3>
          <ul>
            <li><a href="#">Programming</a></li>
            <li><a href="#">AI & ML</a></li>
            <li><a href="#">Self Development</a></li>
            <li><a href="#">Business</a></li>
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
          <a href="#">Privacy Policy</a>
          <a href="#">Terms</a>
          <a href="#">Contact</a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
