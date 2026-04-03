import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchAuthors } from '../../api/books'
import { getImageUrl } from '../../utils/imageUtils'
import Loader from '../../components/common/Loader'

const AuthorsIndex = () => {
  const [authors, setAuthors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadAuthors = async () => {
      try {
        const data = await fetchAuthors()
        setAuthors(data.data || [])
      } catch (error) {
        setError(error?.response?.data?.message || 'Failed to fetch authors.')
      } finally {
        setLoading(false)
      }
    }

    loadAuthors()
  }, [])

  const featuredAuthors = useMemo(() => authors.slice(0, 3), [authors])
  const getAuthorSummary = (author) => {
    if (!author.bio) {
      return 'A featured voice in the bookstore catalog.'
    }

    const truncatedBio = author.bio.substring(0, 130)

    return author.bio.length > 130 ? `${truncatedBio}...` : truncatedBio
  }

  if (loading) {
    return <Loader />
  }

  return (
    <div className="page">
      <div className="authors-studio">
        <section className="authors-studio__hero">
          <div className="authors-studio__hero-copy">
            <p className="authors-studio__eyebrow">Writers and voices</p>
            <h1>Meet the authors shaping this bookstore.</h1>
            <p>
              Explore distinctive storytellers, learn about their background, and jump directly into the books
              that define their work.
            </p>
          </div>

          <div className="authors-studio__feature-wall">
            {featuredAuthors.map((author) => (
              <article key={author.id} className="authors-feature-tile">
                <img
                  src={getImageUrl(author.image)}
                  alt={author.name}
                  onError={(event) => {
                    event.target.src = '/images/default-author.png'
                  }}
                />
                <div className="authors-feature-tile__overlay">
                  <span>Featured author</span>
                  <strong>{author.name}</strong>
                </div>
              </article>
            ))}
          </div>
        </section>

        {error && <p className="wishlist-message wishlist-message--error">{error}</p>}

        <section className="authors-studio__grid">
          {authors.length > 0 ? (
            authors.map((author, index) => (
              <article className="author-portrait-card" key={author.id}>
                <div className="author-portrait-card__image-shell">
                  <img
                    src={getImageUrl(author.image)}
                    alt={author.name}
                    onError={(event) => {
                      event.target.src = '/images/default-author.png'
                    }}
                  />
                  <span className="author-portrait-card__index">{String(index + 1).padStart(2, '0')}</span>
                </div>

                <div className="author-portrait-card__body">
                  <div>
                    <h2>{author.name}</h2>
                    <p>{getAuthorSummary(author)}</p>
                  </div>

                  <Link to={`/authors/${author.id}`} className="author-portrait-card__link">
                    Open author profile
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <div className="authors-empty-state">
              <h2>No authors found</h2>
              <p>Author profiles will appear here when the catalog is available.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default AuthorsIndex
