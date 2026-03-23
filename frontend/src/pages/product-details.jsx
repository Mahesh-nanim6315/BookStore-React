import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchBook } from '../api/books'
import { createReview, deleteReview, updateReview } from '../api/reviews'
import { getImageUrl } from '../utils/imageUtils'
import Loader from '../components/common/Loader'
import { useAuth } from '../contexts/AuthContext'
import { addToCart } from '../api/cart'
import { toggleWishlist } from '../api/wishlist'
import { showToast } from '../utils/toast'

const ProductDetails = () => {
    const { id } = useParams()
    const { user } = useAuth()
    const [book, setBook] = useState(null)
    const [loading, setLoading] = useState(true)
    const [reviews, setReviews] = useState([])
    const [recommendedBooks, setRecommendedBooks] = useState([])
    const [reviewForm, setReviewForm] = useState({
        rating: '',
        comment: ''
    })
    const [editingReviewId, setEditingReviewId] = useState(null)
    const [editReviewForm, setEditReviewForm] = useState({
        rating: '',
        comment: ''
    })

    const refreshBookData = async () => {
        const data = await fetchBook(id)
        setBook(data.data.book)
        setReviews(data.data.reviews || [])
        setRecommendedBooks(data.data.recommended_books || [])
    }

    useEffect(() => {
        const load = async () => {
            try {
                await refreshBookData()
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
            const response = await addToCart(book.id, {
                format,
                price
            })

            if (response.success) {
                showToast.success('Added to cart!')
            }
        } catch (error) {
            console.error('Failed to add to cart', error)
            showToast.error('Failed to add to cart')
        }
    }

    const handleAddToWishlist = async () => {
        try {
            const response = await toggleWishlist(book.id)

            if (response.success) {
                showToast.success(response.action === 'removed' ? 'Removed from wishlist!' : 'Added to wishlist!')
            }
        } catch (error) {
            console.error('Failed to add to wishlist', error)
            showToast.error('Failed to update wishlist')
        }
    }

    const handleReviewSubmit = async (e) => {
        e.preventDefault()

        try {
            const response = await createReview(book.id, {
                rating: reviewForm.rating,
                comment: reviewForm.comment
            })

            if (response.success) {
                setReviewForm({ rating: '', comment: '' })
                await refreshBookData()
                showToast.success('Review submitted successfully!')
            }
        } catch (error) {
            console.error('Failed to submit review', error)
            const message =
                error?.response?.data?.message ||
                error?.response?.data?.errors?.comment?.[0] ||
                error?.response?.data?.errors?.rating?.[0] ||
                'Failed to submit review'
            showToast.error(message)
        }
    }

    const handleEditReviewStart = (review) => {
        setEditingReviewId(review.id)
        setEditReviewForm({
            rating: String(review.rating || ''),
            comment: review.comment || ''
        })
    }

    const handleEditReviewCancel = () => {
        setEditingReviewId(null)
        setEditReviewForm({
            rating: '',
            comment: ''
        })
    }

    const handleUpdateReview = async (reviewId) => {
        try {
            const response = await updateReview(reviewId, editReviewForm)

            if (response.success) {
                await refreshBookData()
                handleEditReviewCancel()
                showToast.success('Review updated successfully!')
            }
        } catch (error) {
            console.error('Failed to update review', error)
            const message =
                error?.response?.data?.message ||
                error?.response?.data?.errors?.comment?.[0] ||
                error?.response?.data?.errors?.rating?.[0] ||
                'Failed to update review'
            showToast.error(message)
        }
    }

    const handleDeleteReview = async (reviewId) => {
        if (window.confirm('Are you sure you want to delete this review?')) {
            try {
                const response = await deleteReview(reviewId)

                if (response.success) {
                    await refreshBookData()
                    handleEditReviewCancel()
                    showToast.success('Review deleted successfully!')
                }
            } catch (error) {
                console.error('Failed to delete review', error)
                showToast.error(error?.response?.data?.message || 'Failed to delete review')
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
                {Array.from({ length: filledStars }, (_, i) => (
                    <span key={i}>⭐</span>
                ))}
                {Array.from({ length: emptyStars }, (_, i) => (
                    <span key={i}>☆</span>
                ))}
            </>
        )
    }

    const currentUserReview = user ? reviews.find((review) => review.user_id === user.id) : null

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
                            <span className="meta-value">{book.language || 'N/A'}</span>
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
                                            <source src={book.audio_file.startsWith('http') 
                                                ? book.audio_file 
                                                : `http://localhost:8000/storage/${book.audio_file}`} 
                                                type="audio/mpeg" />
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

                                    {user?.id === review.user_id && (
                                        <div className="review-actions">
                                            <button
                                                type="button"
                                                onClick={() => handleEditReviewStart(review)}
                                                className="btnss btn-tertiary"
                                            >
                                                Edit Review
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleDeleteReview(review.id)}
                                                className="btnss btn-tertiary"
                                                style={{ width: 'auto', padding: '8px 16px', background: '#fee2e2', color: '#dc2626' }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}

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
                        {currentUserReview ? (
                            <div className="review-card">
                                <p style={{ color: '#6b7280' }}>
                                    You have already reviewed this book. Use the <strong>Edit Review</strong> button on your review to update it.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleReviewSubmit} className="review-form">
                                <div>
                                    <label htmlFor="rating">Your Rating</label>
                                    <select name="rating" id="rating" className="rating-select" value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })} required>
                                        <option value="">Select Rating</option>
                                        <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
                                        <option value="4">⭐⭐⭐⭐ Very Good</option>
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
                                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                        required
                                    ></textarea>
                                </div>

                                <button type="submit" className="btnss btn-primary" style={{ width: 'auto', alignSelf: 'flex-start' }}>
                                    Submit Review
                                </button>
                            </form>
                        )}
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
                                <p>{recBook.name}</p>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {editingReviewId && (
                <div className="review-modal-backdrop" onClick={handleEditReviewCancel}>
                    <div
                        className="review-modal"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="edit-review-title"
                    >
                        <div className="review-modal-header">
                            <div>
                                <p className="review-modal-eyebrow">Update your feedback</p>
                                <h3 id="edit-review-title">Edit Review</h3>
                            </div>
                            <button
                                type="button"
                                className="review-modal-close"
                                onClick={handleEditReviewCancel}
                                aria-label="Close edit review modal"
                            >
                                ×
                            </button>
                        </div>

                        <div className="review-form">
                            <div>
                                <label htmlFor="edit-rating">Rating</label>
                                <select
                                    id="edit-rating"
                                    className="rating-select"
                                    value={editReviewForm.rating}
                                    onChange={(e) => setEditReviewForm({ ...editReviewForm, rating: e.target.value })}
                                >
                                    <option value="">Select Rating</option>
                                    <option value="5">5 - Excellent</option>
                                    <option value="4">4 - Very Good</option>
                                    <option value="3">3 - Good</option>
                                    <option value="2">2 - Fair</option>
                                    <option value="1">1 - Poor</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="edit-comment">Comment</label>
                                <textarea
                                    id="edit-comment"
                                    className="comment-textarea"
                                    value={editReviewForm.comment}
                                    onChange={(e) => setEditReviewForm({ ...editReviewForm, comment: e.target.value })}
                                ></textarea>
                            </div>

                            <div className="review-modal-actions">
                                <button
                                    type="button"
                                    className="btnss btn-primary"
                                    style={{ width: 'auto', alignSelf: 'flex-start' }}
                                    onClick={() => handleUpdateReview(editingReviewId)}
                                >
                                    Save Review
                                </button>
                                <button
                                    type="button"
                                    className="btnss btn-tertiary"
                                    onClick={handleEditReviewCancel}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProductDetails
