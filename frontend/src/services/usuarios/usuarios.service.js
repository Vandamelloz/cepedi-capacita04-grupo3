// ================================================================
// usuarios.service.js - CRUD de Usuários (FastAPI)
// ================================================================

import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from "../api.config";

// ================================================================
// ENDPOINTS DO FASTAPI
// ================================================================

const ENDPOINTS = {
  LISTAR: "/listar_usuarios",
  LISTAR_POR_TIPO: (tipo) => `/listar_usuarios/tipo/${tipo}`,
  BUSCAR: (id) => `/buscar_usuario/${id}`,
  CRIAR: "/criar_usuario",
  ATUALIZAR: (id) => `/atualizar_usuario/${id}`,
  ALTERAR_TIPO: (id) => `/alterar_tipo_usuario/${id}`,
  INATIVAR: (id) => `/inativar_usuario/${id}`,
  REATIVAR: (id) => `/reativar_usuario/${id}`,
  DELETAR: (id) => `/deletar_usuario/${id}`,  // ← ADICIONADO
};

// ================================================================
// FUNÇÕES CRUD
// ================================================================

/**
 * Lista todos os usuários ativos
 */
export async function buscarUsuarios() {
  const resultado = await apiGet(ENDPOINTS.LISTAR);
  return resultado.usuarios || [];
}

/**
 * Lista usuários por tipo
 * @param {string} tipo - ADMINISTRADOR, TECNICO, COMUM
 */
export async function buscarUsuariosPorTipo(tipo) {
  const resultado = await apiGet(ENDPOINTS.LISTAR_POR_TIPO(tipo));
  return resultado.usuarios || [];
}

/**
 * Busca um usuário específico pelo ID
 * @param {number} id - ID do usuário
 */
export async function buscarUsuarioPorId(id) {
  const resultado = await apiGet(ENDPOINTS.BUSCAR(id));
  return resultado.usuario || null;
}

/**
 * Cria um novo usuário
 * @param {Object} dados - { nome, email, senha, tipo_usuario }
 */
export async function criarUsuario(dados) {
  const resultado = await apiPost(ENDPOINTS.CRIAR, dados);
  return resultado;
}

/**
 * Atualiza um usuário existente
 * @param {number} id - ID do usuário
 * @param {Object} dados - { nome, email, senha, tipo_usuario }
 */
export async function atualizarUsuario(id, dados) {
  const resultado = await apiPut(ENDPOINTS.ATUALIZAR(id), dados);
  return resultado;
}

/**
 * Altera o tipo de um usuário (apenas ADMIN)
 * @param {number} id - ID do usuário
 * @param {string} novoTipo - ADMINISTRADOR, TECNICO, COMUM
 * @param {number} adminId - ID do administrador logado
 */
export async function alterarTipoUsuario(id, novoTipo, adminId) {
  const resultado = await apiPatch(`${ENDPOINTS.ALTERAR_TIPO(id)}?novo_tipo=${novoTipo}&admin_id=${adminId}`);
  return resultado;
}

/**
 * Inativa um usuário (Soft Delete)
 * @param {number} id - ID do usuário
 */
export async function inativarUsuario(id) {
  const resultado = await apiPatch(ENDPOINTS.INATIVAR(id));
  return resultado;
}

/**
 * Reativa um usuário
 * @param {number} id - ID do usuário
 */
export async function reativarUsuario(id) {
  const resultado = await apiPatch(ENDPOINTS.REATIVAR(id));
  return resultado;
}

/**
 * Exclui um usuário permanentemente (cuidado!)
 * @param {number} id - ID do usuário
 */
export async function deletarUsuario(id) {
  // 🔴 Agora DELETAR está definido!
  const resultado = await apiDelete(ENDPOINTS.DELETAR(id));
  return resultado;
}