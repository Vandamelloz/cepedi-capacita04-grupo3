import { Routes, Route } from 'react-router-dom';
import Login from './pages/login/Login';
import AdmDashboard from './pages/adm/admDashboard';
import Equipamentos from './pages/Equipamentos/Equipamentos.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<AdmDashboard />} />
      <Route path="/equipamento" element={<Equipamentos />} />
      <Route path="/equipamentos" element={<Equipamentos />} />
    </Routes>
  );
}
