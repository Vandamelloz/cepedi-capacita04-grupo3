import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";

export default function DropdownNotificacoes({
  notificacoes = [],
  onMarcarLida,
  onMarcarTodasLidas,
}) {
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef(null);

  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  useEffect(() => {
    if (!aberto) {
      return undefined;
    }

    function handleCliqueFora(event) {
      if (!containerRef.current?.contains(event.target)) {
        setAberto(false);
      }
    }

    document.addEventListener("mousedown", handleCliqueFora);
    return () => document.removeEventListener("mousedown", handleCliqueFora);
  }, [aberto]);

  function handleNotificacaoClick(notificacao) {
    if (!notificacao.lida) {
      onMarcarLida?.(notificacao.id);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setAberto((prev) => !prev)}
        className="relative rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-200/60 hover:text-gray-700"
        aria-label={`Notificações${naoLidas ? `, ${naoLidas} novas` : ""}`}
        aria-expanded={aberto}
      >
        <Bell className="h-5 w-5" />
        {naoLidas > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {naoLidas}
          </span>
        )}
      </button>

      {aberto && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(20rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg sm:w-80">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <p className="text-sm font-semibold text-gray-900">Notificações</p>
            {naoLidas > 0 && (
              <button
                type="button"
                onClick={onMarcarTodasLidas}
                className="text-xs font-medium text-blue-600 hover:underline"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          <ul className="max-h-72 overflow-y-auto">
            {notificacoes.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-gray-400">
                Nenhuma notificação
              </li>
            ) : (
              notificacoes.map((notificacao) => (
                <li key={notificacao.id}>
                  <button
                    type="button"
                    onClick={() => handleNotificacaoClick(notificacao)}
                    className={`w-full px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                      notificacao.lida ? "opacity-70" : "bg-blue-50/40"
                    }`}
                  >
                    <p className="text-sm font-medium text-gray-900">
                      {notificacao.titulo}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-600">{notificacao.mensagem}</p>
                    <p className="mt-1 text-[11px] text-gray-400">{notificacao.horario}</p>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
