import { Routes, Route } from 'react-router-dom';
import Login from './pages/login/Login';
import AdmDashboard from './pages/adm/admDashboard';
import Equipamentos from './pages/Equipamentos/Equipamentos.jsx';

function Home() {
  return <AdmDashboard />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/equipamento" element={<Equipamentos />} />
    </Routes>
  );
}
