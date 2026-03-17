import axiosClient from './axiosClient'

export const getProfile = async () => {
  const { data } = await axiosClient.get('/profile')
  return data
}

export const updateProfile = async (profileData) => {
  const { data } = await axiosClient.put('/profile/update', profileData)
  return data
}

export const updateCover = async (coverFile) => {
  const formData = new FormData()
  formData.append('cover', coverFile)
  
  const { data } = await axiosClient.post('/profile/cover', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return data
}

export const updateAvatar = async (avatarFile) => {
  const formData = new FormData()
  formData.append('avatar', avatarFile)
  
  const { data } = await axiosClient.post('/profile/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return data
}
