import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { PATH_MAIN } from './pathts'
import { useAuth } from '../store/auth/AuthContext'

interface PublicRouterProps {
  children: ReactNode
}

function PublicRoutes({ children }: PublicRouterProps) {
  const { isAuthenticated } = useAuth()

  return isAuthenticated ? <Navigate to={PATH_MAIN} /> : children
}

export default PublicRoutes
