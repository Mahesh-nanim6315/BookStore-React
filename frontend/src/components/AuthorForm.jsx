import React from 'react'
import { Link } from 'react-router-dom'
import { Formik } from 'formik'
import * as Yup from 'yup'

const validationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .max(255, 'Name may not be greater than 255 characters.')
    .required('Name is required.'),
  image: Yup.string()
    .trim()
    .url('Enter a valid image URL.')
    .transform((value, originalValue) => (originalValue === '' ? undefined : value))
    .nullable(),
  bio: Yup.string().nullable(),
})

const AuthorForm = ({
  initialValues,
  onSubmit,
  submitLabel,
  isSaving,
  mode = 'create',
}) => {
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
              <h1>{mode === 'edit' ? 'Edit Author' : 'Add Author'}</h1>
              <p className="admin-page-subtitle">
                Manage author identity, profile image, and biography details for your catalog.
              </p>
            </div>

            <Link to="/dashboard/authors" className="admin-button">
              Back to authors
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
                  <span>Image URL</span>
                  <input
                    name="image"
                    type="url"
                    value={values.image}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={touched.image && errors.image ? 'error' : ''}
                  />
                  {touched.image && errors.image && <small className="error">{errors.image}</small>}
                </label>
              </div>

              <label className="book-field book-field-full">
                <span>Bio</span>
                <textarea name="bio" rows="8" value={values.bio} onChange={handleChange} onBlur={handleBlur} />
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
      )}
    </Formik>
  )
}

export default AuthorForm
