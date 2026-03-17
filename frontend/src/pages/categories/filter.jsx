import React from 'react'
import { Link } from 'react-router-dom'

const CategoriesFilter = ({ categories = [] }) => {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="category-buttons">
      <h2 style={{ marginLeft: '1rem', marginBottom: '1rem', marginTop: '1rem' }}>Browse Categories</h2>

      <div className="category-list" style={{ marginLeft: '15px' }}>
        {categories.slice(0, 10).map((cat) => (
          <Link key={cat.id} to={`/category/${cat.slug}`} className="category-btn">
            {cat.name}
          </Link>
        ))}
        
        <Link to="/categories" className="view-all-btn">
          View All
        </Link>
      </div>
    </section>
  )
}

export default CategoriesFilter







