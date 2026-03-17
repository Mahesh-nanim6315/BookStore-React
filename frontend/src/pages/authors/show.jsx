import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchAuthor } from '../../api/books'
import { getImageUrl } from '../../utils/imageUtils'

const AuthorsShow = () => {
  const { id } = useParams()
  const [author, setAuthor] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAuthor = async () => {
      try {
        const data = await fetchAuthor(id)
        setAuthor(data.data)
      } catch (error) {
        console.error('Failed to load author', error)
      } finally {
        setLoading(false)
      }
    }
    loadAuthor()
  }, [id])

  if (loading) {
    return <div className="page"><p>Loading...</p></div>
  }

  if (!author) {
    return <div className="page"><p>Author not found.</p></div>
  }

  return (
    <div className="page">
      <div className="container-show" style={{ marginTop: '120px' }}>
        {/* Author Info */}
        <div className="author-profile">
          <img
            src={getImageUrl(author.image)}
            alt={author.name}
            onError={(e) => {
              e.target.src = '/images/default-author.png'
            }}
          />
          <div className="author-info">
            <h1>{author.name}</h1>
            <p>{author.bio || 'No bio available'}</p>
          </div>
        </div>

        <hr />

        {/* Author Books */}
        <h2>📖 Books by {author.name}</h2>

        <div className="books-grid">
          {author.books && author.books.length > 0 ? (
            author.books.map((book) => (
              <div className="book-card" key={book.id}>
                <img 
                  src={getImageUrl(book.image)} 
                  alt={book.name}
                  onError={(e) => {
                    e.target.src = '/images/default-book.png'
                  }}
                />
                <h4>{book.name}</h4>
                <p>₹{book.ebook_price || book.audio_price || book.paperback_price || '0'}</p>
                <Link to={`/products/${book.id}`} className="btn-view">
                  View Book
                </Link>
              </div>
            ))
          ) : (
            <p>No books available for this author.</p>
          )}
        </div>

        <Link to="/authors" className="btn-back">
          ← Back to Authors
        </Link>
      </div>
    </div>
  )
}

export default AuthorsShow




