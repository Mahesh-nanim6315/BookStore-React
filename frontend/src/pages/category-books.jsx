import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchCategoryBooks } from '../api/books'
import { getImageUrl } from '../utils/imageUtils'

const CategoryBooks = () => {
    const { slug } = useParams()
    const [category, setCategory] = useState(null)
    const [books, setBooks] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const loadCategoryBooks = async () => {
            try {
                setLoading(true)
                const response = await fetchCategoryBooks(slug)
                setCategory(response.data.category)
                setBooks(response.data.books.data || response.data.books)
            } catch (error) {
                console.error("Failed to fetch category books", error)
                setError('Failed to load category books')
            } finally {
                setLoading(false)
            }
        }

        if (slug) {
            loadCategoryBooks()
        }
    }, [slug])

    if (loading) {
        return (
            <div className="page" style={{ padding: '2rem', textAlign: 'center' }}>
                Loading books...
            </div>
        )
    }

    if (error) {
        return (
            <div className="page" style={{ padding: '2rem', textAlign: 'center' }}>
                <p style={{ color: 'red' }}>{error}</p>
            </div>
        )
    }

    return (
        <div className="page">
            <header className="page-header">
                <h2 className="page-titles">
                    {category} Books
                </h2>
            </header>

            <div className="book-grid">
                {books.length > 0 ? (
                    books.map((book) => (
                        <div className="book-card" key={book.id}>
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
                            <h4 className="book-title">{book.name}</h4>
                            {book.is_premium && (
                                <span style={{
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    color: '#b45309',
                                    background: '#fef3c7',
                                    padding: '3px 8px',
                                    borderRadius: '999px',
                                    display: 'inline-block',
                                    marginTop: '5px'
                                }}>
                                    Premium
                                </span>
                            )}
                        </div>
                    ))
                ) : (
                    <p className="no-books">No books found.</p>
                )}
            </div>

            {/* Pagination can be added here if needed */}
            {/* <div className="pagination">
                Pagination links would go here
            </div> */}
        </div>
    )
}

export default CategoryBooks







