import { useEffect, useState, useCallback } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Clock, Trash2, AlertTriangle } from 'lucide-react'
import { getHorarios, criarHorarios, deletarHorario } from '../../api/medico'
import { useToast } from '../../contexts/ToastContext'
import { Button, Card, Input, Loading, EmptyState, ErrorState, Modal, ConfirmDialog, Badge } from '../../components/ui'
import { diasSemana, getErrorMessage } from '../../utils'
import type { HorarioAtendimento } from '../../types'

const schema = z.object({
  dias_semana: z.array(z.number()).min(1, 'Selecione ao menos um dia'),
  hora_inicio: z.string().min(1, 'Obrigatório'),
  hora_fim: z.string().min(1, 'Obrigatório'),
  intervalo_minutos: z.number().min(15, 'Mínimo 15 minutos'),
  data_inicio_vigencia: z.string().min(1, 'Obrigatório'),
  data_fim_vigencia: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function HorariosMedicoPage() {
  const { success, error: toastError } = useToast()
  const [horarios, setHorarios] = useState<HorarioAtendimento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { dias_semana: [], intervalo_minutos: 30 },
  })

  const fetchHorarios = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await getHorarios()
      setHorarios(res ?? [])
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchHorarios() }, [fetchHorarios])

  const onSubmit = async (data: FormData) => {
    try {
      await criarHorarios(data)
      success('Horários criados com sucesso!')
      setModalOpen(false)
      reset()
      fetchHorarios()
    } catch (err) {
      toastError(getErrorMessage(err))
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deletarHorario(deleteId)
      success('Horário inativado com sucesso!')
      setDeleteId(null)
      fetchHorarios()
    } catch (err) {
      toastError(getErrorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Horários de Atendimento</h1>
          <p className="text-slate-500 mt-1">Gerencie sua disponibilidade semanal</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          Novo Horário
        </Button>
      </div>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState onRetry={fetchHorarios} />
      ) : horarios.length === 0 ? (
        <EmptyState
          title="Nenhum horário cadastrado"
          description="Cadastre seus horários de atendimento para que pacientes possam agendar consultas"
          action={
            <Button onClick={() => setModalOpen(true)}>
              <Plus size={16} /> Cadastrar horário
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {horarios.map((h) => (
            <Card key={h.horario_id} className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                  <Clock size={18} className="text-primary-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-slate-900 text-sm">{diasSemana[h.dia_semana]}</p>
                    <Badge variant={h.ativo ? 'green' : 'gray'}>{h.ativo ? 'Ativo' : 'Inativo'}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {h.hora_inicio?.substring(0, 5)} – {h.hora_fim?.substring(0, 5)} · a cada {h.intervalo_minutos} min
                  </p>
                </div>
                {h.ativo && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-danger-500 hover:bg-danger-50 shrink-0"
                    onClick={() => setDeleteId(h.horario_id)}
                  >
                    <Trash2 size={15} />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Novo Horário de Atendimento" maxWidth="max-w-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Days of week */}
          <div>
            <label className="label">Dias da semana</label>
            <Controller
              control={control}
              name="dias_semana"
              render={({ field }) => (
                <div className="grid grid-cols-7 gap-1">
                  {diasSemana.map((dia, i) => {
                    const selected = field.value.includes(i)
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          const next = selected
                            ? field.value.filter((d) => d !== i)
                            : [...field.value, i]
                          field.onChange(next)
                        }}
                        className={`py-2 rounded-lg text-xs font-medium transition-all ${
                          selected
                            ? 'bg-primary-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {dia.substring(0, 3)}
                      </button>
                    )
                  })}
                </div>
              )}
            />
            {errors.dias_semana && <p className="text-xs text-danger-500 mt-1">{errors.dias_semana.message}</p>}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Hora início"
              type="time"
              error={errors.hora_inicio?.message}
              {...register('hora_inicio')}
            />
            <Input
              label="Hora fim"
              type="time"
              error={errors.hora_fim?.message}
              {...register('hora_fim')}
            />
            <Input
              label="Intervalo (min)"
              type="number"
              min={15}
              step={15}
              error={errors.intervalo_minutos?.message}
              {...register('intervalo_minutos', { valueAsNumber: true })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Início da vigência"
              type="date"
              error={errors.data_inicio_vigencia?.message}
              {...register('data_inicio_vigencia')}
            />
            <Input
              label="Fim da vigência (opcional)"
              type="date"
              error={errors.data_fim_vigencia?.message}
              {...register('data_fim_vigencia')}
            />
          </div>

          <div className="flex items-start gap-2 p-3 bg-warning-50 rounded-xl">
            <AlertTriangle size={14} className="text-warning-500 shrink-0 mt-0.5" />
            <p className="text-xs text-warning-600">
              Alterações nos horários não afetam consultas já agendadas.
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={isSubmitting}>Criar horários</Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Inativar horário"
        description="Este horário será inativado e não aceitará novos agendamentos. Consultas já marcadas não serão afetadas."
        confirmLabel="Inativar"
        loading={deleting}
      />
    </div>
  )
}
