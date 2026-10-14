import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Usuario } from '../types'

interface Ctx {
  usuario: Usuario | null
  token: string | null
  isAuthenticated: boolean
  isPaciente: boolean
  isMedico: boolean
  isAdmin: boolean
  login: (token: string, usuario: Usuario) => void
  logout: () => void
}

const AuthCtx = createContext<Ctx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    try { return JSON.parse(localStorage.getItem('ms_user') ?? 'null') } catch { return null }
  })
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('ms_token'))

  const login = (t: string, u: Usuario) => {
    setToken(t); setUsuario(u)
    localStorage.setItem('ms_token', t)
    localStorage.setItem('ms_user', JSON.stringify(u))
  }

  const logout = () => {
    setToken(null); setUsuario(null)
    localStorage.removeItem('ms_token')
    localStorage.removeItem('ms_user')
  }

  return (
    <AuthCtx.Provider value={{
      usuario, token,
      isAuthenticated: !!token && !!usuario,
      isPaciente: usuario?.tipo === 'paciente',
      isMedico: usuario?.tipo === 'medico',
      isAdmin: usuario?.tipo === 'admin',
      login, logout,
    }}>
      {children}
    </AuthCtx.Provider>
  )
}

export const useAuth = () => {
  const c = useContext(AuthCtx)
  if (!c) throw new Error('useAuth must be inside AuthProvider')
  return c
}
