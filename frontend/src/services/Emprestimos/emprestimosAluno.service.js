import {
  MOCK_EMPRESTIMOS_ATIVOS,
  MOCK_HISTORICO_EMPRESTIMOS,
  MOCK_NOTIFICACOES_EMPRESTIMOS,
} from "../../mocks/emprestimosAluno.mock";

// TODO: substituir pela chamada real da API quando o backend estiver pronto
export async function buscarMeusEmprestimos({ simularErro = false, simularVazio = false } = {}) {
  await new Promise((resolve) => setTimeout(resolve, 400));

  if (simularErro) {
    throw new Error("Não foi possível carregar seus empréstimos. Tente novamente.");
  }

  if (simularVazio) {
    return {
      emprestimosAtivos: [],
      historico: [],
      notificacoes: [],
    };
  }

  return {
    emprestimosAtivos: MOCK_EMPRESTIMOS_ATIVOS,
    historico: MOCK_HISTORICO_EMPRESTIMOS,
    notificacoes: MOCK_NOTIFICACOES_EMPRESTIMOS,
  };
}
