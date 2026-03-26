// frontend/src/pages/dashboard/DashboardPage.tsx
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { workflowsApi } from '../../api/workflows.api'
import { ordersApi } from '../../api/orders.api'

export function DashboardPage() {
  const { data: workflows = [] } = useQuery({
    queryKey: ['workflows'],
    queryFn: workflowsApi.getAll,
  })

  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: ordersApi.getAll,
  })

  const activeWorkflows = workflows.filter((w) => w.isActive).length
  const pendingOrders = orders.filter((o) => o.status === 'PENDING').length
  //const paidOrders = orders.filter((o) => o.status === 'PAID').length

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Workflows', value: workflows.length, color: 'bg-blue-50 text-blue-700' },
          { label: 'Actifs', value: activeWorkflows, color: 'bg-green-50 text-green-700' },
          { label: 'Commandes', value: orders.length, color: 'bg-purple-50 text-purple-700' },
          { label: 'En attente', value: pendingOrders, color: 'bg-amber-50 text-amber-700' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">{label}</p>
            <p className={`text-3xl font-bold ${color.split(' ')[1]}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Derniers workflows */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Derniers workflows</h2>
            <Link to="/workflows" className="text-sm text-pink-600 hover:underline">
              Voir tout
            </Link>
          </div>
          <ul className="divide-y divide-gray-100">
            {workflows.slice(0, 4).map((w) => (
              <li key={w.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <Link
                    to={`/workflows/${w.id}`}
                    className="text-sm font-medium text-gray-800 hover:text-pink-600"
                  >
                    {w.name}
                  </Link>
                  <p className="text-xs text-gray-400">{w.trigger}</p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    w.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {w.isActive ? 'Actif' : 'Inactif'}
                </span>
              </li>
            ))}
            {workflows.length === 0 && (
              <li className="px-5 py-6 text-center text-sm text-gray-400">
                Aucun workflow —{' '}
                <Link to="/workflows" className="text-pink-600 hover:underline">
                  en créer un
                </Link>
              </li>
            )}
          </ul>
        </div>

        {/* Dernières commandes */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Dernières commandes</h2>
            <Link to="/orders" className="text-sm text-pink-600 hover:underline">
              Voir tout
            </Link>
          </div>
          <ul className="divide-y divide-gray-100">
            {orders.slice(0, 4).map((o) => (
              <li key={o.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">{o.amount} €</p>
                  <p className="text-xs text-gray-400">
                    {new Date(o.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    o.status === 'PAID'
                      ? 'bg-green-100 text-green-700'
                      : o.status === 'CANCELLED'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {o.status}
                </span>
              </li>
            ))}
            {orders.length === 0 && (
              <li className="px-5 py-6 text-center text-sm text-gray-400">
                Aucune commande —{' '}
                <Link to="/orders" className="text-pink-600 hover:underline">
                  en créer une
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
