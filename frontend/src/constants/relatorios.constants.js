export const TIPOS_RELATORIO = [
  { valor: "inventario-completo", texto: "Inventário Completo" },
  { valor: "equipamentos-disponiveis", texto: "Equipamentos Disponíveis" },
  { valor: "equipamentos-emprestados", texto: "Equipamentos Emprestados" },
  { valor: "equipamentos-manutencao", texto: "Equipamentos em Manutenção" },
  { valor: "historico-emprestimos", texto: "Histórico de Empréstimos" },
  { valor: "historico-manutencoes", texto: "Histórico de Manutenções" },
];

export const CONFIG_RELATORIOS = {
  "inventario-completo": {
    colecoes: ["equipamentos"],
    campoData: null,
    filtro: () => true,
    transformar: "equipamento",
  },
  "equipamentos-disponiveis": {
    colecoes: ["equipamentos"],
    campoData: null,
    filtro: (item) => item.status === "Disponível",
    transformar: "equipamento",
  },
  "equipamentos-emprestados": {
    colecoes: ["equipamentos"],
    campoData: null,
    filtro: (item) => item.status === "Emprestado",
    transformar: "equipamento",
  },
  "equipamentos-manutencao": {
    colecoes: ["equipamentos"],
    campoData: null,
    filtro: (item) => item.status === "Em Manutenção",
    transformar: "equipamento",
  },
  "historico-emprestimos": {
    colecoes: ["emprestimos", "equipamentos"],
    campoData: "data",
    filtro: () => true,
    transformar: "emprestimo",
  },
  "historico-manutencoes": {
    colecoes: ["manutencoes", "equipamentos"],
    campoData: "data_abertura",
    filtro: () => true,
    transformar: "manutencao",
  },
};
