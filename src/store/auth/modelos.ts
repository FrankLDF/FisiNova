export interface User {
  id: number
  name: string
  email: string
  rols: number[]
  [key: string]: any
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'SET_USER'; payload: User }
  | { type: 'RESTORE_SESSION'; payload: { user: User; token: string } }

export interface AuthContextValue extends AuthState {
  login: (user: User, token: string) => void
  logout: (showMessage?: boolean) => void
  updateUser: (user: User) => void
  restoreSession: () => void
}

export const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
}
