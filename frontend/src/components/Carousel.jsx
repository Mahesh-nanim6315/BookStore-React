import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const Carousel = ({ title, books, category = null }) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const slideLeft = () => {
    setCurrentIndex(Math.max(0, currentIndex - 1))
  }

  const slideRight = () => {
    const maxIndex = Math.max(0, books.length - 4)
    setCurrentIndex(Math.min(maxIndex, currentIndex + 1))
  }

  if (!books || books.length === 0) {
    return null
  }

  return (
    <section className="carousel-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>{title}</h2>
        
        {category && (
          <Link to={`/category/${category.slug}`} className="view-all-btn">
            View All
          </Link>
        )}
      </div>

      <div className="carousel-wrapper">
        <button className="nav-btn left" onClick={slideLeft}>❮</button>

        <div className="carousel-track">
          {books.map((book, index) => (
            <div key={book.id} className="carousel-card" style={{ transform: `translateX(-${currentIndex * 220}px)` }}>
              <Link to={`/products/${book.id}`}>
                <img src={book.image || '/images/default-book.jpg'} width="200" height="200" alt={book.name} />
                <p className="card-title">{book.name}</p>
              </Link>
              {book.is_premium && (
                <span style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: '#b45309',
                  background: '#fef3c7',
                  padding: '3px 8px',
                  borderRadius: '999px'
                }}>
                  Premium
                </span>
              )}
            </div>
          ))}
        </div>

        <button className="nav-btn right" onClick={slideRight}>❯</button>
      </div>
    </section>
  )
}

export default Carousel
