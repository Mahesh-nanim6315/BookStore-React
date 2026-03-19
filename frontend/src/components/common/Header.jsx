import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { getCart } from '../../api/cart'

const primaryLinks = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Browse' },
  { to: '/ebooks', label: 'Ebooks' },
  { to: '/audiobooks', label: 'Audiobooks' },
  { to: '/paperbacks', label: 'Paperbacks' },
  { to: '/authors', label: 'Authors' },
]

const accountLinks = [
  { to: '/profile', label: 'Profile' },
  { to: '/orders', label: 'Orders' },
  { to: '/wishlist', label: 'Wishlist' },
  { to: '/my-library', label: 'Library' },
  { to: '/plans', label: 'Subscriptions' },
]

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const [cartCount, setCartCount] = useState(0)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const searchPanelRef = useRef(null)

  useEffect(() => {
    if (isAuthenticated) {
      loadCartCount()
    } else {
      setCartCount(0)
    }
  }, [isAuthenticated])

  useEffect(() => {
    setMobileMenuOpen(false)
    setShowUserDropdown(false)
    setSearchOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!searchPanelRef.current?.contains(event.target)) {
        setSearchOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSearchOpen(false)
        setShowUserDropdown(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

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

  const handleSearch = (event) => {
    event.preventDefault()
    const formData = new FormData(event.target)
    const searchQuery = formData.get('search')
    if (searchQuery) {
      setSearchOpen(false)
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const activeSection = useMemo(() => {
    if (location.pathname.startsWith('/products')) return '/products'
    if (location.pathname.startsWith('/ebooks')) return '/ebooks'
    if (location.pathname.startsWith('/audiobooks')) return '/audiobooks'
    if (location.pathname.startsWith('/paperbacks')) return '/paperbacks'
    if (location.pathname.startsWith('/authors')) return '/authors'
    return location.pathname
  }, [location.pathname])

  const initials = user?.name
    ? user.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || '')
        .join('')
    : 'GU'

  return (
    <header className="site-header">
      <div ref={searchPanelRef}>
      <nav className="site-nav">
        <div className="site-nav__brand">
          <Link to="/" className="brand-mark" aria-label="Bookstore home">
            <img src="/images/booklogo.png" width="42" height="34" alt="Bookstore" />
            <div className="brand-copy">
              <strong>BookSphere</strong>
              <span>Digital bookstore</span>
            </div>
          </Link>

          <button
            className="site-nav__toggle"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label="Toggle navigation"
            aria-expanded={mobileMenuOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        <div className={`site-nav__panel ${mobileMenuOpen ? 'site-nav__panel--open' : ''}`}>
          <ul className="site-nav__links">
            {primaryLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={activeSection === link.to ? 'site-link site-link--active' : 'site-link'}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="site-nav__actions">
            <button
              type="button"
              className={`site-search-toggle ${searchOpen ? 'site-search-toggle--active' : ''}`}
              onClick={() => setSearchOpen((open) => !open)}
              aria-label="Open search"
              aria-expanded={searchOpen}
            >
              Search
            </button>

            <select
              className="site-language"
              defaultValue=""
              onChange={(event) => {
                if (event.target.value) {
                  window.location.href = event.target.value
                }
              }}
            >
              <option value="">Language</option>
              <option value="/lang/en">English</option>
              <option value="/lang/hi">Hindi</option>
              <option value="/lang/ta">Tamil</option>
              <option value="/lang/te">Telugu</option>
            </select>

            <Link to="/cart" className="site-cart" aria-label="Cart">
              <span className="site-cart__icon">Cart</span>
              {cartCount > 0 && <span className="site-cart__count">{cartCount}</span>}
            </Link>

            {isAuthenticated ? (
              <div className="site-account">
                <button
                  type="button"
                  className="site-account__trigger"
                  onClick={() => setShowUserDropdown((open) => !open)}
                >
                  <span className="site-account__avatar">{initials}</span>
                  <span className="site-account__copy">
                    <strong>{user?.name || 'Account'}</strong>
                    <small>{user?.plan || 'free'} plan</small>
                  </span>
                </button>

                {showUserDropdown && (
                  <div className="site-account__menu">
                    {accountLinks.map((link) => (
                      <Link key={link.to} to={link.to} className="site-account__link">
                        {link.label}
                      </Link>
                    ))}
                    <button type="button" onClick={handleLogout} className="site-account__logout">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="site-login">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </nav>
      {searchOpen && (
        <div className="site-search-panel">
          <form onSubmit={handleSearch} className="site-search-panel__form">
            <input
              type="text"
              name="search"
              placeholder="Search books, authors, categories, formats"
              className="site-search-panel__input"
              autoFocus
            />
            <button type="submit" className="site-search-panel__button">
              Search
            </button>
          </form>
        </div>
      )}
      </div>
    </header>
  )
}

export default Header
