import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../api/auth';
import Loader from '../components/common/Loader';
import SalesChart from '../components/admin/SalesChart';

const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        total_orders: 0,
        total_revenue: 0,
        total_users: 0,
        total_books: 0,
        chart_data: {
            months: [],
            sales: []
        },
        recent_orders: [],
        low_stock_books: [],
        top_selling_books: []
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await getDashboardStats();
            if (response.success) {
                setDashboardData(response.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="dashboard">
            {/* Stats Cards */}
            <div className="stats">
                <div className="card">
                    Orders<br />
                    <strong>{dashboardData.total_orders}</strong>
                </div>

                <div className="card">
                    Revenue<br />
                    <strong>{formatCurrency(dashboardData.total_revenue)}</strong>
                </div>

                <div className="card">
                    Users<br />
                    <strong>{dashboardData.total_users}</strong>
                </div>

                <div className="card">
                    Books<br />
                    <strong>{dashboardData.total_books}</strong>
                </div>
            </div>

            <hr />

            {/* Quick Actions */}
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

            {/* Chart and Alerts */}
            <div className="chart-alerts">
                <div className="chart-box">
                    <SalesChart 
                        months={dashboardData.chart_data.months} 
                        sales={dashboardData.chart_data.sales} 
                    />
                </div>

                <div className="alerts">
                    <h3>⚠ Low Stock Alerts</h3>
                    {dashboardData.low_stock_books && dashboardData.low_stock_books.length > 0 ? (
                        <div className="alert-box">
                            {dashboardData.low_stock_books.map(book => (
                                <div key={book.id} className="alert-item">
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

            {/* Top Selling Books */}
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
                            {dashboardData.top_selling_books && dashboardData.top_selling_books.length > 0 ? (
                                dashboardData.top_selling_books.map((item, index) => (
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

            {/* Recent Orders */}
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
                        {dashboardData.recent_orders && dashboardData.recent_orders.length > 0 ? (
                            dashboardData.recent_orders.map(order => (
                                <tr key={order.id}>
                                    <td>#{order.id}</td>
                                    <td>{order.user?.name || 'Guest'}</td>
                                    <td>{formatCurrency(order.total_amount)}</td>
                                    <td>
                                        <span className={`status-badge ${order.status?.toLowerCase()}`}>
                                            {order.status || 'Pending'}
                                        </span>
                                    </td>
                                    <td>{new Date(order.created_at).toLocaleDateString('en-IN', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric'
                                    })}</td>
                                    <td>
                                        <Link to={`/admin/orders/${order.id}`} className="view-link">
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center">
                                    No recent orders found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDashboard;
