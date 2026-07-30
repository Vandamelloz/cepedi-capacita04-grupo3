// ================================================================
// manutencoes.service.js - CORREÇÃO DEFINITIVA
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
  let tipoMaiusculo = dados.tipo ? dados.tipo.toUpperCase() : "CORRETIVA";
  if (tipoMaiusculo === "PREVENTIVO") {
    tipoMaiusculo = "PREVENTIVA";
  }
  
  const payload = {
    id_equipamento: Number(dados.id_equipamento),
    descricao_defeito: dados.descricao_defeito,
    tipo: tipoMaiusculo,
    status: dados.status || "PENDENTE"
  };
  
  console.log("📤 CRIANDO payload:", payload);
  const resultado = await apiPost(ENDPOINTS.CRIAR, payload);
  return resultado;
}


export async function atualizarManutencao(id, dados) {
  console.log("🔵 ===== ATUALIZAR MANUTENÇÃO =====");
  console.log("🔵 ID:", id);
  console.log("🔵 Dados recebidos:", JSON.stringify(dados, null, 2));
  console.log("🔵 Tipo recebido:", dados.tipo);
  

  const payload = {
    tipo: dados.tipo || "CORRETIVA"  
  };

  if (dados.tipo) {
    let tipoUpper = String(dados.tipo).toUpperCase();
    if (tipoUpper === "PREVENTIVO") {
      tipoUpper = "PREVENTIVA";
    }
    payload.tipo = tipoUpper;
    console.log("🔵 Tipo processado:", tipoUpper);
  }
  
  
  if (dados.descricao_defeito !== undefined && dados.descricao_defeito !== null) {
    payload.descricao_defeito = dados.descricao_defeito;
  }
  
  if (dados.status) {
    payload.status = dados.status.toUpperCase();
  }
  
  if (dados.data_conclusao) {
    payload.data_conclusao = dados.data_conclusao;
  }
  
  console.log(" Payload FINAL sendo enviado:", JSON.stringify(payload, null, 2));
  console.log(" Tipo no payload FINAL:", payload.tipo);
  
  if (Object.keys(payload).length === 0) {
    console.warn(" Nenhum dado para atualizar");
    return { status: 200, data: { message: "ok" } };
  }
  
  const endpoint = ENDPOINTS.ATUALIZAR(id);
  console.log(" Endpoint:", endpoint);
  
  const resultado = await apiPut(endpoint, payload);
  console.log(" Resultado da atualização:", resultado);
  return resultado;
}

export async function concluirManutencao(id) {
  const payload = {
    status: "CONCLUIDO"
  };
  console.log("Concluindo manutenção:", payload);
  const resultado = await apiPut(ENDPOINTS.ATUALIZAR(id), payload);
  return resultado;
}

export async function excluirManutencao(id) {
  const resultado = await apiDelete(ENDPOINTS.EXCLUIR(id));
  return resultado;
}

export async function salvarManutencao(manutencao) {
  console.log("salvarManutencao recebeu:", JSON.stringify(manutencao, null, 2));
  console.log("Tipo recebido:", manutencao.tipo);
  console.log("ID recebido:", manutencao.id);
  
  if (manutencao.id) {
    console.log(" É uma atualização (ID:", manutencao.id, ")");
    return await atualizarManutencao(manutencao.id, manutencao);
  }
  
  console.log(" É uma criação");
  return await criarManutencao(manutencao);
}