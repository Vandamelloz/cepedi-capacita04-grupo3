import { useState, useEffect } from "react";
import TituloPagina from "../TituloPagina";
import SubTitulo from "../SubTitulo";
import CaixaSelecao from "../CaixadeSelecao/CaixadeSelecao";
import DataSelecao from "../DataSelecao/DataSelecao";
import CaixaTexto from "../CaixaTexto/CaixaTexto";
import Botao from "../Botao";

// Importando os Services
import { buscarUsuarios } from "../../services/usuarios/usuarios.service";
import { buscarEquipamentos } from "../../services/Equipamentos/equipamentos.service";
import { criarEmprestimo } from "../../services/Emprestimos/emprestimos.service";

export default function PopUpEmprestimo({ fechar, aoSalvar }) {
    const [usuarios, setUsuarios] = useState([]);
    const [equipamentos, setEquipamentos] = useState([]);
    const [erro, setErro] = useState("");
    const [salvando, setSalvando] = useState(false);
    const [dataDevolucao, setDataDevolucao] = useState("");

    useEffect(() => {
        async function carregarDadosParaFormulario() {
            try {
                const [dadosUsuarios, dadosEquipamentos] = await Promise.all([
                    buscarUsuarios(),
                    buscarEquipamentos()
                ]);
                
                console.log("📦 Usuários carregados:", dadosUsuarios);
                console.log("📦 Equipamentos carregados:", dadosEquipamentos);
                
                setUsuarios(dadosUsuarios);
                
                const equipamentosLivres = dadosEquipamentos.filter(eq => eq.status === "DISPONIVEL");
                console.log("📦 Equipamentos disponíveis (DISPONIVEL):", equipamentosLivres);
                setEquipamentos(equipamentosLivres);
            } catch (error) {
                console.error("❌ Erro ao carregar dados:", error);
                setErro("Erro ao carregar as listas do banco de dados.");
            }
        }
        carregarDadosParaFormulario();
    }, []);

    const opcoesUsuarios = usuarios.map(u => ({ valor: u.id, texto: u.nome }));
    const opcoesEquipamentos = equipamentos.map(e => ({ 
        valor: e.id, 
        texto: `${e.nome} (${e.codigo_patrimonio || e.patrimonio})` 
    }));

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErro("");

        const idUsuario = event.target.usuario.value;
        const idEquipamento = event.target.equipamento.value;
        const observacao = event.target.observacao.value.trim();

        if (!idUsuario || !idEquipamento || !dataDevolucao) {
            setErro("Por favor, preencha todos os campos obrigatórios (*).");
            return;
        }

        setSalvando(true);

        try {
            const usuarioSelecionado = usuarios.find(u => String(u.id) === String(idUsuario));
            const equipamentoSelecionado = equipamentos.find(e => String(e.id) === String(idEquipamento));
            
            if (!usuarioSelecionado || !equipamentoSelecionado) {
                setErro("Usuário ou equipamento inválido.");
                setSalvando(false);
                return;
            }

            const novoEmprestimo = {
                id_usuario: Number(idUsuario),
                id_equipamento: Number(idEquipamento),
                id_tecnico_saida: 1,
                data_previsao_devolucao: new Date(dataDevolucao).toISOString(),
                observacoes: observacao || null,
                status: "ATIVO"
            };

            console.log("📤 Enviando empréstimo:", novoEmprestimo);

            const resultado = await criarEmprestimo(novoEmprestimo);
            console.log("✅ Empréstimo criado:", resultado);

            if (aoSalvar) await aoSalvar();
            fechar();
        } catch (error) {
            console.error("❌ Erro ao registrar empréstimo:", error);
            setErro("Erro ao registrar o empréstimo: " + (error.message || ""));
        } finally {
            setSalvando(false);
        }
    };

    return (
        <div className="bg-white flex flex-col fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] max-w-[90vw] max-h-[90vh] overflow-y-auto items-center justify-around rounded-xl shadow-2xl p-6 border border-gray-200 z-50">
            
            <div className="w-full mb-4">
                <TituloPagina>Novo Empréstimo</TituloPagina>
                <SubTitulo>Vincule um equipamento disponível a um usuário.</SubTitulo>
            </div>

            {erro && (
                <div className="w-full bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-md text-sm font-medium text-center mb-4">
                    {erro}
                </div>
            )}

            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-[15px]">
                
                <CaixaSelecao 
                    label="Equipamento *" 
                    id="equipamento" 
                    placeholder={equipamentos.length === 0 ? "Nenhum equipamento disponível" : "Selecione o equipamento"} 
                    opcoes={opcoesEquipamentos} 
                />
                
                <CaixaSelecao 
                    label="Usuário *" 
                    id="usuario" 
                    placeholder="Selecione o usuário" 
                    opcoes={opcoesUsuarios} 
                />

                <DataSelecao 
                    label="Previsão de Devolução *" 
                    id="dataDevolucao"
                    name="dataDevolucao"
                    value={dataDevolucao}
                    onChange={(e) => setDataDevolucao(e.target.value)}
                />

                <CaixaTexto 
                    label="Observação" 
                    id="observacao" 
                    placeholder="Ex: Entregue sem a fonte de energia..." 
                />

                <div className="w-full flex flex-row justify-end gap-4 mt-4">
                    <Botao
                        children="Cancelar"
                        onClick={fechar}
                        type="button"
                        estilo="cancelar"
                        icone={false}
                        disabled={salvando}
                    />

                    <Botao 
                        children={salvando ? "Registrando..." : "Confirmar Empréstimo"}
                        type="submit"
                        estilo="registrar"
                        icone={false}
                        disabled={salvando || equipamentos.length === 0}
                    />
                </div>
            </form>
        </div>
    );
}