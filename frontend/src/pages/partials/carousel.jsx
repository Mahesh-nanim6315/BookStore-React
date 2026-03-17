import React from 'react'
import { Link } from 'react-router-dom'
import { getImageUrl } from '../../utils/imageUtils'

const PartialsCarousel = ({ title, books = [], category, categorySlug }) => {
  if (!books || books.length === 0) return null;

  // Use categorySlug if provided, otherwise get from category object
  const slug = categorySlug || (category && category.slug);

  return (
    <div className="page">
      <section className="carousel-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>{title}</h2>
          {slug && (
            <Link to={`/category/${slug}`} className="view-all-btn">
              View All
            </Link>
          )}
        </div>

        <div className="carousel-wrapper">
          <button className="nav-btn left" onClick={(e) => {
            const track = e.target.nextElementSibling;
            if (track) track.scrollBy({ left: -300, behavior: 'smooth' });
          }}>❮</button>

          <div className="carousel-track">
            {books.map((book) => (
              <div className="carousel-card" key={book.id}>
                <Link to={`/products/${book.id}`}>
                  <img 
                    src={getImageUrl(book.image)} 
                    alt={book.name} 
                    width="200" 
                    height="200" 
                    style={{ objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = '/placeholder.jpg'
                    }}
                  />
                  <p className="card-title">{book.name}</p>
                </Link>
                {book.is_premium && (
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#b45309', background: '#fef3c7', padding: '3px 8px', borderRadius: '999px', display: 'inline-block', marginTop: '5px' }}>
                    Premium
                  </span>
                )}
              </div>
            ))}
          </div>

          <button className="nav-btn right" onClick={(e) => {
            const track = e.target.previousElementSibling;
            if (track) track.scrollBy({ left: 300, behavior: 'smooth' });
          }}>❯</button>
        </div>
      </section>
    </div>
  )
}

export default PartialsCarousel







