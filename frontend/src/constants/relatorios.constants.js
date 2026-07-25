/**
 * Tipos alinhados aos endpoints reais do backend:
 * GET /relatorios/{tipo}?formato=csv|pdf
 */
export const TIPOS_RELATORIO = [
  { valor: "emprestimos", texto: "Empréstimos" },
  { valor: "equipamentos", texto: "Equipamentos" },
  { valor: "usuarios", texto: "Usuários" },
  { valor: "manutencoes", texto: "Manutenções" },
  { valor: "reservas", texto: "Reservas" },
  { valor: "categorias", texto: "Categorias" },
];

/** Configuração de colunas da pré-visualização (espelha o CSV do backend). */
export const CONFIG_RELATORIOS = {
  emprestimos: {
    aceitaPeriodo: true,
    colunas: [
      { titulo: "ID", chave: "id" },
      { titulo: "Equipamento", chave: "equipamento", className: "font-semibold text-gray-900" },
      { titulo: "Patrimônio", chave: "patrimonio", className: "font-mono text-xs text-gray-600" },
      { titulo: "Usuário", chave: "usuario" },
      { titulo: "Data Retirada", chave: "data_retirada", className: "text-gray-500" },
      { titulo: "Status", chave: "status" },
    ],
  },
  equipamentos: {
    aceitaPeriodo: false,
    colunas: [
      { titulo: "ID", chave: "id" },
      { titulo: "Patrimônio", chave: "patrimonio", className: "font-mono text-xs text-gray-600" },
      { titulo: "Nome", chave: "nome", className: "font-semibold text-gray-900" },
      { titulo: "Modelo", chave: "modelo", className: "text-gray-500" },
    ],
  },
  usuarios: {
    aceitaPeriodo: false,
    colunas: [
      { titulo: "ID", chave: "id" },
      { titulo: "Nome", chave: "nome", className: "font-semibold text-gray-900" },
      { titulo: "E-mail", chave: "email" },
      { titulo: "Tipo", chave: "tipo", className: "text-gray-500" },
    ],
  },
  manutencoes: {
    aceitaPeriodo: true,
    colunas: [
      { titulo: "ID", chave: "id" },
      { titulo: "Equipamento", chave: "equipamento" },
      { titulo: "Defeito", chave: "defeito", className: "text-gray-500" },
      { titulo: "Abertura", chave: "abertura", className: "text-gray-500" },
    ],
  },
  reservas: {
    aceitaPeriodo: true,
    colunas: [
      { titulo: "ID", chave: "id" },
      { titulo: "Equipamento", chave: "equipamento" },
      { titulo: "Usuário", chave: "usuario" },
      { titulo: "Data", chave: "data", className: "text-gray-500" },
    ],
  },
  categorias: {
    aceitaPeriodo: false,
    colunas: [
      { titulo: "ID", chave: "id" },
      { titulo: "Nome", chave: "nome", className: "font-semibold text-gray-900" },
      { titulo: "Descrição", chave: "descricao", className: "text-gray-500" },
    ],
  },
};
