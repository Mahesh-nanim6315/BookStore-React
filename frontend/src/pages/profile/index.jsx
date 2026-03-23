import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Loader from '../../components/common/Loader'
import { useAuth } from '../../contexts/AuthContext'
import { getProfile, updateAvatar, updateCover, updateProfile } from '../../api/profile'
import { getImageUrl } from '../../utils/imageUtils'
import { showToast } from '../../utils/toast'

const formatPlanLabel = (plan, billingCycle) => {
  const base = plan ? `${plan.charAt(0).toUpperCase()}${plan.slice(1)}` : 'Free'
  return billingCycle ? `${base} (${billingCycle})` : base
}

const getInitials = (name) => {
  if (!name) return 'U'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
}

const ProfileIndex = () => {
  const { updateUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [profile, setProfile] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await getProfile()
        const data = response.data
        setProfile(data)
        setFormData((current) => ({
          ...current,
          name: data.user?.name || '',
          email: data.user?.email || '',
        }))
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load profile.')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  const handleFileUpload = async (event, type) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setError('')
      setMessage('')
      const response = type === 'avatar' ? await updateAvatar(file) : await updateCover(file)
      const nextUser = {
        ...profile.user,
        ...(type === 'avatar' ? { avatar_url: response.data?.avatar_url } : { cover_url: response.data?.cover_url }),
      }
      setProfile((current) => ({ ...current, user: nextUser }))
      updateUser(nextUser)
      showToast.success(response.message || 'Profile image updated successfully!')
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to update image.')
      showToast.error(err?.response?.data?.message || 'Failed to update profile image.')
    } finally {
      event.target.value = ''
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      setError('')
      setMessage('')
      const payload = {
        name: formData.name,
        email: formData.email,
      }

      if (formData.password) {
        payload.password = formData.password
        payload.password_confirmation = formData.password_confirmation
      }

      const response = await updateProfile(payload)
      const nextUser = response.data?.user
      setProfile((current) => ({ ...current, user: nextUser }))
      updateUser(nextUser)
      setFormData((current) => ({
        ...current,
        password: '',
        password_confirmation: '',
      }))
      showToast.success(response.message || 'Profile updated successfully!')
      setIsModalOpen(false)
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to update profile.')
      showToast.error(err?.response?.data?.message || 'Failed to update profile.')
    }
  }

  if (loading) {
    return <Loader />
  }

  const user = profile?.user
  const recentBooks = profile?.recent_books || []
  const statCards = [
    { label: 'Orders', value: profile?.total_orders || 0, detail: 'Completed purchases' },
    { label: 'Wishlist', value: profile?.wishlist_count || 0, detail: 'Saved for later' },
    { label: 'Reviews', value: profile?.review_count || 0, detail: 'Shared with readers' },
    { label: 'Completion', value: `${profile?.profile_completion || 0}%`, detail: 'Account strength' },
  ]

  return (
    <div className="page">
      <div className="profile-page profile-page--dashboard">
        <section className="profile-hero">
          <div className="profile-cover-panel">
            <img src={user?.cover_url} className="profile-cover-image" alt="Cover" />
            <div className="profile-cover-overlay"></div>
            <button
              type="button"
              className="profile-cover-action"
              onClick={() => document.getElementById('coverInput')?.click()}
            >
              Update cover
            </button>
            <input type="file" name="cover" id="coverInput" hidden onChange={(event) => handleFileUpload(event, 'cover')} />
          </div>

          <div className="profile-hero-content">
            <div className="profile-identity-card">
              <div className="profile-avatar-stack">
                <div className="profile-avatar-shell">
                  <img src={user?.avatar_url || getImageUrl(user?.avatar)} className="profile-avatar-image" alt="Avatar" />
                  <span className="profile-avatar-fallback">{getInitials(user?.name)}</span>
                </div>
                <button
                  type="button"
                  className="profile-avatar-action"
                  onClick={() => document.getElementById('avatarInput')?.click()}
                >
                  Change photo
                </button>
                <input type="file" name="avatar" id="avatarInput" hidden onChange={(event) => handleFileUpload(event, 'avatar')} />
              </div>

              <div className="profile-identity-copy">
                <div className="profile-badge-row">
                  <span className="profile-pill profile-pill--role">{user?.role || 'user'}</span>
                  <span className="profile-pill profile-pill--plan">{formatPlanLabel(user?.plan, user?.billing_cycle)}</span>
                </div>
                <h1>{user?.name}</h1>
                <p>{user?.email}</p>
                <div className="profile-meta-grid">
                  <div>
                    <span>Profile strength</span>
                    <strong>{profile?.profile_completion || 0}%</strong>
                  </div>
                  <div>
                    <span>Plan status</span>
                    <strong>{user?.plan_expires_at ? `Active until ${new Date(user.plan_expires_at).toLocaleDateString()}` : 'Always available'}</strong>
                  </div>
                </div>
              </div>

              <div className="profile-hero-actions">
                <button className="profile-primary-action" type="button" onClick={() => setIsModalOpen(true)}>
                  Edit account
                </button>
                <Link to="/plans" className="profile-secondary-action">
                  Manage plan
                </Link>
              </div>
            </div>
          </div>
        </section>

        {message && <p className="wishlist-message">{message}</p>}
        {error && <p className="wishlist-message wishlist-message--error">{error}</p>}

        <section className="profile-dashboard-grid">
          <div className="profile-main-column">
            <div className="profile-section-card">
              <div className="profile-section-head">
                <div>
                  <p className="profile-section-eyebrow">Overview</p>
                  <h2>Account snapshot</h2>
                </div>
              </div>

              <div className="profile-stats-grid">
                {statCards.map((card) => (
                  <div className="profile-stat-card" key={card.label}>
                    <span>{card.label}</span>
                    <strong>{card.value}</strong>
                    <small>{card.detail}</small>
                  </div>
                ))}
              </div>
            </div>

            <div className="profile-section-card">
              <div className="profile-section-head">
                <div>
                  <p className="profile-section-eyebrow">Recent activity</p>
                  <h2>Latest purchases</h2>
                </div>
                <Link to="/orders" className="profile-inline-link">View all orders</Link>
              </div>

              {recentBooks.length > 0 ? (
                <div className="profile-purchase-list">
                  {recentBooks.map((item) => (
                    <div key={item.id} className="profile-purchase-row">
                      <div className="profile-purchase-cover">
                        <img src={getImageUrl(item.book?.image)} alt={item.book?.name || 'Book'} />
                      </div>
                      <div className="profile-purchase-copy">
                        <strong>{item.book?.name || 'Book'}</strong>
                        <span>{item.format} format</span>
                      </div>
                      <div className="profile-purchase-meta">
                        <span>Qty {item.quantity}</span>
                        <strong>Rs. {(item.price || 0) * (item.quantity || 1)}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="profile-empty-state">
                  <h3>No purchases yet</h3>
                  <p>Your latest orders will appear here after checkout is completed.</p>
                  <Link to="/products" className="profile-primary-action profile-primary-action--inline">
                    Browse books
                  </Link>
                </div>
              )}
            </div>
          </div>

          <aside className="profile-side-column">
            <div className="profile-section-card profile-section-card--compact">
              <div className="profile-section-head">
                <div>
                  <p className="profile-section-eyebrow">Membership</p>
                  <h2>Subscription</h2>
                </div>
              </div>
              <div className="profile-plan-panel">
                <strong>{formatPlanLabel(user?.plan, user?.billing_cycle)}</strong>
                <p>
                  {user?.plan_expires_at
                    ? `Renews or expires on ${new Date(user.plan_expires_at).toLocaleDateString()}`
                    : 'You are on the base access tier.'}
                </p>
                <Link to="/plans" className="profile-secondary-action profile-secondary-action--block">
                  Open plans
                </Link>
              </div>
            </div>

            <div className="profile-section-card profile-section-card--compact">
              <div className="profile-section-head">
                <div>
                  <p className="profile-section-eyebrow">Shortcuts</p>
                  <h2>Quick access</h2>
                </div>
              </div>
              <div className="profile-link-list">
                <Link to="/orders" className="profile-link-tile">
                  <span>Orders</span>
                  <small>Track purchases and invoices</small>
                </Link>
                <Link to="/wishlist" className="profile-link-tile">
                  <span>Wishlist</span>
                  <small>Review your saved books</small>
                </Link>
                <Link to="/my-library" className="profile-link-tile">
                  <span>Library</span>
                  <small>Open your owned digital titles</small>
                </Link>
              </div>
            </div>
          </aside>
        </section>

        {isModalOpen && (
          <div
            id="editProfileModal"
            className="modal"
            onClick={(event) => {
              if (event.target.id === 'editProfileModal') setIsModalOpen(false)
            }}
          >
            <div className="modal-content profile-modal">
              <div className="modal-header">
                <h3>Edit Profile</h3>
                <button type="button" className="close-btn" onClick={() => setIsModalOpen(false)}>x</button>
              </div>
              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
                    required
                  />
                </div>
                <hr />
                <h4>Change Password</h4>
                <div className="profile-form-split">
                  <div className="form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={(event) => setFormData((current) => ({ ...current, password: event.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm Password</label>
                    <input
                      type="password"
                      name="password_confirmation"
                      value={formData.password_confirmation}
                      onChange={(event) => setFormData((current) => ({ ...current, password_confirmation: event.target.value }))}
                    />
                  </div>
                </div>
                <div className="profile-form-actions">
                  <button type="button" className="profile-secondary-action" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="profile-primary-action profile-primary-action--inline">
                    Save changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfileIndex
