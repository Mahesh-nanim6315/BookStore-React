import React from 'react'

const BookForm = ({
  values,
  onChange,
  onSubmit,
  authors,
  categories,
  genres,
  submitLabel,
  isSaving,
}) => {
  return (
    <form className="admin-form" onSubmit={onSubmit}>
      <div className="form-row">
        <label htmlFor="name">Book Name</label>
        <input
          id="name"
          name="name"
          type="text"
          value={values.name}
          onChange={onChange}
          required
        />
      </div>

      <div className="form-row">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          rows="6"
          value={values.description}
          onChange={onChange}
          required
        />
      </div>

      <div className="form-row">
        <label htmlFor="language">Language</label>
        <input
          id="language"
          name="language"
          type="text"
          value={values.language}
          onChange={onChange}
          required
        />
      </div>

      <div className="form-row">
        <label htmlFor="author_id">Author</label>
        <select
          id="author_id"
          name="author_id"
          value={values.author_id}
          onChange={onChange}
          required
        >
          <option value="">Select author</option>
          {authors.map((author) => (
            <option key={author.id} value={author.id}>
              {author.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <label htmlFor="category_id">Category</label>
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
      </div>

      <div className="form-row">
        <label htmlFor="genre_id">Genre</label>
        <select
          id="genre_id"
          name="genre_id"
          value={values.genre_id}
          onChange={onChange}
          required
        >
          <option value="">Select genre</option>
          {genres.map((genre) => (
            <option key={genre.id} value={genre.id}>
              {genre.name}            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <label htmlFor="image">Image URL</label>
        <input
          id="image"
          name="image"
          type="url"
          value={values.image}
          onChange={onChange}
          required
        />
      </div>

      <div className="form-row">
        <label htmlFor="price">Price</label>
        <input
          id="price"
          name="price"
          type="number"
          step="0.01"
          value={values.price}
          onChange={onChange}
          required
        />
      </div>

      <div className="form-row form-row-inline">
        <label>
          <input
            name="is_premium"
            type="checkbox"
            checked={values.is_premium}
            onChange={onChange}
          />
          Premium
        </label>
        <label>
          <input
            name="has_ebook"
            type="checkbox"
            checked={values.has_ebook}
            onChange={onChange}
          />
          Ebook
        </label>
        <label>
          <input
            name="has_audio"
            type="checkbox"
            checked={values.has_audio}
            onChange={onChange}
          />
          Audio
        </label>
        <label>
          <input
            name="has_paperback"
            type="checkbox"
            checked={values.has_paperback}
            onChange={onChange}
          />
          Paperback
        </label>
      </div>

      <div className="form-actions">
        <button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  )
}

export default BookForm

