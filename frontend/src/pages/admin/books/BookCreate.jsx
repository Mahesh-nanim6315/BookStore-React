import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BookForm from '../../../components/BookForm'
import { createBook } from '../../../api/books'
import { fetchAuthors, fetchCategories, fetchGenres } from '../../../api/lookups'

const initialValues = {
  name: '',
  description: '',
  language: '',
  author_id: '',
  category_id: '',
  genre_id: '',
  image: '',
  price: '',
  is_premium: false,
  has_ebook: false,
  has_audio: false,
  has_paperback: false,
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
        const [authorsData, categoriesData, genresData] = await Promise.all([
          fetchAuthors(),
          fetchCategories(),
          fetchGenres(),
        ])
        setAuthors(authorsData)
        setCategories(categoriesData)
        setGenres(genresData)
      } catch (error) {
        console.error('Failed to load lookups', error)
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
      await createBook(values)
      navigate('/admin/books')
    } catch (error) {
      console.error('Failed to create book', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="admin-page">
      <h1>Create Book</h1>
      <BookForm
        values={values}
        onChange={handleChange}
        onSubmit={handleSubmit}
        authors={authors}
        categories={categories}
        genres={genres}
        submitLabel="Create Book"
        isSaving={isSaving}
      />
    </div>
  )
}

export default BookCreate







