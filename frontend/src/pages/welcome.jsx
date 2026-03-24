import React, { useEffect, useState } from 'react'
import { fetchHomeData } from '../api/books'
import Loader from '../components/common/Loader'
import Hero from '../components/Hero'
import CategoriesFilter from './categories/filter'
import Carousel from '../components/Carousel'
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
                // Set fallback data so the page still works
                setHomeData({
                    categories: [],
                    recently_viewed_books: [],
                    recent_books: [],
                    trending_books: []
                })
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    if (loading) {
        return <Loader />
    }

    return (
        <div className="page">
            <Hero />

            {homeData?.categories && (
                <CategoriesFilter categories={homeData.categories} />
            )}

            {homeData?.recently_viewed_books?.length > 0 && (
                <Carousel title="Recently Viewed" books={homeData.recently_viewed_books} />
            )}

            {homeData?.recent_books?.length > 0 && (
                <Carousel title="Recently Added" books={homeData.recent_books} />
            )}

            {homeData?.trending_books?.length > 0 && (
                <Carousel title="Top Trending" books={homeData.trending_books} />
            )}

            <Browse categories={homeData?.categories || []} />
        </div>
    )
}

export default Welcome







