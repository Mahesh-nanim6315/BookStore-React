import axiosClient from './axiosClient'

export const getAdminPayments = async () => {
  const { data } = await axiosClient.get('/admin/payments')
  return data
}
