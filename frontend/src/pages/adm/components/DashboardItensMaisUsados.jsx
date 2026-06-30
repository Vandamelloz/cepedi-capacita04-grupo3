import TituloPagina from "../../../components/TituloPagina";
import GraficoBarrasHorizontal from "../../../components/graficos/GraficoBarrasHorizontal";

export default function DashboardItensMaisUsados({
  dados,
  itemSelecionado,
  onSelecionarItem,
}) {
  return (
    <article
      aria-label="Itens mais utilizados"
      className="min-w-0 rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:p-5"
    >
      <TituloPagina>Itens Mais Usados</TituloPagina>

      <div className="mt-3">
        {dados.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">
            Nenhum item registrado no período.
          </p>
        ) : (
          <GraficoBarrasHorizontal
            dados={dados}
            itemSelecionado={itemSelecionado}
            onSelecionarItem={onSelecionarItem}
          />
        )}
      </div>
    </article>
  );
}
