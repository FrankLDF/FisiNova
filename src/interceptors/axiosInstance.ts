import axios from 'axios'
import { PATH_LOGIN } from '../routes/pathts'
import { showNotification } from '../utils/showNotification'

const serverCore = axios.create({
  baseURL: import.meta.env.VITE_SERVER_CORE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

serverCore.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

serverCore.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('sessionUser')
      
      const currentPath = window.location.pathname
      if (currentPath !== PATH_LOGIN) {
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