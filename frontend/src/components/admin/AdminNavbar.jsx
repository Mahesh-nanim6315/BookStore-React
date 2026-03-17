import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const AdminNavbar = ({ user }) => {
  const { logout } = useAuth()
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [theme, setTheme] = useState('light')
  const [notifications, setNotifications] = useState([])
  const navigate = useNavigate()
  const notifyRef = useRef(null)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light'
    setTheme(savedTheme)
    document.body.classList.toggle('dark-mode', savedTheme === 'dark')
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.body.classList.toggle('dark-mode', newTheme === 'dark')
  }

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen)
  }

  const closeNotifications = () => {
    setNotificationsOpen(false)
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const userName = user?.name || 'Admin'
  const userInitial = userName.charAt(0).toUpperCase()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifyRef.current && !notifyRef.current.contains(event.target)) {
        closeNotifications()
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <nav className="topbar" aria-label="Admin top navigation">
      <div className="topbar-left">
        <button id="mobileSidebarToggle" className="icon-btn mobile-sidebar-btn" type="button" aria-label="Open sidebar">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 6h18M3 12h18M3 18h18" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2"></path>
          </svg>
        </button>

        <div>
          <h2 id="dash" className="page-title">Admin Dashboard</h2>
          <p className="page-subtitle">Manage catalog, orders, and operations</p>
        </div>
      </div>

      <div className="topbar-right">
        <button 
          onClick={toggleTheme}
          className={`icon-btn theme-btn ${theme === 'dark' ? 'is-dark' : ''}`} 
          type="button" 
          aria-label={theme === 'dark' ? 'Enable light mode' : 'Enable dark mode'} 
          aria-pressed={theme === 'dark' ? 'true' : 'false'}
        >
          <svg className="icon-moon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.7 14.1A9 9 0 0 1 9.9 3.3a9 9 0 0 0 10.8 10.8z"></path>
          </svg>
          <svg className="icon-sun" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 17a5 5 0 1 1 5-5 5 5 0 0 1-5 5zm0-14v3m0 12v3M4.2 4.2l2.1 2.1m11.4 11.4l2.1 2.1M3 12h3m12 0h3M4.2 19.8l2.1-2.1m11.4-11.4l2.1-2.1" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2"></path>
          </svg>
        </button>

        <div className="notify-dropdown" ref={notifyRef}>
          <button 
            onClick={toggleNotifications}
            className="icon-btn notify-trigger" 
            type="button" 
            aria-haspopup="true" 
            aria-expanded={notificationsOpen ? 'true' : 'false'}
            aria-controls="notifyMenu"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22zm7-6V11a7 7 0 1 0-14 0v5l-2 2v1h18v-1l-2-2z"></path>
            </svg>
            {unreadCount > 0 && (
              <span className="badge">{unreadCount}</span>
            )}
          </button>

          <ul 
            id="notifyMenu" 
            className={`topbar-dropdown notify-menu ${notificationsOpen ? '' : 'hidden'}`}
          >
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <li key={notification.id}>
                  <a 
                    href={notification.url || '#'} 
                    className={notification.read_at ? '' : 'unread'}
                  >
                    {notification.message}
                  </a>
                </li>
              ))
            ) : (
              <li className="empty">No notifications</li>
            )}

            <li className="divider"></li>
            <li>
              <Link to="/admin/notifications" className="view-all">View all notifications</Link>
            </li>
          </ul>
        </div>

        <div className="user-chip" title={userName}>
          <span className="avatar">{userInitial}</span>
          <span className="username">{userName}</span>
        </div>

        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
    </nav>
  )
}

export default AdminNavbar
