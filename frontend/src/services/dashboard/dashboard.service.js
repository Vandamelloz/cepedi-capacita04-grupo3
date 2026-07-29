// ================================================================
// dashboard.service.js - Dashboard (FastAPI)
// ================================================================

import { METRICAS_DEFINICAO, METRICAS_ESTAGIARIO_DEFINICAO } from "../../constants/dashboard.constants";
import { buscarEquipamentos } from "../Equipamentos/equipamentos.service";
import { buscarEmprestimos } from "../Emprestimos/emprestimos.service";
import { buscarUsuarios } from "../usuarios/usuarios.service";
import { apiGet } from "../api.config";

// ================================================================
// FUNÇÕES AUXILIARES
// ================================================================

export function formatarData(iso) {
  if (!iso) return "";
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

function obterDataHoje() {
  return new Date().toISOString().split("T")[0];
}

function formatarHorarioRelativo(dataIso) {
  if (!dataIso) return "";
  const data = new Date(`${dataIso}T12:00:00`);
  const hoje = new Date();
  hoje.setHours(12, 0, 0, 0);
  const diffDias = Math.floor((hoje - data) / (1000 * 60 * 60 * 24));
  if (diffDias <= 0) return "Hoje";
  if (diffDias === 1) return "Ontem";
  if (diffDias < 7) return `Há ${diffDias} dias`;
  return formatarData(dataIso);
}

async function buscarManutencoes() {
  const resultado = await apiGet("/listar_manutencoes");
  return resultado.manutencoes || [];
}

function aplicarStatusDinamico(emprestimos) {
  const dataDeHoje = obterDataHoje();
  return emprestimos.map((emprestimo) => {
    // Mapeia status do FastAPI para o formato do frontend
    const statusMap = {
      "ATIVO": "Ativo",
      "ATRASADO": "Atrasado",
      "DEVOLVIDO": "Concluído"
    };
    
    const statusFrontend = statusMap[emprestimo.status] || emprestimo.status;
    
    if (statusFrontend === "Ativo" && emprestimo.data_previsao_devolucao < dataDeHoje) {
      return { ...emprestimo, status: "Atrasado" };
    }
    return { ...emprestimo, status: statusFrontend };
  });
}

function prepararEmprestimos(emprestimos) {
  return emprestimos.map((emprestimo) => ({
    id: emprestimo.id,
    equipamento: emprestimo.nome_equipamento || emprestimo.equipamento,
    usuario: emprestimo.nome_usuario || emprestimo.usuario,
    data: emprestimo.data_retirada || emprestimo.data,
    dataDevolucao: emprestimo.data_previsao_devolucao || emprestimo.dataDevolucao,
    dataDevolucaoReal: emprestimo.data_devolucao_real,
    status: emprestimo.status,
    dataFormatada: formatarData(emprestimo.data_retirada || emprestimo.data),
    dataDevolucaoFormatada: formatarData(emprestimo.data_previsao_devolucao || emprestimo.dataDevolucao),
  }));
}

function contarEquipamentosPorStatus(equipamentos) {
  const statusMap = {
    "DISPONIVEL": "disponivel",
    "EM_USO": "emprestado",
    "EM_MANUTENCAO": "manutencao",
    "RESERVADO": "reservado",
    "INATIVO": "inativo"
  };
  
  return {
    disponivel: equipamentos.filter((item) => item.status === "DISPONIVEL").length,
    emprestado: equipamentos.filter((item) => item.status === "EM_USO").length,
    manutencao: equipamentos.filter((item) => item.status === "EM_MANUTENCAO").length,
  };
}

function calcularMetricas(equipamentos, emprestimos) {
  const emprestimosComStatus = aplicarStatusDinamico(emprestimos);
  const contagemEquipamentos = contarEquipamentosPorStatus(equipamentos);
  
  const contagens = {
    disponiveis: contagemEquipamentos.disponivel,
    emprestados: contagemEquipamentos.emprestado,
    manutencao: contagemEquipamentos.manutencao,
    atrasos: emprestimosComStatus.filter((item) => item.status === "Atrasado").length,
  };

  return METRICAS_DEFINICAO.map((metrica) => ({
    ...metrica,
    count: contagens[metrica.id] ?? 0,
  }));
}

function calcularMetricasEstagiario(equipamentos, emprestimos) {
  const contagemEquipamentos = contarEquipamentosPorStatus(equipamentos);
  const contagens = {
    disponiveis: contagemEquipamentos.disponivel,
    emprestados: contagemEquipamentos.emprestado,
    ativos: emprestimos.filter((item) => item.status === "ATIVO").length,
    atrasados: emprestimos.filter((item) => item.status === "ATRASADO").length,
  };

  return METRICAS_ESTAGIARIO_DEFINICAO.map((metrica) => ({
    ...metrica,
    count: contagens[metrica.id] ?? 0,
  }));
}

function calcularStatusEquipamentosGrafico(equipamentos) {
  const contagem = contarEquipamentosPorStatus(equipamentos ?? []);
  return [
    { id: "disponivel", label: "Disponível", valor: contagem.disponivel },
    { id: "emprestado", label: "Emprestado", valor: contagem.emprestado },
    { id: "manutencao", label: "Em Manutenção", valor: contagem.manutencao },
  ];
}

export function calcularGraficoStatusEquipamentos(equipamentos) {
  return calcularStatusEquipamentosGrafico(equipamentos);
}

export function montarDadosGraficoEquipamentos(equipamentos) {
  return calcularGraficoStatusEquipamentos(equipamentos);
}

export function mapearDadosParaGraficoBarras(dadosGrafico) {
  return (dadosGrafico ?? []).map((item) => ({
    id: item.id,
    label: item.label,
    valor: Number(item.valor ?? 0),
  }));
}

function prepararEmprestimosEstagiario(emprestimos) {
  return prepararEmprestimos(aplicarStatusDinamico(emprestimos));
}

function calcularItensMaisUsados(emprestimos) {
  const contagemPorEquipamento = emprestimos.reduce((acumulado, emprestimo) => {
    const nome = emprestimo.nome_equipamento || emprestimo.equipamento;
    acumulado[nome] = (acumulado[nome] ?? 0) + 1;
    return acumulado;
  }, {});

  return Object.entries(contagemPorEquipamento)
    .sort(([, valorA], [, valorB]) => valorB - valorA)
    .slice(0, 5)
    .map(([label, valor], indice) => ({
      id: `item-${indice}`,
      label,
      valor,
    }));
}

function montarNotificacoes(emprestimos, manutencoes, equipamentos, usuarios) {
  const usuariosAtivos = usuarios
    .filter((usuario) => usuario.ativo !== false)
    .map((usuario) => usuario.nome);

  const emprestimosComStatus = aplicarStatusDinamico(emprestimos);
  const notificacoes = [];
  let idNotificacao = 1;

  emprestimosComStatus
    .filter((emprestimo) => emprestimo.status === "Atrasado")
    .forEach((emprestimo) => {
      notificacoes.push({
        id: idNotificacao++,
        titulo: "Empréstimo atrasado",
        mensagem: `${emprestimo.nome_equipamento || emprestimo.equipamento} — ${emprestimo.nome_usuario || emprestimo.usuario}`,
        horario: formatarHorarioRelativo(emprestimo.data_previsao_devolucao || emprestimo.dataDevolucao),
        lida: false,
      });
    });

  manutencoes
    .filter((manutencao) => manutencao.status === "CONCLUIDO")
    .sort((a, b) => (b.data_conclusao ?? "").localeCompare(a.data_conclusao ?? ""))
    .slice(0, 3)
    .forEach((manutencao) => {
      const equipamento = equipamentos.find(
        (item) => Number(item.id) === Number(manutencao.id_equipamento)
      );
      notificacoes.push({
        id: idNotificacao++,
        titulo: "Manutenção concluída",
        mensagem: `${equipamento?.nome ?? "Equipamento"} disponível novamente`,
        horario: formatarHorarioRelativo(manutencao.data_conclusao),
        lida: false,
      });
    });

  emprestimosComStatus
    .filter(
      (emprestimo) =>
        emprestimo.status === "ATIVO" && usuariosAtivos.includes(emprestimo.nome_usuario || emprestimo.usuario)
    )
    .sort((a, b) => (b.data_retirada || "").localeCompare(a.data_retirada || ""))
    .slice(0, 3)
    .forEach((emprestimo) => {
      notificacoes.push({
        id: idNotificacao++,
        titulo: "Novo empréstimo",
        mensagem: `${emprestimo.nome_equipamento || emprestimo.equipamento} — ${emprestimo.nome_usuario || emprestimo.usuario}`,
        horario: formatarHorarioRelativo(emprestimo.data_retirada || emprestimo.data),
        lida: true,
      });
    });

  return notificacoes.slice(0, 8);
}

function obterEquipamentosEmManutencao(equipamentos) {
  return equipamentos
    .filter((equipamento) => equipamento.status === "EM_MANUTENCAO")
    .map((equipamento) => equipamento.nome);
}

/**
 * Busca dados para o dashboard principal via FastAPI
 */
export async function buscarDadosDashboard({ simularErro = false, simularVazio = false } = {}) {
  if (simularErro) {
    throw new Error("Não foi possível carregar os dados do dashboard.");
  }

  const [equipamentos, emprestimos, manutencoes, usuarios] = await Promise.all([
    buscarEquipamentos(),
    buscarEmprestimos(),
    buscarManutencoes(),
    buscarUsuarios(),
  ]);

  if (simularVazio) {
    return {
      metricas: METRICAS_DEFINICAO.map((metrica) => ({ ...metrica, count: 0 })),
      emprestimos: [],
      itensMaisUsados: [],
      notificacoes: [],
      equipamentosEmManutencao: [],
    };
  }

  const emprestimosComStatus = aplicarStatusDinamico(emprestimos);
  const equipamentosEmManutencao = obterEquipamentosEmManutencao(equipamentos);

  return {
    metricas: calcularMetricas(equipamentos, emprestimos),
    emprestimos: prepararEmprestimos(emprestimosComStatus),
    itensMaisUsados: calcularItensMaisUsados(emprestimos),
    notificacoes: montarNotificacoes(
      emprestimos,
      manutencoes,
      equipamentos,
      usuarios
    ),
    equipamentosEmManutencao,
  };
}

/**
 * Busca dados para o dashboard do estagiário via FastAPI
 */
export async function buscarDashboardEstagiario() {
  const [equipamentos, emprestimos, manutencoes, usuarios] = await Promise.all([
    buscarEquipamentos(),
    buscarEmprestimos(),
    buscarManutencoes(),
    buscarUsuarios(),
  ]);

  return {
    metricas: calcularMetricasEstagiario(equipamentos, emprestimos),
    equipamentos,
    statusEquipamentos: calcularGraficoStatusEquipamentos(equipamentos),
    emprestimos: prepararEmprestimosEstagiario(emprestimos),
    notificacoes: montarNotificacoes(
      emprestimos,
      manutencoes,
      equipamentos,
      usuarios
    ),
  };
}