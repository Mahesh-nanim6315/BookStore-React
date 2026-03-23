import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import UserForm from '../../../components/UserForm'
import { createAdminUser, getAdminUserCreateMeta } from '../../../api/adminUsers'
import { showToast } from '../../../utils/toast'

const initialValues = {
  name: '',
  email: '',
  password: '',
  role: 'user',
}

const AdminUsersCreate = () => {
  const navigate = useNavigate()
  const [values, setValues] = useState(initialValues)
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

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSaving(true)

    try {
      const response = await createAdminUser(values)
      if (response.success) {
        showToast.success('User created successfully!')
        navigate('/dashboard/users')
      } else {
        showToast.error(response.message || 'Failed to create user')
      }
    } catch (error) {
      console.error('Failed to create user:', error)
      showToast.error('Failed to create user. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="page">
      <UserForm
        values={values}
        onChange={handleChange}
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
