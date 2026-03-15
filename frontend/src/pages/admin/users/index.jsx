import React from 'react'

const AdminUsersIndex = () => {
  return (
    <div className="page">
{/*  */}
{/* 
 */}

<div className="page-header">
    <h2>Users</h2>
    <a href="" className="btn btn-primary">+ Add User</a>
</div>

<form method="GET" className="mysearch">
    <input type="text" name="search" placeholder="Search users..." value="" />
    <button id="bybtn" type="submit">Search</button>
</form>

<table className="table">
    <thead>
        <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Created</th>
            <th>Action</th>
        </tr>
    </thead>
    <tbody>
{/*          */}
        <tr>
            <td></td>
            <td></td>
            <td></td>
            <td>
                <span className="badge ">
                    
                </span>
            </td>
            <td>
                
            </td>
            <td></td>
            <td>
                <a href="">Edit</a>
                <form action="" method="POST" style={{ display: 'inline' }}>
{/*                      */}
{/*                      */}
                    <button onClick={() => {}}>Delete</button>
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

export default AdminUsersIndex







