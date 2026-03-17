import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchBook } from '../api/books'
import { getImageUrl } from '../utils/imageUtils'
import Loader from '../components/common/Loader'

const ProductDetails = () => {
    const { id } = useParams()
    const [book, setBook] = useState(null)
    const [loading, setLoading] = useState(true)
    const [reviews, setReviews] = useState([])
    const [recommendedBooks, setRecommendedBooks] = useState([])
    const [reviewForm, setReviewForm] = useState({
        rating: '',
        comment: ''
    })

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchBook(id)
                setBook(data.data.book)
                setReviews(data.data.reviews || [])
                setRecommendedBooks(data.data.recommended_books || [])
            } catch (error) {
                console.error('Failed to load book', error)
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            load()
        }
    }, [id])

    const handleAddToCart = async (format, price) => {
        try {
            const response = await fetch('/api/v1/cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({
                    book_id: book.id,
                    format,
                    price
                })
            })
            
            if (response.success) {
                alert('Added to cart!')
            }
        } catch (error) {
            console.error('Failed to add to cart', error)
            alert('Failed to add to cart')
        }
    }

    const handleAddToWishlist = async () => {
        try {
            const response = await fetch('/api/v1/wishlist/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({
                    book_id: book.id
                })
            })
            
            if (response.success) {
                alert('Added to wishlist!')
            }
        } catch (error) {
            console.error('Failed to add to wishlist', error)
            alert('Failed to add to wishlist')
        }
    }

    const handleReviewSubmit = async (e) => {
        e.preventDefault()
        
        try {
            const response = await fetch(`/api/v1/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({
                    book_id: book.id,
                    rating: reviewForm.rating,
                    comment: reviewForm.comment
                })
            })
            
            if (response.success) {
                setReviewForm({ rating: '', comment: '' })
                // Reload reviews to show the new one
                const data = await fetchBook(id)
                setReviews(data.data.reviews || [])
            }
        } catch (error) {
            console.error('Failed to submit review', error)
            alert('Failed to submit review')
        }
    }

    const handleDeleteReview = async (reviewId) => {
        if (confirm('Are you sure you want to delete this review?')) {
            try {
                const response = await fetch(`/api/v1/reviews/${reviewId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                })
                
                if (response.success) {
                    setReviews(reviews.filter(review => review.id !== reviewId))
                }
            } catch (error) {
                console.error('Failed to delete review', error)
                alert('Failed to delete review')
            }
        }
    }

    if (loading) {
        return <Loader />
    }

    if (!book) {
        return <div className="page"><p>Book not found.</p></div>
    }

    const renderStars = (rating) => {
        const fullStars = 5
        const filledStars = Math.round(rating)
        const emptyStars = fullStars - filledStars
        
        return (
            <>
                {Array.from({ length: fullStars }, (_, i) => (
                    <span key={i}>⭐</span>
                ))}
                {Array.from({ length: emptyStars }, (_, i) => (
                    <span key={i}>☆</span>
                ))}
            </>
        )
    }

    return (
        <div className="page">
            <div className="product-page">
                {/* Left Column */}
                <div className="product-left">
                    <img src={getImageUrl(book.image)} alt={book.name} className="product-image" />
                    
                    <div className="action-box">
                        {book.has_ebook && (
                            <button 
                                onClick={() => handleAddToCart('ebook', book.ebook_price)}
                                className="btnss btn-primary"
                            >
                                <span>📘</span>
                                <span>Rent Ebook - ${book.ebook_price ? `$${book.ebook_price}` : 'Free'}</span>
                            </button>
                        )}
                        
                        {book.has_audio && (
                            <button 
                                onClick={() => handleAddToCart('audio', book.audio_price)}
                                className="btnss btn-primary"
                            >
                                <span>🎧</span>
                                <span>Rent Audio - ${book.audio_price ? `$${book.audio_price}` : 'Free'}</span>
                            </button>
                        )}
                        
                        {book.has_paperback && (
                            <button 
                                onClick={() => handleAddToCart('paperback', book.paperback_price)}
                                className="btnss btn-primary"
                            >
                                <span>📕</span>
                                <span>Buy Paperback - ${book.paperback_price ? `$${book.paperback_price}` : 'Free'}</span>
                            </button>
                        )}
                        
                        <button 
                            onClick={handleAddToWishlist}
                            className="btnss btn-primary"
                        >
                            <span>❤️</span>
                            <span>Add to Wishlist</span>
                        </button>
                        
                        <Link to="/products" className="btn-back">
                            <span>←</span>
                            <span>Back to Products</span>
                        </Link>
                    </div>
                </div>

                {/* Right Column */}
                <div className="product-right">
                    <div className="product-header">
                        <h1 className="product-title">{book.name}</h1>
                        {book.is_premium && (
                            <p style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: '#fef3c7',
                                color: '#b45309',
                                fontWeight: '600',
                                padding: '6px 12px',
                                borderRadius: '999px'
                            }}>
                                Premium book - Active subscription required
                            </p>
                        )}
                    </div>
                    
                    <div className="product-meta">
                        <div className="meta-item">
                            <span className="meta-label">Author</span>
                            <span className="meta-value">
                                {book.author ? (
                                    <Link to={`/authors/${book.author.id}`} className="author-link">
                                        {book.author.name}
                                    </Link>
                                ) : (
                                    'Unknown'
                                )}
                            </span>
                        </div>
                        
                        <div className="meta-item">
                            <span className="meta-label">Language</span>
                            <span className="meta-value">{book.language}</span>
                        </div>
                        
                        <div className="meta-item">
                            <span className="meta-label">Category</span>
                            <span className="meta-value">{book.category?.name || 'N/A'}</span>
                        </div>
                        
                        <div className="meta-item">
                            <span className="meta-label">Genre</span>
                            <span className="meta-value">{book.genre?.name || 'N/A'}</span>
                        </div>
                    </div>

                    {/* Format Details */}
                    <div className="format-section">
                        <h3 className="format-title">Available Formats</h3>
                        <div className="format-grid">
                            {book.has_ebook && (
                                <div className="format-card">
                                    <span className="format-icon">📘</span>
                                    <h4>E-Book</h4>
                                    <p><strong>Pages:</strong> {book.ebook_pages || '—'}</p>
                                    {book.ebook_pdf && (
                                        <a href={`http://localhost:8000/storage/${book.ebook_pdf}`} download className="btnss btn-tertiary">
                                            ⬇ Download Sample
                                        </a>
                                    )}
                                </div>
                            )}
                            
                            {book.has_audio && (
                                <div className="format-card">
                                    <span className="format-icon">🎧</span>
                                    <h4>Audiobook</h4>
                                    <p><strong>Duration:</strong> {book.audio_minutes || '—'} minutes</p>
                                    {book.audio_file && (
                                        <audio controls className="audio-player">
                                            <source src={`http://localhost:8000/storage/${book.audio_file}`} type="audio/mpeg" />
                                        </audio>
                                    )}
                                </div>
                            )}
                            
                            {book.has_paperback && (
                                <div className="format-card">
                                    <span className="format-icon">📕</span>
                                    <h4>Paperback</h4>
                                    <p><strong>Pages:</strong> {book.paperback_pages || '—'}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="description-section">
                        <h2 className="description-title">Book Description</h2>
                        <div className="description-content">
                            <p style={{ whiteSpace: 'pre-wrap' }}>{book.description}</p>
                        </div>
                    </div>

                    {/* Reviews */}
                    <div className="reviews-section">
                        <div className="reviews-header">
                            <h2>Customer Reviews</h2>
                            {reviews.length > 0 && (
                                <div className="rating-badge">
                                    <span>⭐</span>
                                    <span>{(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)}/5</span>
                                    <span>({reviews.length} reviews)</span>
                                </div>
                            )}
                        </div>
                        
                        {reviews.length > 0 ? (
                            reviews.map((review) => (
                                <div className="review-card" key={review.id}>
                                    <div className="review-header">
                                        <span className="review-author">
                                            {review.user?.name}
                                            
                                            {!review.is_approved && (
                                                <span className="badge bg-warning">
                                                    Pending Approval
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                    
                                    <div className="review-rating">
                                        {renderStars(review.rating)}
                                    </div>
                                    
                                    <p className="review-comment">{review.comment}</p>
                                    <small>{new Date(review.created_at).toLocaleDateString()}</small>
                                    
                                    <div className="review-actions">
                                        <a href={`/reviews/${review.id}/edit`} className="btnss btn-tertiary">
                                            Edit Review
                                        </a>
                                        
                                        <button 
                                            onClick={() => handleDeleteReview(review.id)}
                                            className="btnss btn-tertiary" 
                                            style={{ width: 'auto', padding: '8px 16px', background: '#fee2e2', color: '#dc2626' }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="review-card">
                                <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>
                                    No reviews yet. Be the first to review this book!
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Add Review Form */}
                    <div className="review-form-section">
                        <h3>Add Your Review</h3>
                        <form onSubmit={handleReviewSubmit} className="review-form">
                            <div>
                                <label htmlFor="rating">Your Rating</label>
                                <select name="rating" id="rating" className="rating-select" value={reviewForm.rating} onChange={(e) => setReviewForm({...reviewForm, rating: e.target.value})} required>
                                    <option value="">Select Rating</option>
                                    <option value="5">⭐⭐⭐ Excellent</option>
                                    <option value="4">⭐⭐⭐ Very Good</option>
                                    <option value="3">⭐⭐⭐ Good</option>
                                    <option value="2">⭐⭐ Fair</option>
                                    <option value="1">⭐ Poor</option>
                                </select>
                            </div>
                            
                            <div>
                                <label htmlFor="comment">Your Review</label>
                                <textarea 
                                    name="comment" 
                                    id="comment" 
                                    placeholder="Share your thoughts about this book..."
                                    className="comment-textarea" 
                                    value={reviewForm.comment}
                                    onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                                    required
                                ></textarea>
                            </div>
                            
                            <button type="submit" className="btnss btn-primary" style={{ width: 'auto', alignSelf: 'flex-start' }}>
                                Submit Review
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Recommended Books */}
            {recommendedBooks.length > 0 && (
                <section className="recommended-section">
                    <h2 style={{ textAlign: 'center' }}>Recommended For You</h2>
                    
                    <div className="book-grid">
                        {recommendedBooks.map((recBook) => (
                            <Link key={recBook.id} to={`/products/${recBook.id}`} className="book-card">
                                <img src={getImageUrl(recBook.image)} alt={recBook.name} />
                                <p>{recBook.title}</p>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
}

export default ProductDetails
