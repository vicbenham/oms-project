// frontend/src/api/workflows.api.ts
import apiClient from './client'
import type { Workflow, WorkflowExecution } from '../types';

export const workflowsApi = {
  getAll: () => apiClient.get<Workflow[]>('/workflows').then((r) => r.data),

  create: (data: { name: string; trigger: string; condition?: Record<string, unknown> }) =>
    apiClient.post<Workflow>('/workflows', data).then((r) => r.data),

  update: (id: string, data: { name?: string; isActive?: boolean }) =>
    apiClient.patch<Workflow>(`/workflows/${id}`, data).then((r) => r.data),

  delete: (id: string) => apiClient.delete(`/workflows/${id}`),

  addAction: (workflowId: string, data: { type: string; order: number }) =>
    apiClient.post(`/workflows/${workflowId}/actions`, data).then((r) => r.data),

  removeAction: (workflowId: string, actionId: string) =>
    apiClient.delete(`/workflows/${workflowId}/actions/${actionId}`),

  triggerManually: (id: string) =>
    apiClient.post(`/workflows/${id}/trigger`).then((r) => r.data),

  getExecutions: (workflowId: string) =>
    apiClient
      .get<WorkflowExecution[]>(`/executions/workflow/${workflowId}`)
      .then((r) => r.data),
}
