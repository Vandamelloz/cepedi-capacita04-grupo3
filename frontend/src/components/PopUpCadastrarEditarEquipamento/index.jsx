import { useState } from "react";
import TituloPagina from "../TituloPagina";
import SubTitulo from "../SubTitulo";
import CaixaTexto from "../CaixaTexto/CaixaTexto";
import CaixaSelecao from "../CaixadeSelecao/CaixadeSelecao";
import Botao from "../Botao";

const categoriasDisponiveis = [
  { valor: "Informática", texto: "Informática (Computadores, Notebooks)" },
  { valor: "Audiovisual", texto: "Áudio e Vídeo (Projetores, Câmeras)" },
  { valor: "Laboratório", texto: "Materiais de Laboratório (Microscópio, Arduino)" },
  { valor: "Ferramentas", texto: "Ferramentas de Manutenção (Furadeira)" },
  { valor: "Redes", texto: "Redes e Conectividade (Roteadores, Switches)" },
  { valor: "Acessórios", texto: "Acessórios Diversos (Adaptadores, Cabos)" }
];

export default function PopUpCadastrarEditarEquipamento({ cancelar, salvar, DadosIniciais = null, modoEdicao = false }) {
    
    const [erro, setErro] = useState("");

    const handleSubmit = (event) => {
        event.preventDefault();
        setErro(""); // Limpa erros antigos

        // Pegamos os valores dos campos
        const nome = event.target.nome.value.trim();
        const categoria = event.target.categoria.value;
        const patrimonio = event.target.patrimonio.value.trim();
        const descricao = event.target.descricao.value.trim();
        const status = event.target.status.value;

        // ==========================================
        // 🛡️ REGRAS DE VALIDAÇÃO
        // ==========================================

        // 1. Impedir campos obrigatórios vazios
        if (!nome || !categoria || !patrimonio || !status) {
            setErro("Por favor, preencha todos os campos obrigatórios (*).");
            return;
        }

        // 2. Impedir nome muito curto
        if (nome.length < 3) {
            setErro("O nome do equipamento deve ter pelo menos 3 caracteres.");
            return;
        }

        // ==========================================
        // SE PASSOU NAS VALIDAÇÕES, SALVA!
        // ==========================================

        const dadosSubmetidos = {
            nome,
            categoria,
            patrimonio,
            descricao,
            status
        };
        
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

            {/* 🌟 CAIXA VERMELHA DE ERRO */}
            {erro && (
                <div className="w-full bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-md text-sm font-medium text-center">
                    {erro}
                </div>
            )}

            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-[15px]">

                <CaixaTexto label="Nome *" id="nome" placeholder="" defaultValue={DadosIniciais?.nome || ""} />
                
                <CaixaSelecao label="Categoria *" id="categoria" placeholder="Selecione uma categoria" opcoes={categoriasDisponiveis} defaultValue={DadosIniciais?.categoria || ""} />
                
                <CaixaTexto label="Nº do Patrimônio *" id="patrimonio" placeholder="" defaultValue={DadosIniciais?.patrimonio || ""} />
                
                <CaixaTexto label="Descrição" id="descricao" placeholder="" defaultValue={DadosIniciais?.descricao || ""} />
                
                <CaixaSelecao label="Status *" id="status" placeholder="Selecione o status" defaultValue={DadosIniciais?.status || ""} opcoes={[
                    { valor: "Disponível", texto: "Disponível" },
                    { valor: "Emprestado", texto: "Emprestado" },
                    { valor: "Em Manutenção", texto: "Em Manutenção" },
                    { valor: "Inativo", texto: "Inativo" }
                ]} />

                <div className=" w-[500px] flex flex-row gap-6 mt-2">
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