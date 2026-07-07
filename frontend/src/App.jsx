import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/login/Login';
import Usuarios from './pages/adm/Usuarios.jsx';
import AdmDashboard from './pages/adm/admDashboard';
import Equipamentos from './pages/Equipamentos/Equipamentos.jsx';
import Manutencoes from './pages/adm/Manutencoes.jsx';
import MeusEmprestimos from './pages/aluno/MeusEmprestimos.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';

function RotaInicial() {
  const { isAuthenticated, homePath } = useAuth();
  return <Navigate to={isAuthenticated ? homePath : '/login'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RotaInicial />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AdmDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/equipamento"
        element={
          <ProtectedRoute>
            <Equipamentos />
          </ProtectedRoute>
        }
      />
      <Route
        path="/equipamentos"
        element={
          <ProtectedRoute>
            <Equipamentos />
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
    </Routes>
  );
}
