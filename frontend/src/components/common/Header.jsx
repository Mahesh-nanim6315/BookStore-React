import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { getCart } from '../../api/cart'

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const [cartCount, setCartCount] = useState(0)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      loadCartCount()
    }
  }, [isAuthenticated])

  const loadCartCount = async () => {
    try {
      const response = await getCart()
      const count = response.data?.cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
      setCartCount(count)
    } catch (error) {
      console.error('Failed to load cart count:', error)
    }
  }

  const handleLogout = async () => {
    await logout()
    setShowUserDropdown(false)
    navigate('/')
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const searchQuery = formData.get('search')
    if (searchQuery) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <header className="site-header">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <nav>
        <div className="pair">
          <Link to="/">
            <img src="/images/booklogo.png" width="50px" height="40px" alt="Bookstore" />
          </Link>
          <form onSubmit={handleSearch} className="search-form">
            <input 
              type="text" 
              name="search" 
              placeholder="Search books..." 
              className="search" 
              id="searchInput"
            />
            <button type="submit" className="search-btn" aria-label="Search">
              <i className="fas fa-search"></i>
            </button>
          </form>
          <button 
            className="hamburger" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            &#9776;
          </button>
        </div>

        <ul id="navMenu" className={mobileMenuOpen ? 'mobile-open' : ''}>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/ebooks">Ebooks</Link></li>
          <li><Link to="/audiobooks">Audiobooks</Link></li>
          <li><Link to="/paperbacks">Paperback Books</Link></li>
          <li><Link to="/products">Top Books</Link></li>
          <li><Link to="/authors">Authors</Link></li>
          <li><Link to="/my-library">My Library</Link></li>
        </ul>

        <select className="lang-switcher" onChange={(e) => window.location.href = e.target.value}>
          <option value="">Language</option>
          <option value="/lang/en">English</option>
          <option value="/lang/hi">हिन्दी</option>
          <option value="/lang/ta">தமிழ்</option>
          <option value="/lang/te">తెలుగు</option>
        </select>

        <div className="parent">
          <div className="child">
            <Link to="/cart" className="cart-link">
              <div className="cart-wrapper">
                <img src="/images/shopping-cart.png" width="45" height="45" className="cart-icon" alt="Cart" />
                {cartCount > 0 && (
                  <span 
                    className="cart-count-badge" 
                    style={{
                      backgroundColor: 'red', 
                      color: 'white', 
                      borderRadius: '50%', 
                      padding: '2px 6px', 
                      fontSize: '12px', 
                      position: 'absolute', 
                      top: '7px', 
                      right: '93px'
                    }}
                  >
                    {cartCount}
                  </span>
                )}
              </div>
            </Link>
          </div>

          <div className="child login-icon">
            {isAuthenticated ? (
              <div className="user-dropdown">
                <button 
                  className="user-icon-btn"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                >
                  <i className="fas fa-user-circle"></i>
                </button>
                {showUserDropdown && (
                  <div className="user-dropdown-menu">
                    <Link to="/wishlist" className="dropdown-item" onClick={() => setShowUserDropdown(false)}>
                      <i className="fas fa-heart"></i> My Wishlist
                    </Link>
                    <Link to="/profile" className="dropdown-item" onClick={() => setShowUserDropdown(false)}>
                      <i className="fas fa-user"></i> My Profile
                    </Link>
                    <Link to="/plans" className="dropdown-item" onClick={() => setShowUserDropdown(false)}>
                      <i className="fas fa-crown"></i> Subscriptions
                    </Link>
                    <Link to="/orders" className="dropdown-item" onClick={() => setShowUserDropdown(false)}>
                      <i className="fas fa-shopping-bag"></i> My Orders
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button onClick={handleLogout} className="dropdown-item logout-btn">
                      <i className="fas fa-sign-out-alt"></i> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login">
                <button className="login-btn">Login</button>
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Header
