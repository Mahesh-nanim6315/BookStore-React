import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { hasPermission } from '../../utils/permissions'

const AdminSidebar = ({ user }) => {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const isDesktop = window.matchMedia('(min-width: 1025px)').matches
    const savedState = localStorage.getItem('sidebar')
    if (isDesktop && savedState === 'collapsed') {
      setCollapsed(true)
    }
  }, [])

  useEffect(() => {
    const wrapper = document.querySelector('.admin-wrapper')
    if (!wrapper) return

    wrapper.classList.toggle('collapsed', collapsed)
    wrapper.classList.toggle('sidebar-open', mobileOpen)
  }, [collapsed, mobileOpen])

  useEffect(() => {
    if (!mobileOpen) return

    const handleDocumentClick = (event) => {
      const insideSidebar = event.target.closest('.admin-sidebar')
      const clickedToggle = event.target.closest('#toggleBtn')
      if (!insideSidebar && !clickedToggle) {
        setMobileOpen(false)
      }
    }

    document.addEventListener('click', handleDocumentClick)
    return () => document.removeEventListener('click', handleDocumentClick)
  }, [mobileOpen])

  const toggleSidebar = () => {
    const isDesktop = window.matchMedia('(min-width: 1025px)').matches
    if (!isDesktop) {
      setMobileOpen((prev) => !prev)
      return
    }

    const newState = !collapsed
    setCollapsed(newState)
    localStorage.setItem('sidebar', newState ? 'collapsed' : 'expanded')
  }

  const isActive = (path) => {
    return location.pathname.startsWith(path)
  }

  const canAccessDashboard = hasPermission(user, 'access_dashboard')
  const canManageOrders = hasPermission(user, 'manage_orders')
  const canManagePayments = hasPermission(user, 'manage_payments')
  const canViewBooks = hasPermission(user, 'books.view')
  const canViewAuthors = hasPermission(user, 'authors.view')
  const canManageReviews = hasPermission(user, 'manage_reviews')
  const canViewUsers = hasPermission(user, 'users.view')
  const canManageNotifications = hasPermission(user, 'manage_notifications')
  const canManageRolesPermissions = hasPermission(user, 'manage_roles_permissions')
  const isAdmin = String(user?.role || '').toLowerCase() === 'admin'

  return (
    <>
      <aside id="sidebar" className={`sidebar admin-sidebar ${collapsed ? 'collapsed' : ''}`} aria-label="Admin navigation">
        <div className="sidebar-header">
          <Link to="/dashboard" className="sidebar-brand" aria-label="Go to dashboard">
            <span className="logo-mark">WR</span>
            <span className="brand">WellRead Admin</span>
          </Link>

          <button 
            id="toggleBtn"
            onClick={toggleSidebar}
            className="sidebar-toggle" 
            type="button" 
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} 
            aria-expanded={!collapsed}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
          </button>
        </div>

        <nav className="sidebar-nav">
          <p className="menu-title">Overview</p>
          <ul className="menu">
            {canAccessDashboard && (
              <li className={location.pathname === '/dashboard' ? 'active' : ''}>
                <Link to="/dashboard">
                  <span className="icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm10 8h8V11h-8v10zM3 21h8v-6H3v6zm10-18v6h8V3h-8z"></path></svg>
                  </span>
                  <span className="text">Dashboard</span>
                </Link>
              </li>
            )}
            {canManageOrders && (
              <li className={isActive('/dashboard/orders') ? 'active' : ''}>
                <Link to="/dashboard/orders">
                  <span className="icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M3 7h18v2H3V7zm2 4h14l-1.2 9H6.2L5 11zm4-8h6l1 2H8l1-2z"></path></svg>
                  </span>
                  <span className="text">Orders</span>
                </Link>
              </li>
            )}
            {canManagePayments && (
              <li className={isActive('/dashboard/payments') ? 'active' : ''}>
                <Link to="/dashboard/payments">
                  <span className="icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M3 6h18a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zm0 4h18M7 14h4"></path></svg>
                  </span>
                  <span className="text">Payments</span>
                </Link>
              </li>
            )}
          </ul>

          <p className="menu-title">Catalog</p>
          <ul className="menu">
            {canViewBooks && (
              <li className={isActive('/dashboard/books') ? 'active' : ''}>
                <Link to="/dashboard/books">
                  <span className="icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M4 5a2 2 0 0 1 2-2h11a3 3 0 0 1 3 3v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5zm2 0v13h12V6a1 1 0 0 0-1-1H6z"></path></svg>
                  </span>
                  <span className="text">Books</span>
                </Link>
              </li>
            )}
            {canViewAuthors && (
              <li className={isActive('/dashboard/authors') ? 'active' : ''}>
                <Link to="/dashboard/authors">
                  <span className="icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4zM6 14a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm10 1c-3.3 0-6 1.8-6 4v2h12v-2c0-2.2-2.7-4-6-4zM6 16c-2.8 0-5 1.4-5 3.1V21h7v-1.9A4.8 4.8 0 0 1 10 16z"></path></svg>
                  </span>
                  <span className="text">Authors</span>
                </Link>
              </li>
            )}
            {canManageReviews && (
              <li className={isActive('/dashboard/reviews') ? 'active' : ''}>
                <Link to="/dashboard/reviews">
                  <span className="icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M5 3h10l4 4v14H5V3zm9 1.5V8h3.5L14 4.5zM8 12h8v2H8v-2zm0 4h8v2H8v-2z"></path></svg>
                  </span>
                  <span className="text">Reviews</span>
                </Link>
              </li>
            )}
          </ul>

          <p className="menu-title">Administration</p>
          <ul className="menu">
            {canViewUsers && (
              <li className={isActive('/dashboard/users') ? 'active' : ''}>
                <Link to="/dashboard/users">
                  <span className="icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4zM6 14a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm10 1c-3.3 0-6 1.8-6 4v2h12v-2c0-2.2-2.7-4-6-4zM6 16c-2.8 0-5 1.4-5 3.1V21h7v-1.9A4.8 4.8 0 0 1 10 16z"></path></svg>
                  </span>
                  <span className="text">Users</span>
                </Link>
              </li>
            )}
            {canManageNotifications && (
              <li className={isActive('/dashboard/notifications') ? 'active' : ''}>
                <Link to="/dashboard/notifications">
                  <span className="icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22zm7-6V11a7 7 0 1 0-14 0v5l-2 2v1h18v-1l-2-2z"></path></svg>
                  </span>
                  <span className="text">Notifications</span>
                </Link>
              </li>
            )}
            {canManageRolesPermissions && (
              <li className={isActive('/dashboard/roles-permissions') ? 'active' : ''}>
                <Link to="/dashboard/roles-permissions">
                  <span className="icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M12 1l3 2 3.5-.5 1 3.4L23 8l-1.5 3 1.5 3-3.5 2.1-1 3.4L15 21l-3 2-3-2-3.5.5-1-3.4L1 14l1.5-3L1 8l3.5-2.1 1-3.4L9 3l3-2zm0 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"></path></svg>
                  </span>
                  <span className="text">Roles & Permissions</span>
                </Link>
              </li>
            )}
            {isAdmin && (
              <li className={isActive('/dashboard/settings') ? 'active' : ''}>
                <Link to="/dashboard/settings">
                  <span className="icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M19.4 13a7.8 7.8 0 0 0 .1-1 7.8 7.8 0 0 0-.1-1l2.1-1.6-2-3.4-2.5 1a7.8 7.8 0 0 0-1.7-1l-.4-2.7h-4l-.4 2.7a7.8 7.8 0 0 0 1.7 1l-2.5-1-2 3.4L4.6 11a7.8 7.8 0 0 0-.1 1 7.8 7.8 0 0 0 .1 1l-2.1 1.6 2 3.4 2.5-1a7.8 7.8 0 0 0 1.7 1l.4 2.7h4L.4-2.7a7.8 7.8 0 0 0 1.7-1l2.5 1 2-3.4L19.4 13zM12 15.5A3.5 3.5 0 0 1 1 15.5 12 3.5 3.5 0 0 1 12 15.5z"></path></svg>
                  </span>
                  <span className="text">Settings</span>
                </Link>
              </li>
            )}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <span className="footer-user">{user?.name || 'Admin'}</span>
          <span className="footer-role">Signed in</span>
        </div>
      </aside>
    </>
  )
}

export default AdminSidebar
