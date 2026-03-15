import React from 'react'

const AdminAuthorsIndex = () => {
  return (
    <div className="page">
{/*  */}
{/* 
 */}

<div className="page-header">
    <h2>Authors</h2>
    <a href="" className="btn-primary">
        + Add Author
    </a>
</div>

<form method="GET" action="" className="filter-box">

    <input type="text"
           name="search"
           placeholder="Search author..."
           value="" />

    <input type="number"
           name="min_books"
           placeholder="Min books"
           value=""
           min="0" />

    <button type="submit" className="btn-primary">Filter</button>

    <a href=""
       className="btn-secondary">Reset</a>

</form>

<hr />

<table className="table">
    <thead>
        <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Total Books</th>
            <th>Bio</th>
            <th>Actions</th>
        </tr>
    </thead>

    <tbody>
{/*          */}
        <tr>
            <td>
{/*                  */}
                    <img src="" width="60" />
{/*                  */}
            </td>

            <td></td>

             <td>
                <strong></strong>
            </td>

            <td></td>

            <td style={{ display: 'flex' }}>
                <a href="">View</a>
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

export default AdminAuthorsIndex







