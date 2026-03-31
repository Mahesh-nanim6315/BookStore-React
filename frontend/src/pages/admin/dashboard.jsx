import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDashboardStats } from '../../api/auth'
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        console.log('Loading admin dashboard data...')
        const statsResponse = await getDashboardStats()
        
        console.log('Dashboard stats response:', statsResponse)
        
        if (statsResponse.success) {
          // Map snake_case API response to camelCase state
          const apiData = statsResponse.data
          console.log('API Data:', apiData)
          const mappedStats = {
            totalOrders: apiData.total_orders || 0,
            totalRevenue: apiData.total_revenue || 0,
            totalUsers: apiData.total_users || 0,
            totalBooks: apiData.total_books || 0,
            chartData: {
              months: apiData.chart_data?.months || [],
              sales: apiData.chart_data?.sales || []
            },
            recentOrders: apiData.recent_orders || [],
            lowStockBooks: apiData.low_stock_books || [],
            topSellingBooks: apiData.top_selling_books || []
          }
          console.log('Mapped stats:', mappedStats)
          setStats(mappedStats)
        } else {
          console.error('Stats API returned failure:', statsResponse)
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
        <Link to="/dashboard/books/create" className="quick-card">
          ➕ Add Book
        </Link>

        <Link to="/dashboard/authors/create" className="quick-card">
          ➕ Add Author
        </Link>

        <Link to="/dashboard/users" className="quick-card">
          👥 Manage Users
        </Link>

        <Link to="/dashboard/orders" className="quick-card">
          📦 View Orders
        </Link>
      </div>

      <div className="chart-alerts">
        <div className="chart-box">
          {stats.chartData && stats.chartData.months && stats.chartData.sales ? (
            <SalesChart months={stats.chartData.months} sales={stats.chartData.sales} />
          ) : (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <p>Loading chart data...</p>
            </div>
          )}
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

        <div className="card-box admin-table-wrap dashboard-table-wrap">
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
                    <td data-label="Book">{item.book?.name || 'Book Removed'}</td>
                    <td data-label="Total Sold">
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

        <div className="admin-table-wrap dashboard-table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>#ID</th>
                <th>User</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>

          <tbody>
            {stats.recentOrders && stats.recentOrders.length > 0 ? (
              stats.recentOrders.map((order, index) => (
                <tr key={index}>
                  <td data-label="#ID">#{order.id}</td>
                  <td data-label="User">{order.user?.name || 'Guest'}</td>
                  <td data-label="Total">₹{order.total_amount}</td>
                  <td data-label="Status">
                    <span className="status-badge">
                      {order.status || 'Pending'}
                    </span>
                  </td>
                  <td data-label="Date">{new Date(order.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td data-label="Action">
                    <Link
                      to={`/admin/orders/${order.id}`}
                      className="admin-icon-action admin-icon-action--view"
                      aria-label={`View order ${order.id}`}
                      title="View order"
                    >
                      <img src="/images/view.png" alt="" className="admin-icon-action__icon" />
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
    </div>
  )
}

export default AdminDashboard


