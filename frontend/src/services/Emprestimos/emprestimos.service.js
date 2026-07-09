const API_URL = "http://localhost:3001/emprestimos";

// 1. Buscar todos
export async function buscarEmprestimos() {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Erro ao buscar empréstimos");
    return await response.json();
}

// 2. Criar novo
export async function criarEmprestimo(dados) {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
    });
    if (!response.ok) throw new Error("Erro ao criar empréstimo");
    return await response.json();
}

// 3. Devolver (Atualiza apenas o status e a data)
export async function devolverEmprestimo(id) {
    // Pegando a data de hoje no formato YYYY-MM-DD
    const dataDeHoje = new Date().toISOString().split("T")[0];

    const response = await fetch(`${API_URL}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            status: "Concluído",
            dataDevolucaoReal: dataDeHoje 
        })
    });
    
    if (!response.ok) throw new Error("Erro ao registrar devolução");
    return await response.json();
}

// 4. Renovar (Atualiza os dados gerais, como a nova data)
export async function atualizarEmprestimo(id, dadosAtualizados) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosAtualizados)
    });
    if (!response.ok) throw new Error("Erro ao atualizar o empréstimo");
    return await response.json();
}

// 5. Excluir (Deleta o registro)
export async function deletarEmprestimo(id) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
    });
    if (!response.ok) throw new Error("Erro ao excluir o registro de empréstimo");
    return await response.json();
}