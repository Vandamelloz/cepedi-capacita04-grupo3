export default function DashboardEstadoPainel({ tipo, mensagem, onRecarregar }) {
  if (tipo === "carregando") {
    return (
      <div
        className="flex items-center justify-center py-20 text-gray-500"
        role="status"
        aria-live="polite"
      >
        <div
          className="mr-3 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"
          aria-hidden="true"
        />
        Carregando dashboard...
      </div>
    );
  }

  if (tipo === "erro") {
    return (
      <div
        className="mx-auto max-w-7xl px-4 py-4 sm:px-5"
        role="alert"
        aria-live="assertive"
      >
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <strong>Erro:</strong> {mensagem}
          {onRecarregar && (
            <button
              type="button"
              onClick={onRecarregar}
              className="ml-3 font-medium text-red-800 underline hover:no-underline"
            >
              Tentar novamente
            </button>
          )}
        </div>
      </div>
    );
  }

  if (tipo === "vazio") {
    return (
      <div
        className="flex flex-col items-center justify-center py-20 text-center text-gray-500"
        role="status"
      >
        <p className="text-base font-medium text-gray-700">
          Nenhum dado disponível no momento.
        </p>
        <p className="mt-1 text-sm">
          Quando houver empréstimos e métricas, eles aparecerão aqui.
        </p>
      </div>
    );
  }

  return null;
}
