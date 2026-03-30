import React from 'react'
import { Link } from 'react-router-dom'
import { Formik } from 'formik'
import * as Yup from 'yup'

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
        ? Yup.string().min(6, 'Password must be at least 6 characters.').required('Password is required.')
        : Yup.string(),
    role: Yup.string()
      .oneOf(roles.length > 0 ? roles : ['user', 'admin', 'manager', 'staff'], 'Select a valid role.')
      .required('Role is required.'),
    is_active: Yup.boolean(),
  })

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit} enableReinitialize>
      {({
        values,
        errors,
        touched,
        status,
        handleChange,
        handleBlur,
        handleSubmit,
      }) => (
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
                <label className="book-field">
                  <span>Name</span>
                  <input
                    name="name"
                    type="text"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={touched.name && errors.name ? 'error' : ''}
                  />
                  {touched.name && errors.name && <small className="error">{errors.name}</small>}
                </label>

                <label className="book-field">
                  <span>Email</span>
                  <input
                    name="email"
                    type="email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={touched.email && errors.email ? 'error' : ''}
                  />
                  {touched.email && errors.email && <small className="error">{errors.email}</small>}
                </label>

                {mode === 'create' ? (
                  <label className="book-field">
                    <span>Password</span>
                    <input
                      name="password"
                      type="password"
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={touched.password && errors.password ? 'error' : ''}
                    />
                    {touched.password && errors.password && <small className="error">{errors.password}</small>}
                  </label>
                ) : null}

                <label className="book-field">
                  <span>Role</span>
                  <select
                    name="role"
                    value={values.role}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={touched.role && errors.role ? 'error' : ''}
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </option>
                    ))}
                  </select>
                  {touched.role && errors.role && <small className="error">{errors.role}</small>}
                </label>
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
      )}
    </Formik>
  )
}

export default UserForm
