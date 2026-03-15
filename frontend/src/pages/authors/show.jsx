import React from 'react'
import { Link } from 'react-router-dom'

const AuthorsShow = () => {
  return (
    <div className="page">
      <div className="container-show" style={{ marginTop: '120px' }}>
        {/* Author Info */}
        <div className="author-profile">
          <img src="/images/default-avatar.png" alt="Author" />
          <div className="author-info">
            <h1>Author Name</h1>
            <p>Author bio goes here.</p>
          </div>
        </div>

        <hr />

        {/* Author Books */}
        <h2>Books by Author</h2>

        <div className="books-grid">
          <div className="book-card">
            <img src="/images/science-book.webp" alt="Book" />
            <h4>Sample Book</h4>
            <p>₹ 0</p>
            <Link to="/products/1" className="btn-view">
              View Book
            </Link>
          </div>
          <p>No books available for this author.</p>
        </div>

        <Link to="/authors" className="btn-back">
          ← Back to Authors
        </Link>
      </div>
    </div>
  )
}

export default AuthorsShow




