export default function PaginacaoSimples({
  paginaAtual,
  totalPaginas,
  totalItens,
  itensPorPagina,
  onPaginaAnterior,
  onProximaPagina,
}) {
  if (totalItens <= itensPorPagina) {
    return null;
  }

  const inicio = (paginaAtual - 1) * itensPorPagina + 1;
  const fim = Math.min(paginaAtual * itensPorPagina, totalItens);

  return (
    <div className="mt-3 flex flex-col gap-3 border-t border-gray-100 pt-3 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
      <p className="text-xs text-gray-500">
        Exibindo {inicio}–{fim} de {totalItens}
      </p>

      <div className="flex items-center justify-center gap-2 sm:justify-end">
        <button
          type="button"
          onClick={onPaginaAnterior}
          disabled={paginaAtual <= 1}
          className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Anterior
        </button>
        <span className="text-xs text-gray-500">
          Página {paginaAtual} de {totalPaginas}
        </span>
        <button
          type="button"
          onClick={onProximaPagina}
          disabled={paginaAtual >= totalPaginas}
          className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Próxima
        </button>
      </div>
    </div>
  );
}
