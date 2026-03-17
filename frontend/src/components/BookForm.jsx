import React from 'react'
import { Link } from 'react-router-dom'

const BookForm = ({
  values,
  onChange,
  onSubmit,
  submitLabel,
  isSaving,
  mode = 'create',
  authors = [],
  categories = [],
  genres = [],
}) => {
  return (
    <form className="book-form-shell" onSubmit={onSubmit}>
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

      <div className="book-form-grid">
        <section className="book-form-card">
          <h3>Basic Information</h3>

          <div className="book-field-grid">
            <label className="book-field">
              <span>Book Name</span>
              <input id="name" name="name" type="text" value={values.name} onChange={onChange} required />
            </label>

            <label className="book-field">
              <span>Language</span>
              <input
                id="language"
                name="language"
                type="text"
                value={values.language}
                onChange={onChange}
                required
              />
            </label>

            <label className="book-field">
              <span>Author</span>
              <select id="author_id" name="author_id" value={values.author_id} onChange={onChange} required>
                <option value="">Select author</option>
                {authors.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="book-field">
              <span>Category</span>
              <select
                id="category_id"
                name="category_id"
                value={values.category_id}
                onChange={onChange}
                required
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="book-field">
              <span>Genre</span>
              <select id="genre_id" name="genre_id" value={values.genre_id} onChange={onChange} required>
                <option value="">Select genre</option>
                {genres.map((genre) => (
                  <option key={genre.id} value={genre.id}>
                    {genre.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="book-field">
              <span>Cover Image URL</span>
              <input id="image" name="image" type="url" value={values.image} onChange={onChange} required />
            </label>

            <label className="book-field">
              <span>Main Price</span>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={values.price}
                onChange={onChange}
                required
              />
            </label>

            <label className="book-field">
              <span>Paperback Stock</span>
              <input
                id="stock"
                name="stock"
                type="number"
                min="0"
                value={values.stock}
                onChange={onChange}
              />
            </label>
          </div>

          <label className="book-field book-field-full">
            <span>Description</span>
            <textarea
              id="description"
              name="description"
              rows="6"
              value={values.description}
              onChange={onChange}
              required
            />
          </label>
        </section>

        <aside className="book-form-sidebar">
          <section className="book-form-card">
            <h3>Flags</h3>
            <div className="book-toggles">
              <label className="book-toggle">
                <input name="is_premium" type="checkbox" checked={values.is_premium} onChange={onChange} />
                <span>Premium</span>
              </label>
              <label className="book-toggle">
                <input name="has_ebook" type="checkbox" checked={values.has_ebook} onChange={onChange} />
                <span>eBook</span>
              </label>
              <label className="book-toggle">
                <input name="has_audio" type="checkbox" checked={values.has_audio} onChange={onChange} />
                <span>Audio</span>
              </label>
              <label className="book-toggle">
                <input
                  name="has_paperback"
                  type="checkbox"
                  checked={values.has_paperback}
                  onChange={onChange}
                />
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
              <input
                name="ebook_price"
                type="number"
                step="0.01"
                min="0"
                value={values.ebook_price}
                onChange={onChange}
              />
            </label>
            <label className="book-field">
              <span>eBook PDF URL</span>
              <input name="ebook_pdf" type="url" value={values.ebook_pdf} onChange={onChange} />
            </label>
            <label className="book-field">
              <span>eBook Pages</span>
              <input name="ebook_pages" type="number" min="0" value={values.ebook_pages} onChange={onChange} />
            </label>
          </div>
        </section>

        <section className="book-form-card">
          <h3>Audio Book</h3>
          <div className="book-field-grid">
            <label className="book-field">
              <span>Audio Price</span>
              <input
                name="audio_price"
                type="number"
                step="0.01"
                min="0"
                value={values.audio_price}
                onChange={onChange}
              />
            </label>
            <label className="book-field">
              <span>Audio File URL</span>
              <input name="audio_file" type="url" value={values.audio_file} onChange={onChange} />
            </label>
            <label className="book-field">
              <span>Audio Minutes</span>
              <input
                name="audio_minutes"
                type="number"
                min="0"
                value={values.audio_minutes}
                onChange={onChange}
              />
            </label>
          </div>
        </section>

        <section className="book-form-card">
          <h3>Paperback</h3>
          <div className="book-field-grid">
            <label className="book-field">
              <span>Paperback Price</span>
              <input
                name="paperback_price"
                type="number"
                step="0.01"
                min="0"
                value={values.paperback_price}
                onChange={onChange}
              />
            </label>
            <label className="book-field">
              <span>Paperback Pages</span>
              <input
                name="paperback_pages"
                type="number"
                min="0"
                value={values.paperback_pages}
                onChange={onChange}
              />
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
  )
}

export default BookForm
