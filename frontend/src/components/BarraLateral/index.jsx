
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { menuByRole } from '../../config/menuItems';
import { BotaoBarraLateral } from '../BotaoBarraLateral';
import { Menu } from 'lucide-react';
import logo from '../../assets/imagens/GIPAR-LOGO.jpg';

export default function Sidebar({ userRole }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Busca a lista de botões permitida para o cargo atual (padrão para aluno se não achar)
  const currentMenu = menuByRole[userRole] || menuByRole['aluno'];
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={`h-screen bg-[#1E3A8A] p-3 flex flex-col gap-2 relative transition-all duration-300
        ${isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Botão de Encolher/Expandir */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-10 top-4 w-[30px] h-[30px] flex align-items justify-center bg-blue-600 text-white pt-[4px] rounded hover:bg-blue-700 transition-colors"
      >
        <Menu className="w-13 h-13" />
      </button>
      <div className="w-full h-full flex flex-col gap-2">
        <img src={logo} alt="Logo" className={`${isCollapsed ? 'w-[55px] h-[55px] rounded-full':'hidden' }`} />
        <div className={`px-4 py-6 text-white font-bold text-xl border-b border-white/10 mb-4
        ${isCollapsed ? 'hidden' : ''}`}>
          GIPAR Sistema
        </div>
        
        <nav className="flex flex-col gap-2">
          {currentMenu.map((item) => {
            // Verifica se a rota do botão é a mesma que o usuário está navegando agora
            const isActive = location.pathname === item.path;

            return (
              <BotaoBarraLateral
                key={item.path}
                label={item.label}
                icon={item.icon}
                isActive={isActive}
                onClick={() => navigate(item.path)}
                labelClass={isCollapsed ? "hidden" : ""}
              />
            );
          })}
        </nav>
      </div>
    </aside>
  );
}