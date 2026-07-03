import { useState } from "react";

export default function GraficoBarrasHorizontal({
  dados,
  corBarra = "#2563EB",
  itemSelecionado = null,
  onSelecionarItem,
}) {
  const [itemHover, setItemHover] = useState(null);
  const valorMaximo = Math.max(...dados.map((item) => item.valor), 1);
  const interativo = typeof onSelecionarItem === "function";

  return (
    <div className="flex flex-col gap-4">
      {dados.map((item) => {
        const chave = item.id ?? item.label;
        const larguraPercentual = `${(item.valor / valorMaximo) * 100}%`;
        const selecionado = itemSelecionado === chave;
        const emHover = itemHover === chave;
        const percentual = Math.round((item.valor / valorMaximo) * 100);

        return (
          <div key={chave} className="relative flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <span
                className={`truncate text-xs transition-colors sm:text-sm ${
                  selecionado ? "font-medium text-[#2563EB]" : "text-gray-600"
                }`}
              >
                {item.label}
              </span>
              {emHover && (
                <span className="shrink-0 text-[11px] text-gray-500 sm:text-xs">
                  {item.valor} ({percentual}%)
                </span>
              )}
            </div>

            <div className="h-7 w-full rounded-md bg-gray-100 sm:h-8">
              <button
                type="button"
                disabled={!interativo}
                onClick={() => onSelecionarItem?.(chave)}
                onMouseEnter={() => setItemHover(chave)}
                onMouseLeave={() => setItemHover(null)}
                className={`flex h-full items-center rounded-md px-2 text-xs font-medium text-white transition-all ${
                  interativo ? "cursor-pointer hover:opacity-90" : ""
                } ${selecionado ? "ring-2 ring-[#2563EB] ring-offset-1" : ""}`}
                style={{
                  width: larguraPercentual,
                  backgroundColor: selecionado ? "#1D4ED8" : corBarra,
                }}
                title={`${item.label}: ${item.valor} empréstimos`}
              >
                {item.valor}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
