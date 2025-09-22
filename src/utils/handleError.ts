import { showNotification } from './showNotification'

export const showHandleError = (err: any) => {
  const apiErrorMessage = err.response?.message
  const axiosErrorMessage = err.message

  showNotification({
    type: 'error',
    message: apiErrorMessage || axiosErrorMessage || 'Error desconocido',
  })
}
