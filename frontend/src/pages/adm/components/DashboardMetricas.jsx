import CardsTopoPagina, {
  AlertIcon,
  ArrowsIcon,
  BoxIcon,
  WrenchIcon,
} from "../../../components/CardsTopoPagina";

const ICONES = {
  box: BoxIcon,
  arrows: ArrowsIcon,
  wrench: WrenchIcon,
  alert: AlertIcon,
};

function renderIcone(tipo) {
  const Icone = ICONES[tipo];
  return Icone ? <Icone /> : null;
}

export default function DashboardMetricas({
  metricas,
  filtroMetricaId,
  onAlternarFiltro,
}) {
  return (
    <section
      aria-label="Métricas do sistema"
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
          ativo={filtroMetricaId === metrica.id}
          onClick={() => onAlternarFiltro(metrica.id)}
        />
      ))}
    </section>
  );
}
