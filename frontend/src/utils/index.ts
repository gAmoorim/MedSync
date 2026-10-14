import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { StatusConsulta } from '../types'

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))

export const formatDate = (d: string) => {
  if (!d) return '-'

  return new Date(d).toLocaleDateString('pt-BR', {
    timeZone: 'UTC',
  })
}

export const formatCPF = (cpf: string) =>
  cpf?.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') ?? '-'

export const getHoje = () => new Date().toISOString().split('T')[0]

export const getMesAtual = () => {
  const n = new Date()
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`
}

export const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
export const diasSemanaFull = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

export const statusConfig: Record<StatusConsulta, { label: string; cls: string }> = {
  agendada:   { label: 'Agendada',   cls: 'badge-cyan'  },
  confirmada: { label: 'Confirmada', cls: 'badge-green' },
  concluida:  { label: 'Concluída',  cls: 'badge-slate' },
  cancelada:  { label: 'Cancelada',  cls: 'badge-red'   },
}

export const getErr = (err: unknown): string => {
  if (err && typeof err === 'object' && 'response' in err) {
    const e = err as { response?: { data?: { error?: string } } }
    return e.response?.data?.error ?? 'Erro inesperado. Tente novamente.'
  }
  return 'Erro inesperado. Tente novamente.'
}
