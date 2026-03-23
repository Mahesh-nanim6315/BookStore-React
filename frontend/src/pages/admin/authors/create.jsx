import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthorForm from '../../../components/AuthorForm'
import { createAdminAuthor } from '../../../api/adminAuthors'
import { showToast } from '../../../utils/toast'

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
      const response = await createAdminAuthor(values)
      if (response.success) {
        showToast.success('Author created successfully!')
        navigate('/dashboard/authors')
      } else {
        showToast.error(response.message || 'Failed to create author')
      }
    } catch (error) {
      console.error('Failed to create author:', error)
      showToast.error('Failed to create author. Please try again.')
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
