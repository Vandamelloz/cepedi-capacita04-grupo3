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

export const FILTROS_ESTAGIARIO_POR_METRICA = {
  disponiveis: (emprestimo) => emprestimo.status === "Concluído",
  emprestados: (emprestimo) =>
    emprestimo.status === "Ativo" || emprestimo.status === "Atrasado",
  ativos: (emprestimo) => emprestimo.status === "Ativo",
  atrasados: (emprestimo) => {
    const diasAtraso = emprestimo.diasAtraso ?? 0;
    return diasAtraso > 0 || emprestimo.status === "Atrasado";
  },
};

export const GRAFICO_DESTAQUE_ESTAGIARIO = {
  disponiveis: "disponivel",
  emprestados: "emprestado",
  ativos: "emprestado",
  atrasados: "emprestado",
};

export const METRICAS_ESTAGIARIO_DEFINICAO = [
  {
    id: "disponiveis",
    label: "Equipamentos Disponíveis",
    color: "green",
    icon: "box",
    highlight: false,
  },
  {
    id: "emprestados",
    label: "Equipamentos Emprestados",
    color: "blue",
    icon: "arrows",
    highlight: false,
  },
  {
    id: "ativos",
    label: "Empréstimos Ativos",
    color: "blue",
    icon: "check",
    highlight: false,
  },
  {
    id: "atrasados",
    label: "Empréstimos Atrasados",
    color: "red",
    icon: "alert",
    highlight: true,
    countDestaque: true,
  },
];
