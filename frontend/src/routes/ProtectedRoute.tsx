import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { AppLayout } from '../components/layout/AppLayout'
import type { TipoUsuario } from '../types'

export function ProtectedRoute({ tipo }: { tipo?: TipoUsuario }) {
  const { isAuthenticated, usuario } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (tipo && usuario?.tipo !== tipo) return <Navigate to="/login" replace />
  return <AppLayout><Outlet /></AppLayout>
}
