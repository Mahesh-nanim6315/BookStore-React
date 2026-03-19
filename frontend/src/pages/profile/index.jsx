import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Loader from '../../components/common/Loader'
import { useAuth } from '../../contexts/AuthContext'
import { getProfile, updateAvatar, updateCover, updateProfile } from '../../api/profile'

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
      setMessage(response.message || 'Profile image updated.')
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to update image.')
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
      setMessage(response.message || 'Profile updated successfully.')
      setIsModalOpen(false)
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to update profile.')
    }
  }

  if (loading) {
    return <Loader />
  }

  const user = profile?.user
  const recentBooks = profile?.recent_books || []

  return (
    <div className="page">
      <div className="profile-header" style={{ marginTop: '65px' }}>
        <div className="profile-cover">
          <form>
            <input type="file" name="cover" id="coverInput" hidden onChange={(event) => handleFileUpload(event, 'cover')} />
            <img src={user?.cover_url} className="cover-img" alt="Cover" />
            <button type="button" className="change-cover-btn" onClick={() => document.getElementById('coverInput')?.click()}>
              Change Cover
            </button>
          </form>
        </div>

        <form className="profile-avatar">
          <div className="avatar-upload">
            <input type="file" name="avatar" id="avatarInput" hidden onChange={(event) => handleFileUpload(event, 'avatar')} />
            <img src={user?.avatar_url} id="avatarPreview" className="avatar-img" alt="Avatar" />
            <button type="button" onClick={() => document.getElementById('avatarInput')?.click()}>
              Change Avatar
            </button>
            <h2 className="profile-name profile-name--avatar">{user?.name}</h2>
          </div>
        </form>

        <div className="profile-meta">
          <div className="profile-identity">
            <p className="profile-email">{user?.email}</p>
            <div className="badges-container">
              <span className="role-badges">{user?.role || 'user'}</span>
              <span className="free-badges">{user?.plan || 'free'} plan</span>
            </div>
          </div>

          <div className="profile-right">
            <div className="profile-progress">
              <h4>Profile Completion</h4>
              <div className="progress-bars">
                <div className="progress-fills" style={{ width: `${profile?.profile_completion || 0}%` }}></div>
              </div>
              <span>{profile?.profile_completion || 0}% Completed</span>
            </div>

            <div className="profile-actions">
              <button className="edit-btns" type="button" onClick={() => setIsModalOpen(true)}>
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {message && <p className="wishlist-message">{message}</p>}
      {error && <p className="wishlist-message wishlist-message--error">{error}</p>}

      <div className="profile-stats">
        <div className="stat-card"><h3>{profile?.total_orders || 0}</h3><p>Books Purchased</p></div>
        <div className="stat-card"><h3>{profile?.wishlist_count || 0}</h3><p>Wishlist Items</p></div>
        <div className="stat-card"><h3>{profile?.review_count || 0}</h3><p>Reviews Written</p></div>
        <div className="stat-card"><h3>{user?.plan || 'Free'}</h3><p>Current Plan</p></div>
      </div>

      <div className="recent-purchases">
        <h3>Recent Purchases</h3>
        {recentBooks.length > 0 ? (
          recentBooks.map((item) => (
            <div key={item.id} className="summary-item">
              <div className="item-info">
                <strong>{item.book?.name || 'Book'}</strong>
                <div className="item-details">
                  <span>{item.format}</span>
                  <span>Qty: {item.quantity}</span>
                </div>
              </div>
              <div className="item-price">Rs. {(item.price || 0) * (item.quantity || 1)}</div>
            </div>
          ))
        ) : (
          <p className="no-books">You haven't purchased any books yet.</p>
        )}
      </div>

      <div className="subscription-section">
        <h3>Subscription Management</h3>
        <p>
          You are subscribed to <strong>{user?.plan || 'free'}</strong>
          {user?.billing_cycle ? ` (${user.billing_cycle})` : ''}.
        </p>
        <Link to="/plans" className="upgrade-btn">Manage Subscription</Link>
      </div>

      {isModalOpen && (
        <div id="editProfileModal" className="modal" onClick={(event) => {
          if (event.target.id === 'editProfileModal') setIsModalOpen(false)
        }}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Profile</h3>
              <span className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</span>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input type="text" name="name" value={formData.name} onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={formData.email} onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))} required />
              </div>
              <hr />
              <h4>Change Password (Optional)</h4>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" name="password" value={formData.password} onChange={(event) => setFormData((current) => ({ ...current, password: event.target.value }))} />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input type="password" name="password_confirmation" value={formData.password_confirmation} onChange={(event) => setFormData((current) => ({ ...current, password_confirmation: event.target.value }))} />
              </div>
              <button type="submit" className="save-btn">Save Changes</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfileIndex
