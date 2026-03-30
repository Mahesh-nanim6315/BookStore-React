import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Loader from '../../../components/common/Loader'
import BookForm from '../../../components/BookForm'
import { getAdminBookEditMeta, updateAdminBook } from '../../../api/adminBooks'
import { normalizeApiErrors } from '../../../utils/formErrors'
import { showToast } from '../../../utils/toast'

const BookEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [initialValues, setInitialValues] = useState(null)
  const [authors, setAuthors] = useState([])
  const [categories, setCategories] = useState([])
  const [genres, setGenres] = useState([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const loadBook = async () => {
      try {
        const response = await getAdminBookEditMeta(id)

        if (!response.success) {
          return
        }

        const book = response.data.book || {}

        setInitialValues({
          name: book.name || '',
          description: book.description || '',
          language: book.language || '',
          author_id: book.author_id || '',
          category_id: book.category_id || '',
          genre_id: book.genre_id || '',
          image: book.image || '',
          price: book.price || '',
          stock: book.stock ?? 0,
          is_premium: !!book.is_premium,
          has_ebook: !!book.has_ebook,
          ebook_price: book.ebook_price || '',
          ebook_pdf: book.ebook_pdf || '',
          ebook_pages: book.ebook_pages || '',
          has_audio: !!book.has_audio,
          audio_price: book.audio_price || '',
          audio_file: book.audio_file || '',
          audio_minutes: book.audio_minutes || '',
          has_paperback: !!book.has_paperback,
          paperback_price: book.paperback_price || '',
          paperback_pages: book.paperback_pages || '',
        })

        setAuthors(response.data.authors || [])
        setCategories(response.data.categories || [])
        setGenres(response.data.genres || [])
      } catch (error) {
        console.error('Failed to load book:', error)
      }
    }

    loadBook()
  }, [id])

  const handleSubmit = async (values, { setErrors, setStatus }) => {
    setIsSaving(true)
    setStatus(null)

    try {
      const response = await updateAdminBook(id, {
        ...values,
        name: values.name.trim(),
        description: values.description.trim(),
        language: values.language.trim(),
        image: values.image.trim(),
        ebook_pdf: values.ebook_pdf.trim(),
        audio_file: values.audio_file.trim(),
      })
      if (response.success) {
        showToast.success('Book updated successfully!')
        navigate('/dashboard/books')
      } else {
        const message = response.message || 'Failed to update book'
        setStatus(message)
        showToast.error(message)
      }
    } catch (error) {
      console.error('Failed to update book:', error)
      const nextErrors = normalizeApiErrors(error, 'Failed to update book. Please try again.')
      setErrors(nextErrors)
      setStatus(nextErrors.general || null)
      showToast.error(nextErrors.general || 'Failed to update book. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (!initialValues) {
    return <Loader />
  }

  return (
    <div className="page">
      <BookForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        authors={authors}
        categories={categories}
        genres={genres}
        submitLabel="Update Book"
        isSaving={isSaving}
        mode="edit"
      />
    </div>
  )
}

export default BookEdit
