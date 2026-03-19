export const hasPermission = (user, permission) => {
  if (!user || !permission) {
    return false
  }

  if (String(user.role || '').toLowerCase() === 'admin') {
    return true
  }

  const permissions = Array.isArray(user.permissions) ? user.permissions : []
  return permissions.includes(permission)
}

export const getDefaultPostLoginPath = (user) => {
  if (hasPermission(user, 'access_dashboard')) {
    return '/dashboard'
  }

  return '/'
}
