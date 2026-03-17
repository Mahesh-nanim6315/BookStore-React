import axiosClient from './axiosClient'

export const getAdminRolesPermissions = async () => {
  const { data } = await axiosClient.get('/admin/roles-permissions')
  return data
}

export const updateAdminRolesPermissions = async (permissions) => {
  const { data } = await axiosClient.put('/admin/roles-permissions', { permissions })
  return data
}
