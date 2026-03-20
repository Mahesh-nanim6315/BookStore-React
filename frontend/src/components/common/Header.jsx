import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext.jsx'
import { CART_UPDATED_EVENT, getCart } from '../../api/cart'
import searchIcon from '../../assets/search-icon.png'
import languageIcon from '../../assets/lang-icon.png'

const primaryLinks = [
  { to: '/', labelKey: 'site.home' },
  { to: '/products', labelKey: 'site.browse' },
  { to: '/ebooks', labelKey: 'site.ebooks' },
  { to: '/audiobooks', labelKey: 'site.audiobooks' },
  { to: '/paperbacks', labelKey: 'site.paperbacks' },
  { to: '/authors', labelKey: 'site.authors' },
]

const accountLinks = [
  { to: '/profile', labelKey: 'site.profile' },
  { to: '/orders', labelKey: 'site.orders' },
  { to: '/wishlist', labelKey: 'site.wishlist' },
  { to: '/my-library', labelKey: 'site.library' },
  { to: '/plans', labelKey: 'site.subscriptions' },
]

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const { language, changeLanguage, t } = useLanguage()
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
    const handleCartUpdated = () => {
      if (isAuthenticated) {
        loadCartCount()
      }
    }

    window.addEventListener(CART_UPDATED_EVENT, handleCartUpdated)

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdated)
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
              <strong>{t('brand.name')}</strong>
              <span>{t('brand.tagline')}</span>
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
                  {t(link.labelKey)}
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
              title="Search"
              aria-expanded={searchOpen}
            >
              <img src={searchIcon} alt="" className="site-control__icon" />
            </button>

            <label className="site-language site-language--icon" title="Language">
              <img src={languageIcon} alt="" className="site-control__icon" />
              <span className="site-language__sr">Language</span>
              <select
                className="site-language__select"
                value={language}
                aria-label="Change language"
                onChange={(event) => {
                  changeLanguage(event.target.value)
                }}
              >
                <option value="en">{t('language.english')}</option>
                <option value="hi">{t('language.hindi')}</option>
                <option value="ta">{t('language.tamil')}</option>
                <option value="te">{t('language.telugu')}</option>
              </select>
            </label>

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
                        {t(link.labelKey)}
                      </Link>
                    ))}
                    <button type="button" onClick={handleLogout} className="site-account__logout">
                      {t('site.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="site-login">
                {t('site.signIn')}
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
              placeholder={t('site.searchPlaceholder')}
              className="site-search-panel__input"
              autoFocus
            />
            <button type="submit" className="site-search-panel__button">
              {t('site.search')}
            </button>
          </form>
        </div>
      )}
      </div>
    </header>
  )
}

export default Header
