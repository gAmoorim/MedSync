import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Stethoscope, Lock, ArrowLeft, Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react'
import { resetarSenha } from '../../api/auth'
import { useToast } from '../../contexts/ToastContext'
import { Button } from '../../components/ui'
import { getErrorMessage } from '../../utils'

const schema = z.object({
  nova_senha: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmar_nova_senha: z.string().min(1, 'Confirme a nova senha'),
}).refine(d => d.nova_senha === d.confirmar_nova_senha, {
  message: 'As senhas não conferem',
  path: ['confirmar_nova_senha'],
})

type FormData = z.infer<typeof schema>

export default function ResetarSenhaPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { error: toastError } = useToast()
  const [showNova, setShowNova] = useState(false)
  const [showConfirmar, setShowConfirmar] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  const token = searchParams.get('token')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    if (!token) return
    try {
      await resetarSenha({ token, ...data })
      setSucesso(true)
    } catch (err) {
      console.error('erro completo:', err)
      toastError(getErrorMessage(err))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <Stethoscope size={16} className="text-white" />
          </div>
          <span className="font-semibold text-slate-900">MedSync</span>
        </div>

        <div className="card">
          {/* Token ausente */}
          {!token ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-danger-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-danger-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Link inválido</h2>
              <p className="text-sm text-slate-500 mb-6">
                Este link de recuperação é inválido ou está incompleto. Solicite um novo link.
              </p>
              <Link to="/recuperar-senha">
                <Button className="w-full">Solicitar novo link</Button>
              </Link>
            </div>
          ) : sucesso ? (
            /* Sucesso */
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-success-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-success-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Senha redefinida!</h2>
              <p className="text-sm text-slate-500 mb-6">
                Sua senha foi alterada com sucesso. Faça login com a nova senha.
              </p>
              <Button className="w-full" onClick={() => navigate('/login')}>
                Ir para o login
              </Button>
            </div>
          ) : (
            /* Formulário */
            <>
              <div className="mb-6">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
                  <Lock size={22} className="text-primary-500" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Nova senha</h2>
                <p className="text-slate-500 text-sm mt-1">
                  Escolha uma senha segura com ao menos 6 caracteres.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Nova senha */}
                <div className="flex flex-col gap-1">
                  <label className="label">Nova senha</label>
                  <div className="relative">
                    <input
                      type={showNova ? 'text' : 'password'}
                      placeholder="Mínimo 6 caracteres"
                      className={`input pr-10 ${errors.nova_senha ? 'input-error' : ''}`}
                      {...register('nova_senha')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNova(!showNova)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showNova ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.nova_senha && (
                    <p className="text-xs text-danger-500">{errors.nova_senha.message}</p>
                  )}
                </div>

                {/* Confirmar senha */}
                <div className="flex flex-col gap-1">
                  <label className="label">Confirmar nova senha</label>
                  <div className="relative">
                    <input
                      type={showConfirmar ? 'text' : 'password'}
                      placeholder="Repita a nova senha"
                      className={`input pr-10 ${errors.confirmar_nova_senha ? 'input-error' : ''}`}
                      {...register('confirmar_nova_senha')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmar(!showConfirmar)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmar ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.confirmar_nova_senha && (
                    <p className="text-xs text-danger-500">{errors.confirmar_nova_senha.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" loading={isSubmitting}>
                  Redefinir senha
                </Button>
              </form>

              <div className="mt-4 text-center">
                <Link
                  to="/login"
                  className="text-sm text-slate-500 hover:text-slate-700 flex items-center justify-center gap-1"
                >
                  <ArrowLeft size={14} />
                  Voltar para o login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
