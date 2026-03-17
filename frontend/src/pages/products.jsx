import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchProducts } from '../api/books'
import { getImageUrl } from '../utils/imageUtils'

const Products = () => {
  const [books, setBooks] = useState([])
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    from: 0,
    to: 0
  })
  const [filters, setFilters] = useState({
    categories: [],
    authors: [],
    genres: [],
    languages: []
  })
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    search: '',
    category_id: '',
    language: '',
    author_id: '',
    genre_id: '',
    sort: '',
    page: 1
  })

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetchProducts(formData)
        const booksData = response.data.books
        setBooks(booksData.data || [])
        setFilters(response.data.filters || {})
        
        // Set pagination data
        if (booksData && typeof booksData === 'object' && booksData.current_page) {
          setPagination({
            current_page: booksData.current_page,
            last_page: booksData.last_page,
            per_page: booksData.per_page,
            total: booksData.total,
            from: booksData.from,
            to: booksData.to
          })
        }
      } catch (error) {
        console.error('Failed to load products', error)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const newFormData = { ...formData, page: 1 }
      setFormData(newFormData)
      const response = await fetchProducts(newFormData)
      const booksData = response.data.books
      setBooks(booksData.data || [])
      
      // Update pagination data
      if (booksData && typeof booksData === 'object' && booksData.current_page) {
        setPagination({
          current_page: booksData.current_page,
          last_page: booksData.last_page,
          per_page: booksData.per_page,
          total: booksData.total,
          from: booksData.from,
          to: booksData.to
        })
      }
    } catch (error) {
      console.error('Failed to filter products', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = async (page) => {
    setLoading(true)
    try {
      const newFormData = { ...formData, page }
      setFormData(newFormData)
      const response = await fetchProducts(newFormData)
      const booksData = response.data.books
      setBooks(booksData.data || [])
      
      // Update pagination data
      if (booksData && typeof booksData === 'object' && booksData.current_page) {
        setPagination({
          current_page: booksData.current_page,
          last_page: booksData.last_page,
          per_page: booksData.per_page,
          total: booksData.total,
          from: booksData.from,
          to: booksData.to
        })
      }
    } catch (error) {
      console.error('Failed to change page', error)
    } finally {
      setLoading(false)
    }
  }

  const renderPagination = () => {
    const { current_page, last_page, total, from, to } = pagination
    
    if (last_page <= 1) return null

    return (
      <div className="pagination" style={{ textAlign: 'center', marginTop: '2rem', padding: '1rem' }}>
        <div style={{ marginBottom: '1rem', color: '#666' }}>
          Showing {from || 0} to {to || 0} of {total} results
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Previous button */}
          <button
            onClick={() => handlePageChange(current_page - 1)}
            disabled={current_page <= 1}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #ddd',
              backgroundColor: current_page <= 1 ? '#f5f5f5' : '#fff',
              cursor: current_page <= 1 ? 'not-allowed' : 'pointer',
              borderRadius: '4px'
            }}
          >
            Previous
          </button>

          {/* Page numbers */}
          {Array.from({ length: Math.min(last_page, 10) }, (_, i) => {
            let pageNum
            if (last_page <= 10) {
              pageNum = i + 1
            } else if (current_page <= 5) {
              pageNum = i + 1
            } else if (current_page >= last_page - 4) {
              pageNum = last_page - 9 + i
            } else {
              pageNum = current_page - 5 + i
            }

            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                disabled={pageNum === current_page}
                style={{
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #ddd',
                  backgroundColor: pageNum === current_page ? '#007bff' : '#fff',
                  color: pageNum === current_page ? '#fff' : '#333',
                  cursor: pageNum === current_page ? 'not-allowed' : 'pointer',
                  borderRadius: '4px'
                }}
              >
                {pageNum}
              </button>
            )
          })}

          {/* Next button */}
          <button
            onClick={() => handlePageChange(current_page + 1)}
            disabled={current_page >= last_page}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #ddd',
              backgroundColor: current_page >= last_page ? '#f5f5f5' : '#fff',
              cursor: current_page >= last_page ? 'not-allowed' : 'pointer',
              borderRadius: '4px'
            }}
          >
            Next
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <h1 className="page-title" style={{ marginTop: '100px' }}>Pick Top Seller</h1>

      <div className="container">
        <div className="filter-box">
          <form onSubmit={handleSubmit}>
            <label><strong>Search</strong></label>
            <input 
              type="text" 
              name="search" 
              placeholder="Search book..." 
              value={formData.search}
              onChange={handleInputChange}
            />

            <label><strong>Category</strong></label>
            <select name="category_id" value={formData.category_id} onChange={handleInputChange}>
              <option value="">All</option>
              {filters.categories?.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <label><strong>Language</strong></label>
            <select name="language" value={formData.language} onChange={handleInputChange}>
              <option value="">All</option>
              {filters.languages?.map(language => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>

            <label><strong>Author</strong></label>
            <select name="author_id" value={formData.author_id} onChange={handleInputChange}>
              <option value="">All</option>
              {filters.authors?.map(author => (
                <option key={author.id} value={author.id}>
                  {author.name}
                </option>
              ))}
            </select>

            <label><strong>Genre</strong></label>
            <select name="genre_id" value={formData.genre_id} onChange={handleInputChange}>
              <option value="">All</option>
              {filters.genres?.map(genre => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>

            <label><strong>Sort by Price</strong></label>
            <select name="sort" value={formData.sort} onChange={handleInputChange}>
              <option value="">Default</option>
              <option value="price_asc">Low to High</option>
              <option value="price_desc">High to Low</option>
            </select>

            <button type="submit">Apply Filters</button>
          </form>
        </div>

        <div className="products-section">
          <div className="products-grid">
            {loading ? (
              <p>Loading...</p>
            ) : books.length ? (
              books.map((book) => (
                <div className="product" key={book.id}>
                  <Link to={`/products/${book.id}`}>
                    <img 
                      src={getImageUrl(book.image)} 
                      alt={book.name} 
                      className="book-image"
                      onError={(e) => {
                        e.target.src = '/placeholder.jpg'
                      }}
                    />
                  </Link>

                  <div className="product-header">
                    <h3>{book.name}</h3>
                    {book.is_premium && (
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#b45309', background: '#fef3c7', padding: '3px 8px', borderRadius: '999px' }}>
                        Premium
                      </span>
                    )}
                    <button type="button" className="wishlist-btn">
                      ❤️
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No books found.</p>
            )}
          </div>

          {renderPagination()}
        </div>
      </div>
    </div>
  )
}

export default Products



