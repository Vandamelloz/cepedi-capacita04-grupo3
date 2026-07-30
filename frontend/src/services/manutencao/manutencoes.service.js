// ================================================================
// manutencoes.service.js - CRUD de Manutenções (FastAPI)
// ================================================================

import { apiGet, apiPost, apiPut, apiDelete } from "../api.config";

const ENDPOINTS = {
  LISTAR: "/listar_manutencoes",
  CRIAR: "/criar_manutencao",
  ATUALIZAR: (id) => `/atualizar_manutencao/${id}`,
  EXCLUIR: (id) => `/excluir_manutencao/${id}`,
};

export async function buscarManutencoes() {
  const resultado = await apiGet(ENDPOINTS.LISTAR);
  return resultado.manutencoes || [];
}

export async function criarManutencao(dados) {
  const payload = {
    id_equipamento: Number(dados.id_equipamento),
    descricao_defeito: dados.descricao_defeito,
    status: dados.status || "PENDENTE"
  };
  const resultado = await apiPost(ENDPOINTS.CRIAR, payload);
  return resultado;
}

export async function atualizarManutencao(id, dados) {
  const payload = {};
  
  if (dados.descricao_defeito !== undefined) {
    payload.descricao_defeito = dados.descricao_defeito;
  }
  if (dados.status) {
    payload.status = dados.status.toUpperCase();
  }
  if (dados.data_conclusao) {
    payload.data_conclusao = dados.data_conclusao;
  }
  
  if (Object.keys(payload).length === 0) {
    return { status: 200, data: { message: "ok" } };
  }
  
  const resultado = await apiPut(ENDPOINTS.ATUALIZAR(id), payload);
  return resultado;
}

export async function concluirManutencao(id) {
  // 🔴 CORREÇÃO: Envia apenas o status
  const payload = {
    status: "CONCLUIDO"
  };
  console.log("📤 Concluindo manutenção:", payload);
  const resultado = await apiPut(ENDPOINTS.ATUALIZAR(id), payload);
  return resultado;
}

export async function excluirManutencao(id) {
  const resultado = await apiDelete(ENDPOINTS.EXCLUIR(id));
  return resultado;
}

export async function salvarManutencao(manutencao) {
  if (manutencao.id) {
    return await atualizarManutencao(manutencao.id, manutencao);
  }
  return await criarManutencao(manutencao);
}