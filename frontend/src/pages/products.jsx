import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchBooks } from '../api/books'

const Products = () => {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchBooks()
        const items = Array.isArray(data.data) ? data.data : data.data?.data || []
        setBooks(items)
      } catch (error) {
        console.error('Failed to load books', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="page">
      <h1 className="page-title" style={{ marginTop: '100px' }}>Pick Top Seller</h1>

      <div className="container">
        <div className="filter-box">
          <form>
            <label><strong>Search</strong></label>
            <input type="text" name="search" placeholder="Search book..." />

            <label><strong>Category</strong></label>
            <select name="category_id">
              <option value="">All</option>
            </select>

            <label><strong>Language</strong></label>
            <select name="language">
              <option value="">All</option>
            </select>

            <label><strong>Author</strong></label>
            <select name="author_id">
              <option value="">All</option>
            </select>

            <label><strong>Genre</strong></label>
            <select name="genre_id">
              <option value="">All</option>
            </select>

            <label><strong>Sort by Price</strong></label>
            <select name="sort">
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
                    <img src={book.image} alt={book.name} className="book-image" />
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

          <div className="pagination"></div>
        </div>
      </div>
    </div>
  )
}

export default Products



