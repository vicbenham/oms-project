// frontend/src/pages/orders/OrdersPage.tsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi } from '../../api/orders.api'

export function OrdersPage() {
  const queryClient = useQueryClient()
  const [amount, setAmount] = useState('')

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: ordersApi.getAll,
  })

  const createMutation = useMutation({
    mutationFn: () => ordersApi.create(Number(amount)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      setAmount('')
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      ordersApi.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  })

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Commandes</h1>
      </div>

      {/* Formulaire création */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
        <h2 className="font-semibold text-gray-800 mb-4">Nouvelle commande</h2>
        <div className="flex gap-3">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Montant (€)"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <button
            onClick={() => createMutation.mutate()}
            disabled={!amount || createMutation.isPending}
            className="bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {createMutation.isPending ? 'Création...' : 'Créer'}
          </button>
        </div>
      </div>

      {/* Liste */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Chargement...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">Aucune commande</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['ID', 'Montant', 'Statut', 'Date', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                  {order.id.slice(0, 8)}...
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">{order.amount} €</td>
                <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      order.status === 'PAID' ? 'bg-green-100 text-green-700'
                        : order.status === 'CANCELLED' ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                    }`}>
                      {order.status}
                    </span>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {order.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => updateStatusMutation.mutate({ id: order.id, status: 'PAID' })}
                          className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded transition-colors"
                        >
                          Payer
                        </button>
                        <button
                          onClick={() => updateStatusMutation.mutate({ id: order.id, status: 'CANCELLED' })}
                          className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded transition-colors"
                        >
                          Annuler
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
