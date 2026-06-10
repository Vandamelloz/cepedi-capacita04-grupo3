import {Routes, Route} from 'react-router-dom';
import Login from './pages/login/Login';

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