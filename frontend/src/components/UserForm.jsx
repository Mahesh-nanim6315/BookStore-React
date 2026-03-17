import React from 'react'
import { Link } from 'react-router-dom'

const UserForm = ({
  values,
  onChange,
  onSubmit,
  submitLabel,
  isSaving,
  roles = [],
  mode = 'create',
}) => {
  return (
    <form className="author-form-shell" onSubmit={onSubmit}>
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

      <div className="author-form-grid">
        <section className="book-form-card">
          <div className="book-field-grid">
            <label className="book-field">
              <span>Name</span>
              <input name="name" type="text" value={values.name} onChange={onChange} required />
            </label>

            <label className="book-field">
              <span>Email</span>
              <input name="email" type="email" value={values.email} onChange={onChange} required />
            </label>

            {mode === 'create' ? (
              <label className="book-field">
                <span>Password</span>
                <input name="password" type="password" value={values.password} onChange={onChange} required />
              </label>
            ) : null}

            <label className="book-field">
              <span>Role</span>
              <select name="role" value={values.role} onChange={onChange} required>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {mode === 'edit' ? (
            <div className="user-toggle-wrap">
              <label className="book-toggle">
                <input
                  name="is_active"
                  type="checkbox"
                  checked={!!values.is_active}
                  onChange={onChange}
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

export default UserForm
