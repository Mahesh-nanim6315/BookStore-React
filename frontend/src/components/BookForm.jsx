import React from 'react'
import { Link } from 'react-router-dom'
import { Formik } from 'formik'
import * as Yup from 'yup'
import PropTypes from 'prop-types'

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

const FORMAT_REQUIREMENTS = [
  {
    enabledField: 'has_ebook',
    fields: [
      ['ebook_price', 'eBook price is required when eBook is enabled.'],
      ['ebook_pdf', 'eBook PDF URL is required when eBook is enabled.'],
      ['ebook_pages', 'eBook pages are required when eBook is enabled.'],
    ],
  },
  {
    enabledField: 'has_audio',
    fields: [
      ['audio_price', 'Audio price is required when audio is enabled.'],
      ['audio_file', 'Audio file URL is required when audio is enabled.'],
      ['audio_minutes', 'Audio minutes are required when audio is enabled.'],
    ],
  },
  {
    enabledField: 'has_paperback',
    fields: [
      ['paperback_price', 'Paperback price is required when paperback is enabled.'],
      ['paperback_pages', 'Paperback pages are required when paperback is enabled.'],
      ['stock', 'Paperback stock is required when paperback is enabled.'],
    ],
  },
]

const isBlank = (value) => value == null || String(value).trim() === ''

const getFormatValidationError = (values) => {
  const makeError = (path, message) => new Yup.ValidationError(message, values[path], path)

  if (!values.has_ebook && !values.has_audio && !values.has_paperback) {
    return makeError('formats', 'Enable at least one format before saving a book.')
  }

  for (const requirement of FORMAT_REQUIREMENTS) {
    if (!values[requirement.enabledField]) {
      continue
    }

    const invalidField = requirement.fields.find(([field]) => isBlank(values[field]))
    if (invalidField) {
      const [field, message] = invalidField
      return makeError(field, message)
    }
  }

  return null
}

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
      <option value="">Select {label.toLowerCase()}</option>
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.name}
        </option>
      ))}
    </select>
    <FieldError touched={touched} errors={errors} field={field} />
  </label>
)

const ToggleField = ({ field, label, values, handleChange }) => (
  <label className="book-toggle">
    <input name={field} type="checkbox" checked={values[field]} onChange={handleChange} />
    <span>{label}</span>
  </label>
)

const FormatSection = ({ title, fields, formik }) => (
  <section className="book-form-card">
    <h3>{title}</h3>
    <div className="book-field-grid">
      {fields.map(({ field, label, ...inputProps }) => (
        <TextField
          key={field}
          field={field}
          label={label}
          values={formik.values}
          errors={formik.errors}
          touched={formik.touched}
          handleChange={formik.handleChange}
          handleBlur={formik.handleBlur}
          {...inputProps}
        />
      ))}
    </div>
  </section>
)

const BookFormContent = ({
  formik,
  mode,
  authors,
  categories,
  genres,
  submitLabel,
  isSaving,
}) => {
  const { values, errors, touched, status, handleChange, handleBlur, handleSubmit } = formik

  return (
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
            <TextField field="name" label="Book Name" values={values} errors={errors} touched={touched} handleChange={handleChange} handleBlur={handleBlur} />
            <TextField field="language" label="Language" values={values} errors={errors} touched={touched} handleChange={handleChange} handleBlur={handleBlur} />
            <SelectField field="author_id" label="Author" options={authors} values={values} errors={errors} touched={touched} handleChange={handleChange} handleBlur={handleBlur} />
            <SelectField field="category_id" label="Category" options={categories} values={values} errors={errors} touched={touched} handleChange={handleChange} handleBlur={handleBlur} />
            <SelectField field="genre_id" label="Genre" options={genres} values={values} errors={errors} touched={touched} handleChange={handleChange} handleBlur={handleBlur} />
            <TextField field="image" label="Cover Image URL" type="url" values={values} errors={errors} touched={touched} handleChange={handleChange} handleBlur={handleBlur} />
            <TextField field="price" label="Main Price" type="number" step="0.01" min="0" values={values} errors={errors} touched={touched} handleChange={handleChange} handleBlur={handleBlur} />
            <TextField field="stock" label="Paperback Stock" type="number" min="0" values={values} errors={errors} touched={touched} handleChange={handleChange} handleBlur={handleBlur} />
          </div>

          <label className="book-field book-field-full">
            <span>Description</span>
            <textarea
              id="description"
              name="description"
              rows="6"
              value={values.description}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getFieldErrorClass(touched, errors, 'description')}
            />
            <FieldError touched={touched} errors={errors} field="description" />
          </label>
        </section>

        <aside className="book-form-sidebar">
          <section className="book-form-card">
            <h3>Flags</h3>
            <div className="book-toggles">
              <ToggleField field="is_premium" label="Premium" values={values} handleChange={handleChange} />
              <ToggleField field="has_ebook" label="eBook" values={values} handleChange={handleChange} />
              <ToggleField field="has_audio" label="Audio" values={values} handleChange={handleChange} />
              <ToggleField field="has_paperback" label="Paperback" values={values} handleChange={handleChange} />
            </div>
            {errors.formats && <small className="error">{errors.formats}</small>}
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
        <FormatSection
          title="eBook"
          formik={formik}
          fields={[
            { field: 'ebook_price', label: 'eBook Price', type: 'number', step: '0.01', min: '0' },
            { field: 'ebook_pdf', label: 'eBook PDF URL', type: 'url' },
            { field: 'ebook_pages', label: 'eBook Pages', type: 'number', min: '0' },
          ]}
        />
        <FormatSection
          title="Audio Book"
          formik={formik}
          fields={[
            { field: 'audio_price', label: 'Audio Price', type: 'number', step: '0.01', min: '0' },
            { field: 'audio_file', label: 'Audio File URL', type: 'url' },
            { field: 'audio_minutes', label: 'Audio Minutes', type: 'number', min: '0' },
          ]}
        />
        <FormatSection
          title="Paperback"
          formik={formik}
          fields={[
            { field: 'paperback_price', label: 'Paperback Price', type: 'number', step: '0.01', min: '0' },
            { field: 'paperback_pages', label: 'Paperback Pages', type: 'number', min: '0' },
          ]}
        />
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

const optionShape = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  name: PropTypes.string.isRequired,
})

const formatFieldShape = PropTypes.shape({
  field: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  step: PropTypes.string,
  min: PropTypes.string,
})

const formikShape = PropTypes.shape({
  values: fieldStateShape,
  errors: fieldStateShape,
  touched: fieldStateShape,
  status: PropTypes.string,
  handleChange: PropTypes.func.isRequired,
  handleBlur: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
}).isRequired

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
    if (!values) {
      return true
    }

    const validationResult = getFormatValidationError(values)
    if (validationResult) {
      throw validationResult
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
      {(formik) => <BookFormContent formik={formik} mode={mode} authors={authors} categories={categories} genres={genres} submitLabel={submitLabel} isSaving={isSaving} />}
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
  options: PropTypes.arrayOf(optionShape).isRequired,
  values: fieldStateShape,
  errors: fieldStateShape,
  touched: fieldStateShape,
  handleChange: PropTypes.func.isRequired,
  handleBlur: PropTypes.func.isRequired,
}

ToggleField.propTypes = {
  field: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  values: fieldStateShape,
  handleChange: PropTypes.func.isRequired,
}

FormatSection.propTypes = {
  title: PropTypes.string.isRequired,
  fields: PropTypes.arrayOf(formatFieldShape).isRequired,
  formik: formikShape,
}

BookFormContent.propTypes = {
  formik: formikShape,
  mode: PropTypes.oneOf(['create', 'edit']),
  authors: PropTypes.arrayOf(optionShape).isRequired,
  categories: PropTypes.arrayOf(optionShape).isRequired,
  genres: PropTypes.arrayOf(optionShape).isRequired,
  submitLabel: PropTypes.string.isRequired,
  isSaving: PropTypes.bool.isRequired,
}

BookForm.propTypes = {
  initialValues: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    language: PropTypes.string,
    author_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    category_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    genre_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    image: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    stock: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    ebook_price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    ebook_pdf: PropTypes.string,
    ebook_pages: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    audio_price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    audio_file: PropTypes.string,
    audio_minutes: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    paperback_price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    paperback_pages: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    is_premium: PropTypes.bool,
    has_ebook: PropTypes.bool,
    has_audio: PropTypes.bool,
    has_paperback: PropTypes.bool,
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
  submitLabel: PropTypes.string.isRequired,
  isSaving: PropTypes.bool.isRequired,
  mode: PropTypes.oneOf(['create', 'edit']),
  authors: PropTypes.arrayOf(optionShape),
  categories: PropTypes.arrayOf(optionShape),
  genres: PropTypes.arrayOf(optionShape),
}

export default BookForm
