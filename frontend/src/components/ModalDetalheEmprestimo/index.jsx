import { useEffect, useRef } from "react";
import StatusBadge from "../ui/StatusBadge";

export default function ModalDetalheEmprestimo({ emprestimo, aberto, onFechar }) {
  const botaoFecharRef = useRef(null);

  useEffect(() => {
    if (!aberto) {
      return undefined;
    }

    botaoFecharRef.current?.focus();

    function handleTecla(event) {
      if (event.key === "Escape") {
        onFechar();
      }
    }

    document.addEventListener("keydown", handleTecla);
    return () => document.removeEventListener("keydown", handleTecla);
  }, [aberto, onFechar]);

  if (!aberto || !emprestimo) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-emprestimo-titulo"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Fechar modal"
        onClick={onFechar}
      />

      <div className="relative z-10 max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-5 shadow-xl sm:p-6">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
          <div>
            <h2 id="modal-emprestimo-titulo" className="text-lg font-semibold text-gray-900">
              Detalhes do Empréstimo
            </h2>
            <p className="mt-1 text-sm text-gray-500">{emprestimo.equipamento}</p>
          </div>
          <StatusBadge status={emprestimo.status} />
        </div>

        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500">Usuário</dt>
            <dd className="font-medium text-gray-900">{emprestimo.usuario}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500">Data do empréstimo</dt>
            <dd className="text-gray-900">{emprestimo.dataFormatada}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500">Devolução prevista</dt>
            <dd className="text-gray-900">{emprestimo.dataDevolucaoFormatada}</dd>
          </div>
          {emprestimo.observacao && (
            <div>
              <dt className="mb-1 text-gray-500">Observação</dt>
              <dd className="rounded-lg bg-gray-50 p-3 text-gray-700">
                {emprestimo.observacao}
              </dd>
            </div>
          )}
        </dl>

        <div className="mt-6 flex justify-stretch sm:justify-end">
          <button
            ref={botaoFecharRef}
            type="button"
            onClick={onFechar}
            className="w-full rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 sm:w-auto sm:py-2"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
