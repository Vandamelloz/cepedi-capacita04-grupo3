import { useNavigate } from "react-router-dom";
import LayoutUsuario from "../../layouts/usuario/LayoutUsuario";
import ModalDetalheEmprestimo from "../../components/ModalDetalheEmprestimo";
import useDashboard from "../../hooks/useDashboard";
import DashboardEstadoPainel from "./components/DashboardEstadoPainel";
import DashboardMetricas from "./components/DashboardMetricas";
import DashboardEmprestimos from "./components/DashboardEmprestimos";
import DashboardItensMaisUsados from "./components/DashboardItensMaisUsados";

export default function AdmDashboard() {
  const navigate = useNavigate();
  const {
    usuario,
    metricas,
    emprestimosPaginados,
    itensMaisUsados,
    notificacoes,
    carregando,
    erro,
    dashboardVazio,
    recarregar,
    ordenacao,
    alterarOrdenacao,
    paginaAtual,
    totalPaginas,
    itensPorPagina,
    totalEmprestimos,
    irParaPagina,
    filtroMetricaId,
    filtroAtivo,
    alternarFiltroMetrica,
    limparFiltroMetrica,
    emprestimoSelecionado,
    abrirDetalheEmprestimo,
    fecharDetalheEmprestimo,
    itemGraficoSelecionado,
    alternarItemGrafico,
    marcarNotificacaoLida,
    marcarTodasNotificacoesLidas,
  } = useDashboard();

  function handleLogout() {
    navigate("/login");
  }

  return (
    <LayoutUsuario
      tipoUsuario={usuario.tipoUsuario}
      titulo={usuario.titulo}
      cargo={usuario.cargo}
      nome={usuario.nome}
      notificacoes={notificacoes}
      onMarcarNotificacaoLida={marcarNotificacaoLida}
      onMarcarTodasNotificacoesLidas={marcarTodasNotificacoesLidas}
      onLogout={handleLogout}
    >
      {carregando && <DashboardEstadoPainel tipo="carregando" />}

      {!carregando && erro && (
        <DashboardEstadoPainel
          tipo="erro"
          mensagem={erro}
          onRecarregar={recarregar}
        />
      )}

      {!carregando && !erro && dashboardVazio && (
        <DashboardEstadoPainel tipo="vazio" />
      )}

      {!carregando && !erro && !dashboardVazio && (
        <main className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-3 py-3 sm:gap-4 sm:px-5 sm:py-5">
          <DashboardMetricas
            metricas={metricas}
            filtroMetricaId={filtroMetricaId}
            onAlternarFiltro={alternarFiltroMetrica}
          />

          <section
            aria-label="Resumo operacional"
            className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2"
          >
            <DashboardEmprestimos
              dados={emprestimosPaginados}
              totalEmprestimos={totalEmprestimos}
              ordenacao={ordenacao}
              onAlterarOrdenacao={alterarOrdenacao}
              paginaAtual={paginaAtual}
              totalPaginas={totalPaginas}
              itensPorPagina={itensPorPagina}
              onPaginaAnterior={() => irParaPagina(paginaAtual - 1)}
              onProximaPagina={() => irParaPagina(paginaAtual + 1)}
              filtroAtivo={filtroAtivo}
              onLimparFiltro={limparFiltroMetrica}
              onLinhaClick={abrirDetalheEmprestimo}
            />

            <DashboardItensMaisUsados
              dados={itensMaisUsados}
              itemSelecionado={itemGraficoSelecionado}
              onSelecionarItem={alternarItemGrafico}
            />
          </section>
        </main>
      )}

      <ModalDetalheEmprestimo
        emprestimo={emprestimoSelecionado}
        aberto={Boolean(emprestimoSelecionado)}
        onFechar={fecharDetalheEmprestimo}
      />
    </LayoutUsuario>
  );
}
