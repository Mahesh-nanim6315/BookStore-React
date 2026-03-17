import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Loader from '../../../components/common/Loader'
import { deleteAdminUser, getAdminUsers } from '../../../api/adminUsers'

const AdminUsersIndex = () => {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })

  const loadUsers = async (page = 1, searchTerm = search) => {
    try {
      setLoading(true)
      const response = await getAdminUsers({ page, search: searchTerm })

      if (response.success) {
        setUsers(response.data.data || [])
        setMeta({
          current_page: response.data.current_page || 1,
          last_page: response.data.last_page || 1,
          total: response.data.total || 0,
        })
      }
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers(1, '')
  }, [])

  const handleSubmit = (event) => {
    event.preventDefault()
    loadUsers(1, search)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) {
      return
    }

    try {
      await deleteAdminUser(id)
      loadUsers(meta.current_page, search)
    } catch (error) {
      console.error('Failed to delete user:', error)
    }
  }

  const formatDate = (value) =>
    value
      ? new Date(value).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : '-'

  if (loading) {
    return <Loader />
  }

  return (
    <div className="page">
      <div className="page-header admin-list-header">
        <div>
          <h2>Users</h2>
          <p className="admin-page-subtitle">
            Search accounts, review roles and activation state, then inspect, edit, or remove users.
          </p>
        </div>

        <Link to="/dashboard/users/create" className="admin-button admin-button-success">
          Add User
        </Link>
      </div>

      <form className="book-filter-panel" onSubmit={handleSubmit}>
        <div className="book-filter-grid user-filter-grid">
          <input
            type="text"
            name="search"
            placeholder="Search by name or email"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="book-filter-actions">
          <button type="submit" className="admin-button admin-button-success">
            Search
          </button>
          <button
            type="button"
            className="admin-button"
            onClick={() => {
              setSearch('')
              loadUsers(1, '')
            }}
          >
            Reset
          </button>
        </div>
      </form>

      <div className="admin-table-wrap">
        <table className="table-custom">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="book-title-cell">
                      <div className="author-avatar">
                        {user.name?.[0] || 'U'}
                      </div>
                      <div>
                        <strong>{user.name}</strong>
                        <div className="book-subline">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="book-tag">{user.role || 'user'}</span>
                  </td>
                  <td>
                    <span className={`review-status-badge ${user.is_active ? 'approved' : 'pending'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{formatDate(user.created_at)}</td>
                  <td>
                    <div className="book-action-row">
                      <Link to={`/dashboard/users/${user.id}`} className="view-link">
                        View
                      </Link>
                      <Link to={`/dashboard/users/${user.id}/edit`} className="view-link">
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="admin-button book-delete-button"
                        onClick={() => handleDelete(user.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="empty-data">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="admin-pagination-note">
        Showing page {meta.current_page} of {meta.last_page} with {meta.total} users.
      </div>
    </div>
  )
}

export default AdminUsersIndex
