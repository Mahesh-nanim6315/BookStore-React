import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Loader from '../../../components/common/Loader'
import UserForm from '../../../components/UserForm'
import { getAdminUserEditMeta, updateAdminUser } from '../../../api/adminUsers'
import { showToast } from '../../../utils/toast'

const AdminUsersEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [values, setValues] = useState(null)
  const [roles, setRoles] = useState(['user', 'admin', 'manager', 'staff'])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const response = await getAdminUserEditMeta(id)
        if (response.success) {
          const user = response.data.user || {}
          setValues({
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

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setValues((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSaving(true)

    try {
      const response = await updateAdminUser(id, values)
      if (response.success) {
        showToast.success('User updated successfully!')
        navigate('/dashboard/users')
      } else {
        showToast.error(response.message || 'Failed to update user')
      }
    } catch (error) {
      console.error('Failed to update user:', error)
      showToast.error('Failed to update user. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (!values) {
    return <Loader />
  }

  return (
    <div className="page">
      <UserForm
        values={values}
        onChange={handleChange}
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
