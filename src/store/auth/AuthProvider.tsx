import React, { useReducer, useEffect, type ReactNode } from 'react'
import { AuthContext } from './AuthContext'
import { showNotification } from '../../utils/showNotification'
import type { AuthAction, AuthContextValue, AuthState, User } from './modelos'
import { setGlobalLogout } from '../../interceptors/axiosInstance'

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      }

    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      }

    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
      }

    case 'RESTORE_SESSION':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      }

    default:
      return state
  }
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  })

  const login = (user: User, token: string) => {
    try {
      localStorage.setItem('authToken', token)
      localStorage.setItem('sessionUser', JSON.stringify(user))

      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } })

    } catch (error) {
      console.error('❌ Error al guardar sesión:', error)
      showNotification({
        type: 'error',
        message: 'Error al guardar la sesión',
      })
    }
  }

  const logout = (showMessage: boolean = true) => {
    try {
      localStorage.removeItem('authToken')
      localStorage.removeItem('sessionUser')

      dispatch({ type: 'LOGOUT' })

      if (showMessage) {
        showNotification({
          type: 'info',
          message: 'Sesión cerrada correctamente',
        })
      }

    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error)
      dispatch({ type: 'LOGOUT' })
    }
  }

  const updateUser = (user: User) => {
    try {
      localStorage.setItem('sessionUser', JSON.stringify(user))
      dispatch({ type: 'SET_USER', payload: user })
    } catch (error) {
      console.error('❌ Error al actualizar usuario:', error)
      showNotification({
        type: 'error',
        message: 'Error al actualizar información del usuario',
      })
    }
  }

  const restoreSession = () => {
    try {

      const token = localStorage.getItem('authToken')
      const userStored = localStorage.getItem('sessionUser')

      if (token && userStored) {
        const user = JSON.parse(userStored)
        dispatch({ type: 'RESTORE_SESSION', payload: { user, token } })
      } else {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    } catch (error) {
      console.error('❌ Error al restaurar sesión:', error)

      try {
        localStorage.removeItem('authToken')
        localStorage.removeItem('sessionUser')
      } catch (cleanError) {
        console.error('❌ Error al limpiar localStorage:', cleanError)
      }

      dispatch({ type: 'SET_LOADING', payload: false })

      showNotification({
        type: 'warning',
        message:
          'Error al restaurar sesión. Por favor, inicia sesión nuevamente.',
      })
    }
  }

  useEffect(() => {

    setGlobalLogout(logout)

    restoreSession()

    return () => {
    }
  }, [])

  const contextValue: AuthContextValue = {
    ...state,
    login,
    logout,
    updateUser,
    restoreSession,
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  )
}
