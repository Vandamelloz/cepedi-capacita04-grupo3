export const MOCK_EMPRESTIMOS_ATIVOS = [
  {
    id: 1,
    equipamento: "Kit Arduino Completo",
    patrimonio: "PAT-005",
    status: "Atrasado",
    data: "2024-05-19",
    dataFormatada: "19/05/2024",
    dataDevolucaoFormatada: "02/06/2024",
    diasAtraso: 20,
    usuario: "João Santos",
    observacao: "",
  },
  {
    id: 2,
    equipamento: "Kit Arduino Completo",
    patrimonio: "PAT-007",
    status: "Ativo",
    data: "2024-05-19",
    dataFormatada: "19/05/2024",
    dataDevolucaoFormatada: "02/06/2024",
    diasAtraso: 0,
    usuario: "João Santos",
    observacao: "",
  },
];

export const MOCK_HISTORICO_EMPRESTIMOS = [
  {
    id: 3,
    equipamento: "Protoboard 830 Furos",
    patrimonio: "PAT-021",
    status: "Concluído",
    dataFormatada: "02/03/2026",
    dataDevolucaoFormatada: "10/03/2026",
  },
  {
    id: 4,
    equipamento: "Ferro de Solda",
    patrimonio: "PAT-014",
    status: "Concluído",
    dataFormatada: "15/01/2026",
    dataDevolucaoFormatada: "20/01/2026",
  },
];

export const MOCK_NOTIFICACOES_EMPRESTIMOS = [
  {
    id: 1,
    titulo: "Empréstimo em atraso",
    mensagem: "O Kit Arduino Completo está atrasado há 723 dias.",
    lida: false,
  },
  {
    id: 2,
    titulo: "Lembrete de devolução",
    mensagem: "Não esqueça de devolver os equipamentos em dia.",
    lida: false,
  },
];
