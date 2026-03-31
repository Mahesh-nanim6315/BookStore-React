import React, { useEffect, useState } from 'react'
import { Formik } from 'formik'
import * as Yup from 'yup'
import Loader from '../../../components/common/Loader'
import { getAdminSettings, updateAdminSettings } from '../../../api/adminSettings'
import { normalizeApiErrors } from '../../../utils/formErrors'
import { showToast } from '../../../utils/toast'

const defaultSettings = {
  site_name: '',
  support_email: '',
  tax_rate: '5',
  maintenance_mode: '0',
  subscriptions_enabled: '1',
  free_trial_days: '0',
  auto_approve_reviews: '0',
  books_per_page: '12',
}

const settingsValidationSchema = Yup.object({
  site_name: Yup.string()
    .trim()
    .max(255, 'Site name may not be greater than 255 characters.'),
  support_email: Yup.string()
    .trim()
    .email('Enter a valid support email address.')
    .max(255, 'Support email may not be greater than 255 characters.'),
  tax_rate: Yup.number()
    .transform((value, originalValue) => (originalValue === '' ? undefined : value))
    .typeError('Tax rate must be a number between 0 and 100.')
    .min(0, 'Tax rate must be a number between 0 and 100.')
    .max(100, 'Tax rate must be a number between 0 and 100.')
    .required('Tax rate is required.'),
  maintenance_mode: Yup.string()
    .oneOf(['0', '1'], 'Select a valid maintenance mode.')
    .required('Maintenance mode is required.'),
  subscriptions_enabled: Yup.string()
    .oneOf(['0', '1'], 'Select a valid subscriptions setting.')
    .required('Subscriptions setting is required.'),
  free_trial_days: Yup.number()
    .transform((value, originalValue) => (originalValue === '' ? undefined : value))
    .typeError('Free trial days must be a whole number between 0 and 365.')
    .integer('Free trial days must be a whole number between 0 and 365.')
    .min(0, 'Free trial days must be a whole number between 0 and 365.')
    .max(365, 'Free trial days must be a whole number between 0 and 365.')
    .required('Free trial days is required.'),
  auto_approve_reviews: Yup.string()
    .oneOf(['0', '1'], 'Select a valid review approval setting.')
    .required('Review approval setting is required.'),
  books_per_page: Yup.number()
    .transform((value, originalValue) => (originalValue === '' ? undefined : value))
    .typeError('Books per page must be a whole number between 5 and 100.')
    .integer('Books per page must be a whole number between 5 and 100.')
    .min(5, 'Books per page must be a whole number between 5 and 100.')
    .max(100, 'Books per page must be a whole number between 5 and 100.')
    .required('Books per page is required.'),
})

const normalizeSettings = (values) => ({
  ...values,
  site_name: values.site_name.trim(),
  support_email: values.support_email.trim(),
  tax_rate: String(values.tax_rate).trim(),
  free_trial_days: String(values.free_trial_days).trim(),
  books_per_page: String(values.books_per_page).trim(),
})

const AdminSettingsIndex = () => {
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [initialValues, setInitialValues] = useState(defaultSettings)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true)
        setErrorMessage('')
        const response = await getAdminSettings()

        if (response.success) {
          setInitialValues({
            ...defaultSettings,
            ...(response.data.settings || {}),
          })
        } else {
          setErrorMessage(response.message || 'Failed to load settings.')
        }
      } catch (error) {
        console.error('Failed to load settings:', error)
        setErrorMessage(error.response?.data?.message || 'Failed to load settings.')
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [])

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

        {errorMessage ? (
          <div className="settings-error-banner">
            {errorMessage}
          </div>
        ) : null}

        <Formik
          initialValues={initialValues}
          validationSchema={settingsValidationSchema}
          enableReinitialize
          onSubmit={async (values, { setErrors, setStatus, resetForm }) => {
            setStatus(null)
            setErrorMessage('')

            try {
              const payload = normalizeSettings(values)
              const response = await updateAdminSettings(payload)

              if (response.success) {
                const updated = {
                  ...defaultSettings,
                  ...(response.data.settings || payload),
                }

                setInitialValues(updated)
                resetForm({ values: updated })
                showToast.success('Settings updated successfully!')
                return
              }

              const message = response.message || 'Failed to save settings.'
              setStatus(message)
              showToast.error(message)
            } catch (error) {
              console.error('Failed to save settings:', error)
              const nextErrors = normalizeApiErrors(error, 'Failed to save settings.')
              setErrors(nextErrors)
              setStatus(nextErrors.general || null)
              setErrorMessage(nextErrors.general || 'Failed to save settings.')
              showToast.error(nextErrors.general || 'Failed to save settings.')
            }
          }}
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
            resetForm,
          }) => (
            <form onSubmit={handleSubmit} id="settings-form" noValidate>
              {status ? (
                <div className="settings-error-banner">
                  {status}
                </div>
              ) : null}

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
                        onBlur={handleBlur}
                        placeholder="Enter site name"
                      />
                      {touched.site_name && errors.site_name ? <small className="error">{errors.site_name}</small> : null}
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
                        onBlur={handleBlur}
                        placeholder="support@example.com"
                      />
                      {touched.support_email && errors.support_email ? <small className="error">{errors.support_email}</small> : null}
                    </div>

                    <div className="settings-form-group">
                      <label htmlFor="tax_rate" className="settings-label">Tax Rate (%)</label>
                      <input
                        type="number"
                        id="tax_rate"
                        name="tax_rate"
                        className="settings-input"
                        value={values.tax_rate}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        min="0"
                        max="100"
                        step="0.01"
                        placeholder="5"
                      />
                      {touched.tax_rate && errors.tax_rate ? <small className="error">{errors.tax_rate}</small> : null}
                      <small className="settings-help-text">Used for cart and checkout tax calculations across the storefront.</small>
                    </div>

                    <div className="settings-form-group">
                      <label htmlFor="maintenance_mode" className="settings-label">Maintenance Mode</label>
                      <select
                        id="maintenance_mode"
                        name="maintenance_mode"
                        className="settings-select"
                        value={values.maintenance_mode}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      >
                        <option value="0">Disabled</option>
                        <option value="1">Enabled</option>
                      </select>
                      {touched.maintenance_mode && errors.maintenance_mode ? <small className="error">{errors.maintenance_mode}</small> : null}
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
                        onBlur={handleBlur}
                      >
                        <option value="1">Yes</option>
                        <option value="0">No</option>
                      </select>
                      {touched.subscriptions_enabled && errors.subscriptions_enabled ? <small className="error">{errors.subscriptions_enabled}</small> : null}
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
                        onBlur={handleBlur}
                        min="0"
                        max="365"
                      />
                      {touched.free_trial_days && errors.free_trial_days ? <small className="error">{errors.free_trial_days}</small> : null}
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
                        onBlur={handleBlur}
                      >
                        <option value="1">Yes</option>
                        <option value="0">No</option>
                      </select>
                      {touched.auto_approve_reviews && errors.auto_approve_reviews ? <small className="error">{errors.auto_approve_reviews}</small> : null}
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
                        onBlur={handleBlur}
                        min="5"
                        max="100"
                      />
                      {touched.books_per_page && errors.books_per_page ? <small className="error">{errors.books_per_page}</small> : null}
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-actions" id="settings-form-actions">
                <button type="submit" className="settings-btn settings-btn-primary" id="save-settings-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Settings'}
                </button>
                <button
                  type="button"
                  className="settings-btn settings-btn-secondary"
                  id="reset-settings-btn"
                  onClick={() => {
                    setErrorMessage('')
                    resetForm({ values: initialValues })
                  }}
                >
                  Reset
                </button>
              </div>
            </form>
          )}
        </Formik>
      </div>
    </div>
  )
}

export default AdminSettingsIndex
