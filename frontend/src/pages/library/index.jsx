import React, { useEffect, useState } from 'react'
import Loader from '../../components/common/Loader'
import { getLibrary } from '../../api/library'
import { getImageUrl } from '../../utils/imageUtils'

const LibraryIndex = () => {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const loadLibrary = async () => {
      try {
        const response = await getLibrary()
        setItems(response.data?.libraries || [])
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load your library.')
      } finally {
        setLoading(false)
      }
    }

    loadLibrary()
  }, [])

  if (loading) {
    return <Loader />
  }

  return (
    <div className="page">
      <div className="library-container" style={{ marginTop: '100px' }}>
        <h1 className="library-title">My Library</h1>

        {error && <p className="wishlist-message wishlist-message--error">{error}</p>}

        {items.length === 0 ? (
          <p className="empty-text">You have no books in your library yet.</p>
        ) : (
          <div className="library-grid">
            {items.map((item) => {
              const isExpired = item.expires_at && new Date(item.expires_at) < new Date()
              const book = item.book

              return (
                <div className="library-card" key={item.id}>
                  <img src={getImageUrl(book?.image)} alt={book?.name || 'Book'} />
                  <h3>{book?.name || 'Untitled Book'}</h3>
                  <p>{book?.author?.name || 'Unknown Author'}</p>

                  <span className={`format-badge ${item.format}`}>
                    {item.format}
                  </span>

                  {item.format === 'ebook' && book?.ebook_pdf && (
                    <a
                      href={book.ebook_pdf.startsWith('http') ? book.ebook_pdf : `http://localhost:8000/storage/${book.ebook_pdf}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn read"
                    >
                      Read
                    </a>
                  )}

                  {item.format === 'audio' && book?.audio_file && (
                    <a
                      href={book.audio_file.startsWith('http') ? book.audio_file : `http://localhost:8000/storage/${book.audio_file}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn listen"
                    >
                      Listen
                    </a>
                  )}

                  {item.format === 'paperback' && (
                    <span className="owned">Paperback Owned</span>
                  )}

                  {item.expires_at && (
                    <small className="expiry">
                      {isExpired
                        ? `Expired on ${new Date(item.expires_at).toLocaleDateString()}`
                        : `Expires on ${new Date(item.expires_at).toLocaleDateString()}`}
                    </small>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default LibraryIndex
