import React from 'react'
import { Link } from 'react-router-dom'

const AuthorForm = ({
  values,
  onChange,
  onSubmit,
  submitLabel,
  isSaving,
  mode = 'create',
}) => {
  return (
    <form className="author-form-shell" onSubmit={onSubmit}>
      <div className="author-form-header">
        <div>
          <h1>{mode === 'edit' ? 'Edit Author' : 'Add Author'}</h1>
          <p className="admin-page-subtitle">
            Manage author identity, profile image, and biography details for your catalog.
          </p>
        </div>

        <Link to="/dashboard/authors" className="admin-button">
          Back to authors
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
              <span>Image URL</span>
              <input name="image" type="url" value={values.image} onChange={onChange} />
            </label>
          </div>

          <label className="book-field book-field-full">
            <span>Bio</span>
            <textarea name="bio" rows="8" value={values.bio} onChange={onChange} />
          </label>
        </section>

        <aside className="book-form-card">
          <h3>Preview</h3>
          {values.image ? (
            <img src={values.image} alt={values.name || 'Author preview'} className="author-image-preview" />
          ) : (
            <div className="book-cover-placeholder">Add an image URL to preview the author photo.</div>
          )}
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

export default AuthorForm
