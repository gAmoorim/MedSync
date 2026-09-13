import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { StatusConsulta } from '../types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string): string {
  if (!date) return '-'
  const d = new Date(date + 'T00:00:00')
  return d.toLocaleDateString('pt-BR')
}

export function formatDateTime(date: string): string {
  if (!date) return '-'
  return new Date(date).toLocaleString('pt-BR')
}

export function formatCPF(cpf: string): string {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export function formatTelefone(tel: string): string {
  const digits = tel.replace(/\D/g, '')
  if (digits.length === 11) return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
}

export const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

export function getStatusBadge(status: StatusConsulta): string {
  const map: Record<StatusConsulta, string> = {
    agendada: 'badge-blue',
    confirmada: 'badge-green',
    concluida: 'badge-gray',
    cancelada: 'badge-red',
  }
  return map[status] ?? 'badge-gray'
}

export function getStatusLabel(status: StatusConsulta): string {
  const map: Record<StatusConsulta, string> = {
    agendada: 'Agendada',
    confirmada: 'Confirmada',
    concluida: 'Concluída',
    cancelada: 'Cancelada',
  }
  return map[status] ?? status
}

export function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { error?: string } } }
    return axiosError.response?.data?.error ?? 'Erro inesperado. Tente novamente.'
  }
  return 'Erro inesperado. Tente novamente.'
}

export function getMesAtual(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function getDataLocal(date = new Date()): string {
  const ano = date.getFullYear()
  const mes = String(date.getMonth() + 1).padStart(2, '0')
  const dia = String(date.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

export function getHoje(): string {
  return getDataLocal()
}
