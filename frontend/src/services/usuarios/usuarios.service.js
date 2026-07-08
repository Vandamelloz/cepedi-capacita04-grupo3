const API_URL = "http://localhost:3001/usuarios";

export async function buscarUsuarios() {
    const resposta = await fetch(API_URL);
    if (!resposta.ok) throw new Error("Erro ao buscar usuários");
    return await resposta.json();
}

export async function criarUsuario(dados) {
    const resposta = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
    });
    if (!resposta.ok) throw new Error("Erro ao cadastrar usuário");
    return await resposta.json();
}

export async function atualizarUsuario(id, dados) {
    const resposta = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
    });
    if (!resposta.ok) throw new Error("Erro ao atualizar usuário");
    return await resposta.json();
}

export async function deletarUsuario(id) {
    const resposta = await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
    });
    if (!resposta.ok) throw new Error("Erro ao excluir usuário");
    return await resposta.json();
}