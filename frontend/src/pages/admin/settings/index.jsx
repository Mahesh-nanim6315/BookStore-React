import React, { useEffect, useState } from 'react'
import { Formik } from 'formik'
import * as Yup from 'yup'
import PropTypes from 'prop-types'
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

const buildSettingsValues = (settings = {}) => ({
  ...defaultSettings,
  ...settings,
})

const fieldStateShape = PropTypes.objectOf(PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.bool,
  PropTypes.number,
  PropTypes.object,
  PropTypes.array,
]))

const FieldError = ({ touched, errors, field }) => (
  touched[field] && errors[field] ? <small className="error">{errors[field]}</small> : null
)

const InputField = ({ id, label, type = 'text', values, touched, errors, handleChange, handleBlur, ...inputProps }) => (
  <div className="settings-form-group">
    <label htmlFor={id} className="settings-label">{label}</label>
    <input
      type={type}
      id={id}
      name={id}
      className="settings-input"
      value={values[id]}
      onChange={handleChange}
      onBlur={handleBlur}
      {...inputProps}
    />
    <FieldError touched={touched} errors={errors} field={id} />
  </div>
)

const SelectField = ({ id, label, values, touched, errors, handleChange, handleBlur, options, helpText }) => (
  <div className="settings-form-group">
    <label htmlFor={id} className="settings-label">{label}</label>
    <select
      id={id}
      name={id}
      className="settings-select"
      value={values[id]}
      onChange={handleChange}
      onBlur={handleBlur}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    <FieldError touched={touched} errors={errors} field={id} />
    {helpText ? <small className="settings-help-text">{helpText}</small> : null}
  </div>
)

const SettingsFormContent = ({ formik, initialValues, setErrorMessage }) => {
  const {
    values,
    errors,
    touched,
    status,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
  } = formik

  return (
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
            <InputField id="site_name" label="Site Name" values={values} touched={touched} errors={errors} handleChange={handleChange} handleBlur={handleBlur} placeholder="Enter site name" />
            <InputField id="support_email" label="Support Email" type="email" values={values} touched={touched} errors={errors} handleChange={handleChange} handleBlur={handleBlur} placeholder="support@example.com" />
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
              <FieldError touched={touched} errors={errors} field="tax_rate" />
              <small className="settings-help-text">Used for cart and checkout tax calculations across the storefront.</small>
            </div>
            <SelectField
              id="maintenance_mode"
              label="Maintenance Mode"
              values={values}
              touched={touched}
              errors={errors}
              handleChange={handleChange}
              handleBlur={handleBlur}
              options={[
                { value: '0', label: 'Disabled' },
                { value: '1', label: 'Enabled' },
              ]}
              helpText="When enabled, only admins should be allowed to access the site."
            />
          </div>
        </div>

        <div className="settings-card" id="subscription-settings-card">
          <div className="settings-card-header">
            <h4 className="settings-card-title">Subscription Settings</h4>
            <span className="settings-card-icon">Billing</span>
          </div>

          <div className="settings-card-body">
            <SelectField
              id="subscriptions_enabled"
              label="Enable Subscriptions"
              values={values}
              touched={touched}
              errors={errors}
              handleChange={handleChange}
              handleBlur={handleBlur}
              options={[
                { value: '1', label: 'Yes' },
                { value: '0', label: 'No' },
              ]}
            />
            <InputField id="free_trial_days" label="Free Trial Days" type="number" values={values} touched={touched} errors={errors} handleChange={handleChange} handleBlur={handleBlur} min="0" max="365" />
          </div>
        </div>

        <div className="settings-card" id="content-settings-card">
          <div className="settings-card-header">
            <h4 className="settings-card-title">Content Settings</h4>
            <span className="settings-card-icon">Content</span>
          </div>

          <div className="settings-card-body">
            <SelectField
              id="auto_approve_reviews"
              label="Auto Approve Reviews"
              values={values}
              touched={touched}
              errors={errors}
              handleChange={handleChange}
              handleBlur={handleBlur}
              options={[
                { value: '1', label: 'Yes' },
                { value: '0', label: 'No' },
              ]}
            />
            <InputField id="books_per_page" label="Books Per Page" type="number" values={values} touched={touched} errors={errors} handleChange={handleChange} handleBlur={handleBlur} min="5" max="100" />
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
  )
}

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
          setInitialValues(buildSettingsValues(response.data.settings))
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

  const handleSubmitSuccess = (response, payload, resetForm) => {
    if (!response.success) {
      const message = response.message || 'Failed to save settings.'
      return { ok: false, message }
    }

    const updated = buildSettingsValues(response.data.settings || payload)
    setInitialValues(updated)
    resetForm({ values: updated })
    showToast.success('Settings updated successfully!')
    return { ok: true, message: '' }
  }

  const handleSubmitError = (error, setErrors, setStatus) => {
    console.error('Failed to save settings:', error)
    const nextErrors = normalizeApiErrors(error, 'Failed to save settings.')
    const message = nextErrors.general || 'Failed to save settings.'
    setErrors(nextErrors)
    setStatus(nextErrors.general || null)
    setErrorMessage(message)
    showToast.error(message)
  }

  const handleSubmitSettings = async (values, { setErrors, setStatus, resetForm }) => {
    setStatus(null)
    setErrorMessage('')

    try {
      const payload = normalizeSettings(values)
      const response = await updateAdminSettings(payload)
      const result = handleSubmitSuccess(response, payload, resetForm)

      if (!result.ok) {
        setStatus(result.message)
        showToast.error(result.message)
      }
    } catch (error) {
      handleSubmitError(error, setErrors, setStatus)
    }
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

        {errorMessage ? (
          <div className="settings-error-banner">
            {errorMessage}
          </div>
        ) : null}

        <Formik
          initialValues={initialValues}
          validationSchema={settingsValidationSchema}
          enableReinitialize
          onSubmit={handleSubmitSettings}
        >
          {(formik) => <SettingsFormContent formik={formik} initialValues={initialValues} setErrorMessage={setErrorMessage} />}
        </Formik>
      </div>
    </div>
  )
}

FieldError.propTypes = {
  touched: fieldStateShape.isRequired,
  errors: fieldStateShape.isRequired,
  field: PropTypes.string.isRequired,
}

InputField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  values: fieldStateShape.isRequired,
  touched: fieldStateShape.isRequired,
  errors: fieldStateShape.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleBlur: PropTypes.func.isRequired,
}

SelectField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  values: fieldStateShape.isRequired,
  touched: fieldStateShape.isRequired,
  errors: fieldStateShape.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleBlur: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  })).isRequired,
  helpText: PropTypes.string,
}

SettingsFormContent.propTypes = {
  formik: PropTypes.shape({
    values: fieldStateShape.isRequired,
    errors: fieldStateShape.isRequired,
    touched: fieldStateShape.isRequired,
    status: PropTypes.string,
    isSubmitting: PropTypes.bool.isRequired,
    handleChange: PropTypes.func.isRequired,
    handleBlur: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    resetForm: PropTypes.func.isRequired,
  }).isRequired,
  initialValues: fieldStateShape.isRequired,
  setErrorMessage: PropTypes.func.isRequired,
}

export default AdminSettingsIndex
