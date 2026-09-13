import { forwardRef } from 'react'
import type { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes } from 'react'
import { Loader2, X, AlertTriangle } from 'lucide-react'
import { cn } from '../../utils'

// Button
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, className, disabled, ...props }, ref) => {
    const variants = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      danger: 'btn-danger',
      ghost: 'btn-ghost',
    }
    const sizes = { sm: 'btn-sm', md: '', lg: 'btn-lg' }

    return (
      <button
        ref={ref}
        className={cn('btn', variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

// Input
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s/g, '-')
    return (
      <div className="flex flex-col gap-1">
        {label && <label htmlFor={inputId} className="label">{label}</label>}
        <input
          ref={ref}
          id={inputId}
          className={cn('input', error && 'input-error', className)}
          {...props}
        />
        {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
        {error && <p className="text-xs text-danger-500">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

// Select
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string | number; label: string }[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, id, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s/g, '-')
    return (
      <div className="flex flex-col gap-1">
        {label && <label htmlFor={selectId} className="label">{label}</label>}
        <select
          ref={ref}
          id={selectId}
          className={cn('input', error && 'input-error', className)}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {error && <p className="text-xs text-danger-500">{error}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'

// Textarea
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s/g, '-')
    return (
      <div className="flex flex-col gap-1">
        {label && <label htmlFor={inputId} className="label">{label}</label>}
        <textarea
          ref={ref}
          id={inputId}
          rows={3}
          className={cn('input resize-none', error && 'input-error', className)}
          {...props}
        />
        {error && <p className="text-xs text-danger-500">{error}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

// Badge
interface BadgeProps {
  variant?: 'blue' | 'green' | 'yellow' | 'red' | 'gray'
  children: ReactNode
}

export function Badge({ variant = 'gray', children }: BadgeProps) {
  const variants = {
    blue: 'badge-blue',
    green: 'badge-green',
    yellow: 'badge-yellow',
    red: 'badge-red',
    gray: 'badge-gray',
  }
  return <span className={cn('badge', variants[variant])}>{children}</span>
}

// Card
export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('card', className)}>{children}</div>
}

// Loading
export function Loading({ text = 'Carregando...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-400">
      <Loader2 size={32} className="animate-spin text-primary-500" />
      <p className="text-sm">{text}</p>
    </div>
  )
}

// Empty State
export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
        <span className="text-3xl">📭</span>
      </div>
      <div>
        <p className="font-medium text-slate-700">{title}</p>
        {description && <p className="text-sm text-slate-400 mt-1">{description}</p>}
      </div>
      {action}
    </div>
  )
}

// Error State
export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-danger-50 flex items-center justify-center">
        <AlertTriangle size={28} className="text-danger-500" />
      </div>
      <div>
        <p className="font-medium text-slate-700">Algo deu errado</p>
        <p className="text-sm text-slate-400 mt-1">{message ?? 'Não foi possível carregar os dados.'}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>Tentar novamente</Button>
      )}
    </div>
  )
}

// Modal
interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  maxWidth?: string
}

export function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }: ModalProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative bg-white rounded-2xl shadow-modal w-full', maxWidth)}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg">
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

// Confirm Dialog
interface ConfirmProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmLabel?: string
  loading?: boolean
  variant?: 'danger' | 'primary'
}

export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel = 'Confirmar', loading, variant = 'danger' }: ConfirmProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-sm">
      <p className="text-sm text-slate-600 mb-6">{description}</p>
      <div className="flex gap-3 justify-end">
        <Button variant="secondary" onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button variant={variant} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
      </div>
    </Modal>
  )
}

// Skeleton
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse bg-slate-100 rounded-lg', className)} />
}

// Table
interface Column<T> {
  key: string
  label: string
  render?: (row: T) => ReactNode
  className?: string
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (row: T) => string | number
  onRowClick?: (row: T) => void
}

export function Table<T>({ columns, data, keyExtractor, onRowClick }: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            {columns.map((col) => (
              <th key={col.key} className={cn('text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide', col.className)}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={keyExtractor(row)}
              onClick={() => onRowClick?.(row)}
              className={cn('border-b border-slate-50 transition-colors', onRowClick && 'cursor-pointer hover:bg-slate-50')}
            >
              {columns.map((col) => (
                <td key={col.key} className={cn('py-3 px-4 text-slate-700', col.className)}>
                  {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '-')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
