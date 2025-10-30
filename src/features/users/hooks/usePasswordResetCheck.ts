// src/features/users/hooks/usePasswordResetCheck.ts

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import userService from '../services/user'
import { useAuth } from '../../../store/auth/AuthContext'

export const usePasswordResetCheck = () => {
  const { isAuthenticated } = useAuth()
  const [showModal, setShowModal] = useState(false)

  const { data } = useQuery({
    queryKey: ['check-password-reset'],
    queryFn: userService.checkPasswordReset,
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
    retry: false,
  })

  useEffect(() => {
    if (data?.data?.needs_reset === true) {
      setShowModal(true)
    } else {
      setShowModal(false)
    }
  }, [data])

  const closeModal = () => {
    setShowModal(false)
  }

  return {
    showPasswordResetModal: showModal,
    closePasswordResetModal: closeModal,
    needsReset: data?.data?.needs_reset || false,
  }
}
