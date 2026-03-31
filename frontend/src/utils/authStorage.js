const AUTH_TOKEN_KEY = 'auth_token'
const USER_KEY = 'user'
const PERSIST_KEY = 'auth_persist'

const getActiveStorage = () => {
  const persistMode = localStorage.getItem(PERSIST_KEY)

  if (persistMode === 'session') {
    return sessionStorage
  }

  return localStorage
}

export const getStoredToken = () => {
  return localStorage.getItem(AUTH_TOKEN_KEY) || sessionStorage.getItem(AUTH_TOKEN_KEY)
}

export const getStoredUser = () => {
  return localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY)
}

export const setAuthSession = ({ token, user, persist }) => {
  const targetStorage = persist ? localStorage : sessionStorage
  const otherStorage = persist ? sessionStorage : localStorage

  otherStorage.removeItem(AUTH_TOKEN_KEY)
  otherStorage.removeItem(USER_KEY)

  localStorage.setItem(PERSIST_KEY, persist ? 'local' : 'session')
  targetStorage.setItem(AUTH_TOKEN_KEY, token)
  targetStorage.setItem(USER_KEY, JSON.stringify(user))
}

export const clearAuthSession = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(PERSIST_KEY)
  sessionStorage.removeItem(AUTH_TOKEN_KEY)
  sessionStorage.removeItem(USER_KEY)
}

export const updateStoredUser = (user) => {
  getActiveStorage().setItem(USER_KEY, JSON.stringify(user))
}
