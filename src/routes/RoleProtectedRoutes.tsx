import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../store/auth/AuthContext'
import { hasAnyRole } from '../utils/authFunctions'

interface RoleProtectedRouteProps {
  children: ReactNode
  allowedRoles: number[]
  redirectTo?: string
}

export const RoleProtectedRoute = ({
  children,
  allowedRoles,
  redirectTo = '/access-denied',
}: RoleProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!hasAnyRole(user?.rols, allowedRoles)) {
    return <Navigate to={redirectTo} replace />
  }

  return <>{children}</>
}