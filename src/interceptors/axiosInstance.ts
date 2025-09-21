import axios from 'axios'
import { PATH_LOGIN } from '../routes/pathts'
import { showNotification } from '../utils/showNotification'

const serverCore = axios.create({
  baseURL: import.meta.env.VITE_SERVER_CORE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

let globalLogout: ((showMessage?: boolean) => void) | null = null

export const setGlobalLogout = (logoutFn: (showMessage?: boolean) => void) => {
  globalLogout = logoutFn
}

serverCore.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

serverCore.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const currentPath = window.location.pathname

      console.log('🚨 Error 401 detectado - Cerrando sesión automáticamente')

      if (globalLogout) {
        globalLogout(false)
      } else {
        localStorage.removeItem('authToken')
        localStorage.removeItem('sessionUser')
        console.log('⚠️ Fallback: localStorage limpiado directamente')
      }

      if (currentPath !== PATH_LOGIN) {
        console.log(`🔄 Redirigiendo de ${currentPath} a ${PATH_LOGIN}`)
        window.location.replace(PATH_LOGIN)
        showNotification({
          title: 'INFO',
          type: 'info',
          message: 'Sesión caducada',
        })
      }
    }

    return Promise.reject({ response: err.response?.data, err })
  }
)

export default serverCore
