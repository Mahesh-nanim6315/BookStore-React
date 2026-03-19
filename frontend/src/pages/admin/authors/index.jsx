import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Loader from '../../../components/common/Loader'
import { deleteAdminAuthor, getAdminAuthors } from '../../../api/adminAuthors'

const initialFilters = {
  search: '',
  min_books: '',
}

const AdminAuthorsIndex = () => {
  const [loading, setLoading] = useState(true)
  const [authors, setAuthors] = useState([])
  const [filters, setFilters] = useState(initialFilters)
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })

  const loadAuthors = async (nextFilters = filters, page = 1) => {
    try {
      setLoading(true)
      const response = await getAdminAuthors({ ...nextFilters, page })

      if (response.success) {
        setAuthors(response.data.data || [])
        setMeta({
          current_page: response.data.current_page || 1,
          last_page: response.data.last_page || 1,
          total: response.data.total || 0,
        })
      }
    } catch (error) {
      console.error('Failed to fetch authors:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAuthors(initialFilters, 1)
  }, [])

  const handleFilterChange = (event) => {
    const { name, value } = event.target
    setFilters((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    loadAuthors(filters, 1)
  }

  const handleReset = () => {
    setFilters(initialFilters)
    loadAuthors(initialFilters, 1)
  }

  const handleDelete = async (authorId) => {
    if (!window.confirm('Delete this author?')) {
      return
    }

    try {
      await deleteAdminAuthor(authorId)
      loadAuthors(filters, meta.current_page)
    } catch (error) {
      console.error('Failed to delete author:', error)
    }
  }

  if (loading) {
    return <Loader />
  }

  const truncateBio = (bio) => {
    if (!bio) {
      return 'No bio available.'
    }

    return bio.length > 120 ? `${bio.slice(0, 120)}...` : bio
  }

  return (
    <div className="page">
      <div className="page-header admin-list-header">
        <div>
          <h2>Authors</h2>
          <p className="admin-page-subtitle">
            Filter by name or catalog size, then create, inspect, update, or remove author records.
          </p>
        </div>

        <Link to="/dashboard/authors/create" className="admin-button admin-button-success">
          Add Author
        </Link>
      </div>

      <form className="book-filter-panel" onSubmit={handleSubmit}>
        <div className="book-filter-grid author-filter-grid">
          <input
            type="text"
            name="search"
            placeholder="Search by author name"
            value={filters.search}
            onChange={handleFilterChange}
          />

          <input
            type="number"
            name="min_books"
            placeholder="Minimum books"
            min="0"
            value={filters.min_books}
            onChange={handleFilterChange}
          />
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
              <th>Author</th>
              <th>Total Books</th>
              <th>Bio</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {authors.length > 0 ? (
              authors.map((author) => (
                <tr key={author.id}>
                  <td>
                    <div className="book-title-cell">
                      <div className="author-avatar">
                        {author.image ? <img src={author.image} alt={author.name} /> : <span>{author.name?.[0] || 'A'}</span>}
                      </div>
                      <div>
                        <strong>{author.name}</strong>
                        <div className="book-subline">#{author.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>{author.books_count || 0}</td>
                  <td className="author-bio-cell">{truncateBio(author.bio)}</td>
                  <td>
                    <div className="book-action-row">
                      <Link
                        to={`/dashboard/authors/${author.id}`}
                        className="admin-icon-action admin-icon-action--view"
                        aria-label={`View ${author.name}`}
                        title="View"
                      >
                        <img src="/images/view.png" alt="" className="admin-icon-action__icon" />
                      </Link>
                      <Link
                        to={`/dashboard/authors/${author.id}/edit`}
                        className="admin-icon-action admin-icon-action--edit"
                        aria-label={`Edit ${author.name}`}
                        title="Edit"
                      >
                        <img src="/images/edit.png" alt="" className="admin-icon-action__icon" />
                      </Link>
                      <button
                        type="button"
                        className="admin-icon-action admin-icon-action--delete"
                        onClick={() => handleDelete(author.id)}
                        aria-label={`Delete ${author.name}`}
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
                <td colSpan="4" className="empty-data">
                  No authors matched the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="admin-pagination-note">
        Showing page {meta.current_page} of {meta.last_page} with {meta.total} authors.
      </div>
    </div>
  )
}

export default AdminAuthorsIndex
