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

  return (
    <div className="page">
      <div className="page-header admin-list-header">
        <div>
          <h2>{book.name}</h2>
          <p className="admin-page-subtitle">Review format availability, pricing, and catalog metadata.</p>
        </div>

        <Link to="/dashboard/books" className="admin-button">
          Back to list
        </Link>
      </div>

      <div className="book-show-layout">
        <div className="book-show-cover">
          {book.image ? <img src={book.image} alt={book.name} /> : <div className="book-cover-placeholder">No image</div>}
        </div>

        <div className="book-show-card">
          <p><strong>Description:</strong> {book.description}</p>
          <p><strong>Language:</strong> {book.language}</p>
          <p><strong>Author:</strong> {book.author?.name || '-'}</p>
          <p><strong>Category:</strong> {book.category?.name || '-'}</p>
          <p><strong>Genre:</strong> {book.genre?.name || '-'}</p>
          <p><strong>Main Price:</strong> {book.price}</p>
          <p><strong>Stock:</strong> {book.stock ?? 0}</p>
          <p><strong>Premium:</strong> {book.is_premium ? 'Yes' : 'No'}</p>
          <p><strong>eBook:</strong> {book.has_ebook ? 'Available' : 'No'}</p>
          <p><strong>Audio:</strong> {book.has_audio ? 'Available' : 'No'}</p>
          <p><strong>Paperback:</strong> {book.has_paperback ? 'Available' : 'No'}</p>

          <div className="book-action-row">
            <Link
              to={`/dashboard/books/${book.id}/edit`}
              className="admin-icon-action admin-icon-action--edit"
              aria-label={`Edit ${book.name}`}
              title="Edit"
            >
              <img src="/images/edit.png" alt="" className="admin-icon-action__icon" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookShow
