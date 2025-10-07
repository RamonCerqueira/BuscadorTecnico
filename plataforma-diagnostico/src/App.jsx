import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/lib/store'
import Layout from '@/components/Layout'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Tickets from '@/pages/Tickets'
import NewTicket from '@/pages/NewTicket'
import TicketDetail from '@/pages/TicketDetail'
import PublicHome from '@/pages/PublicHome'
import PublicProfile from '@/pages/PublicProfile'
import './App.css'

// Componente para proteger rotas
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

// Componente para redirecionar usuários autenticados
function PublicRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  
  if (isAuthenticated) {
    return <Navigate to="/app/dashboard" replace />
  }
  
  return children
}

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Homepage pública */}
          <Route path="/" element={<PublicHome />} />
          
          {/* Perfil público */}
          <Route path="/profile/:id" element={<PublicProfile />} />
          
          {/* Rota pública - Login */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          
          {/* Rotas protegidas */}
          <Route 
            path="/app" 
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Redirecionar /app para /app/dashboard */}
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            
            {/* Dashboard */}
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* Chamados */}
            <Route path="tickets" element={<Tickets />} />
            <Route path="tickets/new" element={<NewTicket />} />
            <Route path="tickets/:id" element={<TicketDetail />} />
            
            {/* Outras rotas que serão implementadas */}
            <Route path="profile" element={<div className="p-6"><h1 className="text-2xl font-bold">Perfil</h1><p>Página em desenvolvimento...</p></div>} />
            <Route path="users" element={<div className="p-6"><h1 className="text-2xl font-bold">Usuários</h1><p>Página em desenvolvimento...</p></div>} />
            <Route path="analytics" element={<div className="p-6"><h1 className="text-2xl font-bold">Analytics</h1><p>Página em desenvolvimento...</p></div>} />
            <Route path="settings" element={<div className="p-6"><h1 className="text-2xl font-bold">Configurações</h1><p>Página em desenvolvimento...</p></div>} />
            
            {/* Rota 404 */}
            <Route path="*" element={
              <div className="text-center py-12">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Página não encontrada</h1>
                <p className="text-gray-600 mb-4">A página que você está procurando não existe.</p>
                <button 
                  onClick={() => window.history.back()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Voltar
                </button>
              </div>
            } />
          </Route>
        </Routes>
      </div>
    </Router>
  )
}

export default App

