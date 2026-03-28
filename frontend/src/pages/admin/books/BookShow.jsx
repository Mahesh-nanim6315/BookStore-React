import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Loader from '../../../components/common/Loader'
import { getAdminBook } from '../../../api/adminBooks'

const BookShow = () => {
  const { id } = useParams()
  const [book, setBook] = useState(null)

  useEffect(() => {
    const loadBook = async () => {
      try {
        const response = await getAdminBook(id)
        if (response.success) {
          setBook(response.data.book)
        }
      } catch (error) {
        console.error('Failed to fetch book:', error)
      }
    }

    loadBook()
  }, [id])

  if (!book) {
    return <Loader />
  }

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(Number(amount || 0))

  const formatAvailability = (value) => (value ? 'Available' : 'Not available')

  const formatRows = [
    { label: 'eBook', value: formatAvailability(book.has_ebook) },
    { label: 'Audio', value: formatAvailability(book.has_audio) },
    { label: 'Paperback', value: formatAvailability(book.has_paperback) },
  ]

  const details = [
    { label: 'Language', value: book.language || '-' },
    { label: 'Author', value: book.author?.name || '-' },
    { label: 'Category', value: book.category?.name || '-' },
    { label: 'Genre', value: book.genre?.name || '-' },
    { label: 'Premium access', value: book.is_premium ? 'Yes' : 'No' },
    { label: 'Stock', value: book.has_paperback ? book.stock ?? 0 : 'Digital only' },
  ]

  return (
    <div className="page">
      <section className="book-show-hero">
        <div className="book-show-hero__content">
          <span className="book-show-hero__eyebrow">Catalog detail</span>
          <h2>{book.name}</h2>
          <p className="admin-page-subtitle">
            Review core metadata, format availability, pricing, and inventory from one clean summary view.
          </p>

          <div className="book-show-hero__stats">
            <div className="book-show-stat">
              <span className="book-show-stat__label">Main price</span>
              <strong>{formatCurrency(book.price)}</strong>
            </div>
            <div className="book-show-stat">
              <span className="book-show-stat__label">Book ID</span>
              <strong>#{book.id}</strong>
            </div>
            <div className="book-show-stat">
              <span className="book-show-stat__label">Availability</span>
              <strong>{book.is_premium ? 'Premium' : 'Standard'}</strong>
            </div>
          </div>
        </div>

        <div className="book-show-hero__actions">
          <Link to="/dashboard/books" className="admin-button">
            Back to list
          </Link>
          <Link to={`/dashboard/books/${book.id}/edit`} className="admin-button admin-button-success">
            Edit book
          </Link>
        </div>
      </section>

      <div className="book-show-layout">
        <aside className="book-show-sidebar">
          <div className="book-show-cover book-show-cover--framed">
            {book.image ? <img src={book.image} alt={book.name} /> : <div className="book-cover-placeholder">No image</div>}
          </div>

          <div className="book-show-card book-show-formats">
            <div className="book-show-card__header">
              <h3>Formats</h3>
              <span className="book-show-card__caption">Delivery options</span>
            </div>

            <div className="book-show-format-list">
              {formatRows.map((item) => (
                <div key={item.label} className="book-show-format-pill">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className="book-show-main">
          <div className="book-show-card">
            <div className="book-show-card__header">
              <h3>Description</h3>
              <span className="book-show-card__caption">Reader-facing summary</span>
            </div>
            <p className="book-show-description">{book.description || 'No description available.'}</p>
          </div>

          <div className="book-show-card">
            <div className="book-show-card__header">
              <h3>Book details</h3>
              <span className="book-show-card__caption">Catalog metadata</span>
            </div>

            <div className="book-show-detail-grid">
              {details.map((item) => (
                <div key={item.label} className="book-show-detail-item">
                  <span className="book-show-detail-item__label">{item.label}</span>
                  <strong className="book-show-detail-item__value">{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default BookShow
