import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Loader from '../../../components/common/Loader'
import { getAdminUser } from '../../../api/adminUsers'

const AdminUsersShow = () => {
  const { id } = useParams()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await getAdminUser(id)
        if (response.success) {
          setUser(response.data.user)
        }
      } catch (error) {
        console.error('Failed to load user:', error)
      }
    }

    loadUser()
  }, [id])

  if (!user) {
    return <Loader />
  }

  return (
    <div className="page">
      <div className="page-header admin-list-header">
        <div>
          <h2>{user.name}</h2>
          <p className="admin-page-subtitle">Review account details, role assignment, and activation state.</p>
        </div>

        <Link to="/dashboard/users" className="admin-button">
          Back to users
        </Link>
      </div>

      <div className="book-show-layout">
        <div className="book-show-cover user-detail-avatar-wrap">
          <div className="user-detail-avatar">{user.name?.[0] || 'U'}</div>
        </div>

        <div className="book-show-card">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role || 'user'}</p>
          <p><strong>Status:</strong> {user.is_active ? 'Active' : 'Inactive'}</p>
          <p><strong>Plan:</strong> {user.plan || 'free'}</p>

          <div className="book-action-row">
            <Link
              to={`/dashboard/users/${user.id}/edit`}
              className="admin-icon-action admin-icon-action--edit"
              aria-label={`Edit ${user.name}`}
              title="Edit"
            >
              <img src="/images/edit.png" alt="" className="admin-icon-action__icon" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminUsersShow
