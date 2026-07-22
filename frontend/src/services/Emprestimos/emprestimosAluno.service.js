const API_URL = "http://localhost:3001/emprestimos";

// Mantém o mesmo nome de função de antes (buscarMeusEmprestimos) para não quebrar
// nenhum import existente — só trocou o que tem por dentro (mock -> API real).
export async function buscarMeusEmprestimos(nomeUsuario) {
  const resposta = await fetch(`${API_URL}?usuario=${encodeURIComponent(nomeUsuario)}`);

  if (!resposta.ok) {
    throw new Error("Não foi possível carregar seus empréstimos. Tente novamente.");
  }

  return await resposta.json();
}