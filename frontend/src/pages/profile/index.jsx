import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Formik } from 'formik'
import * as Yup from 'yup'
import Loader from '../../components/common/Loader'
import { useAuth } from '../../contexts/AuthContext'
import { getProfile, updateAvatar, updateCover, updateProfile } from '../../api/profile'
import { getImageUrl } from '../../utils/imageUtils'
import { normalizeApiErrors } from '../../utils/formErrors'
import { showToast } from '../../utils/toast'
import { optionalStrongPassword } from '../../utils/passwordValidation'

const profileValidationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .max(255, 'Name may not be greater than 255 characters.')
    .required('Name is required.'),
  email: Yup.string()
    .trim()
    .email('Enter a valid email address.')
    .max(255, 'Email may not be greater than 255 characters.')
    .required('Email is required.'),
  current_password: Yup.string().when('password', ([password], schema) =>
    password ? schema.required('Current password is required to change your password.') : schema
  ),
  password: optionalStrongPassword(),
  password_confirmation: Yup.string().when('password', ([password], schema) =>
    password
      ? schema
          .required('Please confirm your password.')
          .oneOf([Yup.ref('password')], 'Passwords do not match.')
      : schema
  ),
})

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
  const [profileFormInitialValues, setProfileFormInitialValues] = useState({
    name: '',
    email: '',
    current_password: '',
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
        setProfileFormInitialValues({
          name: data.user?.name || '',
          email: data.user?.email || '',
          current_password: '',
          password: '',
          password_confirmation: '',
        })
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

    const maxSize = type === 'avatar' ? 2 * 1024 * 1024 : 4 * 1024 * 1024
    const allowedTypes = ['image/jpeg', 'image/png']

    if (!allowedTypes.includes(file.type)) {
      const message = 'Please choose a JPG or PNG image.'
      setError(message)
      showToast.error(message)
      event.target.value = ''
      return
    }

    if (file.size > maxSize) {
      const message = type === 'avatar'
        ? 'Avatar must be 2 MB or smaller.'
        : 'Cover image must be 4 MB or smaller.'
      setError(message)
      showToast.error(message)
      event.target.value = ''
      return
    }

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

  const handleSubmit = async (values, { setErrors, setStatus, resetForm }) => {
    try {
      setError('')
      setMessage('')
      const payload = {
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
      }

      if (values.password) {
        payload.current_password = values.current_password
        payload.password = values.password
        payload.password_confirmation = values.password_confirmation
      }

      const response = await updateProfile(payload)
      const nextUser = response.data?.user
      setProfile((current) => ({ ...current, user: nextUser }))
      updateUser(nextUser)
      const nextValues = {
        name: nextUser?.name || '',
        email: nextUser?.email || '',
        current_password: '',
        password: '',
        password_confirmation: '',
      }
      setProfileFormInitialValues(nextValues)
      resetForm({ values: nextValues })
      setStatus(null)
      showToast.success(response.message || 'Profile updated successfully!')
      setIsModalOpen(false)
    } catch (err) {
      const nextErrors = normalizeApiErrors(err, 'Unable to update profile.')
      setErrors(nextErrors)
      setStatus(nextErrors.general || null)
      setError(nextErrors.general || 'Unable to update profile.')
      showToast.error(nextErrors.general || 'Failed to update profile.')
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
            <input type="file" name="cover" id="coverInput" accept=".jpg,.jpeg,.png,image/jpeg,image/png" hidden onChange={(event) => handleFileUpload(event, 'cover')} />
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
                <input type="file" name="avatar" id="avatarInput" accept=".jpg,.jpeg,.png,image/jpeg,image/png" hidden onChange={(event) => handleFileUpload(event, 'avatar')} />
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
          <div id="editProfileModal" className="modal">
            <button
              type="button"
              className="modal-backdrop-button"
              onClick={() => setIsModalOpen(false)}
              aria-label="Close edit profile modal"
            />
            <div className="modal-content profile-modal">
              <div className="modal-header">
                <h3>Edit Profile</h3>
                <button type="button" className="close-btn" onClick={() => setIsModalOpen(false)}>x</button>
              </div>
              <Formik
                initialValues={profileFormInitialValues}
                validationSchema={profileValidationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
              >
                {({
                  values,
                  errors,
                  touched,
                  status,
                  isSubmitting,
                  handleChange,
                  handleBlur,
                  handleSubmit,
                }) => (
                  <form onSubmit={handleSubmit} className="profile-form" noValidate>
                    {status && <p className="wishlist-message wishlist-message--error">{status}</p>}

                    <div className="form-group">
                      <label htmlFor="profile-name">Name</label>
                      <input
                        id="profile-name"
                        type="text"
                        name="name"
                        value={values.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={touched.name && errors.name ? 'error' : ''}
                      />
                      {touched.name && errors.name && <small className="error">{errors.name}</small>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="profile-email">Email</label>
                      <input
                        id="profile-email"
                        type="email"
                        name="email"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={touched.email && errors.email ? 'error' : ''}
                      />
                      {touched.email && errors.email && <small className="error">{errors.email}</small>}
                    </div>
                    <hr />
                    <h4>Change Password</h4>
                    <div className="profile-form-split">
                      <div className="form-group">
                        <label htmlFor="profile-current-password">Current Password</label>
                        <input
                          id="profile-current-password"
                          type="password"
                          name="current_password"
                          value={values.current_password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          autoComplete="current-password"
                          className={touched.current_password && errors.current_password ? 'error' : ''}
                        />
                        {touched.current_password && errors.current_password && <small className="error">{errors.current_password}</small>}
                      </div>
                      <div className="form-group">
                        <label htmlFor="profile-new-password">New Password</label>
                        <input
                          id="profile-new-password"
                          type="password"
                          name="password"
                          value={values.password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          autoComplete="new-password"
                          className={touched.password && errors.password ? 'error' : ''}
                        />
                        {touched.password && errors.password && <small className="error">{errors.password}</small>}
                      </div>
                      <div className="form-group">
                        <label htmlFor="profile-password-confirmation">Confirm Password</label>
                        <input
                          id="profile-password-confirmation"
                          type="password"
                          name="password_confirmation"
                          value={values.password_confirmation}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          autoComplete="new-password"
                          className={touched.password_confirmation && errors.password_confirmation ? 'error' : ''}
                        />
                        {touched.password_confirmation && errors.password_confirmation && <small className="error">{errors.password_confirmation}</small>}
                      </div>
                    </div>
                    <div className="profile-form-actions">
                      <button type="button" className="profile-secondary-action" onClick={() => setIsModalOpen(false)}>
                        Cancel
                      </button>
                      <button type="submit" className="profile-primary-action profile-primary-action--inline" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save changes'}
                      </button>
                    </div>
                  </form>
                )}
              </Formik>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfileIndex
