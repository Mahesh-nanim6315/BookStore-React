import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Loader from '../../../components/common/Loader'
import AuthorForm from '../../../components/AuthorForm'
import { getAdminAuthorEditMeta, updateAdminAuthor } from '../../../api/adminAuthors'
import { showToast } from '../../../utils/toast'

const AdminAuthorsEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [values, setValues] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const loadAuthor = async () => {
      try {
        const response = await getAdminAuthorEditMeta(id)
        if (response.success) {
          const author = response.data.author || {}
          setValues({
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

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSaving(true)

    try {
      const response = await updateAdminAuthor(id, values)
      if (response.success) {
        showToast.success('Author updated successfully!')
        navigate('/dashboard/authors')
      } else {
        showToast.error(response.message || 'Failed to update author')
      }
    } catch (error) {
      console.error('Failed to update author:', error)
      showToast.error('Failed to update author. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (!values) {
    return <Loader />
  }

  return (
    <div className="page">
      <AuthorForm
        values={values}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitLabel="Update Author"
        isSaving={isSaving}
        mode="edit"
      />
    </div>
  )
}

export default AdminAuthorsEdit
