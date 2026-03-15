import React from 'react'

const CategoryBooks = () => {
  return (
    <div className="page">
{/*  */}

<h2 className="page-titles">
     Books
</h2>

<div className="book-grid">
{/*      */}
        <div className="book-card">
              <a href="">
                   <img src="" alt="" className="book-image" />
              </a>
            <h4 className="book-title"></h4>
{/*              */}
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#b45309', background: '#fef3c7', padding: '3px 8px', borderRadius: '999px' }}>
                    Premium
                </span>
{/*              */}
        </div>
{/*      */}
        <p className="no-books">No books found.</p>
{/*      */}
</div>

<div className="pagination">
    
</div>
{/* 
 */}
    </div>
  )
}

export default CategoryBooks







