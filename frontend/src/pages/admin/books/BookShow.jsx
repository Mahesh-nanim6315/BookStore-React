import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchBook } from '../../../api/books'

const BookShow = () => {
  const { id } = useParams()
  const [book, setBook] = useState(null)

  useEffect(() => {
    const loadBook = async () => {
      try {
        const data = await fetchBook(id)
        setBook(data)
      } catch (error) {
        console.error('Failed to fetch book', error)
      }
    }
    loadBook()
  }, [id])

  if (!book) {
    return <p>Loading...</p>
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>{book.name}</h1>
        <Link to="/admin/books" className="btn-secondary">
          Back to list
        </Link>
      </div>
      <div className="book-details">
        <img src={book.image} alt={book.name} width="220" />
        <div>
          <p><strong>Description:</strong> {book.description}</p>
          <p><strong>Language:</strong> {book.language}</p>
          <p><strong>Author:</strong> {book.author?.name || '—'}</p>
          <p><strong>Category:</strong> {book.category?.name || '—'}</p>
          <p><strong>Genre:</strong> {book.genre?.name || '—'}</p>
          <p><strong>Price:</strong> {book.price}</p>
          <p><strong>Premium:</strong> {book.is_premium ? 'Yes' : 'No'}</p>
        </div>
      </div>
    </div>
  )
}

export default BookShow







