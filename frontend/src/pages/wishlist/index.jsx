import React from 'react'

const WishlistIndex = () => {
  return (
    <div className="page">
{/*  */}

<div className="wishlist-container" id="wishlist-section">
    <h2 className="wishlist-title" id="wishlist-heading">â¤ï¸ My Wishlist</h2>
{/* 
    ) */}
        <div className="wishlist-grid" id="wishlist-grid">
{/*              */}
                <div className="wishlist-item" id="wishlist-item-">
                    <img src="" 
                         alt="" 
                         className="wishlist-image" 
                         width="200" height="300" />

                    <h4 className="wishlist-book-title"></h4>
                    
                    <div className="wishlist-actions" id="wishlist-actions-">
{/*                          */}
                        <form action="" method="POST" className="wishlist-form">
{/*                              */}
                            <input type="hidden" name="format" value="ebook" />
                            <input type="hidden" name="price" value="" />
                            <button type="submit" className="wishlist-btn add-btn">ðŸ›’ Add</button>
                        </form>
{/*                          */}
                            <a href="" className="wishlist-btn login-btn">
                                Login to Add
                            </a>
{/*                          */}

                        <form action="" method="POST" className="wishlist-form">
{/*                              */}
{/*                              */}
                            <button className="wishlist-btn remove-btn" type="submit">Remove</button>
                        </form>
                    </div>
                </div>
{/*              */}
        </div>
{/*      */}
        <p className="wishlist-empty">Your wishlist is empty.</p>
{/*      */}
</div>
{/* 
 */}
    </div>
  )
}

export default WishlistIndex







