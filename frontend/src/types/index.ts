// frontend/src/types/index.ts
export interface User {
  id: string
  email: string
  createdAt: string
}

export interface Order {
  id: string
  amount: number
  status: 'PENDING' | 'PAID' | 'CANCELLED'
  createdAt: string
  userId: string
}

export interface WorkflowAction {
  id: string
  type: ActionType
  order: number
  params?: Record<string, unknown>
}

export interface Workflow {
  id: string
  name: string
  trigger: TriggerType
  isActive: boolean
  condition?: Record<string, unknown>
  actions: WorkflowAction[]
  createdAt: string
}

export interface ActionResult {
  id: string
  actionType: ActionType
  order: number
  status: 'SUCCESS' | 'ERROR'
  output: string
  executedAt: string
}

export interface WorkflowExecution {
  id: string
  status: 'RUNNING' | 'SUCCESS' | 'ERROR'
  startedAt: string
  finishedAt?: string
  context?: Record<string, unknown>
  actionResults: ActionResult[]
}

export type TriggerType = 'USER_REGISTERED' | 'ORDER_CREATED' | 'ORDER_PAID' | 'MANUAL'
export type ActionType = 'NOTIFY_ADMIN' | 'NOTIFY_USER' | 'CREATE_LOG' | 'CREATE_TASK' | 'UPDATE_STATUS'
