import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import BookForm from '../../../components/BookForm'
import { fetchBook, updateBook } from '../../../api/books'
import { fetchAuthors, fetchCategories, fetchGenres } from '../../../api/lookups'

const BookEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [values, setValues] = useState(null)
  const [authors, setAuthors] = useState([])
  const [categories, setCategories] = useState([])
  const [genres, setGenres] = useState([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [bookData, authorsData, categoriesData, genresData] = await Promise.all([
          fetchBook(id),
          fetchAuthors(),
          fetchCategories(),
          fetchGenres(),
        ])
        setValues({
          name: bookData.name || '',
          description: bookData.description || '',
          language: bookData.language || '',
          author_id: bookData.author_id || '',
          category_id: bookData.category_id || '',
          genre_id: bookData.genre_id || '',
          image: bookData.image || '',
          price: bookData.price || '',
          is_premium: !!bookData.is_premium,
          has_ebook: !!bookData.has_ebook,
          has_audio: !!bookData.has_audio,
          has_paperback: !!bookData.has_paperback,
        })
        setAuthors(authorsData)
        setCategories(categoriesData)
        setGenres(genresData)
      } catch (error) {
        console.error('Failed to load book', error)
      }
    }

    loadData()
  }, [id])

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
      await updateBook(id, values)
      navigate('/admin/books')
    } catch (error) {
      console.error('Failed to update book', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (!values) {
    return <p>Loading...</p>
  }

  return (
    <div className="admin-page">
      <h1>Edit Book</h1>
      <BookForm
        values={values}
        onChange={handleChange}
        onSubmit={handleSubmit}
        authors={authors}
        categories={categories}
        genres={genres}
        submitLabel="Update Book"
        isSaving={isSaving}
      />
    </div>
  )
}

export default BookEdit







