import React from 'react'
import { Link } from 'react-router-dom'
import { Formik } from 'formik'
import * as Yup from 'yup'
import PropTypes from 'prop-types'
import { strongPassword } from '../utils/passwordValidation'

const getFieldErrorClass = (touched, errors, field) => (touched[field] && errors[field] ? 'error' : '')

const FieldError = ({ touched, errors, field }) => (
  touched[field] && errors[field] ? <small className="error">{errors[field]}</small> : null
)

const TextField = ({
  field,
  label,
  type = 'text',
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  ...inputProps
}) => (
  <label className="book-field">
    <span>{label}</span>
    <input
      id={field}
      name={field}
      type={type}
      value={values[field]}
      onChange={handleChange}
      onBlur={handleBlur}
      className={getFieldErrorClass(touched, errors, field)}
      {...inputProps}
    />
    <FieldError touched={touched} errors={errors} field={field} />
  </label>
)

const SelectField = ({ field, label, options, values, errors, touched, handleChange, handleBlur }) => (
  <label className="book-field">
    <span>{label}</span>
    <select
      id={field}
      name={field}
      value={values[field]}
      onChange={handleChange}
      onBlur={handleBlur}
      className={getFieldErrorClass(touched, errors, field)}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option.charAt(0).toUpperCase() + option.slice(1)}
        </option>
      ))}
    </select>
    <FieldError touched={touched} errors={errors} field={field} />
  </label>
)

const UserFormContent = ({ formik, mode, roles, submitLabel, isSaving }) => {
  const { values, errors, touched, status, handleChange, handleBlur, handleSubmit } = formik

  return (
    <form className="author-form-shell" onSubmit={handleSubmit} noValidate>
      <div className="author-form-header">
        <div>
          <h1>{mode === 'edit' ? 'Edit User' : 'Create User'}</h1>
          <p className="admin-page-subtitle">
            Manage account identity, role assignment, and access state from one place.
          </p>
        </div>

        <Link to="/dashboard/users" className="admin-button">
          Back to users
        </Link>
      </div>

      {status && <small className="error">{status}</small>}

      <div className="author-form-grid">
        <section className="book-form-card">
          <div className="book-field-grid">
            <TextField field="name" label="Name" values={values} errors={errors} touched={touched} handleChange={handleChange} handleBlur={handleBlur} />
            <TextField field="email" label="Email" type="email" values={values} errors={errors} touched={touched} handleChange={handleChange} handleBlur={handleBlur} />

            {mode === 'create' ? (
              <>
                <TextField
                  field="password"
                  label="Password"
                  type="password"
                  values={values}
                  errors={errors}
                  touched={touched}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  autoComplete="new-password"
                />
                <TextField
                  field="password_confirmation"
                  label="Confirm Password"
                  type="password"
                  values={values}
                  errors={errors}
                  touched={touched}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  autoComplete="new-password"
                />
              </>
            ) : null}

            <SelectField field="role" label="Role" options={roles} values={values} errors={errors} touched={touched} handleChange={handleChange} handleBlur={handleBlur} />
          </div>

          {mode === 'edit' ? (
            <div className="user-toggle-wrap">
              <label className="book-toggle">
                <input
                  name="is_active"
                  type="checkbox"
                  checked={!!values.is_active}
                  onChange={handleChange}
                />
                <span>Account is active</span>
              </label>
            </div>
          ) : null}
        </section>

        <aside className="book-form-card">
          <h3>Summary</h3>
          <div className="review-identity">
            <strong>{values.name || 'New user'}</strong>
            <div className="book-subline">{values.email || 'No email yet'}</div>
            <div className="book-tag-row">
              {values.role ? <span className="book-tag">{values.role}</span> : null}
              {mode === 'edit' ? (
                <span className={`review-status-badge ${values.is_active ? 'approved' : 'pending'}`}>
                  {values.is_active ? 'Active' : 'Inactive'}
                </span>
              ) : null}
            </div>
          </div>
        </aside>
      </div>

      <div className="book-form-actions">
        <button type="submit" className="admin-button admin-button-success" disabled={isSaving}>
          {isSaving ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  )
}

const fieldStateShape = PropTypes.objectOf(
  PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.bool,
  ]),
).isRequired

const formikShape = PropTypes.shape({
  values: fieldStateShape,
  errors: fieldStateShape,
  touched: fieldStateShape,
  status: PropTypes.string,
  handleChange: PropTypes.func.isRequired,
  handleBlur: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
}).isRequired

const UserForm = ({
  initialValues,
  onSubmit,
  submitLabel,
  isSaving,
  roles = [],
  mode = 'create',
}) => {
  const validationSchema = Yup.object({
    name: Yup.string()
      .trim()
      .max(255, 'Name may not be greater than 255 characters.')
      .required('Name is required.'),
    email: Yup.string()
      .trim()
      .email('Enter a valid email address.')
      .required('Email is required.'),
    password:
      mode === 'create'
        ? strongPassword()
        : Yup.string(),
    password_confirmation:
      mode === 'create'
        ? Yup.string()
            .required('Please confirm your password.')
            .oneOf([Yup.ref('password')], 'Passwords do not match.')
        : Yup.string(),
    role: Yup.string()
      .oneOf(roles.length > 0 ? roles : ['user', 'admin', 'manager', 'staff'], 'Select a valid role.')
      .required('Role is required.'),
    is_active: Yup.boolean(),
  })

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit} enableReinitialize>
      {(formik) => <UserFormContent formik={formik} mode={mode} roles={roles} submitLabel={submitLabel} isSaving={isSaving} />}
    </Formik>
  )
}

FieldError.propTypes = {
  touched: fieldStateShape,
  errors: fieldStateShape,
  field: PropTypes.string.isRequired,
}

TextField.propTypes = {
  field: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  values: fieldStateShape,
  errors: fieldStateShape,
  touched: fieldStateShape,
  handleChange: PropTypes.func.isRequired,
  handleBlur: PropTypes.func.isRequired,
}

SelectField.propTypes = {
  field: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  values: fieldStateShape,
  errors: fieldStateShape,
  touched: fieldStateShape,
  handleChange: PropTypes.func.isRequired,
  handleBlur: PropTypes.func.isRequired,
}

UserFormContent.propTypes = {
  formik: formikShape,
  mode: PropTypes.oneOf(['create', 'edit']),
  roles: PropTypes.arrayOf(PropTypes.string).isRequired,
  submitLabel: PropTypes.string.isRequired,
  isSaving: PropTypes.bool.isRequired,
}

UserForm.propTypes = {
  initialValues: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    password: PropTypes.string,
    password_confirmation: PropTypes.string,
    role: PropTypes.string,
    is_active: PropTypes.bool,
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
  submitLabel: PropTypes.string.isRequired,
  isSaving: PropTypes.bool.isRequired,
  roles: PropTypes.arrayOf(PropTypes.string),
  mode: PropTypes.oneOf(['create', 'edit']),
}

export default UserForm
