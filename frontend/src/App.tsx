// frontend/src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { LoginPage } from './pages/login/LoginPage'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { WorkflowsPage } from './pages/workflows/WorkflowsPage'
import { WorkflowDetailPage } from './pages/workflow-detail/WorkflowDetailPage'
import { OrdersPage } from './pages/orders/OrdersPage'
import { Navbar } from './components/Navbar'

// Guard de route — redirige vers /login si non authentifié
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  const { isAuthenticated } = useAuth()

  return (
    <BrowserRouter>
      {isAuthenticated && <Navbar />}
      <main className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/workflows" element={<PrivateRoute><WorkflowsPage /></PrivateRoute>} />
          <Route path="/workflows/:id" element={<PrivateRoute><WorkflowDetailPage /></PrivateRoute>} />
          <Route path="/orders" element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
