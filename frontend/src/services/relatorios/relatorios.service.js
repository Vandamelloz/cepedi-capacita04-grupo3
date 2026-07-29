// ================================================================
// relatorios.service.js - Relatórios (FastAPI)
// ================================================================

import {
  CONFIG_RELATORIOS,
  TIPOS_RELATORIO,
} from "../../constants/relatorios.constants";
import { getAccessToken } from "../auth/auth.service";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Mapeamento de cabeçalhos do CSV
const MAPA_CABECALHOS = {
  ID: "id",
  Equipamento: "equipamento",
  Patrimonio: "patrimonio",
  Usuario: "usuario",
  "Data Retirada": "data_retirada",
  Status: "status",
  Nome: "nome",
  Modelo: "modelo",
  Email: "email",
  Tipo: "tipo",
  Defeito: "defeito",
  Abertura: "abertura",
  Data: "data",
  Descricao: "descricao",
};

function obterCabecalhosAuth() {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Sessão sem token. Faça login novamente.");
  }
  return { Authorization: `Bearer ${token}` };
}

function montarQuery({ formato, dataInicial, dataFinal, aceitaPeriodo }) {
  const params = new URLSearchParams();
  params.set("formato", formato);
  if (aceitaPeriodo && dataInicial && dataFinal) {
    params.set("data_inicial", dataInicial);
    params.set("data_final", dataFinal);
  }
  return params.toString();
}

function extrairNomeArquivo(contentDisposition, fallback) {
  if (!contentDisposition) return fallback;
  const match = /filename\*?=(?:UTF-8''|")?([^\";]+)"?/i.exec(contentDisposition);
  if (!match?.[1]) return fallback;
  return decodeURIComponent(match[1].replace(/['"]/g, "").trim());
}

function parsearCsv(texto) {
  const linhas = texto.replace(/^\uFEFF/, "").split(/\r?\n/).filter(linha => linha.trim().length > 0);
  if (linhas.length === 0) return [];
  const cabecalhos = dividirLinhaCsv(linhas[0]);
  return linhas.slice(1).map((linha, indice) => {
    const valores = dividirLinhaCsv(linha);
    const registro = { id: indice + 1 };
    cabecalhos.forEach((cabecalho, i) => {
      const chave = MAPA_CABECALHOS[cabecalho] ?? cabecalho.toLowerCase();
      registro[chave] = valores[i] ?? "";
    });
    return registro;
  });
}

function dividirLinhaCsv(linha) {
  const campos = [];
  let atual = "";
  let emAspas = false;
  for (let i = 0; i < linha.length; i += 1) {
    const char = linha[i];
    if (char === '"') {
      if (emAspas && linha[i + 1] === '"') {
        atual += '"';
        i += 1;
      } else {
        emAspas = !emAspas;
      }
      continue;
    }
    if (char === ";" && !emAspas) {
      campos.push(atual);
      atual = "";
      continue;
    }
    atual += char;
  }
  campos.push(atual);
  return campos;
}

function dispararDownload(blob, nomeArquivo) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function requisitarRelatorio({ tipo, formato, dataInicial = "", dataFinal = "" }) {
  const config = CONFIG_RELATORIOS[tipo];
  if (!config) throw new Error("Tipo de relatório inválido.");
  const query = montarQuery({ formato, dataInicial, dataFinal, aceitaPeriodo: config.aceitaPeriodo });
  const resposta = await fetch(`${API_BASE}/relatorios/${tipo}?${query}`, {
    method: "GET",
    headers: obterCabecalhosAuth(),
  });
  if (resposta.status === 401) {
    throw new Error("Não autorizado. Faça login novamente.");
  }
  if (resposta.status === 403) {
    throw new Error("Você não tem permissão para gerar este relatório.");
  }
  if (!resposta.ok) {
    let detalhe = "Não foi possível gerar o relatório.";
    try {
      const erro = await resposta.json();
      if (erro?.detail) detalhe = String(erro.detail);
    } catch {}
    throw new Error(detalhe);
  }
  return resposta;
}

export function obterLabelTipoRelatorio(tipo) {
  return TIPOS_RELATORIO.find(item => item.valor === tipo)?.texto ?? "Relatório";
}

export function obterConfigRelatorio(tipo) {
  return CONFIG_RELATORIOS[tipo] ?? CONFIG_RELATORIOS.emprestimos;
}

export async function buscarDadosRelatorio({ tipo, dataInicial = "", dataFinal = "" }) {
  const resposta = await requisitarRelatorio({ tipo, formato: "csv", dataInicial, dataFinal });
  const texto = await resposta.text();
  return parsearCsv(texto);
}

export async function exportarRelatorio({ tipo, formato, dataInicial = "", dataFinal = "" }) {
  const formatoNormalizado = String(formato).toLowerCase();
  if (formatoNormalizado !== "csv" && formatoNormalizado !== "pdf") {
    throw new Error("Formato inválido. Use csv ou pdf.");
  }
  const resposta = await requisitarRelatorio({ tipo, formato: formatoNormalizado, dataInicial, dataFinal });
  const blob = await resposta.blob();
  const fallback = `relatorio_${tipo}.${formatoNormalizado}`;
  const nomeArquivo = extrairNomeArquivo(resposta.headers.get("Content-Disposition"), fallback);
  dispararDownload(blob, nomeArquivo);
}