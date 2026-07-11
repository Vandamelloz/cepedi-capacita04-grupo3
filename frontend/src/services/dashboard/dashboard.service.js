import { METRICAS_DEFINICAO } from "../../constants/dashboard.constants";
import { buscarEquipamentos } from "../Equipamentos/equipamentos.service";
import { buscarEmprestimos } from "../Emprestimos/emprestimos.service";
import { buscarUsuarios } from "../usuarios/usuarios.service";

const API_BASE = "http://localhost:3001";

export function formatarData(iso) {
  if (!iso) {
    return "";
  }

  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

function obterDataHoje() {
  return new Date().toISOString().split("T")[0];
}

function formatarHorarioRelativo(dataIso) {
  if (!dataIso) {
    return "";
  }

  const data = new Date(`${dataIso}T12:00:00`);
  const hoje = new Date();
  hoje.setHours(12, 0, 0, 0);

  const diffDias = Math.floor((hoje - data) / (1000 * 60 * 60 * 24));

  if (diffDias <= 0) {
    return "Hoje";
  }

  if (diffDias === 1) {
    return "Ontem";
  }

  if (diffDias < 7) {
    return `Há ${diffDias} dias`;
  }

  return formatarData(dataIso);
}

async function buscarManutencoes() {
  const resposta = await fetch(`${API_BASE}/manutencoes`);

  if (!resposta.ok) {
    throw new Error(
      "Não foi possível carregar as manutenções. Verifique se o json-server está rodando na porta 3001."
    );
  }

  return resposta.json();
}

function aplicarStatusDinamico(emprestimos) {
  const dataDeHoje = obterDataHoje();

  return emprestimos.map((emprestimo) => {
    if (emprestimo.status === "Ativo" && emprestimo.dataDevolucao < dataDeHoje) {
      return { ...emprestimo, status: "Atrasado" };
    }

    return emprestimo;
  });
}

function prepararEmprestimos(emprestimos) {
  return emprestimos.map((emprestimo) => ({
    ...emprestimo,
    dataFormatada: formatarData(emprestimo.data),
    dataDevolucaoFormatada: formatarData(emprestimo.dataDevolucao),
  }));
}

function calcularMetricas(equipamentos, emprestimos) {
  const emprestimosComStatus = aplicarStatusDinamico(emprestimos);

  const contagens = {
    disponiveis: equipamentos.filter((item) => item.status === "Disponível").length,
    emprestados: equipamentos.filter((item) => item.status === "Emprestado").length,
    manutencao: equipamentos.filter((item) => item.status === "Em Manutenção").length,
    atrasos: emprestimosComStatus.filter((item) => item.status === "Atrasado").length,
  };

  return METRICAS_DEFINICAO.map((metrica) => ({
    ...metrica,
    count: contagens[metrica.id] ?? 0,
  }));
}

function calcularItensMaisUsados(emprestimos) {
  const contagemPorEquipamento = emprestimos.reduce((acumulado, emprestimo) => {
    const nome = emprestimo.equipamento;
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
    .filter((usuario) => usuario.status === "Ativo")
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
        mensagem: `${emprestimo.equipamento} — ${emprestimo.usuario}`,
        horario: formatarHorarioRelativo(emprestimo.dataDevolucao),
        lida: false,
      });
    });

  manutencoes
    .filter((manutencao) => manutencao.concluida)
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
        emprestimo.status === "Ativo" && usuariosAtivos.includes(emprestimo.usuario)
    )
    .sort((a, b) => b.data.localeCompare(a.data))
    .slice(0, 3)
    .forEach((emprestimo) => {
      notificacoes.push({
        id: idNotificacao++,
        titulo: "Novo empréstimo",
        mensagem: `${emprestimo.equipamento} — ${emprestimo.usuario}`,
        horario: formatarHorarioRelativo(emprestimo.data),
        lida: true,
      });
    });

  return notificacoes.slice(0, 8);
}

function obterEquipamentosEmManutencao(equipamentos) {
  return equipamentos
    .filter((equipamento) => equipamento.status === "Em Manutenção")
    .map((equipamento) => equipamento.nome);
}

/**
 * Camada de acesso aos dados do dashboard via json-server.
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
