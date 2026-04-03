import React, { useEffect, useState } from 'react'
import Loader from '../../../components/common/Loader'
import { getAdminNotifications, markAdminNotificationRead } from '../../../api/adminNotifications'
import { showToast } from '../../../utils/toast'

const formatNotificationMessage = (notification) => {
  return (
    notification.data?.message ||
    notification.data?.title ||
    notification.data?.text ||
    'Notification'
  )
}

const formatNotificationLink = (notification) => {
  return notification.data?.url || '#'
}

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '-'

const AdminNotificationsIndex = () => {
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true)
        const response = await getAdminNotifications()

        if (response.success) {
          setNotifications(response.data.data || [])
          setMeta({
            current_page: response.data.current_page || 1,
            last_page: response.data.last_page || 1,
            total: response.data.total || 0,
          })
        }
      } catch (error) {
        console.error('Failed to load notifications:', error)
      } finally {
        setLoading(false)
      }
    }

    loadNotifications()
  }, [])

  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await markAdminNotificationRead(notificationId)
      if (response.success) {
        showToast.success('Notification marked as read!')
        setNotifications((current) =>
          current.map((notification) =>
            notification.id === notificationId
              ? { ...notification, read_at: new Date().toISOString() }
              : notification,
          ),
        )
      } else {
        showToast.error(response.message || 'Failed to mark notification as read')
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      showToast.error('Failed to mark notification as read. Please try again.')
    }
  }

  if (loading) {
    return <Loader />
  }

  return (
    <div className="page">
      <div className="page-header admin-list-header">
        <div>
          <h2>Notifications</h2>
          <p className="admin-page-subtitle">
            Review recent system events and mark items as read when they’ve been handled.
          </p>
        </div>
      </div>

      <div className="notifications-list">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <article
              key={notification.id}
              className={`notification-card ${notification.read_at ? 'is-read' : 'is-unread'}`}
            >
              <div className="notification-card-main">
                <div className="notification-icon">
                  {notification.read_at ? 'R' : 'N'}
                </div>

                <div className="notification-content">
                  <a
                    href={formatNotificationLink(notification)}
                    className="notification-link"
                    target={formatNotificationLink(notification).startsWith('http') ? '_blank' : undefined}
                    rel={formatNotificationLink(notification).startsWith('http') ? 'noreferrer' : undefined}
                  >
                    {formatNotificationMessage(notification)}
                  </a>

                  <div className="notification-meta">
                    <span>{formatDate(notification.created_at)}</span>
                    <span className={`review-status-badge ${notification.read_at ? 'approved' : 'pending'}`}>
                      {notification.read_at ? 'Read' : 'Unread'}
                    </span>
                  </div>
                </div>
              </div>

              {notification.read_at ? null : (
                <button
                  type="button"
                  className="admin-button review-action-button"
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  Mark as read
                </button>
              )}
            </article>
          ))
        ) : (
          <div className="notification-empty">
            No notifications right now.
          </div>
        )}
      </div>

      <div className="admin-pagination-note">
        Showing page {meta.current_page} of {meta.last_page} with {meta.total} notifications.
      </div>
    </div>
  )
}

export default AdminNotificationsIndex
