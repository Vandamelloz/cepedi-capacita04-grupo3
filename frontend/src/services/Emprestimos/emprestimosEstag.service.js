const API_URL = "http://localhost:3001/emprestimos";

export async function buscarEmprestimos() {

    const resposta = await fetch(API_URL);

    if (!resposta.ok) {
        throw new Error("Erro ao buscar empréstimos");
    }

    return await resposta.json();

}

export async function criarEmprestimo(dados) {

    const resposta = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type":"application/json"
        },
        body: JSON.stringify(dados)
    });

    if(!resposta.ok){
        throw new Error("Erro ao cadastrar empréstimo");
    }

    return await resposta.json();

}

export async function atualizarEmprestimo(id,dados){

    const resposta = await fetch(`${API_URL}/${id}`,{
        method:"PUT",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify(dados)
    });

    if(!resposta.ok){
        throw new Error("Erro ao atualizar empréstimo");
    }

    return await resposta.json();

}

export async function cancelarEmprestimo(id){

    const resposta = await fetch(`${API_URL}/${id}`,{
        method:"DELETE"
    });

    if(!resposta.ok){
        throw new Error("Erro ao cancelar empréstimo");
    }

    return await resposta.json();

}