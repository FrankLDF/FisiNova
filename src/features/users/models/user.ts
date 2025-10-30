// src/features/users/models/user.ts

export interface UserModel {
  id?: number
  name: string
  email: string
  active?: boolean
  created_at?: string
  updated_at?: string

  roles?: Role[]
  employee?: {
    id: number
    firstname: string
    lastname: string
    position?: {
      id: number
      name: string
    }
  }
}

export interface Role {
  id: number
  name: string
  description?: string
  active?: boolean
  pivot?: {
    active: boolean
  }
}

export interface CreateUserRequest {
  name: string
  email: string
  roles: number[]
  active?: boolean
}

export interface UpdateUserRequest {
  name?: string
  email?: string
  roles?: number[]
  active?: boolean
}

export interface ChangePasswordRequest {
  current_password: string
  new_password: string
  new_password_confirmation: string
}

export interface UserFilters {
  search?: string
  active?: boolean | string
  paginate?: number
}
