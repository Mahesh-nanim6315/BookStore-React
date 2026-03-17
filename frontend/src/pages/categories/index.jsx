import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCategories } from '../../api/categories'
import Loader from '../../components/common/Loader'

const CategoriesIndex = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await getCategories()
        setCategories(response.data)
      } catch (error) {
        console.error('Failed to load categories:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadCategories()
  }, [])

  if (loading) {
    return <Loader />
  }

  return (
    <div className="page">
      <div className="categories-page" style={{ marginTop: '50px' }}>

        <div className="categories-header">
          <h1>All Categories</h1>
          <p>Explore books by category</p>
        </div>

        <div className="categories-grid">
          {categories.map((category) => (
            <Link 
              key={category.id}
              to={`/category/${category.slug}`} 
              className="category-card"
            >
              <div className="category-name">
                {category.name}
              </div>

              <div className="category-count">
                {category.books_count} Books
              </div>
              <div className="category-count">
                eBook: {category.ebooks_count}
              </div>
              <div className="category-count">
                Audiobook: {category.audiobooks_count}
              </div>
              <div className="category-count">
                Paperback: {category.paperbacks_count}
              </div>
            </Link>
          ))}
        </div>

        {categories.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>No categories found.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CategoriesIndex






