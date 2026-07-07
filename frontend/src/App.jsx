import { Routes, Route } from 'react-router-dom';
import Login from './pages/login/Login';
import Usuarios from './pages/adm/Usuarios.jsx';
import AdmDashboard from './pages/adm/admDashboard';
import Equipamentos from './pages/adm/equipamentos.jsx';
import Manutencoes from './pages/adm/Manutencoes.jsx';
import MeusEmprestimos from './pages/aluno/MeusEmprestimos.jsx';


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<AdmDashboard />} />
      <Route path="/equipamento" element={<Equipamentos />} />
      <Route path="/equipamentos" element={<Equipamentos />} />
      <Route path="/manutencoes" element={<Manutencoes />} />
      <Route path="/usuarios" element={<Usuarios />} />
      <Route path="/alunoEmprestimos" element={<MeusEmprestimos/>}/>
    </Routes>
  );
}
