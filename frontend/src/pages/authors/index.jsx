import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchAuthors } from '../../api/books'
import { getImageUrl } from '../../utils/imageUtils'
import Loader from '../../components/common/Loader'

const AuthorsIndex = () => {
  const [authors, setAuthors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAuthors = async () => {
      try {
        const data = await fetchAuthors()
        setAuthors(data.data || [])
      } catch (error) {
        console.error('Failed to fetch authors', error)
      } finally {
        setLoading(false)
      }
    }
    loadAuthors()
  }, [])

  if (loading) {
    return <Loader />
  }

  return (
    <div className="page">
      <title>Authors</title>
      <div className="container-auth" style={{ marginTop: '120px' }}>
        <h1 className="page-title">📚 Our Authors</h1>

        <div className="authors-grid">
          {authors.length > 0 ? (
            authors.map((author) => (
              <div className="author-card" key={author.id}>
                <img
                  src={getImageUrl(author.image)}
                  alt={author.name}
                  onError={(e) => {
                    e.target.src = '/images/default-author.png'
                  }}
                />

                <h3>{author.name}</h3>

                <p className="bio">
                  {author.bio ? `${author.bio.substring(0, 80)}${author.bio.length > 80 ? '...' : ''}` : 'No bio available'}
                </p>

                <Link to={`/authors/${author.id}`} className="btn-view">
                  View Profile →
                </Link>
              </div>
            ))
          ) : (
            <p>No authors found.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthorsIndex






