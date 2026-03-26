// frontend/src/pages/workflows/WorkflowsPage.tsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { workflowsApi } from '../../api/workflows.api'
import type { TriggerType } from '../../types';

const TRIGGERS: TriggerType[] = ['USER_REGISTERED', 'ORDER_CREATED', 'ORDER_PAID', 'MANUAL']

export function WorkflowsPage() {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [trigger, setTrigger] = useState<TriggerType>('ORDER_CREATED')
  const [showForm, setShowForm] = useState(false)

  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: workflowsApi.getAll,
  })

  const createMutation = useMutation({
    mutationFn: () => workflowsApi.create({ name, trigger }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] })
      setName('')
      setShowForm(false)
    },
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      workflowsApi.update(id, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workflows'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => workflowsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workflows'] }),
  })

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Workflows</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-pink-600 hover:bg-pink-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Nouveau workflow
        </button>
      </div>

      {/* Formulaire création */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">Nouveau workflow</h2>
          <div className="flex gap-3 flex-wrap">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom du workflow"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-48 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <select
              value={trigger}
              onChange={(e) => setTrigger(e.target.value as TriggerType)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              {TRIGGERS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <button
              onClick={() => createMutation.mutate()}
              disabled={!name || createMutation.isPending}
              className="bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {createMutation.isPending ? 'Création...' : 'Créer'}
            </button>
          </div>
        </div>
      )}

      {/* Liste */}
      {isLoading ? (
        <div className="text-center text-gray-400 py-12">Chargement...</div>
      ) : workflows.length === 0 ? (
        <div className="text-center text-gray-400 py-12">Aucun workflow</div>
      ) : (
        <div className="grid gap-4">
          {workflows.map((workflow) => (
            <div
              key={workflow.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <Link
                    to={`/workflows/${workflow.id}`}
                    className="font-semibold text-gray-900 hover:text-pink-600 transition-colors"
                  >
                    {workflow.name}
                  </Link>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    workflow.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {workflow.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>Trigger : <span className="font-mono text-gray-600">{workflow.trigger}</span></span>
                  <span>{workflow.actions.length} action{workflow.actions.length > 1 ? 's' : ''}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleMutation.mutate({ id: workflow.id, isActive: !workflow.isActive })}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-colors font-medium ${
                    workflow.isActive
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                      : 'bg-green-100 hover:bg-green-200 text-green-700'
                  }`}
                >
                  {workflow.isActive ? 'Désactiver' : 'Activer'}
                </button>
                <Link
                  to={`/workflows/${workflow.id}`}
                  className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg transition-colors font-medium"
                >
                  Détail
                </Link>
                <button
                  onClick={() => deleteMutation.mutate(workflow.id)}
                  className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg transition-colors font-medium"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
