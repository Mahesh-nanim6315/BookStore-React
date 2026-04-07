import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Loader from '../../../components/common/Loader'
import { deleteAdminBook, getAdminBooks } from '../../../api/adminBooks'
import { showToast } from '../../../utils/toast'

const initialFilters = {
  search: '',
  author: '',
  category: '',
  genre: '',
  format: '',
  premium: '',
}

const BooksIndex = () => {
  const [loading, setLoading] = useState(true)
  const [books, setBooks] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [filters, setFilters] = useState(initialFilters)
  const [filterOptions, setFilterOptions] = useState({
    authors: [],
    categories: [],
    genres: [],
  })

  const loadBooks = async (nextFilters = filters, page = 1) => {
    try {
      setLoading(true)
      const response = await getAdminBooks({
        ...nextFilters,
        page,
      })

      if (response.success) {
        setBooks(response.data.books?.data || [])
        setMeta({
          current_page: response.data.books?.current_page || 1,
          last_page: response.data.books?.last_page || 1,
          total: response.data.books?.total || 0,
        })
        setFilterOptions({
          authors: response.data.filters?.authors || [],
          categories: response.data.filters?.categories || [],
          genres: response.data.filters?.genres || [],
        })
      }
    } catch (error) {
      console.error('Failed to fetch admin books:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBooks(initialFilters, 1)
  }, [])

  const handleFilterChange = (event) => {
    const { name, value } = event.target
    setFilters((current) => ({ ...current, [name]: value }))
  }

  const handleSearch = (event) => {
    event.preventDefault()
    loadBooks(filters, 1)
  }

  const handleReset = () => {
    setFilters(initialFilters)
    loadBooks(initialFilters, 1)
  }

  const handlePageChange = (page) => {
    if (page < 1 || page > meta.last_page || page === meta.current_page) {
      return
    }

    loadBooks(filters, page)
  }

  const handleDelete = async (bookId) => {
    if (!globalThis.confirm('Delete this book?')) {
      return
    }

    try {
      const response = await deleteAdminBook(bookId)
      if (response.success) {
        showToast.success('Book deleted successfully!')
        loadBooks(filters, meta.current_page)
      } else {
        showToast.error(response.message || 'Failed to delete book')
      }
    } catch (error) {
      console.error('Failed to delete book:', error)
      showToast.error('Failed to delete book. Please try again.')
    }
  }

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(Number(amount || 0))

  if (loading) {
    return <Loader />
  }

  return (
    <div className="page">
      <div className="page-header admin-list-header">
        <div>
          <h2>Books</h2>
          <p className="admin-page-subtitle">
            Manage catalog titles, refine search filters, and jump into create, view, edit, or delete actions.
          </p>
        </div>

        <Link to="/dashboard/books/create" className="admin-button admin-button-success">
          Add Book
        </Link>
      </div>

      <form className="book-filter-panel" onSubmit={handleSearch}>
        <div className="book-filter-grid">
          <input
            type="text"
            name="search"
            placeholder="Search by title"
            value={filters.search}
            onChange={handleFilterChange}
          />

          <select name="author" value={filters.author} onChange={handleFilterChange}>
            <option value="">All Authors</option>
            {filterOptions.authors.map((author) => (
              <option key={author.id} value={author.id}>
                {author.name}
              </option>
            ))}
          </select>

          <select name="category" value={filters.category} onChange={handleFilterChange}>
            <option value="">All Categories</option>
            {filterOptions.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <select name="genre" value={filters.genre} onChange={handleFilterChange}>
            <option value="">All Genres</option>
            {filterOptions.genres.map((genre) => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>

          <select name="format" value={filters.format} onChange={handleFilterChange}>
            <option value="">All Formats</option>
            <option value="ebook">eBook</option>
            <option value="audio">Audio</option>
            <option value="paperback">Paperback</option>
          </select>

          <select name="premium" value={filters.premium} onChange={handleFilterChange}>
            <option value="">All Access Types</option>
            <option value="1">Premium</option>
            <option value="0">Standard</option>
          </select>
        </div>

        <div className="book-filter-actions">
          <button type="submit" className="admin-button admin-button-success">
            Apply Filters
          </button>
          <button type="button" className="admin-button" onClick={handleReset}>
            Reset
          </button>
        </div>
      </form>

      <div className="admin-table-wrap">
        <table className="table-custom">
          <thead>
            <tr>
              <th>Book</th>
              <th>Author</th>
              <th>Category</th>
              <th>Formats</th>
              <th>Stock</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.length > 0 ? (
              books.map((book) => (
                <tr key={book.id}>
                  <td data-label="Book">
                    <div className="book-title-cell">
                      <div className="book-mini-cover">
                        {book.image ? <img src={book.image} alt={book.name} /> : <span>No image</span>}
                      </div>
                      <div>
                        <strong>{book.name}</strong>
                        <div className="book-subline">#{book.id}</div>
                      </div>
                    </div>
                  </td>
                  <td data-label="Author">{book.author?.name || '-'}</td>
                  <td data-label="Category">
                    <div>{book.category?.name || '-'}</div>
                    <div className="book-subline">{book.genre?.name || '-'}</div>
                  </td>
                  <td data-label="Formats">
                    <div className="book-tag-row">
                      {book.has_ebook && <span className="book-tag">eBook</span>}
                      {book.has_audio && <span className="book-tag">Audio</span>}
                      {book.has_paperback && <span className="book-tag">Paperback</span>}
                      {book.is_premium && <span className="book-tag book-tag-premium">Premium</span>}
                    </div>
                  </td>
                  <td data-label="Stock">{book.has_paperback ? book.stock ?? 0 : '-'}</td>
                  <td data-label="Price">{formatCurrency(book.price)}</td>
                  <td data-label="Actions">
                    <div className="book-action-row">
                      <Link
                        to={`/dashboard/books/${book.id}`}
                        className="admin-icon-action admin-icon-action--view"
                        aria-label={`View ${book.name}`}
                        title="View"
                      >
                        <img src="/images/view.png" alt="" className="admin-icon-action__icon" />
                      </Link>
                      <Link
                        to={`/dashboard/books/${book.id}/edit`}
                        className="admin-icon-action admin-icon-action--edit"
                        aria-label={`Edit ${book.name}`}
                        title="Edit"
                      >
                        <img src="/images/edit.png" alt="" className="admin-icon-action__icon" />
                      </Link>
                      <button
                        type="button"
                        className="admin-icon-action admin-icon-action--delete"
                        onClick={() => handleDelete(book.id)}
                        aria-label={`Delete ${book.name}`}
                        title="Delete"
                      >
                        <img src="/images/delete.png" alt="" className="admin-icon-action__icon" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="empty-data">
                  No books matched the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {meta.last_page > 1 ? (
        <div className="admin-pagination">
          <div className="pagination-info">
            Showing page {meta.current_page} of {meta.last_page} with {meta.total} total books.
          </div>
          <div className="pagination-controls">
            <button
              type="button"
              className="pagination-btn"
              onClick={() => handlePageChange(meta.current_page - 1)}
              disabled={meta.current_page === 1}
            >
              &lt; Previous
            </button>

            {new Array(meta.last_page).map((_, index) => {
              const pageNumber = index + 1

              if (
                pageNumber === 1 ||
                pageNumber === meta.last_page ||
                (pageNumber >= meta.current_page - 2 && pageNumber <= meta.current_page + 2)
              ) {
                return (
                  <button
                    key={pageNumber}
                    type="button"
                    className={`pagination-btn ${meta.current_page === pageNumber ? 'active' : ''}`}
                    onClick={() => handlePageChange(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                )
              }

              if (
                (pageNumber === meta.current_page - 3 && pageNumber > 1) ||
                (pageNumber === meta.current_page + 3 && pageNumber < meta.last_page)
              ) {
                return <span key={pageNumber} className="pagination-ellipsis">...</span>
              }

              return null
            })}

            <button
              type="button"
              className="pagination-btn"
              onClick={() => handlePageChange(meta.current_page + 1)}
              disabled={meta.current_page === meta.last_page}
            >
              Next 
            </button>
          </div>
        </div>
      ) : (
        <div className="admin-pagination-note">
          Showing page {meta.current_page} of {meta.last_page} with {meta.total} books.
        </div>
      )}
    </div>
  )
}

export default BooksIndex
