import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { fetchProducts } from '../api/books'
import { toggleWishlist } from '../api/wishlist'
import { useAuth } from '../contexts/AuthContext'
import Loader from '../components/common/Loader'
import { getImageUrl } from '../utils/imageUtils'

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const { isAuthenticated } = useAuth()

  const [books, setBooks] = useState([])
  const [filters, setFilters] = useState({
    categories: [],
    authors: [],
    genres: [],
    languages: [],
  })
  const [loading, setLoading] = useState(true)
  const [meta, setMeta] = useState({
    current_page: Number(searchParams.get('page') || 1),
    last_page: 1,
    total: 0,
  })
  const [formData, setFormData] = useState({
    search: searchParams.get('search') || '',
    category_id: searchParams.get('category_id') || '',
    language: searchParams.get('language') || '',
    author_id: searchParams.get('author_id') || '',
    genre_id: searchParams.get('genre_id') || '',
    sort: searchParams.get('sort') || '',
    page: Number(searchParams.get('page') || 1),
  })

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true)
      try {
        const response = await fetchProducts(formData)
        const booksData = response.data.books || {}
        setBooks(booksData.data || [])
        setFilters(response.data.filters || {})
        setMeta({
          current_page: Number(booksData.current_page || formData.page || 1),
          last_page: Number(booksData.last_page || 1),
          total: Number(booksData.total || 0),
        })
      } catch (error) {
        console.error('Failed to load products:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [formData])

  const updateUrl = (nextFormData) => {
    const params = new URLSearchParams()
    Object.entries(nextFormData).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      }
    })
    setSearchParams(params)
  }

  const handleFilterChange = (event) => {
    const { name, value } = event.target
    const nextFormData = { ...formData, [name]: value, page: 1 }
    setFormData(nextFormData)
    updateUrl(nextFormData)
  }

  const handleSearch = (event) => {
    event.preventDefault()
    const nextFormData = { ...formData, page: 1 }
    setFormData(nextFormData)
    updateUrl(nextFormData)
  }

  const handlePageChange = (page) => {
    const nextPage = Number(page)
    if (nextPage < 1 || nextPage > meta.last_page || nextPage === Number(formData.page)) {
      return
    }

    const nextFormData = { ...formData, page: nextPage }
    setFormData(nextFormData)
    updateUrl(nextFormData)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleWishlistToggle = async (bookId) => {
    if (!isAuthenticated) {
      alert('Please login to add items to wishlist')
      return
    }

    try {
      await toggleWishlist(bookId)
      setBooks((current) =>
        current.map((book) =>
          book.id === bookId ? { ...book, in_wishlist: !book.in_wishlist } : book,
        ),
      )
    } catch (error) {
      console.error('Failed to toggle wishlist:', error)
    }
  }

  const renderPagination = () => {
    if (meta.last_page <= 1) {
      return null
    }

    const current = Number(meta.current_page)
    const pages = []

    for (let page = 1; page <= meta.last_page; page += 1) {
      if (page === 1 || page === meta.last_page || (page >= current - 1 && page <= current + 1)) {
        pages.push(page)
      }
    }

    const uniquePages = [...new Set(pages)].sort((a, b) => a - b)
    const pageItems = []

    uniquePages.forEach((page, index) => {
      if (index > 0 && uniquePages[index - 1] !== page - 1) {
        pageItems.push(`ellipsis-${page}`)
      }
      pageItems.push(page)
    })

    return (
      <div className="products-pagination">
        <button
          type="button"
          className="pagination-pill"
          onClick={() => handlePageChange(current - 1)}
          disabled={current === 1}
        >
          Prev
        </button>

        <div className="pagination-pages">
          {pageItems.map((item) =>
            typeof item === 'string' ? (
              <span key={item} className="pagination-ellipsis">...</span>
            ) : (
              <button
                key={item}
                type="button"
                className={`pagination-pill ${item === current ? 'is-active' : ''}`}
                onClick={() => handlePageChange(item)}
              >
                {item}
              </button>
            ),
          )}
        </div>

        <button
          type="button"
          className="pagination-pill"
          onClick={() => handlePageChange(current + 1)}
          disabled={current === meta.last_page}
        >
          Next
        </button>
      </div>
    )
  }

  if (loading) {
    return <Loader />
  }

  return (
    <div className="products-page">
      <div className="products-page-header">
        <h1>Pick Top Seller</h1>
        <p>Explore our best-selling books across all categories and genres.</p>
      </div>

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
              {filters.categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <label><strong>Language</strong></label>
            <select name="language" value={formData.language} onChange={handleFilterChange}>
              <option value="">All</option>
              {filters.languages?.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>

           <label><strong>Author</strong></label>
            <select name="author_id" value={formData.author_id} onChange={handleFilterChange}>
              <option value="">All</option>
              {filters.authors?.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.name}
                </option>
              ))}
            </select>  

            <label><strong>Genre</strong></label>
            <select name="genre_id" value={formData.genre_id} onChange={handleFilterChange}>
              <option value="">All</option>
              {filters.genres?.map((genre) => (
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
          <div className="products-summary">
            <span>{meta.total} books found</span>
            <span>Page {meta.current_page} of {meta.last_page}</span>
          </div>

          <div className="products-grid">
            {books.length > 0 ? (
              books.map((book) => (
                <div key={book.id} className="product">
                  <button
                    type="button"
                    className="wishlist-btn"
                    onClick={() => handleWishlistToggle(book.id)}
                    aria-label={book.in_wishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    {book.in_wishlist ? '❤️' : '🤍'}
                  </button>

                  <Link to={`/products/${book.id}`} className="product-cover-link">
                    <img src={getImageUrl(book.image)} alt={book.name} className="book-image" />
                  </Link>

                  <div className="product-header">
                    <div className="product-title-block">
                      <h3>{book.name}</h3>
                      {/* {book.author?.name && <p className="product-author">{book.author.name}</p>} */}
                    </div>
                    {book.is_premium && <span className="premium-badge">Premium</span>}
                  </div>

                  {/* <div className="product-meta">
                    {book.category?.name && <span>{book.category.name}</span>}
                    {book.language && <span>{book.language}</span>}
                  </div> */}
                </div>
              ))
            ) : (
              <p className="empty-state">No books found.</p>
            )}
          </div>

          {renderPagination()}
        </div>
      </div>
    </div>
  )
}

export default Products
