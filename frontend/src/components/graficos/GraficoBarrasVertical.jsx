function calcularLimiteEixo(valorMaximo) {
  if (valorMaximo <= 4) {
    return 4;
  }

  if (valorMaximo <= 8) {
    return 8;
  }

  return Math.ceil(valorMaximo / 4) * 4;
}

export default function GraficoBarrasVertical({
  dados,
  corBarra = "#1A6B74",
  itemSelecionado = null,
}) {
  const valorMaximo = Math.max(...dados.map((item) => item.valor), 0);
  const limiteEixo = calcularLimiteEixo(Math.max(valorMaximo, 1));
  const marcasEixo = Array.from({ length: limiteEixo + 1 }, (_, indice) => limiteEixo - indice);

  return (
    <div className="flex gap-3 sm:gap-4">
      <div
        className="flex h-52 shrink-0 flex-col justify-between py-1 text-[11px] text-gray-400 sm:h-56 sm:text-xs"
        aria-hidden="true"
      >
        {marcasEixo.map((marca) => (
          <span key={marca}>{marca}</span>
        ))}
      </div>

      <div className="relative min-w-0 flex-1">
        <div className="pointer-events-none absolute inset-x-0 top-0 flex h-52 flex-col justify-between sm:h-56">
          {marcasEixo.map((marca) => (
            <div
              key={`grade-${marca}`}
              className={`w-full ${marca === 0 ? "border-b border-gray-200" : "border-t border-dotted border-gray-200"}`}
            />
          ))}
        </div>

        <div className="relative flex h-52 items-end justify-around gap-2 px-1 sm:h-56 sm:gap-4 sm:px-2">
          {dados.map((item) => {
            const chave = item.id ?? item.label;
            const alturaPercentual = `${(item.valor / limiteEixo) * 100}%`;
            const selecionado = itemSelecionado === chave;
            const opaco = itemSelecionado && !selecionado;

            return (
              <div
                key={chave}
                className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2"
              >
                <div className="flex h-full w-full max-w-16 items-end justify-center">
                  <div
                    className={`w-10 rounded-t-sm transition-all sm:w-12 ${
                      selecionado ? "ring-2 ring-[#2563EB] ring-offset-1" : ""
                    }`}
                    style={{
                      height: alturaPercentual,
                      minHeight: item.valor > 0 ? "4px" : "0",
                      backgroundColor: selecionado ? "#155E66" : corBarra,
                      opacity: opaco ? 0.35 : 1,
                    }}
                    title={`${item.label}: ${item.valor}`}
                    aria-label={`${item.label}: ${item.valor}`}
                  />
                </div>
                <span
                  className={`truncate text-center text-[11px] sm:text-xs ${
                    selecionado ? "font-medium text-[#2563EB]" : "text-gray-600"
                  }`}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
