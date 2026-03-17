import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { fetchProducts } from '../api/books'
import { toggleWishlist } from '../api/wishlist'
import { useAuth } from '../contexts/AuthContext'
import Loader from '../components/common/Loader'

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const { isAuthenticated } = useAuth()
  
  const [books, setBooks] = useState([])
  const [filters, setFilters] = useState({
    categories: [],
    authors: [],
    genres: [],
    languages: []
  })
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    search: searchParams.get('search') || '',
    category_id: searchParams.get('category_id') || '',
    language: searchParams.get('language') || '',
    author_id: searchParams.get('author_id') || '',
    genre_id: searchParams.get('genre_id') || '',
    sort: searchParams.get('sort') || '',
    page: searchParams.get('page') || 1
  })

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true)
      try {
        const response = await fetchProducts(formData)
        const booksData = response.data.books
        setBooks(booksData.data || [])
        setFilters(response.data.filters || {})
      } catch (error) {
        console.error('Failed to load products:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadProducts()
  }, [formData])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    const newFormData = { ...formData, [name]: value, page: 1 }
    setFormData(newFormData)
    
    // Update URL params
    const params = new URLSearchParams()
    Object.entries(newFormData).forEach(([key, val]) => {
      if (val) params.set(key, val)
    })
    setSearchParams(params)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const newFormData = { ...formData, page: 1 }
    setFormData(newFormData)
    
    const params = new URLSearchParams()
    Object.entries(newFormData).forEach(([key, val]) => {
      if (val) params.set(key, val)
    })
    setSearchParams(params)
  }

  const handleWishlistToggle = async (bookId) => {
    if (!isAuthenticated) {
      alert('Please login to add items to wishlist')
      return
    }

    try {
      await toggleWishlist(bookId)
      // Update UI to reflect wishlist status
      setBooks(prevBooks => 
        prevBooks.map(book => 
          book.id === bookId 
            ? { ...book, in_wishlist: !book.in_wishlist }
            : book
        )
      )
    } catch (error) {
      console.error('Failed to toggle wishlist:', error)
    }
  }

  if (loading) {
    return <Loader />
  }

  return (
    <div className="products-page">
      <h1 className="page-title" style={{ marginTop: '100px' }}>Pick Top Seller</h1>

      <div className="container">
        <div className="filter-box">
          <form onSubmit={handleSearch}>
            <label><strong>Search</strong></label>
            <input 
              type="text"
              name="search"
              value={formData.search}
              onChange={handleFilterChange}
              placeholder="Search book..."
            />

            <label><strong>Category</strong></label>
            <select name="category_id" value={formData.category_id} onChange={handleFilterChange}>
              <option value="">All</option>
              {filters.categories?.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <label><strong>Language</strong></label>
            <select name="language" value={formData.language} onChange={handleFilterChange}>
              <option value="">All</option>
              {filters.languages?.map(language => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>

            <label><strong>Author</strong></label>
            <select name="author_id" value={formData.author_id} onChange={handleFilterChange}>
              <option value="">All</option>
              {filters.authors?.map(author => (
                <option key={author.id} value={author.id}>
                  {author.name}
                </option>
              ))}
            </select>

            <label><strong>Genre</strong></label>
            <select name="genre_id" value={formData.genre_id} onChange={handleFilterChange}>
              <option value="">All</option>
              {filters.genres?.map(genre => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>

            <label><strong>Sort by Price</strong></label>
            <select name="sort" value={formData.sort} onChange={handleFilterChange}>
              <option value="">Default</option>
              <option value="price_asc">Low to High</option>
              <option value="price_desc">High to Low</option>
            </select>

            <button type="submit">Apply Filters</button>
          </form>
        </div>

        <div className="products-section">
          <div className="products-grid">
            {books.length > 0 ? (
              books.map(book => (
                <div key={book.id} className="product">
                  {book.image && (
                    <Link to={`/products/${book.id}`}>
                      <img src={book.image} alt={book.name} className="book-image" />
                    </Link>
                  )}

                  <div className="product-header">
                    <h3>{book.name}</h3>
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
                    <button 
                      type="button" 
                      className="wishlist-btn"
                      onClick={() => handleWishlistToggle(book.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '20px'
                      }}
                    >
                      {book.in_wishlist ? '❤️' : '🤍'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No books found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
        export default Products



