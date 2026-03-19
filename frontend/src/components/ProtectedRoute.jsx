import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { hasPermission } from '../utils/permissions'
import Loader from './common/Loader'

const ProtectedRoute = ({ children, adminOnly = false, requiredPermission = null, requiredRole = null }) => {
  const { isAuthenticated, user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <Loader />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (adminOnly && String(user?.role || '').toLowerCase() !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  if (requiredRole && String(user?.role || '').toLowerCase() !== String(requiredRole).toLowerCase()) {
    return <Navigate to="/" replace />
  }

  if (requiredPermission && !hasPermission(user, requiredPermission)) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
