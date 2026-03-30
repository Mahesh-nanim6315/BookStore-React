import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Loader from '../../../components/common/Loader'
import UserForm from '../../../components/UserForm'
import { getAdminUserEditMeta, updateAdminUser } from '../../../api/adminUsers'
import { normalizeApiErrors } from '../../../utils/formErrors'
import { showToast } from '../../../utils/toast'

const AdminUsersEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [initialValues, setInitialValues] = useState(null)
  const [roles, setRoles] = useState(['user', 'admin', 'manager', 'staff'])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const response = await getAdminUserEditMeta(id)
        if (response.success) {
          const user = response.data.user || {}
          setInitialValues({
            name: user.name || '',
            email: user.email || '',
            role: user.role || 'user',
            is_active: !!user.is_active,
          })
          setRoles(response.data.available_roles || ['user', 'admin', 'manager', 'staff'])
        }
      } catch (error) {
        console.error('Failed to load user:', error)
      }
    }

    loadMeta()
  }, [id])

  const handleSubmit = async (values, { setErrors, setStatus }) => {
    setIsSaving(true)
    setStatus(null)

    try {
      const response = await updateAdminUser(id, {
        ...values,
        name: values.name.trim(),
        email: values.email.trim(),
      })
      if (response.success) {
        showToast.success('User updated successfully!')
        navigate('/dashboard/users')
      } else {
        const message = response.message || 'Failed to update user'
        setStatus(message)
        showToast.error(message)
      }
    } catch (error) {
      console.error('Failed to update user:', error)
      const nextErrors = normalizeApiErrors(error, 'Failed to update user. Please try again.')
      setErrors(nextErrors)
      setStatus(nextErrors.general || null)
      showToast.error(nextErrors.general || 'Failed to update user. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (!initialValues) {
    return <Loader />
  }

  return (
    <div className="page">
      <UserForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        submitLabel="Update User"
        isSaving={isSaving}
        roles={roles}
        mode="edit"
      />
    </div>
  )
}

export default AdminUsersEdit
