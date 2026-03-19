import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Loader from '../../components/common/Loader'
import { getLibrary } from '../../api/library'
import { getImageUrl } from '../../utils/imageUtils'

const formatType = (value) => {
  if (!value) return 'Unknown'
  return value.replace(/\b\w/g, (char) => char.toUpperCase())
}

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

  const metrics = useMemo(() => {
    const ebooks = items.filter((item) => item.format === 'ebook').length
    const audio = items.filter((item) => item.format === 'audio').length
    const paperbacks = items.filter((item) => item.format === 'paperback').length

    return [
      { label: 'Titles', value: items.length, detail: 'In your library' },
      { label: 'Ebooks', value: ebooks, detail: 'Readable online' },
      { label: 'Audio', value: audio, detail: 'Listen-ready items' },
      { label: 'Paperback', value: paperbacks, detail: 'Owned physical copies' },
    ]
  }, [items])

  if (loading) {
    return <Loader />
  }

  return (
    <div className="page">
      <div className="library-shell">
        <section className="library-hero">
          <div>
            <p className="orders-eyebrow">Account</p>
            <h1>My Library</h1>
            <p className="orders-subtitle">Access your purchased ebooks, audiobooks, and owned paperback records in one place.</p>
          </div>
          <Link to="/products" className="orders-hero-action">
            Discover more books
          </Link>
        </section>

        {error && <p className="wishlist-message wishlist-message--error">{error}</p>}

        <section className="library-metrics">
          {metrics.map((metric) => (
            <div key={metric.label} className="library-metric-card">
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <small>{metric.detail}</small>
            </div>
          ))}
        </section>

        {items.length === 0 ? (
          <section className="library-empty">
            <h2>Your library is empty</h2>
            <p>Books you purchase or unlock will appear here automatically after checkout.</p>
            <Link to="/products" className="orders-button orders-button--primary">
              Browse books
            </Link>
          </section>
        ) : (
          <section className="library-grid-refined">
            {items.map((item) => {
              const book = item.book
              const isExpired = item.expires_at && new Date(item.expires_at) < new Date()
              const readUrl = book?.ebook_pdf?.startsWith('http') ? book.ebook_pdf : `http://localhost:8000/storage/${book?.ebook_pdf}`
              const audioUrl = book?.audio_file?.startsWith('http') ? book.audio_file : `http://localhost:8000/storage/${book?.audio_file}`

              return (
                <article className="library-card-refined" key={item.id}>
                  <div className="library-card-refined__cover">
                    <img src={getImageUrl(book?.image)} alt={book?.name || 'Book'} />
                    <span className={`library-format library-format--${item.format}`}>{formatType(item.format)}</span>
                  </div>

                  <div className="library-card-refined__body">
                    <div>
                      <h2>{book?.name || 'Untitled Book'}</h2>
                      <p>{book?.author?.name || 'Unknown author'}</p>
                    </div>

                    <div className="library-card-refined__meta">
                      <span>{book?.category?.name || 'General catalog'}</span>
                      {item.expires_at && (
                        <span className={isExpired ? 'library-expiry library-expiry--expired' : 'library-expiry'}>
                          {isExpired
                            ? `Expired ${new Date(item.expires_at).toLocaleDateString()}`
                            : `Expires ${new Date(item.expires_at).toLocaleDateString()}`}
                        </span>
                      )}
                    </div>

                    <div className="library-card-refined__actions">
                      {item.format === 'ebook' && book?.ebook_pdf && (
                        <a href={readUrl} target="_blank" rel="noreferrer" className="orders-button orders-button--primary">
                          Read now
                        </a>
                      )}

                      {item.format === 'audio' && book?.audio_file && (
                        <a href={audioUrl} target="_blank" rel="noreferrer" className="orders-button orders-button--primary">
                          Listen now
                        </a>
                      )}

                      {item.format === 'paperback' && (
                        <span className="library-owned-pill">Paperback owned</span>
                      )}

                      <Link to={`/products/${book?.id}`} className="orders-button orders-button--ghost">
                        View title
                      </Link>
                    </div>
                  </div>
                </article>
              )
            })}
          </section>
        )}
      </div>
    </div>
  )
}

export default LibraryIndex
