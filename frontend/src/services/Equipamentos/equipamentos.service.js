const API_URL = "http://localhost:3001/equipamentos";

export async function buscarEquipamentos() {
    const resposta = await fetch(API_URL);
    
    if (!resposta.ok) {
        throw new Error("Erro ao buscar a lista de equipamentos");
    }
    
    return await resposta.json();
}

export async function criarEquipamento(dadosDoEquipamento) {
    const resposta = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Os "dadosDoEquipamento" virão do seu PopUpCadastrarEditarEquipamento
        body: JSON.stringify(dadosDoEquipamento)
    });
    
    if (!resposta.ok) {
        throw new Error("Erro ao cadastrar um novo equipamento");
    }
    
    return await resposta.json();
}

export async function atualizarEquipamento(id, dadosAtualizados) {
    const resposta = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosAtualizados)
    });
    
    if (!resposta.ok) {
        throw new Error("Erro ao atualizar os dados do equipamento");
    }
    
    return await resposta.json();
}

export async function deletarEquipamento(id) {
    const resposta = await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
    });
    
    if (!resposta.ok) {
        throw new Error("Erro ao excluir o equipamento");
    }
    
    return await resposta.json();
}