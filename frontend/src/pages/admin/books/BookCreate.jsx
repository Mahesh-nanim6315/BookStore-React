import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BookForm from '../../../components/BookForm'
import { createAdminBook, getAdminBookCreateMeta } from '../../../api/adminBooks'
import { showToast } from '../../../utils/toast'

const initialValues = {
  name: '',
  description: '',
  language: '',
  author_id: '',
  category_id: '',
  genre_id: '',
  image: '',
  price: '',
  stock: 0,
  is_premium: false,
  has_ebook: false,
  ebook_price: '',
  ebook_pdf: '',
  ebook_pages: '',
  has_audio: false,
  audio_price: '',
  audio_file: '',
  audio_minutes: '',
  has_paperback: false,
  paperback_price: '',
  paperback_pages: '',
}

const BookCreate = () => {
  const navigate = useNavigate()
  const [values, setValues] = useState(initialValues)
  const [authors, setAuthors] = useState([])
  const [categories, setCategories] = useState([])
  const [genres, setGenres] = useState([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const loadLookups = async () => {
      try {
        const response = await getAdminBookCreateMeta()
        if (response.success) {
          setAuthors(response.data.authors || [])
          setCategories(response.data.categories || [])
          setGenres(response.data.genres || [])
        }
      } catch (error) {
        console.error('Failed to load book metadata:', error)
      }
    }

    loadLookups()
  }, [])

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSaving(true)

    try {
      const response = await createAdminBook(values)
      if (response.success) {
        showToast.success('Book created successfully!')
        navigate('/dashboard/books')
      } else {
        showToast.error(response.message || 'Failed to create book')
      }
    } catch (error) {
      console.error('Failed to create book:', error)
      showToast.error('Failed to create book. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="page">
      <BookForm
        values={values}
        onChange={handleChange}
        onSubmit={handleSubmit}
        authors={authors}
        categories={categories}
        genres={genres}
        submitLabel="Create Book"
        isSaving={isSaving}
        mode="create"
      />
    </div>
  )
}

export default BookCreate
