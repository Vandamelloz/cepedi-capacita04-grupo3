import { useNavigate } from "react-router-dom";
import LayoutUsuario from "../../layouts/usuario/LayoutUsuario";
import useCatalogo from "../../hooks/useCatalogo";
import DashboardEstadoPainel from "../adm/components/DashboardEstadoPainel";
import AlertaBanner from "../../components/AlertaBanner/AlertaBanner";
import CardEquipamento from "../../components/CardEquipamento/CardEquipamento";
import EstadoVazio from "../../components/EstadoVazio/EstadoVazio";
import CampoPesquisa from "../../components/Pesquisa/Pesquisa";
import { useAuth } from "../../contexts/AuthContext";

export default function Catalogo() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const {
    usuario,
    notificacoes,
    carregando,
    erro,
    paginaVazia,
    filtroSemResultado,
    recarregar,
    termo,
    setTermo,
    status,
    setStatus,
    categoria,
    setCategoria,
    listaCategorias,
    listaStatus,
    equipamentosPorCategoria,
  } = useCatalogo();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <LayoutUsuario
      tipoUsuario={usuario.role}
      titulo="Catálogo"
      cargo={usuario.perfil}
      nome={usuario.nome}
      notificacoes={notificacoes}
      onLogout={handleLogout}
    >
      {carregando && <DashboardEstadoPainel tipo="carregando" />}

      {!carregando && erro && (
        <DashboardEstadoPainel tipo="erro" mensagem={erro} onRecarregar={recarregar} />
      )}

      {!carregando && !erro && paginaVazia && <DashboardEstadoPainel tipo="vazio" />}

      {!carregando && !erro && !paginaVazia && (
        <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-3 py-3 sm:px-6 sm:py-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Catálogo de Equipamentos</h1>
            <p className="mt-1 text-gray-500">
              Consulte os equipamentos disponíveis para empréstimo
            </p>
          </div>

          <AlertaBanner
            variante="info"
            titulo="Como solicitar um empréstimo?"
            descricao="Para solicitar o empréstimo de um equipamento, dirija-se ao balcão de atendimento com sua identificação. O prazo máximo de empréstimo é de 15 dias."
          />

          <CampoPesquisa
            termo={termo}
            setTermo={setTermo}
            status={status}
            setStatus={setStatus}
            categoria={categoria}
            setCategoria={setCategoria}
            listaCategorias={listaCategorias}
            listaStatus={listaStatus}
            placeholderTexto="Nome do equipamento..."
            placeholderStatus="Todos"
            placeholderCategoria="Todas"
          />

          {filtroSemResultado ? (
            <EstadoVazio mensagem="Nenhum equipamento encontrado com esses filtros" />
          ) : (
            Object.entries(equipamentosPorCategoria).map(([nomeCategoria, itens]) => (
              <section key={nomeCategoria}>
                <h2 className="mb-4 text-lg font-semibold text-gray-900">{nomeCategoria}</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {itens.map((equipamento) => (
                    <CardEquipamento
                      key={equipamento.id}
                      nome={equipamento.nome}
                      patrimonio={equipamento.patrimonio}
                      descricao={equipamento.descricao}
                      status={equipamento.status}
                    />
                  ))}
                </div>
              </section>
            ))
          )}
        </main>
      )}
    </LayoutUsuario>
  );
}