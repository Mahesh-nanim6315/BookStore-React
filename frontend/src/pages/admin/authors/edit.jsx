import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Loader from '../../../components/common/Loader'
import AuthorForm from '../../../components/AuthorForm'
import { getAdminAuthorEditMeta, updateAdminAuthor } from '../../../api/adminAuthors'
import { normalizeApiErrors } from '../../../utils/formErrors'
import { showToast } from '../../../utils/toast'

const AdminAuthorsEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [initialValues, setInitialValues] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const loadAuthor = async () => {
      try {
        const response = await getAdminAuthorEditMeta(id)
        if (response.success) {
          const author = response.data.author || {}
          setInitialValues({
            name: author.name || '',
            image: author.image || '',
            bio: author.bio || '',
          })
        }
      } catch (error) {
        console.error('Failed to load author:', error)
      }
    }

    loadAuthor()
  }, [id])

  const handleSubmit = async (values, { setErrors, setStatus }) => {
    setIsSaving(true)
    setStatus(null)

    try {
      const response = await updateAdminAuthor(id, {
        ...values,
        name: values.name.trim(),
        image: values.image.trim(),
      })
      if (response.success) {
        showToast.success('Author updated successfully!')
        navigate('/dashboard/authors')
      } else {
        const message = response.message || 'Failed to update author'
        setStatus(message)
        showToast.error(message)
      }
    } catch (error) {
      console.error('Failed to update author:', error)
      const nextErrors = normalizeApiErrors(error, 'Failed to update author. Please try again.')
      setErrors(nextErrors)
      setStatus(nextErrors.general || null)
      showToast.error(nextErrors.general || 'Failed to update author. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (!initialValues) {
    return <Loader />
  }

  return (
    <div className="page">
      <AuthorForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        submitLabel="Update Author"
        isSaving={isSaving}
        mode="edit"
      />
    </div>
  )
}

export default AdminAuthorsEdit
