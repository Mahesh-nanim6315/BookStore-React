import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteBook, fetchBooks } from '../../../api/books'
import Loader from '../../../components/common/Loader'

const BooksIndex = () => {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [search, setSearch] = useState('')

  const loadBooks = async (pageToLoad = 1, searchTerm = '') => {
    setLoading(true)
    try {
      const data = await fetchBooks({ page: pageToLoad, search: searchTerm })
      const items = Array.isArray(data.data) ? data.data : data.data?.data || []
      setBooks(items)
      setPage(data.current_page || pageToLoad)
      setLastPage(data.last_page || 1)
    } catch (error) {
      console.error('Failed to fetch books', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBooks()
  }, [])

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    loadBooks(1, search)
  }

  const handleDelete = async (bookId) => {
    if (!window.confirm('Delete this book?')) return
    try {
      await deleteBook(bookId)
      loadBooks(page, search)
    } catch (error) {
      console.error('Failed to delete book', error)
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Books</h1>
        <Link to="/admin/books/create" className="btn-primary">
          Add Book
        </Link>
      </div>

      <form className="admin-search" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          placeholder="Search by name"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {loading ? (
        <Loader />
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Author</th>
              <th>Category</th>
              <th>Genre</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id}>
                <td>{book.id}</td>
                <td>{book.name}</td>
                <td>{book.author?.name || '—'}</td>
                <td>{book.category?.name || '—'}</td>
                <td>{book.genre?.name || '—'}</td>
                <td>{book.price}</td>
                <td className="row-actions">
                  <Link to={`/admin/books/${book.id}`}>View</Link>
                  <Link to={`/admin/books/${book.id}/edit`}>Edit</Link>
                  <button type="button" onClick={() => handleDelete(book.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="pagination">
        <button
          type="button"
          onClick={() => loadBooks(Math.max(page - 1, 1), search)}
          disabled={page <= 1}
        >
          Prev
        </button>
        <span>
          Page {page} of {lastPage}
        </span>
        <button
          type="button"
          onClick={() => loadBooks(Math.min(page + 1, lastPage), search)}
          disabled={page >= lastPage}
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default BooksIndex









