import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchAuthor } from '../../api/books'
import { getImageUrl } from '../../utils/imageUtils'
import Loader from '../../components/common/Loader'

const getBookPrice = (book) => book?.ebook_price || book?.audio_price || book?.paperback_price || 0

const AuthorsShow = () => {
  const { id } = useParams()
  const [author, setAuthor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadAuthor = async () => {
      try {
        const data = await fetchAuthor(id)
        setAuthor(data.data)
      } catch (error) {
        setError(error?.response?.data?.message || 'Failed to load author.')
      } finally {
        setLoading(false)
      }
    }

    loadAuthor()
  }, [id])

  const bookCount = useMemo(() => author?.books?.length || 0, [author?.books])

  if (loading) {
    return <Loader />
  }

  if (!author) {
    return <div className="page"><p>{error || 'Author not found.'}</p></div>
  }

  return (
    <div className="page">
      <div className="author-stage">
        <section className="author-stage__hero">
          <div className="author-stage__portrait">
            <img
              src={getImageUrl(author.image)}
              alt={author.name}
              onError={(event) => {
                event.target.src = '/images/default-author.png'
              }}
            />
          </div>

          <div className="author-stage__copy">
            <p className="authors-studio__eyebrow">Author profile</p>
            <h1>{author.name}</h1>
            <p>{author.bio || 'No biography is available for this author yet.'}</p>

            <div className="author-stage__stats">
              <div>
                <span>Books in catalog</span>
                <strong>{bookCount}</strong>
              </div>
              <div>
                <span>Featured role</span>
                <strong>Storyteller</strong>
              </div>
            </div>

            <Link to="/authors" className="author-stage__back-link">
              Back to all authors
            </Link>
          </div>
        </section>

        <section className="author-bibliography">
          <div className="author-bibliography__head">
            <div>
              <p className="authors-studio__eyebrow">Bibliography</p>
              <h2>Books by {author.name}</h2>
            </div>
          </div>

          {author.books && author.books.length > 0 ? (
            <div className="author-bibliography__grid">
              {author.books.map((book) => (
                <article className="author-book-slab" key={book.id}>
                  <div className="author-book-slab__cover">
                    <img
                      src={getImageUrl(book.image)}
                      alt={book.name}
                      onError={(event) => {
                        event.target.src = '/images/default-book.png'
                      }}
                    />
                  </div>
                  <div className="author-book-slab__body">
                    <h3>{book.name}</h3>
                    <p>From Rs. {getBookPrice(book)}</p>
                    <Link to={`/products/${book.id}`} className="author-book-slab__link">
                      View book
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="authors-empty-state">
              <h2>No books available</h2>
              <p>This author does not have any published titles in the storefront yet.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default AuthorsShow
