import React, { useEffect, useState } from 'react'
import Loader from '../../../components/common/Loader'
import { getAdminSettings, updateAdminSettings } from '../../../api/adminSettings'

const defaultSettings = {
  site_name: '',
  support_email: '',
  maintenance_mode: '0',
  subscriptions_enabled: '1',
  free_trial_days: '0',
  auto_approve_reviews: '0',
  books_per_page: '12',
}

const AdminSettingsIndex = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [initialValues, setInitialValues] = useState(defaultSettings)
  const [values, setValues] = useState(defaultSettings)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true)
        const response = await getAdminSettings()

        if (response.success) {
          const settings = {
            ...defaultSettings,
            ...(response.data.settings || {}),
          }

          setInitialValues(settings)
          setValues(settings)
        }
      } catch (error) {
        console.error('Failed to load settings:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setSaveMessage('')

    try {
      const response = await updateAdminSettings(values)
      if (response.success) {
        const updated = {
          ...defaultSettings,
          ...(response.data.settings || values),
        }

        setInitialValues(updated)
        setValues(updated)
        setSaveMessage(response.message || 'Settings updated successfully.')
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setValues(initialValues)
  }

  if (loading) {
    return <Loader />
  }

  return (
    <div className="page">
      <div className="settings-container" id="main-settings-container">
        <div className="settings-header">
          <h2 className="settings-title">Platform Settings</h2>
          <p className="settings-subtitle">Configure and manage your platform preferences through the API-backed admin panel.</p>
        </div>

        {saveMessage ? (
          <div className="roles-save-banner">
            {saveMessage}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} id="settings-form">
          <div className="settings-tabs-wrapper" id="settings-tabs-container">
            <div className="settings-card" id="general-settings-card">
              <div className="settings-card-header">
                <h4 className="settings-card-title">General Settings</h4>
                <span className="settings-card-icon">Settings</span>
              </div>

              <div className="settings-card-body">
                <div className="settings-form-group">
                  <label htmlFor="site_name" className="settings-label">Site Name</label>
                  <input
                    type="text"
                    id="site_name"
                    name="site_name"
                    className="settings-input"
                    value={values.site_name}
                    onChange={handleChange}
                    placeholder="Enter site name"
                  />
                </div>

                <div className="settings-form-group">
                  <label htmlFor="support_email" className="settings-label">Support Email</label>
                  <input
                    type="email"
                    id="support_email"
                    name="support_email"
                    className="settings-input"
                    value={values.support_email}
                    onChange={handleChange}
                    placeholder="support@example.com"
                  />
                </div>

                <div className="settings-form-group">
                  <label htmlFor="maintenance_mode" className="settings-label">Maintenance Mode</label>
                  <select
                    id="maintenance_mode"
                    name="maintenance_mode"
                    className="settings-select"
                    value={values.maintenance_mode}
                    onChange={handleChange}
                  >
                    <option value="0">Disabled</option>
                    <option value="1">Enabled</option>
                  </select>
                  <small className="settings-help-text">When enabled, only admins should be allowed to access the site.</small>
                </div>
              </div>
            </div>

            <div className="settings-card" id="subscription-settings-card">
              <div className="settings-card-header">
                <h4 className="settings-card-title">Subscription Settings</h4>
                <span className="settings-card-icon">Billing</span>
              </div>

              <div className="settings-card-body">
                <div className="settings-form-group">
                  <label htmlFor="subscriptions_enabled" className="settings-label">Enable Subscriptions</label>
                  <select
                    id="subscriptions_enabled"
                    name="subscriptions_enabled"
                    className="settings-select"
                    value={values.subscriptions_enabled}
                    onChange={handleChange}
                  >
                    <option value="1">Yes</option>
                    <option value="0">No</option>
                  </select>
                </div>

                <div className="settings-form-group">
                  <label htmlFor="free_trial_days" className="settings-label">Free Trial Days</label>
                  <input
                    type="number"
                    id="free_trial_days"
                    name="free_trial_days"
                    className="settings-input"
                    value={values.free_trial_days}
                    onChange={handleChange}
                    min="0"
                    max="365"
                  />
                </div>
              </div>
            </div>

            <div className="settings-card" id="content-settings-card">
              <div className="settings-card-header">
                <h4 className="settings-card-title">Content Settings</h4>
                <span className="settings-card-icon">Content</span>
              </div>

              <div className="settings-card-body">
                <div className="settings-form-group">
                  <label htmlFor="auto_approve_reviews" className="settings-label">Auto Approve Reviews</label>
                  <select
                    id="auto_approve_reviews"
                    name="auto_approve_reviews"
                    className="settings-select"
                    value={values.auto_approve_reviews}
                    onChange={handleChange}
                  >
                    <option value="1">Yes</option>
                    <option value="0">No</option>
                  </select>
                </div>

                <div className="settings-form-group">
                  <label htmlFor="books_per_page" className="settings-label">Books Per Page</label>
                  <input
                    type="number"
                    id="books_per_page"
                    name="books_per_page"
                    className="settings-input"
                    value={values.books_per_page}
                    onChange={handleChange}
                    min="5"
                    max="100"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="settings-actions" id="settings-form-actions">
            <button type="submit" className="settings-btn settings-btn-primary" id="save-settings-btn" disabled={saving}>
              <span className="btn-icon">Save</span>
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
            <button type="button" className="settings-btn settings-btn-secondary" id="reset-settings-btn" onClick={handleReset}>
              <span className="btn-icon">Reset</span>
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminSettingsIndex
