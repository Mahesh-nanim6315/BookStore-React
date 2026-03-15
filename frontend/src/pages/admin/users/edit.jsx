import React from 'react'

const AdminUsersEdit = () => {
  return (
    <div className="page">
{/*  */}
{/* 
 */}
<h2>Edit User</h2>

<form action="" method="POST" className="form-box">
{/*      */}
{/*      */}

    <label>Name</label>
    <input type="text" name="name" value="" required />

    <label>Email</label>
    <input type="email" name="email" value="" required />

    <label>New Password (optional)</label>
    <input type="password" name="password" />

    <label>Role</label>
    <select name="role" required>
        <option value="user" >User</option>
        <option value="admin" >Admin</option>
        <option value="manager" >Manager</option>
        <option value="staff" >Staff</option>
    </select>

    <button type="submit" className="btn-primary">Update User</button>
</form>
{/*  */}
    </div>
  )
}

export default AdminUsersEdit







