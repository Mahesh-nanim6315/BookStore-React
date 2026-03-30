import React from 'react'
import { Link } from 'react-router-dom'
import { Formik } from 'formik'
import * as Yup from 'yup'

const optionalNumber = (label) =>
  Yup.number()
    .transform((value, originalValue) => (originalValue === '' ? undefined : value))
    .typeError(`${label} must be a number.`)
    .min(0, `${label} must be at least 0.`)
    .nullable()

const optionalInteger = (label) =>
  Yup.number()
    .transform((value, originalValue) => (originalValue === '' ? undefined : value))
    .typeError(`${label} must be a number.`)
    .integer(`${label} must be a whole number.`)
    .min(0, `${label} must be at least 0.`)
    .nullable()

const optionalUrl = (label) =>
  Yup.string()
    .trim()
    .url(`Enter a valid ${label}.`)
    .transform((value, originalValue) => (originalValue === '' ? undefined : value))
    .nullable()

const validationSchema = Yup.object({
  name: Yup.string().trim().max(255, 'Book name may not be greater than 255 characters.').required('Book name is required.'),
  description: Yup.string().trim().required('Description is required.'),
  language: Yup.string().trim().max(255, 'Language may not be greater than 255 characters.').required('Language is required.'),
  author_id: Yup.string().required('Author is required.'),
  category_id: Yup.string().required('Category is required.'),
  genre_id: Yup.string().required('Genre is required.'),
  image: Yup.string().trim().url('Enter a valid cover image URL.').required('Cover image URL is required.'),
  price: Yup.number()
    .transform((value, originalValue) => (originalValue === '' ? undefined : value))
    .typeError('Main price must be a number.')
    .min(0, 'Main price must be at least 0.')
    .required('Main price is required.'),
  stock: optionalInteger('Paperback stock'),
  ebook_price: optionalNumber('eBook price'),
  ebook_pdf: optionalUrl('eBook PDF URL'),
  ebook_pages: optionalInteger('eBook pages'),
  audio_price: optionalNumber('Audio price'),
  audio_file: optionalUrl('audio file URL'),
  audio_minutes: optionalInteger('Audio minutes'),
  paperback_price: optionalNumber('Paperback price'),
  paperback_pages: optionalInteger('Paperback pages'),
  is_premium: Yup.boolean(),
  has_ebook: Yup.boolean(),
  has_audio: Yup.boolean(),
  has_paperback: Yup.boolean(),
}).test(
  'format-requirements',
  'Complete the required fields for each enabled format.',
  (values) => {
    if (!values) return true

    const makeError = (path, message) => new Yup.ValidationError(message, values[path], path)

    if (values.has_ebook) {
      if (values.ebook_price === '' || values.ebook_price === undefined || values.ebook_price === null) {
        return makeError('ebook_price', 'eBook price is required when eBook is enabled.')
      }
      if (!values.ebook_pdf?.trim()) {
        return makeError('ebook_pdf', 'eBook PDF URL is required when eBook is enabled.')
      }
      if (values.ebook_pages === '' || values.ebook_pages === undefined || values.ebook_pages === null) {
        return makeError('ebook_pages', 'eBook pages are required when eBook is enabled.')
      }
    }

    if (values.has_audio) {
      if (values.audio_price === '' || values.audio_price === undefined || values.audio_price === null) {
        return makeError('audio_price', 'Audio price is required when audio is enabled.')
      }
      if (!values.audio_file?.trim()) {
        return makeError('audio_file', 'Audio file URL is required when audio is enabled.')
      }
      if (values.audio_minutes === '' || values.audio_minutes === undefined || values.audio_minutes === null) {
        return makeError('audio_minutes', 'Audio minutes are required when audio is enabled.')
      }
    }

    if (values.has_paperback) {
      if (values.paperback_price === '' || values.paperback_price === undefined || values.paperback_price === null) {
        return makeError('paperback_price', 'Paperback price is required when paperback is enabled.')
      }
      if (values.paperback_pages === '' || values.paperback_pages === undefined || values.paperback_pages === null) {
        return makeError('paperback_pages', 'Paperback pages are required when paperback is enabled.')
      }
      if (values.stock === '' || values.stock === undefined || values.stock === null) {
        return makeError('stock', 'Paperback stock is required when paperback is enabled.')
      }
    }

    return true
  }
)

const BookForm = ({
  initialValues,
  onSubmit,
  submitLabel,
  isSaving,
  mode = 'create',
  authors = [],
  categories = [],
  genres = [],
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
        <form className="book-form-shell" onSubmit={handleSubmit} noValidate>
          <div className="book-form-header">
            <div>
              <h1>{mode === 'edit' ? 'Edit Book' : 'Add Book'}</h1>
              <p className="admin-page-subtitle">
                Capture catalog details, pricing, and format availability in one place.
              </p>
            </div>

            <Link to="/dashboard/books" className="admin-button">
              Back to books
            </Link>
          </div>

          {status && <small className="error">{status}</small>}

          <div className="book-form-grid">
            <section className="book-form-card">
              <h3>Basic Information</h3>

              <div className="book-field-grid">
                <label className="book-field">
                  <span>Book Name</span>
                  <input id="name" name="name" type="text" value={values.name} onChange={handleChange} onBlur={handleBlur} className={touched.name && errors.name ? 'error' : ''} />
                  {touched.name && errors.name && <small className="error">{errors.name}</small>}
                </label>

                <label className="book-field">
                  <span>Language</span>
                  <input id="language" name="language" type="text" value={values.language} onChange={handleChange} onBlur={handleBlur} className={touched.language && errors.language ? 'error' : ''} />
                  {touched.language && errors.language && <small className="error">{errors.language}</small>}
                </label>

                <label className="book-field">
                  <span>Author</span>
                  <select id="author_id" name="author_id" value={values.author_id} onChange={handleChange} onBlur={handleBlur} className={touched.author_id && errors.author_id ? 'error' : ''}>
                    <option value="">Select author</option>
                    {authors.map((author) => (
                      <option key={author.id} value={author.id}>
                        {author.name}
                      </option>
                    ))}
                  </select>
                  {touched.author_id && errors.author_id && <small className="error">{errors.author_id}</small>}
                </label>

                <label className="book-field">
                  <span>Category</span>
                  <select id="category_id" name="category_id" value={values.category_id} onChange={handleChange} onBlur={handleBlur} className={touched.category_id && errors.category_id ? 'error' : ''}>
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {touched.category_id && errors.category_id && <small className="error">{errors.category_id}</small>}
                </label>

                <label className="book-field">
                  <span>Genre</span>
                  <select id="genre_id" name="genre_id" value={values.genre_id} onChange={handleChange} onBlur={handleBlur} className={touched.genre_id && errors.genre_id ? 'error' : ''}>
                    <option value="">Select genre</option>
                    {genres.map((genre) => (
                      <option key={genre.id} value={genre.id}>
                        {genre.name}
                      </option>
                    ))}
                  </select>
                  {touched.genre_id && errors.genre_id && <small className="error">{errors.genre_id}</small>}
                </label>

                <label className="book-field">
                  <span>Cover Image URL</span>
                  <input id="image" name="image" type="url" value={values.image} onChange={handleChange} onBlur={handleBlur} className={touched.image && errors.image ? 'error' : ''} />
                  {touched.image && errors.image && <small className="error">{errors.image}</small>}
                </label>

                <label className="book-field">
                  <span>Main Price</span>
                  <input id="price" name="price" type="number" step="0.01" min="0" value={values.price} onChange={handleChange} onBlur={handleBlur} className={touched.price && errors.price ? 'error' : ''} />
                  {touched.price && errors.price && <small className="error">{errors.price}</small>}
                </label>

                <label className="book-field">
                  <span>Paperback Stock</span>
                  <input id="stock" name="stock" type="number" min="0" value={values.stock} onChange={handleChange} onBlur={handleBlur} className={touched.stock && errors.stock ? 'error' : ''} />
                  {touched.stock && errors.stock && <small className="error">{errors.stock}</small>}
                </label>
              </div>

              <label className="book-field book-field-full">
                <span>Description</span>
                <textarea id="description" name="description" rows="6" value={values.description} onChange={handleChange} onBlur={handleBlur} className={touched.description && errors.description ? 'error' : ''} />
                {touched.description && errors.description && <small className="error">{errors.description}</small>}
              </label>
            </section>

            <aside className="book-form-sidebar">
              <section className="book-form-card">
                <h3>Flags</h3>
                <div className="book-toggles">
                  <label className="book-toggle">
                    <input name="is_premium" type="checkbox" checked={values.is_premium} onChange={handleChange} />
                    <span>Premium</span>
                  </label>
                  <label className="book-toggle">
                    <input name="has_ebook" type="checkbox" checked={values.has_ebook} onChange={handleChange} />
                    <span>eBook</span>
                  </label>
                  <label className="book-toggle">
                    <input name="has_audio" type="checkbox" checked={values.has_audio} onChange={handleChange} />
                    <span>Audio</span>
                  </label>
                  <label className="book-toggle">
                    <input name="has_paperback" type="checkbox" checked={values.has_paperback} onChange={handleChange} />
                    <span>Paperback</span>
                  </label>
                </div>
              </section>

              <section className="book-form-card">
                <h3>Cover Preview</h3>
                {values.image ? (
                  <img src={values.image} alt={values.name || 'Book cover preview'} className="book-cover-preview" />
                ) : (
                  <div className="book-cover-placeholder">Paste an image URL to preview the cover.</div>
                )}
              </section>
            </aside>
          </div>

          <div className="book-format-grid">
            <section className="book-form-card">
              <h3>eBook</h3>
              <div className="book-field-grid">
                <label className="book-field">
                  <span>eBook Price</span>
                  <input name="ebook_price" type="number" step="0.01" min="0" value={values.ebook_price} onChange={handleChange} onBlur={handleBlur} className={touched.ebook_price && errors.ebook_price ? 'error' : ''} />
                  {touched.ebook_price && errors.ebook_price && <small className="error">{errors.ebook_price}</small>}
                </label>
                <label className="book-field">
                  <span>eBook PDF URL</span>
                  <input name="ebook_pdf" type="url" value={values.ebook_pdf} onChange={handleChange} onBlur={handleBlur} className={touched.ebook_pdf && errors.ebook_pdf ? 'error' : ''} />
                  {touched.ebook_pdf && errors.ebook_pdf && <small className="error">{errors.ebook_pdf}</small>}
                </label>
                <label className="book-field">
                  <span>eBook Pages</span>
                  <input name="ebook_pages" type="number" min="0" value={values.ebook_pages} onChange={handleChange} onBlur={handleBlur} className={touched.ebook_pages && errors.ebook_pages ? 'error' : ''} />
                  {touched.ebook_pages && errors.ebook_pages && <small className="error">{errors.ebook_pages}</small>}
                </label>
              </div>
            </section>

            <section className="book-form-card">
              <h3>Audio Book</h3>
              <div className="book-field-grid">
                <label className="book-field">
                  <span>Audio Price</span>
                  <input name="audio_price" type="number" step="0.01" min="0" value={values.audio_price} onChange={handleChange} onBlur={handleBlur} className={touched.audio_price && errors.audio_price ? 'error' : ''} />
                  {touched.audio_price && errors.audio_price && <small className="error">{errors.audio_price}</small>}
                </label>
                <label className="book-field">
                  <span>Audio File URL</span>
                  <input name="audio_file" type="url" value={values.audio_file} onChange={handleChange} onBlur={handleBlur} className={touched.audio_file && errors.audio_file ? 'error' : ''} />
                  {touched.audio_file && errors.audio_file && <small className="error">{errors.audio_file}</small>}
                </label>
                <label className="book-field">
                  <span>Audio Minutes</span>
                  <input name="audio_minutes" type="number" min="0" value={values.audio_minutes} onChange={handleChange} onBlur={handleBlur} className={touched.audio_minutes && errors.audio_minutes ? 'error' : ''} />
                  {touched.audio_minutes && errors.audio_minutes && <small className="error">{errors.audio_minutes}</small>}
                </label>
              </div>
            </section>

            <section className="book-form-card">
              <h3>Paperback</h3>
              <div className="book-field-grid">
                <label className="book-field">
                  <span>Paperback Price</span>
                  <input name="paperback_price" type="number" step="0.01" min="0" value={values.paperback_price} onChange={handleChange} onBlur={handleBlur} className={touched.paperback_price && errors.paperback_price ? 'error' : ''} />
                  {touched.paperback_price && errors.paperback_price && <small className="error">{errors.paperback_price}</small>}
                </label>
                <label className="book-field">
                  <span>Paperback Pages</span>
                  <input name="paperback_pages" type="number" min="0" value={values.paperback_pages} onChange={handleChange} onBlur={handleBlur} className={touched.paperback_pages && errors.paperback_pages ? 'error' : ''} />
                  {touched.paperback_pages && errors.paperback_pages && <small className="error">{errors.paperback_pages}</small>}
                </label>
              </div>
            </section>
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

export default BookForm
