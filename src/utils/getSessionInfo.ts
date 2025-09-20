export const getSessionInfo = () => {
  const userStored = localStorage.getItem('sessionUser')
  return userStored ? JSON.parse(userStored) : null
}

export const getAuthToken = () => {
  return localStorage.getItem('authToken')
}

export const isAuthenticated = () => {
  return !!getAuthToken()
}

export const clearSession = () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('sessionUser')
}