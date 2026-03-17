import React from 'react'
import { Link } from 'react-router-dom'

const Hero = () => {
  return (
    <div className="hero-slider">
      <div className="hero-slide slide-1"></div>
      <div className="hero-slide slide-2"></div>
      <div className="hero-slide slide-3"></div>
      <div className="hero-slide slide-4"></div>
     
      <div className="hero-content">
        <h1>WellRead Book Store Online</h1>
        <p>Let's Shop Together</p>
        <Link to="/products">
          <button>Explore Here</button>
        </Link>
      </div>
    </div>
  )
}

export default Hero
