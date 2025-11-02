import serverCore from '../../../interceptors/axiosInstance'
import { buildQueryParams } from '../../../utils/urlParams'
import type {
  CreateUserRequest,
  UpdateUserRequest,
  ChangePasswordRequest,
  UserFilters,
} from '../models/user'

class UserService {
  async getUsers(filters: UserFilters = {}) {
    const params = buildQueryParams(filters)
    const res = await serverCore.get(`/users?${params}`)
    return res.data
  }

  async getUserById(id: number) {
    const res = await serverCore.get(`/users/${id}`)
    return res.data
  }

  async createUser(data: CreateUserRequest) {
    const res = await serverCore.post('/users', data)
    return res.data
  }

  async updateUser(id: number, data: UpdateUserRequest) {
    const res = await serverCore.put(`/users/${id}`, data)
    return res.data
  }

  async deleteUser(id: number) {
    const res = await serverCore.delete(`/users/${id}`)
    return res.data
  }

  async resetPassword(id: number) {
    const res = await serverCore.post(`/users/${id}/reset-password`)
    return res.data
  }

  async changePassword(data: ChangePasswordRequest) {
    const res = await serverCore.post('/change-password', data)
    return res.data
  }

  async checkPasswordReset() {
    const res = await serverCore.post('/check-password-reset')
    return res.data
  }

  async getRoles() {
    const res = await serverCore.get('/roles')
    return res.data
  }

  async getAvailableEmployees() {
    const res = await serverCore.get('/available-employees')
    return res.data
  }
}

export default new UserService()
