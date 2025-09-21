import { createContext, useContext } from 'react'
import type { AuthContextValue } from './modelos'

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
)

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider')
  }
  return context
}

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
