import { createContext, type ReactNode, useContext, useEffect, useReducer } from 'react'
import { authService } from '../../../shared/services'
import type { LoginRequest, RegisterRequest, User } from '../../../shared/types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }

interface AuthContextType extends AuthState {
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
}

function authReducer (state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      }
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      }
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      }
    default:
      return state
  }
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider ({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = authService.isAuthenticated()
      if (!isAuth) {
        dispatch({ type: 'LOGOUT' })
      } else {
        try {
          const user = await authService.getCurrentUser()
          dispatch({ type: 'AUTH_SUCCESS', payload: user })
        } catch (error) {
          // If fetching user fails, clear auth state
          dispatch({ type: 'LOGOUT' })
        }
      }
    }

    checkAuth()
  }, [])

  const login = async (data: LoginRequest) => {
    try {
      dispatch({ type: 'AUTH_START' })
      const response = await authService.login(data)
      dispatch({ type: 'AUTH_SUCCESS', payload: response.user })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed'
      dispatch({ type: 'AUTH_FAILURE', payload: message })
      throw error
    }
  }

  const register = async (data: RegisterRequest) => {
    try {
      dispatch({ type: 'AUTH_START' })
      const response = await authService.register(data)
      dispatch({ type: 'AUTH_SUCCESS', payload: response.user })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed'
      dispatch({ type: 'AUTH_FAILURE', payload: message })
      throw error
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } finally {
      dispatch({ type: 'LOGOUT' })
    }
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth () {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
