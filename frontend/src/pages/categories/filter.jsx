import React from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

const CategoriesFilter = ({ categories = [] }) => {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="category-buttons">
      <h2 className="category-buttons-title">Browse Categories</h2>

      <div className="category-list">
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

CategoriesFilter.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      slug: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
}

export default CategoriesFilter







