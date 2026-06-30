import TituloPagina from "../../../components/TituloPagina";
import TabelaGipar from "../../../components/tabelaGipar/TabelaGipar";
import { COLUNAS_EMPRESTIMOS } from "../dashboardColunas";
import PaginacaoSimples from "./PaginacaoSimples";

export default function DashboardEmprestimos({
  dados,
  totalEmprestimos,
  ordenacao,
  onAlterarOrdenacao,
  paginaAtual,
  totalPaginas,
  itensPorPagina,
  onPaginaAnterior,
  onProximaPagina,
  filtroAtivo,
  onLimparFiltro,
  onLinhaClick,
}) {
  return (
    <article
      aria-label="Últimos empréstimos"
      className="min-w-0 rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:p-5"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
        <TituloPagina>Últimos Empréstimos</TituloPagina>

        {filtroAtivo && (
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
              Filtro: {filtroAtivo.filtroLabel}
            </span>
            <button
              type="button"
              onClick={onLimparFiltro}
              className="text-xs font-medium text-gray-500 hover:text-gray-800"
            >
              Limpar
            </button>
          </div>
        )}
      </div>

      <div className="mt-3 min-w-0">
        <TabelaGipar
          colunas={COLUNAS_EMPRESTIMOS}
          dados={dados}
          ordenacao={ordenacao}
          onOrdenarColuna={onAlterarOrdenacao}
          onLinhaClick={onLinhaClick}
        />
      </div>

      <PaginacaoSimples
        paginaAtual={paginaAtual}
        totalPaginas={totalPaginas}
        totalItens={totalEmprestimos}
        itensPorPagina={itensPorPagina}
        onPaginaAnterior={onPaginaAnterior}
        onProximaPagina={onProximaPagina}
      />
    </article>
  );
}
