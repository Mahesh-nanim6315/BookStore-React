import axiosClient from './axiosClient'

export const getAdminSettings = async () => {
  const { data } = await axiosClient.get('/admin/settings')
  return data
}

export const updateAdminSettings = async (settings) => {
  const { data } = await axiosClient.post('/admin/settings', settings)
  return data
}
