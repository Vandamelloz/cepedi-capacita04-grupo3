import { useState } from "react";
import TituloPagina from "../TituloPagina";
import SubTitulo from "../SubTitulo";
import CaixaTexto from "../CaixaTexto/CaixaTexto";
import CaixaSelecao from "../CaixadeSelecao/CaixadeSelecao";
import Botao from "../Botao";

const categoriasDisponiveis = [
  { valor: "1", texto: "Informática (Computadores, Notebooks)" },
  { valor: "2", texto: "Eletrônicos (Equipamentos eletrônicos em geral)" },
  { valor: "3", texto: "Laboratório (Materiais de Laboratório, Arduino)" },
  { valor: "4", texto: "Áudio e Vídeo (Projetores, Câmeras, Caixas de Som)" }
];

export default function PopUpCadastrarEditarEquipamento({ cancelar, salvar, DadosIniciais = null, modoEdicao = false }) {
    
    const [erro, setErro] = useState("");

    const handleSubmit = (event) => {
    event.preventDefault();
    setErro("");

    // Pegamos os valores dos campos
    const nome = event.target.nome.value.trim();
    const categoria = event.target.categoria.value;
    const patrimonio = event.target.patrimonio.value.trim();
    const descricao = event.target.descricao.value.trim();
    const status = event.target.status.value || "DISPONIVEL"; // ← 🔴 CORREÇÃO AQUI!
    const quantidade = parseInt(event.target.quantidade?.value) || 1;

        // ==========================================
        // 🛡️ VALIDAÇÕES
        // ==========================================

        if (!nome || !categoria || !patrimonio || !status) {
            setErro("Por favor, preencha todos os campos obrigatórios (*).");
            return;
        }

        if (nome.length < 3) {
            setErro("O nome do equipamento deve ter pelo menos 3 caracteres.");
            return;
        }

        if (quantidade < 1) {
            setErro("A quantidade deve ser pelo menos 1.");
            return;
        }

        // ==========================================
        // 🔴 CORREÇÃO: Mapeia os campos para o formato do backend
        // ==========================================

        const dadosSubmetidos = {
            codigo_patrimonio: patrimonio,      // ← backend espera "codigo_patrimonio"
            nome: nome,
            modelo: descricao || "",            // ← backend espera "modelo"
            id_categoria: Number(categoria),    // ← backend espera "id_categoria" (número)
            quantidade: quantidade,             // ← NOVO: campo quantidade
            status: status.toUpperCase(),       // ← backend espera maiúsculas: "DISPONIVEL", "EM_USO", etc.
            ativo: true
        };

        console.log("📤 Dados submetidos:", dadosSubmetidos); // ← LOG para debug
        
        salvar(dadosSubmetidos);
    };

    return (
        <div className="bg-white flex flex-col fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] items-center justify-around rounded-xl shadow-sm p-5 border border-gray-300 gap-4 z-50">
            
            <TituloPagina>
                {modoEdicao ? "Editar Equipamento" : "Cadastrar Equipamento"}
            </TituloPagina>
            <SubTitulo>
                {modoEdicao ? "Faça as alterações necessárias no formulário abaixo." : "Preencha o formulário abaixo para cadastrar um novo equipamento."}
            </SubTitulo>

            {erro && (
                <div className="w-full bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-md text-sm font-medium text-center">
                    {erro}
                </div>
            )}

            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-[15px]">

                <CaixaTexto 
                    label="Nome *" 
                    id="nome" 
                    placeholder="Digite o nome do equipamento" 
                    defaultValue={DadosIniciais?.nome || ""} 
                />
                
                <CaixaSelecao 
                    label="Categoria *" 
                    id="categoria" 
                    placeholder="Selecione uma categoria" 
                    opcoes={categoriasDisponiveis} 
                    defaultValue={DadosIniciais?.id_categoria || DadosIniciais?.categoria || ""} 
                />
                
                <CaixaTexto 
                    label="Nº do Patrimônio *" 
                    id="patrimonio" 
                    placeholder="Digite o número do patrimônio" 
                    defaultValue={DadosIniciais?.codigo_patrimonio || DadosIniciais?.patrimonio || ""} 
                />
                
                <CaixaTexto 
                    label="Modelo / Descrição" 
                    id="descricao" 
                    placeholder="Digite o modelo ou descrição" 
                    defaultValue={DadosIniciais?.modelo || DadosIniciais?.descricao || ""} 
                />

                <CaixaTexto 
                    label="Quantidade *" 
                    id="quantidade" 
                    type="number"
                    placeholder="Digite a quantidade" 
                    defaultValue={DadosIniciais?.quantidade || 1} 
                />
                
                <CaixaSelecao 
                    label="Status *" 
                    id="status" 
                    placeholder="Selecione o status"
                    defaultValue={DadosIniciais?.status || ""} 
                    opcoes={[
                        { valor: "DISPONIVEL", texto: "Disponível" },
                        { valor: "EM_USO", texto: "Emprestado" },
                        { valor: "EM_MANUTENCAO", texto: "Em Manutenção" },
                        { valor: "INATIVO", texto: "Inativo" }
                    ]} 
                />

                <div className="w-full flex flex-row gap-6 mt-2">
                    <Botao
                        children="Cancelar"
                        onClick={cancelar}
                        type="button"
                        estilo="cancelar"
                        icone={false}
                    />

                    <Botao 
                        children={modoEdicao ? "Salvar" : "Cadastrar"}
                        type="submit"
                        estilo={modoEdicao ? "salvar" : "registrar"}
                        icone={false}
                    />
                </div>
            </form>
        </div>
    );
}