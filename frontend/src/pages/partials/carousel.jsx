import React from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { getImageUrl } from '../../utils/imageUtils'

const PartialsCarousel = ({ title, books = [], category, categorySlug }) => {
  if (!books || books.length === 0) return null

  const slug = categorySlug || category?.slug

  return (
    <section className="carousel-section">
      <div className="carousel-header">
        <h2>{title}</h2>
        {slug && (
          <Link to={`/category/${slug}`} className="view-all-btn">
            View All
          </Link>
        )}
      </div>

      <div className="carousel-wrapper">
        <button
          type="button"
          className="nav-btn left"
          onClick={(e) => {
            const track = e.currentTarget.nextElementSibling
            if (track) track.scrollBy({ left: -track.clientWidth, behavior: 'smooth' })
          }}
          aria-label={`Scroll ${title} left`}
        >
          &#10094;
        </button>

        <div className="carousel-track">
          {books.map((book) => (
            <div className="carousel-card" key={book.id}>
              <Link to={`/products/${book.id}`} className="carousel-card-link">
                <img
                  src={getImageUrl(book.image)}
                  alt={book.name}
                  onError={(e) => {
                    e.target.src = '/placeholder.jpg'
                  }}
                />
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
          onClick={(e) => {
            const track = e.currentTarget.previousElementSibling
            if (track) track.scrollBy({ left: track.clientWidth, behavior: 'smooth' })
          }}
          aria-label={`Scroll ${title} right`}
        >
          &#10095;
        </button>
      </div>
    </section>
  )
}

PartialsCarousel.propTypes = {
  title: PropTypes.string.isRequired,
  books: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      image: PropTypes.string,
      name: PropTypes.string.isRequired,
      is_premium: PropTypes.bool,
    })
  ),
  category: PropTypes.shape({
    slug: PropTypes.string,
  }),
  categorySlug: PropTypes.string,
}

export default PartialsCarousel
