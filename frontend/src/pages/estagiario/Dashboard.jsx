import LayoutUsuario from "../../layouts/usuario/LayoutUsuario";
import CardsTopoPagina, {
  AlertIcon,
  ArrowsIcon,
  BoxIcon,
  CheckCircleIcon,
} from "../../components/CardsTopoPagina";
import TituloPagina from "../../components/TituloPagina";
import StatusBadge from "../../components/ui/StatusBadge";
import GraficoBarrasHorizontal from "../../components/graficos/GraficoBarrasHorizontal";
import DashboardEstadoPainel from "../adm/components/DashboardEstadoPainel";
import useDashboardEstagiario from "../../hooks/useDashboardEstagiario";
import { useAuth } from "../../contexts/AuthContext";

const ICONES = {
  box: BoxIcon,
  arrows: ArrowsIcon,
  check: CheckCircleIcon,
  alert: AlertIcon,
};

function renderIcone(tipo) {
  const Icone = ICONES[tipo];
  return Icone ? <Icone /> : null;
}

export default function DashboardEstagiario() {
  const { usuario } = useAuth();
  const {
    metricas,
    statusEquipamentosGrafico,
    ultimosEmprestimos,
    notificacoes,
    carregando,
    erro,
    dashboardVazio,
    filtroSelecionado,
    destaqueGrafico,
    recarregar,
    alternarFiltro,
    marcarNotificacaoLida,
    marcarTodasNotificacoesLidas,
  } = useDashboardEstagiario();

  return (
    <LayoutUsuario
      titulo="Dashboard"
      notificacoes={notificacoes}
      onMarcarNotificacaoLida={marcarNotificacaoLida}
      onMarcarTodasNotificacoesLidas={marcarTodasNotificacoesLidas}
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
          <div>
            <p className="text-sm text-gray-500">
              Bem-vindo(a),{" "}
              <span className="font-medium text-gray-700">{usuario?.nome}</span>
            </p>
          </div>

          <section
            aria-label="Métricas do dashboard"
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
          >
            {metricas.map((metrica) => (
              <CardsTopoPagina
                key={metrica.id}
                label={metrica.label}
                count={metrica.count}
                color={metrica.color}
                icon={renderIcone(metrica.icon)}
                highlight={metrica.highlight}
                countDestaque={metrica.countDestaque}
                ativo={filtroSelecionado === metrica.id}
                onClick={() => alternarFiltro(metrica.id)}
              />
            ))}
          </section>

          <section
            aria-label="Resumo operacional"
            className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2"
          >
            <article className="min-w-0 rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:p-5">
              <TituloPagina>Status dos Equipamentos</TituloPagina>
              <div className="mt-4">
                <GraficoBarrasHorizontal
                  dados={statusEquipamentosGrafico}
                  corBarra="#1A6B74"
                  itemSelecionado={destaqueGrafico}
                />
              </div>
            </article>

            <article className="min-w-0 rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:p-5">
              <TituloPagina>Últimos Empréstimos</TituloPagina>
              <ul className="mt-4 flex flex-col gap-3">
                {ultimosEmprestimos.length === 0 ? (
                  <li className="py-8 text-center text-sm text-gray-400">
                    {filtroSelecionado
                      ? "Nenhum empréstimo encontrado para este filtro."
                      : "Nenhum empréstimo registrado."}
                  </li>
                ) : (
                  ultimosEmprestimos.map((emprestimo) => (
                    <li
                      key={emprestimo.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 px-3 py-3 sm:px-4"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {emprestimo.equipamento}
                        </p>
                        <p className="truncate text-xs text-gray-500 sm:text-sm">
                          {emprestimo.usuario}
                        </p>
                      </div>
                      <StatusBadge status={emprestimo.status} />
                    </li>
                  ))
                )}
              </ul>
            </article>
          </section>
        </main>
      )}
    </LayoutUsuario>
  );
}
