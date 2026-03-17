import React, { useEffect, useState } from 'react'
import { fetchPaperbacks } from '../api/books'
import PartialsCarousel from './partials/carousel'

const Paperbacks = () => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const loadPaperbacks = async () => {
            try {
                setLoading(true)
                const response = await fetchPaperbacks()
                setData(response.data)
            } catch (error) {
                console.error("Failed to fetch paperbacks", error)
                setError('Failed to load paperbacks')
            } finally {
                setLoading(false)
            }
        }

        loadPaperbacks()
    }, [])

    if (loading) {
        return (
            <div className="page" style={{ padding: '2rem', textAlign: 'center' }}>
                Loading paperbacks...
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

    if (!data) {
        return (
            <div className="page" style={{ padding: '2rem', textAlign: 'center' }}>
                No paperbacks data available.
            </div>
        )
    }

    return (
        <div className="page">
            <header className="page-header">
                <h2 className="page-titles">Paperback Books</h2>
            </header>

            {data.drama && data.drama.length > 0 && (
                <PartialsCarousel title="Drama" books={data.drama} />
            )}

            {data.thriller && data.thriller.length > 0 && (
                <PartialsCarousel title="Thriller" books={data.thriller} />
            )}

            {data.social && data.social.length > 0 && (
                <PartialsCarousel title="Social" books={data.social} />
            )}

            {data.family && data.family.length > 0 && (
                <PartialsCarousel title="Family" books={data.family} />
            )}

            {data.romance && data.romance.length > 0 && (
                <PartialsCarousel title="Romance" books={data.romance} />
            )}

            {data.humor && data.humor.length > 0 && (
                <PartialsCarousel title="Humor" books={data.humor} />
            )}

            {data.horror && data.horror.length > 0 && (
                <PartialsCarousel title="Horror" books={data.horror} />
            )}

            {data.historical && data.historical.length > 0 && (
                <PartialsCarousel title="Historical" books={data.historical} />
            )}

            {(!data.drama || data.drama.length === 0) && 
             (!data.thriller || data.thriller.length === 0) && 
             (!data.social || data.social.length === 0) && 
             (!data.family || data.family.length === 0) && 
             (!data.romance || data.romance.length === 0) && 
             (!data.humor || data.humor.length === 0) && 
             (!data.horror || data.horror.length === 0) && 
             (!data.historical || data.historical.length === 0) && (
                <p style={{ textAlign: 'center', padding: '2rem' }}>No paperback books found.</p>
            )}
        </div>
    )
}

export default Paperbacks
