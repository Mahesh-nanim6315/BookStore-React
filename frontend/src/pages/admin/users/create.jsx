import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import UserForm from '../../../components/UserForm'
import { createAdminUser, getAdminUserCreateMeta } from '../../../api/adminUsers'
import { normalizeApiErrors } from '../../../utils/formErrors'
import { showToast } from '../../../utils/toast'

const initialValues = {
  name: '',
  email: '',
  password: '',
  role: 'user',
}

const AdminUsersCreate = () => {
  const navigate = useNavigate()
  const [roles, setRoles] = useState(['user', 'admin', 'manager', 'staff'])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const response = await getAdminUserCreateMeta()
        if (response.success) {
          setRoles(response.data.available_roles || ['user', 'admin', 'manager', 'staff'])
        }
      } catch (error) {
        console.error('Failed to load user meta:', error)
      }
    }

    loadMeta()
  }, [])

  const handleSubmit = async (values, { setErrors, setStatus }) => {
    setIsSaving(true)
    setStatus(null)

    try {
      const response = await createAdminUser({
        ...values,
        name: values.name.trim(),
        email: values.email.trim(),
      })
      if (response.success) {
        showToast.success('User created successfully!')
        navigate('/dashboard/users')
      } else {
        const message = response.message || 'Failed to create user'
        setStatus(message)
        showToast.error(message)
      }
    } catch (error) {
      console.error('Failed to create user:', error)
      const nextErrors = normalizeApiErrors(error, 'Failed to create user. Please try again.')
      setErrors(nextErrors)
      setStatus(nextErrors.general || null)
      showToast.error(nextErrors.general || 'Failed to create user. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="page">
      <UserForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        submitLabel="Create User"
        isSaving={isSaving}
        roles={roles}
        mode="create"
      />
    </div>
  )
}

export default AdminUsersCreate
