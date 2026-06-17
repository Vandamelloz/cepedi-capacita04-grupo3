import {Routes, Route} from 'react-router-dom';
import Login from './pages/login/Login';
import AdmDashboard from './pages/adm/admDashboard';


function Home() {
  return (
    <div>
      <AdmDashboard></AdmDashboard>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}