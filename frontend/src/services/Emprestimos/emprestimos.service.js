// ================================================================
// emprestimos.service.js - CRUD de Empréstimos (FastAPI)
// ================================================================

import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from "../api.config";

// ================================================================
// ENDPOINTS DO FASTAPI
// ================================================================

const ENDPOINTS = {
  LISTAR: "/listar_emprestimos",
  CRIAR: "/criar_emprestimo",
  ATUALIZAR: (id) => `/atualizar_emprestimo/${id}`,
  DEVOLVER: (id) => `/devolver_emprestimo/${id}`,
  CANCELAR: (id) => `/cancelar_emprestimo/${id}`,   // ← ADICIONADO
  DELETAR: (id) => `/excluir_emprestimo/${id}`,
};

// ================================================================
// FUNÇÕES CRUD
// ================================================================

/**
 * Lista todos os empréstimos
 * @param {boolean} apenasAtivos - Se true, lista apenas ativos
 */
export async function buscarEmprestimos(apenasAtivos = false) {
  const endpoint = apenasAtivos 
    ? `${ENDPOINTS.LISTAR}?apenas_ativos=true`
    : ENDPOINTS.LISTAR;
  
  const resultado = await apiGet(endpoint);
  return resultado.emprestimos || [];
}

/**
 * Cria um novo empréstimo
 * @param {Object} dados - { id_usuario, id_equipamento, id_tecnico_saida, data_previsao_devolucao, observacoes }
 */
export async function criarEmprestimo(dados) {
  // 🔴 Garante que o status seja enviado
  const payload = {
    id_usuario: Number(dados.id_usuario),
    id_equipamento: Number(dados.id_equipamento),
    id_tecnico_saida: Number(dados.id_tecnico_saida || 1),
    data_previsao_devolucao: dados.data_previsao_devolucao,
    observacoes: dados.observacoes || null,
    status: dados.status || "ATIVO"
  };
  
  console.log("📤 Criando empréstimo:", payload);
  const resultado = await apiPost(ENDPOINTS.CRIAR, payload);
  return resultado;
}

/**
 * Registra a devolução de um equipamento
 * @param {number} id - ID do empréstimo
 */
export async function devolverEmprestimo(id) {
  console.log("🔄 Devolvendo empréstimo ID:", id);
  const resultado = await apiPut(ENDPOINTS.DEVOLVER(id));
  return resultado;
}

/**
 * Atualiza um empréstimo existente (renovação, observações, etc.)
 * @param {number} id - ID do empréstimo
 * @param {Object} dados - { data_previsao_devolucao, observacoes, status }
 */
export async function atualizarEmprestimo(id, dados) {
  // 🔴 CORRIGIDO: Monta payload com apenas os campos fornecidos
  const payload = {};
  
  if (dados.data_previsao_devolucao) {
    payload.data_previsao_devolucao = dados.data_previsao_devolucao;
  }
  if (dados.observacoes !== undefined && dados.observacoes !== null) {
    payload.observacoes = dados.observacoes;
  }
  if (dados.status) {
    payload.status = dados.status.toUpperCase();
  }
  
  if (Object.keys(payload).length === 0) {
    throw new Error("Nenhum dado para atualizar");
  }
  
  console.log("📤 Payload para atualizar empréstimo:", payload);
  
  const resultado = await apiPut(ENDPOINTS.ATUALIZAR(id), payload);
  return resultado;
}

/**
 * Cancela um empréstimo (altera status para CANCELADO)
 * @param {number} id - ID do empréstimo
 */
export async function cancelarEmprestimo(id) {
  console.log("📤 Cancelando empréstimo ID:", id);
  const resultado = await apiPatch(ENDPOINTS.CANCELAR(id));
  return resultado;
}

/**
 * Exclui um empréstimo (uso restrito, apenas para correções)
 * @param {number} id - ID do empréstimo
 */
export async function deletarEmprestimo(id) {
  const resultado = await apiDelete(ENDPOINTS.DELETAR(id));
  return resultado;
}