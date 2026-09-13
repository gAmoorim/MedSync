import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import type { TipoUsuario } from '../types'
import { AppLayout } from '../components/layout/AppLayout'

interface ProtectedRouteProps {
  tipo?: TipoUsuario
}

export function ProtectedRoute({ tipo }: ProtectedRouteProps) {
  const { isAuthenticated, usuario } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (tipo && usuario?.tipo !== tipo) return <Navigate to="/login" replace />

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  )
}
