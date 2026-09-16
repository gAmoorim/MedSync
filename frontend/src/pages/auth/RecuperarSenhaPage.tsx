import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Stethoscope, Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { solicitarRecuperacaoSenha } from '../../api/auth'
import { useToast } from '../../contexts/ToastContext'
import { Button, Input } from '../../components/ui'
import { getErrorMessage } from '../../utils'

const schema = z.object({
  email: z.string().email('Email inválido'),
})

type FormData = z.infer<typeof schema>

export default function RecuperarSenhaPage() {
  const { error: toastError } = useToast()
  const [enviado, setEnviado] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      await solicitarRecuperacaoSenha(data.email)
      setEnviado(true)
    } catch (err) {
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
          {enviado ? (
            /* Success state */
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-success-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-success-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Email enviado!</h2>
              <p className="text-sm text-slate-500 mb-6">
                Se este email estiver cadastrado, você receberá as instruções para redefinir sua senha em breve. Verifique também a caixa de spam.
              </p>
              <Link to="/login">
                <Button variant="secondary" className="w-full">
                  <ArrowLeft size={16} />
                  Voltar para o login
                </Button>
              </Link>
            </div>
          ) : (
            /* Form state */
            <>
              <div className="mb-6">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
                  <Mail size={22} className="text-primary-500" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Recuperar senha</h2>
                <p className="text-slate-500 text-sm mt-1">
                  Digite seu email e enviaremos um link para redefinir sua senha.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Email cadastrado"
                  type="email"
                  placeholder="seu@email.com"
                  error={errors.email?.message}
                  {...register('email')}
                />

                <Button type="submit" className="w-full" loading={isSubmitting}>
                  Enviar link de recuperação
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
