// frontend/src/pages/workflow-detail/WorkflowDetailPage.tsx
import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { workflowsApi } from '../../api/workflows.api'
import type { ActionType, WorkflowExecution } from '../../types';

const ACTION_TYPES: ActionType[] = [
  'NOTIFY_ADMIN', 'NOTIFY_USER', 'CREATE_LOG', 'CREATE_TASK', 'UPDATE_STATUS',
]

// Composant qui visualise le déroulé d'une exécution
function ExecutionTimeline({ execution }: { execution: WorkflowExecution }) {
  const [open, setOpen] = useState(false)
  const duration = execution.finishedAt
    ? ((new Date(execution.finishedAt).getTime() - new Date(execution.startedAt).getTime()) / 1000).toFixed(2)
    : null

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Header exécution */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className={`w-2.5 h-2.5 rounded-full ${
            execution.status === 'SUCCESS' ? 'bg-green-500'
              : execution.status === 'ERROR' ? 'bg-red-500'
                : 'bg-amber-400 animate-pulse'
          }`} />
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            execution.status === 'SUCCESS' ? 'bg-green-100 text-green-700'
              : execution.status === 'ERROR' ? 'bg-red-100 text-red-700'
                : 'bg-amber-100 text-amber-700'
          }`}>
            {execution.status}
          </span>
          <span className="text-xs text-gray-500">
            {new Date(execution.startedAt).toLocaleString('fr-FR')}
          </span>
          {duration && (
            <span className="text-xs text-gray-400">{duration}s</span>
          )}
        </div>
        <span className="text-gray-400 text-sm">{open ? '▲' : '▼'}</span>
      </button>

      {/* Détail des actions — visualisation du déroulé */}
      {open && (
        <div className="px-4 py-4 bg-white">
          {/* Contexte de l'événement */}
          {execution.context && (
            <div className="mb-4 bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-500 mb-1">Contexte de l'événement</p>
              <pre className="text-xs text-gray-700 overflow-auto">
                {JSON.stringify(execution.context, null, 2)}
              </pre>
            </div>
          )}

          {/* Timeline des actions */}
          <p className="text-xs font-medium text-gray-500 mb-3">Déroulé des actions</p>
          <div className="flex flex-col gap-0">
            {execution.actionResults
              .sort((a, b) => a.order - b.order)
              .map((result, index) => (
                <div key={result.id} className="flex gap-3">
                  {/* Ligne verticale de la timeline */}
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      result.status === 'SUCCESS'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {result.status === 'SUCCESS' ? '✓' : '✗'}
                    </div>
                    {index < execution.actionResults.length - 1 && (
                      <div className="w-0.5 h-6 bg-gray-200" />
                    )}
                  </div>

                  {/* Contenu de l'action */}
                  <div className="pb-4 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-gray-800">
                        {result.actionType}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(result.executedAt).toLocaleTimeString('fr-FR')}
                      </span>
                    </div>
                    {result.output && (
                      <p className={`text-xs px-2 py-1 rounded font-mono ${
                        result.status === 'SUCCESS'
                          ? 'bg-green-50 text-green-800'
                          : 'bg-red-50 text-red-800'
                      }`}>
                        {result.output}
                      </p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function WorkflowDetailPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [actionType, setActionType] = useState<ActionType>('NOTIFY_USER')
  const [actionOrder, setActionOrder] = useState('1')

  const { data: workflows = [] } = useQuery({
    queryKey: ['workflows'],
    queryFn: workflowsApi.getAll,
  })

  const workflow = workflows.find((w) => w.id === id)

  const { data: executions = [], refetch: refetchExecutions } = useQuery({
    queryKey: ['executions', id],
    queryFn: () => workflowsApi.getExecutions(id!),
    enabled: !!id,
    refetchInterval: 3000, // Rafraîchit toutes les 3s pour voir les nouvelles exécutions
  })

  const addActionMutation = useMutation({
    mutationFn: () =>
      workflowsApi.addAction(id!, { type: actionType, order: Number(actionOrder) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workflows'] }),
  })

  const removeActionMutation = useMutation({
    mutationFn: (actionId: string) => workflowsApi.removeAction(id!, actionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workflows'] }),
  })

  const triggerMutation = useMutation({
    mutationFn: () => workflowsApi.triggerManually(id!),
    onSuccess: () => setTimeout(() => refetchExecutions(), 500),
  })

  if (!workflow) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center text-gray-400 py-12">Workflow introuvable</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <Link to="/workflows" className="text-sm text-gray-400 hover:text-pink-600 mb-2 inline-block">
          ← Retour aux workflows
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{workflow.name}</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Trigger : <span className="font-mono text-gray-600">{workflow.trigger}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
              workflow.isActive
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-500'
            }`}>
              {workflow.isActive ? 'Actif' : 'Inactif'}
            </span>
            {workflow.trigger === 'MANUAL' && (
              <button
                onClick={() => triggerMutation.mutate()}
                disabled={triggerMutation.isPending || !workflow.isActive}
                className="text-sm bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg transition-colors font-medium"
              >
                {triggerMutation.isPending ? 'Déclenchement...' : '▶ Déclencher'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Actions du workflow */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Actions</h2>
            <p className="text-xs text-gray-400 mt-0.5">Exécutées dans l'ordre défini</p>
          </div>

          {/* Visualisation des actions en pipeline */}
          <div className="p-5">
            {workflow.actions.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Aucune action</p>
            ) : (
              <div className="flex flex-col gap-0 mb-4">
                {workflow.actions
                  .sort((a, b) => a.order - b.order)
                  .map((action, index) => (
                    <div key={action.id} className="flex gap-3 items-start">
                      <div className="flex flex-col items-center">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {action.order}
                        </div>
                        {index < workflow.actions.length - 1 && (
                          <div className="w-0.5 h-6 bg-gray-200" />
                        )}
                      </div>
                      <div className="flex-1 pb-4 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          {action.type}
                        </span>
                        <button
                          onClick={() => removeActionMutation.mutate(action.id)}
                          className="text-xs text-red-400 hover:text-red-600 transition-colors"
                        >
                          Retirer
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* Ajouter une action */}
            <div className="border-t border-gray-100 pt-4 flex flex-col gap-2">
              <p className="text-xs font-medium text-gray-500">Ajouter une action</p>
              <div className="flex gap-2">
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value as ActionType)}
                  className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs flex-1 focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  {ACTION_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={actionOrder}
                  onChange={(e) => setActionOrder(e.target.value)}
                  placeholder="Ordre"
                  className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs w-16 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <button
                  onClick={() => addActionMutation.mutate()}
                  disabled={addActionMutation.isPending}
                  className="bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Historique des exécutions */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-800">Exécutions</h2>
              <p className="text-xs text-gray-400 mt-0.5">Rafraîchissement automatique</p>
            </div>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {executions.length}
            </span>
          </div>

          <div className="p-4 flex flex-col gap-3 max-h-96 overflow-y-auto">
            {executions.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">
                Aucune exécution — déclenche un événement pour voir le résultat
              </p>
            ) : (
              executions.map((execution) => (
                <ExecutionTimeline key={execution.id} execution={execution} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
