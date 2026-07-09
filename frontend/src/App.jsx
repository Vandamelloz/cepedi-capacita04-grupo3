import { Navigate, Route, Routes } from 'react-router-dom';

// Importações das páginas
import Login from './pages/login/Login';
import Usuarios from './pages/adm/Usuarios.jsx';
import AdmDashboard from './pages/adm/admDashboard';
import AdmEquipamentos from './pages/adm/equipamentos.jsx';
import EstagEquipamentos from './pages/estagiario/equipamentos.jsx';
import Manutencoes from './pages/adm/Manutencoes.jsx';
import MeusEmprestimos from './pages/aluno/MeusEmprestimos.jsx';
import EmprestimosAdm from './pages/adm/Emprestimo.jsx';

// Importações de autenticação
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';

function RotaInicial() {
  const { isAuthenticated, homePath } = useAuth();
  return <Navigate to={isAuthenticated ? homePath : '/login'} replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/" element={<RotaInicial />} />
      <Route path="/login" element={<Login />} />

      {/* Rotas Protegidas (Exigem Autenticação) */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <AdmDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/EstagEquipamentos" 
        element={
          <ProtectedRoute>
            <EstagEquipamentos />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/equipamentos" 
        element={
          <ProtectedRoute>
            <AdmEquipamentos />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/manutencoes" 
        element={
          <ProtectedRoute>
            <Manutencoes />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/usuarios" 
        element={
          <ProtectedRoute>
            <Usuarios />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/alunoEmprestimos" 
        element={
          <ProtectedRoute>
            <MeusEmprestimos />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/emprestimos" 
        element={
          <ProtectedRoute>
            <EmprestimosAdm />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}