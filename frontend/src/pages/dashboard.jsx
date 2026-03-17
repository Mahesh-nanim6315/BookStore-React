import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const Dashboard = () => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    window.location.href = '/'
  }

  return (
    <div className="page">
      <div className="container-show" style={{ marginTop: '120px' }}>
        <div className="welcome-section">
          <h1>Welcome back, {user?.name || 'User'}!</h1>
          <p>Here's your personal dashboard</p>
        </div>

        <hr />

        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>📚 My Library</h3>
            <p>Books you own</p>
            <Link to="/my-library" className="btn-primary">View Library</Link>
          </div>

          <div className="stat-card">
            <h3>🛒 Cart</h3>
            <p>Items in cart</p>
            <Link to="/cart" className="btn-primary">View Cart</Link>
          </div>

          <div className="stat-card">
            <h3>❤️ Wishlist</h3>
            <p>Saved books</p>
            <Link to="/wishlist" className="btn-primary">View Wishlist</Link>
          </div>

          <div className="stat-card">
            <h3>📦 Orders</h3>
            <p>Order history</p>
            <Link to="/orders" className="btn-primary">View Orders</Link>
          </div>
        </div>

        <hr />

        <div className="quick-actions">
          <h3>⚡ Quick Actions</h3>
          <div className="action-grid">
            <Link to="/products" className="action-card">
              <h4>📖 Browse Books</h4>
              <p>Discover new books</p>
            </Link>

            <Link to="/ebooks" className="action-card">
              <h4>📱 E-books</h4>
              <p>Digital books</p>
            </Link>

            <Link to="/audiobooks" className="action-card">
              <h4>🎧 Audiobooks</h4>
              <p>Listen to books</p>
            </Link>

            <Link to="/paperbacks" className="action-card">
              <h4>📕 Paperbacks</h4>
              <p>Physical books</p>
            </Link>

            <Link to="/authors" className="action-card">
              <h4>✍️ Authors</h4>
              <p>Meet authors</p>
            </Link>

            <Link to="/profile" className="action-card">
              <h4>👤 Profile</h4>
              <p>Edit your info</p>
            </Link>
          </div>
        </div>

        <hr />

        <div className="recent-activity">
          <h3>📊 Recent Activity</h3>
          <div className="activity-list">
            <div className="activity-item">
              <span className="activity-icon">📚</span>
              <div className="activity-content">
                <p>Welcome to your dashboard!</p>
                <small>Just now</small>
              </div>
            </div>
            
            <div className="activity-item">
              <span className="activity-icon">👋</span>
              <div className="activity-content">
                <p>You've successfully logged in</p>
                <small>Just now</small>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-footer">
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
