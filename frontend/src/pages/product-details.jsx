import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchBook } from '../api/books'

const ProductDetails = () => {
  const { id } = useParams()
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchBook(id)
        setBook(data)
      } catch (error) {
        console.error('Failed to load book', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return <div className="page"><p>Loading...</p></div>
  }

  if (!book) {
    return <div className="page"><p>Book not found.</p></div>
  }

  return (
    <div className="page">
      <div className="product-page">
        <div className="product-left">
          <img src={book.image} alt={book.name} className="product-image" />

          <div className="action-box">
            <button type="button" className="btnss btn-primary">
              <span>📘</span>
              <span>Rent Ebook - ${book.price}</span>
            </button>
            <button type="button" className="btnss btn-primary">
              <span>🎧</span>
              <span>Rent Audio - ${book.price}</span>
            </button>
            <button type="button" className="btnss btn-primary">
              <span>📕</span>
              <span>Buy Paperback - ${book.price}</span>
            </button>
            <button className="btnss btn-primary" type="button">
              <span>❤️</span>
              <span>Add to Wishlist</span>
            </button>
            <Link to="/products" className="btn-back">
              <span>←</span>
              <span>Back to Products</span>
            </Link>
          </div>
        </div>

        <div className="product-right">
          <div className="product-header">
            <h1 className="product-title">{book.name}</h1>
            {book.is_premium && (
              <p style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#fef3c7', color: '#b45309', fontWeight: 600, padding: '6px 12px', borderRadius: '999px' }}>
                Premium book - Active subscription required
              </p>
            )}

            <div className="product-meta">
              <div className="meta-item">
                <span className="meta-label">Author</span>
                <span className="meta-value">{book.author?.name || 'Unknown'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Language</span>
                <span className="meta-value">{book.language}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Category</span>
                <span className="meta-value">{book.category?.name || 'N/A'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Genre</span>
                <span className="meta-value">{book.genre?.name || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="format-section">
            <h3 className="format-title">Available Formats</h3>
            <div className="format-grid">
              <div className="format-card">
                <span className="format-icon">📘</span>
                <h4>E-Book</h4>
                <p><strong>Pages:</strong> {book.ebook_pages || '—'}</p>
                <button className="btnss btn-tertiary" type="button">⬇ Download Sample</button>
              </div>
              <div className="format-card">
                <span className="format-icon">🎧</span>
                <h4>Audiobook</h4>
                <p><strong>Duration:</strong> {book.audio_minutes || '—'} minutes</p>
                <audio controls className="audio-player">
                  <source src={book.audio_file || ''} type="audio/mpeg" />
                </audio>
              </div>
              <div className="format-card">
                <span className="format-icon">📕</span>
                <h4>Paperback</h4>
                <p><strong>Pages:</strong> {book.paperback_pages || '—'}</p>
              </div>
            </div>
          </div>

          <div className="description-section">
            <h2 className="description-title">Book Description</h2>
            <div className="description-content">
              <p>{book.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetails



