import React, { createContext, useContext, useState, useEffect } from 'react'
import { login as loginApi, register as registerApi, logout as logoutApi, getUser } from '../api/auth'
import { normalizeApiErrors } from '../utils/formErrors'
import { clearAuthSession, getStoredToken, setAuthSession, updateStoredUser } from '../utils/authStorage'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = getStoredToken()
    if (token) {
      loadUser()
    } else {
      setLoading(false)
    }
  }, [])

  const loadUser = async () => {
    try {
      const response = await getUser()
      if (response.success) {
        const currentUser = response.user || response.data
        setUser(currentUser)
        setIsAuthenticated(true)
        updateStoredUser(currentUser)
      }
    } catch (error) {
        console.error('Failed to load user:', error)
      clearAuthSession()
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      const response = await loginApi(credentials)
      
      if (response.success) {
        setAuthSession({
          token: response.token,
          user: response.user,
          persist: Boolean(credentials.remember),
        })
        setUser(response.user)
        setIsAuthenticated(true)
        return { success: true, user: response.user }
      } else {
        return { success: false, errors: response.errors }
      }
    } catch (error) {
      console.error('Login failed:', error)
      return { success: false, errors: normalizeApiErrors(error, 'Network error. Please try again.') }
    }
  }

  const register = async (userData) => {
    try {
      const response = await registerApi(userData)

      if (response.success) {
        setAuthSession({
          token: response.token,
          user: response.user,
          persist: true,
        })
        setUser(response.user)
        setIsAuthenticated(true)
        return { success: true, user: response.user }
      } else {
        return { success: false, errors: response.errors }
      }
    } catch (error) {
      console.error('Registration failed:', error)
      return { success: false, errors: normalizeApiErrors(error, 'Network error. Please try again.') }
    }
  }

  const logout = async () => {
    try {
      await logoutApi()
    } catch (error) {
      console.error('Logout API failed:', error)
    } finally {
      clearAuthSession()
      setUser(null)
      setIsAuthenticated(false)
    }
  }

  const updateUser = (userData) => {
    setUser(userData)
    updateStoredUser(userData)
  }

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    loadUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
