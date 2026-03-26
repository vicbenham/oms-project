// frontend/src/context/AuthContext.tsx
import { createContext, useContext, useState, type ReactNode } from 'react';
import { authApi } from '../api/auth.api'

interface AuthContextType {
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem('token'),
  )

  const login = async (email: string, password: string) => {
    await authApi.login(email, password)
    setIsAuthenticated(true)
  }

  const register = async (email: string, password: string) => {
    await authApi.register(email, password)
    await login(email, password)
  }

  const logout = () => {
    authApi.logout()
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
