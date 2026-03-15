import React from 'react'
import { Link } from 'react-router-dom'

const Header = () => {
  return (
    <header>
      <nav>
        <div className="pair">
          <img src="/images/booklogo.png" width="70" height="40" alt="Bookstore" />
          <form className="search-form">
            <input type="text" placeholder="Search books" className="search" />
            <button type="button" className="search-btn" aria-label="Search">
              <i className="fas fa-search"></i>
            </button>
          </form>
          <button className="hamburger" aria-label="Toggle Menu">&#9776;</button>
        </div>

        <ul id="navMenu">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/ebooks">Ebooks</Link></li>
          <li><Link to="/audiobooks">Audiobooks</Link></li>
          <li><Link to="/paperbacks">Paperback Books</Link></li>
          <li><Link to="/products">Top Books</Link></li>
          <li><Link to="/authors">Authors</Link></li>
          <li><Link to="/my-library">My Library</Link></li>
        </ul>

        <div className="parent">
          <div className="child">
            <Link to="/cart" className="cart-link">
              <div className="cart-wrapper">
                <img src="/images/shopping-cart.png" width="45" height="45" className="cart-icon" alt="Cart" />
              </div>
            </Link>
          </div>

          <div className="child login-icon">
            <Link to="/login">
              <button className="login-btn">Login</button>
            </Link>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Header
