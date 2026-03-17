// API Service Index - Central export point for all API functions
import axiosClient from './axiosClient'
import * as auth from './auth'
import * as books from './books'
import * as orders from './orders'
import * as cart from './cart'
import * as categories from './categories'
import * as profile from './profile'
import * as library from './library'
import * as reviews from './reviews'
import * as wishlist from './wishlist'
import * as checkout from './checkout'
import * as lookups from './lookups'

// Default export for api
export default {
  // HTTP Client
  axiosClient,
  
  // Auth API
  ...auth,
  
  // Books API
  ...books,
  
  // Orders API
  ...orders,
  
  // Cart API
  ...cart,
  
  // Categories API
  ...categories,
  
  // Profile API
  ...profile,
  
  // Library API
  ...library,
  
  // Reviews API
  ...reviews,
  
  // Wishlist API
  ...wishlist,
  
  // Checkout API
  ...checkout,
  
  // Lookups API
  ...lookups,
  
  // Dashboard API
  getDashboardInfo: async () => {
    const { data } = await axiosClient.get('/dashboard')
    return data
  }
}
