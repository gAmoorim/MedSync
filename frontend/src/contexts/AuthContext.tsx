import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { Usuario, TipoUsuario } from '../types'

interface AuthContextType {
  usuario: Usuario | null
  token: string | null
  isAuthenticated: boolean
  login: (token: string, usuario: Usuario) => void
  logout: () => void
  isPaciente: boolean
  isMedico: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    const stored = localStorage.getItem('medsync_usuario')
    return stored ? JSON.parse(stored) : null
  })
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('medsync_token'))

  const login = (newToken: string, newUsuario: Usuario) => {
    setToken(newToken)
    setUsuario(newUsuario)
    localStorage.setItem('medsync_token', newToken)
    localStorage.setItem('medsync_usuario', JSON.stringify(newUsuario))
  }

  const logout = () => {
    setToken(null)
    setUsuario(null)
    localStorage.removeItem('medsync_token')
    localStorage.removeItem('medsync_usuario')
  }

  const tipoIs = (tipo: TipoUsuario) => usuario?.tipo === tipo

  return (
    <AuthContext.Provider value={{
      usuario,
      token,
      isAuthenticated: !!token && !!usuario,
      login,
      logout,
      isPaciente: tipoIs('paciente'),
      isMedico: tipoIs('medico'),
      isAdmin: tipoIs('admin'),
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
