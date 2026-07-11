import {
  CONFIG_RELATORIOS,
  TIPOS_RELATORIO,
} from "../../constants/relatorios.constants";
import { buscarEquipamentos } from "../Equipamentos/equipamentos.service";
import { buscarEmprestimos } from "../Emprestimos/emprestimos.service";
import { buscarManutencoes } from "../manutencao/manutencoes.service";

const CARREGADORES = {
  equipamentos: buscarEquipamentos,
  emprestimos: buscarEmprestimos,
  manutencoes: async () => {
    const { manutencoes } = await buscarManutencoes();
    return manutencoes;
  },
};

const TRANSFORMADORES = {
  equipamento: (item) => ({
    id: item.id,
    nome: item.nome,
    categoria: item.categoria,
    patrimonio: item.patrimonio,
    status: item.status,
  }),

  emprestimo: (item, contexto) => {
    const equipamento = contexto.equipamentos.find(
      (eq) => eq.patrimonio === item.patrimonio
    );

    return {
      id: item.id,
      nome: item.equipamento,
      categoria: equipamento?.categoria ?? "",
      patrimonio: item.patrimonio,
      status: item.status,
    };
  },

  manutencao: (item, contexto) => {
    const equipamento = contexto.equipamentos.find(
      (eq) => Number(eq.id) === Number(item.id_equipamento)
    );

    return {
      id: item.id,
      nome: equipamento?.nome ?? item.nome ?? "",
      categoria: equipamento?.categoria ?? "",
      patrimonio: equipamento?.patrimonio ?? item.patrimonio ?? "",
      status: item.concluida ? "Concluído" : "Em Manutenção",
    };
  },
};

function filtrarPorPeriodo(dados, campoData, dataInicial, dataFinal) {
  if (!campoData || (!dataInicial && !dataFinal)) {
    return dados;
  }

  return dados.filter((item) => {
    const data = item[campoData];
    if (!data) return true;
    if (dataInicial && data < dataInicial) return false;
    if (dataFinal && data > dataFinal) return false;
    return true;
  });
}

async function carregarColecoes(nomes) {
  const unicos = [...new Set(nomes)];
  const entradas = await Promise.all(
    unicos.map(async (nome) => [nome, await CARREGADORES[nome]()])
  );

  return Object.fromEntries(entradas);
}

function obterColecaoPrincipal(config, contexto) {
  const [principal] = config.colecoes;
  return contexto[principal];
}

export function obterLabelTipoRelatorio(tipo) {
  return TIPOS_RELATORIO.find((item) => item.valor === tipo)?.texto ?? "Relatório";
}

export async function buscarDadosRelatorio({
  tipo,
  dataInicial = "",
  dataFinal = "",
}) {
  const config = CONFIG_RELATORIOS[tipo] ?? CONFIG_RELATORIOS["inventario-completo"];

  const contexto = await carregarColecoes(config.colecoes);
  const dadosBrutos = obterColecaoPrincipal(config, contexto);

  const dadosFiltrados = filtrarPorPeriodo(
    dadosBrutos.filter(config.filtro),
    config.campoData,
    dataInicial,
    dataFinal
  );

  const transformar = TRANSFORMADORES[config.transformar];
  return dadosFiltrados.map((item) => transformar(item, contexto));
}
