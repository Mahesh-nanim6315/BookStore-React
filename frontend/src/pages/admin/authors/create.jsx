import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthorForm from '../../../components/AuthorForm'
import { createAdminAuthor } from '../../../api/adminAuthors'
import { normalizeApiErrors } from '../../../utils/formErrors'
import { showToast } from '../../../utils/toast'

const initialValues = {
  name: '',
  image: '',
  bio: '',
}

const AdminAuthorsCreate = () => {
  const navigate = useNavigate()
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (values, { setErrors, setStatus }) => {
    setIsSaving(true)
    setStatus(null)

    try {
      const response = await createAdminAuthor({
        ...values,
        name: values.name.trim(),
        image: values.image.trim(),
      })
      if (response.success) {
        showToast.success('Author created successfully!')
        navigate('/dashboard/authors')
      } else {
        const message = response.message || 'Failed to create author'
        setStatus(message)
        showToast.error(message)
      }
    } catch (error) {
      console.error('Failed to create author:', error)
      const nextErrors = normalizeApiErrors(error, 'Failed to create author. Please try again.')
      setErrors(nextErrors)
      setStatus(nextErrors.general || null)
      showToast.error(nextErrors.general || 'Failed to create author. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="page">
      <AuthorForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        submitLabel="Create Author"
        isSaving={isSaving}
        mode="create"
      />
    </div>
  )
}

export default AdminAuthorsCreate
