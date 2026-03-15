import React from 'react'

const AdminBooksIndex = () => {
  return (
    <div className="page">
{/*  */}
{/* 
 */}
    <div className="page-header">
          <h2>Books</h2>
          <a href="" className="btn-primary">+ Add Book</a>  
    </div>

    
<hr />

<form method="GET" action="" className="filter-box">

    <input type="text" name="search"
        placeholder="Search book..."
        value="" />

    <select name="author">
        <option value="">All Authors</option>
{/*          */}
            <option value=""
                >
                
            </option>
{/*          */}
    </select>

    <select name="category">
        <option value="">All Categories</option>
{/*          */}
            <option value=""
                >
                
            </option>
{/*          */}
    </select>

    <select name="genre">
        <option value="">All Genres</option>
{/*          */}
            <option value=""
                >
                
            </option>
{/*          */}
    </select>

    <button type="submit" className="btn-primary">Filter</button>
    <a href="" className="btn-secondary">Reset</a>

</form>

<hr />


<table className="table">
    <thead>
        <tr>
            <th>Book Name</th>
            <th>Author</th>
            <th>Category</th>
            <th>Price</th>
            <th>Actions</th>
        </tr>
    </thead>
    <tbody>
{/*          */}
        <tr>
            <td></td>
            <td></td>
            <td></td>
            <td>$</td>
            <td style={{ display: 'flex' }}>
                <a href="">Edit</a>

                <form action=""
                      method="POST" style={{ display: 'inline' }}>
{/*                      */}
{/*                      */}
                    <button type="submit">Delete</button>
                </form>
            </td>
        </tr>
{/*          */}
    </tbody>
</table>


{/* 
 */}
    </div>
  )
}

export default AdminBooksIndex







