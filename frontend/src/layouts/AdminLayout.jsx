import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import AdminNavbar from '../components/admin/AdminNavbar'
import AdminSidebar from '../components/admin/AdminSidebar'
import { getDashboardInfo } from '../api/auth'
import '../styles/admin.css'

const AdminLayout = () => {
  const [user, setUser] = useState(null)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const response = await getDashboardInfo()
        if (response.success) {
          setUser(response.data.user)
        }
      } catch (error) {
        console.error('Failed to load user info:', error)
      }
    }

    // Try to get user from localStorage first
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    } else {
      loadUserInfo()
    }
  }, [])

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen)
  }

  return (
    <div className="admin-wrapper">
      <AdminSidebar user={user} />
      
      <div className="main-content">
        <AdminNavbar user={user} />
        
        <div className="toast-container" id="admin-toast-container" aria-live="polite" aria-atomic="true">
          {/* Toast notifications will appear here */}
        </div>

        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
