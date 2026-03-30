import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BookForm from '../../../components/BookForm'
import { createAdminBook, getAdminBookCreateMeta } from '../../../api/adminBooks'
import { normalizeApiErrors } from '../../../utils/formErrors'
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

  const handleSubmit = async (values, { setErrors, setStatus }) => {
    setIsSaving(true)
    setStatus(null)

    try {
      const response = await createAdminBook({
        ...values,
        name: values.name.trim(),
        description: values.description.trim(),
        language: values.language.trim(),
        image: values.image.trim(),
        ebook_pdf: values.ebook_pdf.trim(),
        audio_file: values.audio_file.trim(),
      })
      if (response.success) {
        showToast.success('Book created successfully!')
        navigate('/dashboard/books')
      } else {
        const message = response.message || 'Failed to create book'
        setStatus(message)
        showToast.error(message)
      }
    } catch (error) {
      console.error('Failed to create book:', error)
      const nextErrors = normalizeApiErrors(error, 'Failed to create book. Please try again.')
      setErrors(nextErrors)
      setStatus(nextErrors.general || null)
      showToast.error(nextErrors.general || 'Failed to create book. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="page">
      <BookForm
        initialValues={initialValues}
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
