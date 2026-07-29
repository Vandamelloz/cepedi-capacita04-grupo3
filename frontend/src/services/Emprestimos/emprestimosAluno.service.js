// ================================================================
// emprestimosAluno.service.js - Empréstimos para Alunos (FastAPI)
// ================================================================

import { buscarEmprestimos } from "./emprestimos.service";

/**
 * Busca empréstimos de um aluno específico pelo nome
 * @param {string} nomeUsuario - Nome do usuário
 */
export async function buscarMeusEmprestimos(nomeUsuario) {
  const emprestimos = await buscarEmprestimos();
  
  // Filtra pelo nome do usuário (case insensitive)
  return emprestimos.filter(
    (emp) => emp.nome_usuario?.toLowerCase() === nomeUsuario?.toLowerCase()
  );
}