import React from 'react'

const PartialsCarousel = () => {
  return (
    <div className="page">
{/*   */}
<section className="carousel-section">

 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2></h2>
{/* 
         && $category) */}
            <a href=""
               className="view-all-btn">
                View All
            </a>
{/*          */}
    </div>

    <div className="carousel-wrapper">
        <button className="nav-btn left" onClick={() => {}}>â®</button>

        <div className="carousel-track">
{/*              */}
                <div className="carousel-card">
                    <a href="">
                        <img src="" width="200" height="200" />
                        <p className="card-title"></p>
                    </a>
{/*                      */}
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#b45309', background: '#fef3c7', padding: '3px 8px', borderRadius: '999px' }}>
                            Premium
                        </span>
{/*                      */}
                </div>
{/*              */}

        </div>

        <button className="nav-btn right" onClick={() => {}}>â¯</button>
    </div>
</section>
    </div>
  )
}

export default PartialsCarousel







