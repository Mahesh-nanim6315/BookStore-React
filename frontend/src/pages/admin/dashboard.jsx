import React from 'react'
import { Link } from 'react-router-dom'

const AdminDashboard = () => {
  return (
    <div className="page">
      <div className="dashboard">
        <div className="stats">
          <div className="card">Orders<br /><strong>0</strong></div>
          <div className="card">Revenue<br /><strong>₹0</strong></div>
          <div className="card">Users<br /><strong>0</strong></div>
          <div className="card">Books<br /><strong>0</strong></div>
        </div>

        <hr />

        <h3>⚡ Quick Actions</h3>
        <div className="quick-actions">
          <Link to="/admin/books/create" className="quick-card">➕ Add Book</Link>
          <Link to="/admin/authors" className="quick-card">➕ Add Author</Link>
          <Link to="/admin/users" className="quick-card">👥 Manage Users</Link>
          <Link to="/admin/orders" className="quick-card">📦 View Orders</Link>
        </div>

        <div className="chart-alerts">
          <div className="chart-box">
            <p>Sales chart placeholder.</p>
          </div>

          <div className="alerts">
            <h3>⚠ Low Stock Alerts</h3>
            <div className="alert-box">
              <div className="alert-item">📕 <span className="stock-count">Stock: 0</span></div>
            </div>
            <p>All books have sufficient stock 👍</p>
          </div>
        </div>

        <hr />

        <div className="card-section">
          <h3 className="section-title">🏆 Top Selling Books</h3>
          <div className="card-box">
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Total Sold</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="2" className="empty-data">No sales data yet.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3>🕒 Recent Orders</h3>
          <table className="table">
            <thead>
              <tr>
                <th>#ID</th>
                <th>User</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="6">No recent orders found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard




