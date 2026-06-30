/**
 * Dados temporários para desenvolvimento do Dashboard.
 *
 * Este arquivo será substituído futuramente pela integração
 * com o backend através do dashboard.service.js.
 */

export const MOCK_USUARIO = {
  tipoUsuario: "adm",
  titulo: "Dashboard",
  nome: "Admin Sistema",
  cargo: "Administrador",
  notificacoes: 2,
};

export const MOCK_METRICAS = [
  {
    id: "disponiveis",
    label: "Itens Disponíveis",
    count: 5,
    color: "green",
    icon: "box",
    highlight: false,
    filtroLabel: "Itens devolvidos",
  },
  {
    id: "emprestados",
    label: "Itens Emprestados",
    count: 2,
    color: "blue",
    icon: "arrows",
    highlight: false,
    filtroLabel: "Empréstimos ativos",
  },
  {
    id: "manutencao",
    label: "Em Manutenção",
    count: 2,
    color: "orange",
    icon: "wrench",
    highlight: false,
    filtroLabel: "Equipamentos em manutenção",
  },
  {
    id: "atrasos",
    label: "Atrasos Hoje",
    count: 1,
    color: "red",
    icon: "alert",
    highlight: true,
    filtroLabel: "Empréstimos atrasados",
  },
];

export const EQUIPAMENTOS_EM_MANUTENCAO = [
  "Notebook Dell Latitude",
  "Impressora HP LaserJet",
];

export const MOCK_EMPRESTIMOS = [
  {
    id: 1,
    equipamento: "Projetor Epson X41",
    usuario: "Maria Silva",
    data: "2024-05-31",
    dataDevolucao: "2024-06-07",
    status: "Ativo",
    observacao: "Uso em apresentação da turma B.",
  },
  {
    id: 2,
    equipamento: "Kit Arduino Completo",
    usuario: "João Santos",
    data: "2024-05-19",
    dataDevolucao: "2024-05-26",
    status: "Atrasado",
    observacao: "Devolução pendente há 3 dias.",
  },
  {
    id: 3,
    equipamento: "Notebook Dell Latitude",
    usuario: "Ana Costa",
    data: "2024-04-30",
    dataDevolucao: "2024-05-07",
    status: "Concluído",
    observacao: "Equipamento enviado para manutenção após devolução.",
  },
  {
    id: 4,
    equipamento: "Tablet Samsung Tab S8",
    usuario: "Maria Silva",
    data: "2024-05-09",
    dataDevolucao: "2024-05-16",
    status: "Concluído",
    observacao: "Devolvido em perfeito estado.",
  },
  {
    id: 5,
    equipamento: 'Monitor LG 24"',
    usuario: "João Santos",
    data: "2024-04-14",
    dataDevolucao: "2024-04-21",
    status: "Cancelado",
    observacao: "Empréstimo cancelado a pedido do usuário.",
  },
  {
    id: 6,
    equipamento: "Câmera Canon EOS",
    usuario: "Pedro Lima",
    data: "2024-05-28",
    dataDevolucao: "2024-06-04",
    status: "Ativo",
    observacao: "Gravação de projeto final.",
  },
  {
    id: 7,
    equipamento: "Microfone Shure SM58",
    usuario: "Ana Costa",
    data: "2024-05-15",
    dataDevolucao: "2024-05-22",
    status: "Concluído",
    observacao: "Utilizado em evento interno.",
  },
  {
    id: 8,
    equipamento: "Impressora HP LaserJet",
    usuario: "Carlos Mendes",
    data: "2024-05-22",
    dataDevolucao: "2024-05-29",
    status: "Atrasado",
    observacao: "Equipamento aguardando revisão técnica.",
  },
];

export const MOCK_ITENS_MAIS_USADOS = [
  { id: "projetor", label: "Projetor Epson X41", valor: 12 },
  { id: "arduino", label: "Kit Arduino Completo", valor: 10 },
  { id: "notebook", label: "Notebook Dell Latitude", valor: 8 },
  { id: "tablet", label: "Tablet Samsung Tab S8", valor: 6 },
  { id: "monitor", label: 'Monitor LG 24"', valor: 4 },
];

export const MOCK_NOTIFICACOES = [
  {
    id: 1,
    titulo: "Empréstimo atrasado",
    mensagem: "Kit Arduino Completo — João Santos",
    horario: "Há 2 horas",
    lida: false,
  },
  {
    id: 2,
    titulo: "Manutenção concluída",
    mensagem: "Notebook Dell Latitude disponível novamente",
    horario: "Há 5 horas",
    lida: false,
  },
  {
    id: 3,
    titulo: "Novo empréstimo",
    mensagem: "Câmera Canon EOS — Pedro Lima",
    horario: "Ontem",
    lida: true,
  },
];

export const FILTROS_POR_METRICA = {
  disponiveis: (emprestimo) => emprestimo.status === "Concluído",
  emprestados: (emprestimo) => emprestimo.status === "Ativo",
  manutencao: (emprestimo) =>
    EQUIPAMENTOS_EM_MANUTENCAO.includes(emprestimo.equipamento),
  atrasos: (emprestimo) => emprestimo.status === "Atrasado",
};

export const MOCK_DASHBOARD_VAZIO = {
  metricas: MOCK_METRICAS.map((metrica) => ({ ...metrica, count: 0 })),
  emprestimos: [],
  itensMaisUsados: [],
};

export const DASHBOARD_CONFIG = {
  simulateLoadingMs: 600,
  itensPorPagina: 5,
  ordenacaoPadrao: { campo: "data", direcao: "desc" },
};
