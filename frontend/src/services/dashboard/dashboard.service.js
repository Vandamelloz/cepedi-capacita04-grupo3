import {
  DASHBOARD_CONFIG,
  MOCK_DASHBOARD_VAZIO,
  MOCK_EMPRESTIMOS,
  MOCK_ITENS_MAIS_USADOS,
  MOCK_METRICAS,
  MOCK_NOTIFICACOES,
} from "../../mocks/dashboard.mock";

function aguardar(ms) {
  if (!ms || ms <= 0) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function formatarData(iso) {
  if (!iso) {
    return "";
  }

  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

function prepararEmprestimos(emprestimos) {
  return emprestimos.map((emprestimo) => ({
    ...emprestimo,
    dataFormatada: formatarData(emprestimo.data),
    dataDevolucaoFormatada: formatarData(emprestimo.dataDevolucao),
  }));
}

/**
 * Camada de acesso aos dados do dashboard.
 * Hoje consome mocks; no futuro, substituir o corpo por chamadas à API.
 */
export async function buscarDadosDashboard({ simularErro = false, simularVazio = false } = {}) {
  await aguardar(DASHBOARD_CONFIG.simulateLoadingMs);

  if (simularErro) {
    throw new Error("Não foi possível carregar os dados do dashboard.");
  }

  if (simularVazio) {
    return {
      metricas: MOCK_DASHBOARD_VAZIO.metricas,
      emprestimos: prepararEmprestimos(MOCK_DASHBOARD_VAZIO.emprestimos),
      itensMaisUsados: MOCK_DASHBOARD_VAZIO.itensMaisUsados,
      notificacoes: [],
    };
  }

  return {
    metricas: MOCK_METRICAS,
    emprestimos: prepararEmprestimos(MOCK_EMPRESTIMOS),
    itensMaisUsados: MOCK_ITENS_MAIS_USADOS,
    notificacoes: MOCK_NOTIFICACOES.map((notificacao) => ({ ...notificacao })),
  };
}
