import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { PATH_LOGIN } from './pathts'
import { AppShell } from '../layout/AppShell'
import Header from '../components/header/Header'
import { Navbar } from '../components/navbar/Navbar'
import { useAuth } from '../store/auth/AuthContext'

interface PrivateRoutesProps {
  children: ReactNode
}

function PrivateRoutes({ children }: PrivateRoutesProps) {
  const { isAuthenticated } = useAuth()

  return !isAuthenticated ? (
    <Navigate to={PATH_LOGIN} replace />
  ) : (
    <AppShell headerContent={<Header />} navContent={<Navbar />}>
      {children}
    </AppShell>
  )
}

export default PrivateRoutes
