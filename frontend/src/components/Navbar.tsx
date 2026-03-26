// frontend/src/components/Navbar.tsx
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function Navbar() {
  const { logout } = useAuth()

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between shadow-lg">
      <span className="font-bold text-lg tracking-wide text-pink-400">WOM OMS</span>
      <div className="flex gap-6 items-center">
        {[
          { to: '/', label: 'Dashboard' },
          { to: '/workflows', label: 'Workflows' },
          { to: '/orders', label: 'Commandes' },
        ].map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }: { isActive: boolean }) =>
              `text-sm transition-colors ${isActive ? 'text-pink-400 font-medium' : 'text-gray-300 hover:text-white'}`
            }
          >
            {label}
          </NavLink>
        ))}
        <button
          onClick={logout}
          className="text-sm bg-pink-600 hover:bg-pink-700 px-3 py-1.5 rounded transition-colors"
        >
          Déconnexion
        </button>
      </div>
    </nav>
  )
}
