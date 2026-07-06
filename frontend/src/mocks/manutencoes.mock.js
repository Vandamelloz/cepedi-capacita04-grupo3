export const MANUTENCOES_CONFIG = {
  simulateLoadingMs: 500,
};

export const MOCK_EQUIPAMENTOS = [
  {
    id: 1,
    nome: "Câmera Canon EOS",
    patrimonio: "PAT-003",
    status: "Indisponível",
  },

  {
    id: 2,
    nome: "Furadeira Bosch",
    patrimonio: "PAT-010",
    status: "Disponível",
  },

  {
    id: 3,
    nome: "Projetor Epson",
    patrimonio: "PAT-007",
    status: "Indisponível",
  },

  {
    id: 4,
    nome: "Notebook Dell Inspiron",
    patrimonio: "PAT-015",
    status: "Disponível",
  },

  {
    id: 5,
    nome: "Impressora HP LaserJet",
    patrimonio: "PAT-021",
    status: "Disponível",
  },
];

export const MOCK_NOTIFICACOES_MANUTENCOES = [
  {
    id: 1,
    titulo: "Manutenção pendente",

    mensagem:
      "Existem equipamentos aguardando conclusão.",

    lida: false,
  },

  {
    id: 2,
    titulo: "Equipamento indisponível",

    mensagem:
      "Alguns equipamentos estão em manutenção.",

    lida: false,
  },
];

export const MOCK_MANUTENCOES = [
  {
    id: 1,
    id_equipamento: 1,
    nome: "Câmera Canon EOS",
    patrimonio: "PAT-003",
    tipo: "Corretiva",

    descricao_defeito:
      "Lente com problema de foco automático e não liga",

    data_abertura: "2024-05-31",

    data_conclusao: null,

    concluida: false,
  },

  {
    id: 2,
    id_equipamento: 2,
    nome: "Furadeira Bosch",
    patrimonio: "PAT-010",
    tipo: "Preventiva",

    descricao_defeito:
      "Manutenção periódica - troca de escovas",

    data_abertura: "2024-06-04",

    data_conclusao: "2024-06-10",

    concluida: true,
  },

  {
    id: 3,
    id_equipamento: 3,
    nome: "Projetor Epson",
    patrimonio: "PAT-007",
    tipo: "Corretiva",

    descricao_defeito:
      "Lâmpada queimada",

    data_abertura: "2024-05-10",

    data_conclusao: "2024-05-15",

    concluida: true,
  },

  {
    id: 4,
    id_equipamento: 4,
    nome: "Notebook Dell Inspiron",
    patrimonio: "PAT-015",
    tipo: "Preventiva",

    descricao_defeito:
      "Limpeza interna e troca de pasta térmica",

    data_abertura: "2024-06-04",

    data_conclusao: "2026-07-01",

    concluida: true,
  },

  {
    id: 5,
    id_equipamento: 3,
    nome: "Projetor Epson",
    patrimonio: "PAT-007",
    tipo: "Preventiva",

    descricao_defeito:
      "Fiscalização para verificar funcionamento e analisar a qualidade das imagens",

    data_abertura: "2026-07-16",

    data_conclusao: null,

    concluida: false,
  },

];