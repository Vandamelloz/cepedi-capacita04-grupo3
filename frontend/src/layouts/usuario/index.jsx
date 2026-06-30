import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import BarraLateral from "../../components/BarraLateral";
import Cabecalho from "../../components/Cabecalho";

export default function LayoutUsuario({
  tipoUsuario,
  titulo,
  cargo,
  nome,
  notificacoes = [],
  onMarcarNotificacaoLida,
  onMarcarTodasNotificacoesLidas,
  onLogout,
  children,
}) {
  const location = useLocation();
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);

  useEffect(() => {
    setMenuMobileAberto(false);
  }, [location.pathname]);

  return (
    <section className="flex h-[100dvh] w-full min-h-0 overflow-hidden">
      <BarraLateral
        userRole={tipoUsuario}
        nomeUsuario={nome}
        cargoUsuario={cargo}
        onLogout={onLogout}
        mobileAberto={menuMobileAberto}
        onFecharMobile={() => setMenuMobileAberto(false)}
      />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-gray-100">
        <Cabecalho
          titulo={titulo}
          nome={nome}
          notificacoes={notificacoes}
          onMarcarNotificacaoLida={onMarcarNotificacaoLida}
          onMarcarTodasNotificacoesLidas={onMarcarTodasNotificacoesLidas}
          onLogout={onLogout}
          onAbrirMenuMobile={() => setMenuMobileAberto(true)}
        />
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden w-full">
          {children}
        </div>
      </div>
    </section>
  );
}
