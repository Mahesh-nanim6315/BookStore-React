import React, { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import Loader from '../../../components/common/Loader'
import { getAdminRolesPermissions, updateAdminRolesPermissions } from '../../../api/adminRoles'
import { showToast } from '../../../utils/toast'

const groupPermissions = (permissionLabels) => {
  const groups = {
    General: [],
    Catalog: [],
    Users: [],
    Moderation: [],
    System: [],
  }

  for (const [key, label] of Object.entries(permissionLabels || {})) {
    if (key.startsWith('books.') || key.startsWith('authors.')) {
      groups.Catalog.push([key, label])
      continue
    }

    if (key.startsWith('users.')) {
      groups.Users.push([key, label])
      continue
    }

    if (key === 'manage_reviews' || key === 'manage_notifications') {
      groups.Moderation.push([key, label])
      continue
    }

    if (key === 'manage_roles_permissions') {
      groups.System.push([key, label])
      continue
    }

    groups.General.push([key, label])
  }

  return groups
}

const PermissionChip = ({ role, permissionKey, label, checked, togglePermission }) => (
  <label
    className={`roles-permission-chip ${checked ? 'active' : ''} ${role === 'admin' ? 'locked' : ''}`}
  >
    <input
      type="checkbox"
      checked={checked}
      disabled={role === 'admin'}
      onChange={() => togglePermission(role, permissionKey)}
    />
    <span>{label}</span>
  </label>
)

const PermissionGroup = ({ role, groupName, permissions, selectedPermissions, togglePermission }) => (
  <div className="roles-group">
    <h4>{groupName}</h4>
    <div className="roles-permissions-grid">
      {permissions.map(([permissionKey, label]) => (
        <PermissionChip
          key={permissionKey}
          role={role}
          permissionKey={permissionKey}
          label={label}
          checked={selectedPermissions.includes(permissionKey)}
          togglePermission={togglePermission}
        />
      ))}
    </div>
  </div>
)

const RoleCard = ({
  role,
  selectedPermissions,
  groupedPermissions,
  setAllForRole,
  togglePermission,
}) => (
  <section className="roles-card">
    <div className="roles-card-header">
      <div>
        <h3>{role.charAt(0).toUpperCase() + role.slice(1)}</h3>
        <p className="book-subline">
          {role === 'admin'
            ? 'Admin always keeps full access.'
            : `${selectedPermissions.length} permissions selected`}
        </p>
      </div>

      {role === 'admin' ? (
        <span className="review-status-badge approved">
          Locked Full Access
        </span>
      ) : (
        <div className="book-action-row">
          <button
            type="button"
            className="admin-button"
            onClick={() => setAllForRole(role, true)}
          >
            Select All
          </button>
          <button
            type="button"
            className="admin-button"
            onClick={() => setAllForRole(role, false)}
          >
            Clear
          </button>
        </div>
      )}
    </div>

    <div className="roles-groups">
      {Object.entries(groupedPermissions).map(([groupName, permissions]) => (
        <PermissionGroup
          key={groupName}
          role={role}
          groupName={groupName}
          permissions={permissions}
          selectedPermissions={selectedPermissions}
          togglePermission={togglePermission}
        />
      ))}
    </div>
  </section>
)

const AdminRolesPermissionsIndex = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [roles, setRoles] = useState([])
  const [permissionLabels, setPermissionLabels] = useState({})
  const [rolePermissions, setRolePermissions] = useState({})
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        setLoading(true)
        const response = await getAdminRolesPermissions()

        if (response.success) {
          setRoles(response.data.roles || [])
          setPermissionLabels(response.data.permission_labels || {})
          setRolePermissions(response.data.role_permissions || {})
        }
      } catch (error) {
        console.error('Failed to load roles and permissions:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPermissions()
  }, [])

  const groupedPermissions = useMemo(
    () => groupPermissions(permissionLabels),
    [permissionLabels],
  )

  const togglePermission = (role, permissionKey) => {
    if (role === 'admin') {
      return
    }

    setRolePermissions((current) => {
      const currentPermissions = current[role] || []
      const nextPermissions = currentPermissions.includes(permissionKey)
        ? currentPermissions.filter((item) => item !== permissionKey)
        : [...currentPermissions, permissionKey]

      return {
        ...current,
        [role]: nextPermissions,
      }
    })
  }

  const setAllForRole = (role, enabled) => {
    if (role === 'admin') {
      return
    }

    const allPermissions = Object.keys(permissionLabels)
    setRolePermissions((current) => ({
      ...current,
      [role]: enabled ? allPermissions : [],
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setSaveMessage('')

    try {
      const response = await updateAdminRolesPermissions(rolePermissions)
      if (response.success) {
        setRolePermissions(response.data.role_permissions || rolePermissions)
        showToast.success('Permissions updated successfully!')
      } else {
        showToast.error(response.message || 'Failed to update permissions')
      }
    } catch (error) {
      console.error('Failed to update permissions:', error)
      showToast.error('Failed to update permissions. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Loader />
  }

  return (
    <div className="page">
      <div className="page-header admin-list-header">
        <div>
          <h2>Roles & Permissions</h2>
          <p className="admin-page-subtitle">
            Control what each role can access across orders, catalog management, moderation, and system tools.
          </p>
        </div>
      </div>

      {saveMessage ? (
        <div className="roles-save-banner">
          {saveMessage}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="roles-shell">
        {roles.map((role) => {
          const selectedPermissions = rolePermissions[role] || []

          return (
            <RoleCard
              key={role}
              role={role}
              selectedPermissions={selectedPermissions}
              groupedPermissions={groupedPermissions}
              setAllForRole={setAllForRole}
              togglePermission={togglePermission}
            />
          )
        })}

        <div className="book-form-actions">
          <button type="submit" className="admin-button admin-button-success" disabled={saving}>
            {saving ? 'Saving...' : 'Save Permissions'}
          </button>
        </div>
      </form>
    </div>
  )
}

PermissionChip.propTypes = {
  role: PropTypes.string.isRequired,
  permissionKey: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  togglePermission: PropTypes.func.isRequired,
}

PermissionGroup.propTypes = {
  role: PropTypes.string.isRequired,
  groupName: PropTypes.string.isRequired,
  permissions: PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.string).isRequired,
  ).isRequired,
  selectedPermissions: PropTypes.arrayOf(PropTypes.string).isRequired,
  togglePermission: PropTypes.func.isRequired,
}

RoleCard.propTypes = {
  role: PropTypes.string.isRequired,
  selectedPermissions: PropTypes.arrayOf(PropTypes.string).isRequired,
  groupedPermissions: PropTypes.objectOf(
    PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string).isRequired).isRequired,
  ).isRequired,
  setAllForRole: PropTypes.func.isRequired,
  togglePermission: PropTypes.func.isRequired,
}

export default AdminRolesPermissionsIndex
