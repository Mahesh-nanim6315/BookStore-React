import React, { useRef } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { getImageUrl } from '../utils/imageUtils'

const Carousel = ({ title, books, category = null }) => {
  const trackRef = useRef(null)

  if (!books || books.length === 0) {
    return null
  }

  const scrollTrack = (direction) => {
    const track = trackRef.current
    if (!track) return

    track.scrollBy({
      left: direction * track.clientWidth,
      behavior: 'smooth',
    })
  }

  return (
    <section className="carousel-section">
      <div className="carousel-header">
        <h2>{title}</h2>

        {category && (
          <Link to={`/category/${category.slug}`} className="view-all-btn">
            View All
          </Link>
        )}
      </div>

      <div className="carousel-wrapper">
        <button
          type="button"
          className="nav-btn left"
          onClick={() => scrollTrack(-1)}
          aria-label={`Scroll ${title} left`}
        >
          &#10094;
        </button>

        <div ref={trackRef} className="carousel-track">
          {books.map((book) => (
            <div key={book.id} className="carousel-card">
              <Link to={`/products/${book.id}`} className="carousel-card-link">
                <img src={getImageUrl(book.image)} alt={book.name} />
                <p className="card-title">{book.name}</p>
              </Link>
              {book.is_premium && (
                <span className="premium-badge">
                  Premium
                </span>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          className="nav-btn right"
          onClick={() => scrollTrack(1)}
          aria-label={`Scroll ${title} right`}
        >
          &#10095;
        </button>
      </div>
    </section>
  )
}

Carousel.propTypes = {
  title: PropTypes.string.isRequired,
  books: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      image: PropTypes.string,
      name: PropTypes.string.isRequired,
      is_premium: PropTypes.bool,
    })
  ).isRequired,
  category: PropTypes.shape({
    slug: PropTypes.string.isRequired,
  }),
}

export default Carousel
