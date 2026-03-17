import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDashboardStats, getDashboardInfo } from '../../api/auth'
import SalesChart from '../../components/admin/SalesChart'
import Loader from '../../components/common/Loader'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    totalBooks: 0,
    chartData: {
      months: [],
      sales: []
    },
    recentOrders: [],
    lowStockBooks: [],
    topSellingBooks: []
  })
  const [dashboardInfo, setDashboardInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [statsResponse, infoResponse] = await Promise.all([
          getDashboardStats(),
          getDashboardInfo()
        ])
        
        if (statsResponse.success) {
          setStats(statsResponse.data)
        }
        
        if (infoResponse.success) {
          setDashboardInfo(infoResponse.data)
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadDashboardData()
  }, [])

  if (loading) {
    return <Loader />
  }

  return (
    <div className="dashboard">
      <div className="stats">
        <div className="card">
          Orders<br />
          <strong>{stats.totalOrders}</strong>
        </div>

        <div className="card">
          Revenue<br />
          <strong>₹{Number(stats.totalRevenue).toLocaleString()}</strong>
        </div>

        <div className="card">
          Users<br />
          <strong>{stats.totalUsers}</strong>
        </div>

        <div className="card">
          Books<br />
          <strong>{stats.totalBooks}</strong>
        </div>
      </div>

      <hr />

      <h3>⚡ Quick Actions</h3>

      <div className="quick-actions">
        <Link to="/admin/books/create" className="quick-card">
          ➕ Add Book
        </Link>

        <Link to="/admin/authors/create" className="quick-card">
          ➕ Add Author
        </Link>

        <Link to="/admin/users" className="quick-card">
          👥 Manage Users
        </Link>

        <Link to="/admin/orders" className="quick-card">
          📦 View Orders
        </Link>
      </div>

      <div className="chart-alerts">
        <div className="chart-box">
          <SalesChart months={stats.chartData.months} sales={stats.chartData.sales} />
        </div>

        <div className="alerts">
          <h3>⚠ Low Stock Alerts</h3>
          {stats.lowStockBooks && stats.lowStockBooks.length > 0 ? (
            <div className="alert-box">
              {stats.lowStockBooks.map((book, index) => (
                <div key={index} className="alert-item">
                  📕 {book.name}
                  <span className="stock-count">Stock: {book.stock}</span>
                </div>
              ))}
            </div>
          ) : (
            <p>All books have sufficient stock 👍</p>
          )}
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
              {stats.topSellingBooks && stats.topSellingBooks.length > 0 ? (
                stats.topSellingBooks.map((item, index) => (
                  <tr key={index}>
                    <td>{item.book?.name || 'Book Removed'}</td>
                    <td>
                      <span className="badge-sales">
                        {item.total_sold}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="empty-data">
                    No sales data yet.
                  </td>
                </tr>
              )}
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
            {stats.recentOrders && stats.recentOrders.length > 0 ? (
              stats.recentOrders.map((order, index) => (
                <tr key={index}>
                  <td>#{order.id}</td>
                  <td>{order.user?.name || 'Guest'}</td>
                  <td>₹{order.total_amount}</td>
                  <td>
                    <span className="status-badge">
                      {order.status || 'Pending'}
                    </span>
                  </td>
                  <td>{new Date(order.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td>
                    <Link to={`/admin/orders/${order.id}`}>
                      View
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No recent orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminDashboard




