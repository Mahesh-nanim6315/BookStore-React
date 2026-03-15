import React from 'react'
import { Link, Outlet } from 'react-router-dom'

const AdminLayout = () => {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <h2>Admin</h2>
        <nav>
          <ul>
            <li><Link to="/admin">Dashboard</Link></li>
            <li><Link to="/admin/books">Books</Link></li>
            <li><Link to="/admin/authors">Authors</Link></li>
            <li><Link to="/admin/orders">Orders</Link></li>
            <li><Link to="/admin/users">Users</Link></li>
            <li><Link to="/admin/settings">Settings</Link></li>
          </ul>
        </nav>
      </aside>
      <section className="admin-content">
        <Outlet />
      </section>
    </div>
  )
}

export default AdminLayout
