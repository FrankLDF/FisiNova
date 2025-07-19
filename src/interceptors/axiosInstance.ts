import axios from 'axios'
import { showNotification } from '../components/notification/showNotification'
import { PATH_LOGIN } from '../routes/PathsRoutes'

const fisinovaApi = axios.create({
  baseURL: import.meta.env.VITE_FISINOVA_CORE_URL,
  withCredentials: true,
})

fisinovaApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sessionUser')
      const currentPath = window.location.pathname
      if (currentPath !== PATH_LOGIN) {
        showNotification({
          type: 'info',
          message: 'Sesión caducada',
        })
        window.location.replace(PATH_LOGIN)
      }
    }
    return Promise.reject(err)
  }
)

export default fisinovaApi
