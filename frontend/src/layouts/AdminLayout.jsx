import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
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
          localStorage.setItem('user', JSON.stringify(response.data.user))
        }
      } catch (error) {
        console.error('Failed to load user info:', error)
      }
    }

    // Try to get user from localStorage first
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }

    loadUserInfo()
  }, [])

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen)
  }

  return (
    <div className={`admin-wrapper ${mobileSidebarOpen ? 'sidebar-open' : ''}`}>
      <AdminSidebar user={user} mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />
      
      <div className="main-content">
        <AdminNavbar user={user} onToggleSidebar={toggleMobileSidebar} />
        
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />

        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
