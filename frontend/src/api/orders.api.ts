// frontend/src/api/orders.api.ts
import apiClient from './client'
import type { Order } from '../types';

export const ordersApi = {
  getAll: () => apiClient.get<Order[]>('/orders').then((r) => r.data),

  create: (amount: number) =>
    apiClient.post<Order>('/orders', { amount }).then((r) => r.data),

  updateStatus: (id: string, status: string) =>
    apiClient.patch<Order>(`/orders/${id}/status`, { status }).then((r) => r.data),
}
