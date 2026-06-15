import {Routes, Route} from 'react-router-dom';
import Login from './pages/login/Login';
import Botao from "./components/Botao/index.jsx";
import TituloPagina from './components/TituloPagina/index.jsx';

function Home() {
  return (
    <div>
      <Login></Login>
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