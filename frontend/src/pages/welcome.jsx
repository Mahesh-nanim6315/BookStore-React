import React, { useEffect, useState } from 'react'
import { fetchHomeData } from '../api/books'
import Hero from './hero'
import CategoriesFilter from './categories/filter'
import PartialsCarousel from './partials/carousel'
import Browse from './browse'

const Welcome = () => {
    const [homeData, setHomeData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await fetchHomeData()
                setHomeData(response.data)
            } catch (error) {
                console.error("Failed to fetch home data", error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    if (loading) return <div className="page" style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>

    return (
        <div className="page">
            <Hero />

            {homeData?.categories && (
                <CategoriesFilter categories={homeData.categories} />
            )}

            {homeData?.recently_viewed_books?.length > 0 && (
                <PartialsCarousel title="Recently Viewed" books={homeData.recently_viewed_books} />
            )}

            {homeData?.recent_books?.length > 0 && (
                <PartialsCarousel title="Recently Added" books={homeData.recent_books} />
            )}

            {homeData?.trending_books?.length > 0 && (
                <PartialsCarousel title="Top Trending" books={homeData.trending_books} />
            )}

            <Browse categories={homeData?.categories || []} />
        </div>
    )
}

export default Welcome







