export const DASHBOARD_CONFIG = {
  itensPorPagina: 5,
  ordenacaoPadrao: { campo: "data", direcao: "desc" },
};

export const METRICAS_DEFINICAO = [
  {
    id: "disponiveis",
    label: "Itens Disponíveis",
    color: "green",
    icon: "box",
    highlight: false,
    filtroLabel: "Itens devolvidos",
  },
  {
    id: "emprestados",
    label: "Itens Emprestados",
    color: "blue",
    icon: "arrows",
    highlight: false,
    filtroLabel: "Empréstimos ativos",
  },
  {
    id: "manutencao",
    label: "Em Manutenção",
    color: "orange",
    icon: "wrench",
    highlight: false,
    filtroLabel: "Equipamentos em manutenção",
  },
  {
    id: "atrasos",
    label: "Atrasos Hoje",
    color: "red",
    icon: "alert",
    highlight: true,
    filtroLabel: "Empréstimos atrasados",
  },
];

export const FILTROS_ESTATICOS_POR_METRICA = {
  disponiveis: (emprestimo) => emprestimo.status === "Concluído",
  emprestados: (emprestimo) => emprestimo.status === "Ativo",
  atrasos: (emprestimo) => emprestimo.status === "Atrasado",
};
