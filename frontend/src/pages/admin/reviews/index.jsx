import React from 'react'

const AdminReviewsIndex = () => {
  return (
    <div className="page">
{/*  */}
{/* 
 */}

<h2>Reviews Management</h2>

<form method="GET" className="filter-box">

    <input type="text"
           name="search"
           placeholder="Search by book or user"
           value="" />

    <select name="status">
        <option value="">All</option>
        <option value="0"
            >
            Pending
        </option>
        <option value="1"
            >
            Approved
        </option>
    </select>

    <button type="submit" className="btn-primary">Filter</button>
    <a href=""
       className="btn-secondary">Reset</a>
</form>

<hr />

<table className="table">
    <thead>
        <tr>
            <th>User</th>
            <th>Book</th>
            <th>Rating</th>
            <th>Comment</th>
            <th>Status</th>
            <th>Actions</th>
        </tr>
    </thead>

    <tbody>
{/*          */}
        <tr>
            <td></td>
            <td></td>
            <td>â­ /5</td>
            <td></td>
            <td>
{/*                  */}
                    <span style={{ color: 'green' }}>Approved</span>
{/*                  */}
                    <span style={{ color: 'red' }}>Pending</span>
{/*                  */}
            </td>

            <td>
                <form action=""
                      method="POST"
                      style={{ display: 'inline' }}>
{/*                      */}
{/*                      */}
                    <button type="submit">
                        
                    </button>
                </form>

                <form action=""
                      method="POST"
                      style={{ display: 'inline' }}>
{/*                      */}
{/*                      */}
                    <button type="submit">Delete</button>
                </form>
            </td>
        </tr>
{/*          */}
        <tr>
            <td colspan="6">No reviews found.</td>
        </tr>
{/*          */}
    </tbody>
</table>


{/* 
 */}
    </div>
  )
}

export default AdminReviewsIndex







