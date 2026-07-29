// ================================================================
// equipamentos.service.js - CRUD de Equipamentos (FastAPI)
// ================================================================

import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from "../api.config";

// ================================================================
// ENDPOINTS DO FASTAPI
// ================================================================

const ENDPOINTS = {
  LISTAR: "/listar_equipamentos",
  CRIAR: "/criar_equipamento",
  ATUALIZAR: (id) => `/atualizar_equipamento/${id}`,
  INATIVAR: (id) => `/inativar_equipamento/${id}`,
  REATIVAR: (id) => `/reativar_equipamento/${id}`,
  EXCLUIR: (id) => `/excluir_equipamento/${id}`,
};

// ================================================================
// FUNÇÕES CRUD
// ================================================================

/**
 * Lista todos os equipamentos ativos
 */
export async function buscarEquipamentos() {
  const resultado = await apiGet(ENDPOINTS.LISTAR);
  return resultado.equipamentos || [];
}

/**
 * Cria um novo equipamento
 * @param {Object} dados - { codigo_patrimonio, nome, modelo, id_categoria, status, ativo }
 */
export async function criarEquipamento(dados) {
  const resultado = await apiPost(ENDPOINTS.CRIAR, dados);
  return resultado;
}

/**
 * Atualiza um equipamento existente
 * @param {number} id - ID do equipamento
 * @param {Object} dados - { codigo_patrimonio, nome, modelo, id_categoria, status }
 */
export async function atualizarEquipamento(id, dados) {
  const resultado = await apiPut(ENDPOINTS.ATUALIZAR(id), dados);
  return resultado;
}

/**
 * Inativa um equipamento (Soft Delete)
 * @param {number} id - ID do equipamento
 */
export async function inativarEquipamento(id) {
  const resultado = await apiPatch(ENDPOINTS.INATIVAR(id));
  return resultado;
}

/**
 * Reativa um equipamento
 * @param {number} id - ID do equipamento
 */
export async function reativarEquipamento(id) {
  const resultado = await apiPatch(ENDPOINTS.REATIVAR(id));
  return resultado;
}

/**
 * Exclui um equipamento permanentemente (cuidado!)
 * @param {number} id - ID do equipamento
 */
export async function deletarEquipamento(id) {
  const resultado = await apiDelete(ENDPOINTS.EXCLUIR(id));
  return resultado;
}
