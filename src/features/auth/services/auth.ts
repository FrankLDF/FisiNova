import serverCore from '../../../interceptors/axiosInstance'
import type { AuthCredentials } from '../models/authCredencials'

class AuthService {
  async login(credentials: AuthCredentials) {
    const res = await serverCore.post(`/login`, credentials)
    if (res.data && res.data.token) {
      // Guardar token para API
      localStorage.setItem('authToken', res.data.token)
      localStorage.setItem('sessionUser', JSON.stringify(res.data.data))
    }
    return res.data
  }

  async logout() {
    const res = await serverCore.post(`/logout`)
    if (res.data) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('sessionUser')
    }
    return res.data
  }

  async checkAuth() {
    const res = await serverCore.get(`/user`)
    return res.data
  }
}

export default new AuthService()