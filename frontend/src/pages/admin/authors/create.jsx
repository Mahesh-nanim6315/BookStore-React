import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthorForm from '../../../components/AuthorForm'
import { createAdminAuthor } from '../../../api/adminAuthors'

const initialValues = {
  name: '',
  image: '',
  bio: '',
}

const AdminAuthorsCreate = () => {
  const navigate = useNavigate()
  const [values, setValues] = useState(initialValues)
  const [isSaving, setIsSaving] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSaving(true)

    try {
      await createAdminAuthor(values)
      navigate('/dashboard/authors')
    } catch (error) {
      console.error('Failed to create author:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="page">
      <AuthorForm
        values={values}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitLabel="Create Author"
        isSaving={isSaving}
        mode="create"
      />
    </div>
  )
}

export default AdminAuthorsCreate
