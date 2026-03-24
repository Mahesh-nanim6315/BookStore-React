import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { fetchProducts } from '../api/books'
import { toggleWishlist } from '../api/wishlist'
import { useAuth } from '../contexts/AuthContext'
import Loader from '../components/common/Loader'
import { getImageUrl } from '../utils/imageUtils'
import { showToast } from '../utils/toast'

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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
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
    setMobileFiltersOpen(false)
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
      showToast.error('Please login to add items to wishlist')
      return
    }

    try {
      const response = await toggleWishlist(bookId)
      setBooks((current) =>
        current.map((book) =>
          book.id === bookId ? { ...book, in_wishlist: !book.in_wishlist } : book,
        ),
      )

      if (response.success) {
        showToast.success(response.action === 'removed' ? 'Removed from wishlist!' : 'Added to wishlist!')
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error)
      showToast.error('Failed to update wishlist')
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

  const activeFilterCount = ['search', 'category_id', 'language', 'author_id', 'genre_id', 'sort']
    .filter((key) => Boolean(formData[key]))
    .length

  return (
    <div className="products-page">
      <div className="products-page-header">
        <p className="products-page-title">Curated Shelf</p>
        <h1>Find your next standout read</h1>
        <p className="products-page-subtitle">
          Explore bestselling stories, premium picks, and hidden gems across every category.
        </p>
      </div>

      <div className="products-shell">
        <button
          type="button"
          className="products-mobile-toggle"
          onClick={() => setMobileFiltersOpen((open) => !open)}
          aria-expanded={mobileFiltersOpen}
        >
          <span>Filters & Sort</span>
          <strong>{activeFilterCount}</strong>
        </button>

        <aside className={`filter-box ${mobileFiltersOpen ? 'is-open' : ''}`}>
          <div className="filter-box__header">
            <p className="filter-box__eyebrow">Refine results</p>
            <h2>Browse smarter</h2>
          </div>

          <form onSubmit={handleSearch} className="products-filters__form">
            <div className="products-filter-group">
              <label htmlFor="products-search"><strong>Search</strong></label>
              <input
                id="products-search"
                type="text"
                name="search"
                value={formData.search}
                onChange={handleFilterChange}
                placeholder="Search book..."
              />
            </div>

            <div className="products-filter-group">
              <label htmlFor="products-category"><strong>Category</strong></label>
              <select id="products-category" name="category_id" value={formData.category_id} onChange={handleFilterChange}>
                <option value="">All</option>
                {filters.categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="products-filter-group">
              <label htmlFor="products-language"><strong>Language</strong></label>
              <select id="products-language" name="language" value={formData.language} onChange={handleFilterChange}>
                <option value="">All</option>
                {filters.languages?.map((language) => (
                  <option key={language} value={language}>
                    {language}
                  </option>
                ))}
              </select>
            </div>

            <div className="products-filter-group">
              <label htmlFor="products-author"><strong>Author</strong></label>
              <select id="products-author" name="author_id" value={formData.author_id} onChange={handleFilterChange}>
                <option value="">All</option>
                {filters.authors?.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="products-filter-group">
              <label htmlFor="products-genre"><strong>Genre</strong></label>
              <select id="products-genre" name="genre_id" value={formData.genre_id} onChange={handleFilterChange}>
                <option value="">All</option>
                {filters.genres?.map((genre) => (
                  <option key={genre.id} value={genre.id}>
                    {genre.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="products-filter-group">
              <label htmlFor="products-sort"><strong>Sort by Price</strong></label>
              <select id="products-sort" name="sort" value={formData.sort} onChange={handleFilterChange}>
                <option value="">Default</option>
                <option value="price_asc">Low to High</option>
                <option value="price_desc">High to Low</option>
              </select>
            </div>

            <button type="submit">Apply Filters</button>
          </form>
        </aside>

        <section className="products-section">
          <div className="products-summary">
            <div className="products-summary__copy">
              <strong>{meta.total}</strong>
              <span>books matched your shelf</span>
            </div>
            <span className="products-summary__page">Page {meta.current_page} of {meta.last_page}</span>
          </div>

          <div className="products-grid">
            {books.length > 0 ? (
              books.map((book) => (
                <article key={book.id} className="product">
                  <button
                    type="button"
                    className="wishlist-btn"
                    onClick={() => handleWishlistToggle(book.id)}
                    aria-label={book.in_wishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <span aria-hidden="true">{book.in_wishlist ? '♥' : '♡'}</span>
                  </button>

                  <Link to={`/products/${book.id}`} className="product-cover-link">
                    <img src={getImageUrl(book.image)} alt={book.name} className="book-image" />
                  </Link>

                  <div className="product-card-body">
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

                    <Link to={`/products/${book.id}`} className="product-view-link">
                      View details
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <p className="empty-state">No books found.</p>
            )}
          </div>

          {renderPagination()}
        </section>
      </div>
    </div>
  )
}

export default Products
