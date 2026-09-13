import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning'

interface Toast {
  id: number
  type: ToastType
  message: string
}

interface ToastContextType {
  success: (message: string) => void
  error: (message: string) => void
  warning: (message: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

let counter = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = ++counter
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }, [])

  const remove = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id))

  const icons = {
    success: <CheckCircle size={18} className="text-success-500 shrink-0" />,
    error: <XCircle size={18} className="text-danger-500 shrink-0" />,
    warning: <AlertCircle size={18} className="text-warning-500 shrink-0" />,
  }

  const borders = {
    success: 'border-l-success-500',
    error: 'border-l-danger-500',
    warning: 'border-l-warning-500',
  }

  return (
    <ToastContext.Provider value={{
      success: (m) => addToast('success', m),
      error: (m) => addToast('error', m),
      warning: (m) => addToast('warning', m),
    }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-start gap-3 bg-white rounded-xl shadow-modal border border-slate-100 border-l-4 ${borders[toast.type]} p-4 animate-in slide-in-from-right-5`}
          >
            {icons[toast.type]}
            <p className="text-sm text-slate-700 flex-1">{toast.message}</p>
            <button onClick={() => remove(toast.id)} className="text-slate-400 hover:text-slate-600 shrink-0">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
