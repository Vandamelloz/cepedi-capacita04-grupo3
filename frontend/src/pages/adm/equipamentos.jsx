import LayoutUsuario from "../../layouts/usuario/LayoutUsuario.jsx";
import PopUpCadastrarEditarEquipamento from "../../components/PopUpCadastrarEditarEquipamento/index.jsx";
import Pesquisa from "../../components/Pesquisa/Pesquisa";
import TabelaGipar from "../../components/tabelaGipar/TabelaGipar";
import Botao from "../../components/Botao";
import PopUpExclusao from "../../components/PopUpExclusao";
import StatusBadge from "../../components/ui/StatusBadge";

import { useState, useEffect } from "react";
import { buscarEquipamentos, criarEquipamento, atualizarEquipamento, deletarEquipamento } from "../../services/Equipamentos/equipamentos.service";

const gerarIdEquipamento = () => String(Date.now());

export default function Equipamentos () {
    const [popUpEditarEquipamento, setPopUpEditarEquipamento] = useState(false);
    const [popUpCadastrarEquipamento, setPopUpCadastrarEquipamento] = useState(false);
    const [popUpExclusao, setPopUpExclusao] = useState(false);


    const [termo, setTermo] = useState("");
    const [categoria, setCategoria] = useState("");
    const [filtroStatus, setFiltroStatus] = useState(""); // Novo estado para status

    const [equipamentoSelecionado, setEquipamentoSelecionado] = useState(null);
    const [equipamentos, setEquipamentos] = useState([]);

    const carregarEquipamentos = async () => {
        try {
            const dados = await buscarEquipamentos();
            setEquipamentos(dados);
        } catch (erro) {
            console.error(erro);
        }
    };

    useEffect(() => {
        let ativo = true;

        const carregar = async () => {
            try {
                const dados = await buscarEquipamentos();
                if (ativo) {
                    setEquipamentos(dados);
                }
            } catch (erro) {
                console.error(erro);
            }
        };

        carregar();

        return () => {
            ativo = false;
        };
    }, []);

    const salvarEquipamento = async (dadosDoFormulario) => {
        try {
            if (equipamentoSelecionado) {
                await atualizarEquipamento(equipamentoSelecionado.id, { ...equipamentoSelecionado, ...dadosDoFormulario });
            } else {
                const novoEquipamento = {
                    id: gerarIdEquipamento(),
                    ...dadosDoFormulario
                };
                await criarEquipamento(novoEquipamento);
            }
            carregarEquipamentos();
            fecharPopUp();
        } catch (erro) {
            console.error(erro);
        }
    };

    const excluirEquipamento = async () => {
        if (equipamentoSelecionado) {
            try {
                await deletarEquipamento(equipamentoSelecionado.id);
                carregarEquipamentos();
                fecharPopUp();
            } catch (erro) {
                console.error(erro);
            }
        }
    };

    const fecharPopUp = () => {
        setPopUpExclusao(false);
        setPopUpEditarEquipamento(false);
        setPopUpCadastrarEquipamento(false);
        setEquipamentoSelecionado(null);
    };


    const equipamentosFiltrados = equipamentos.filter((equipamento) => {
        const termoMinusculo = termo.toLowerCase();
        
        const bateTexto = 
            equipamento.nome?.toLowerCase().includes(termoMinusculo) ||
            equipamento.patrimonio?.toLowerCase().includes(termoMinusculo);
            
        const bateCategoria = categoria === "" || equipamento.categoria === categoria;
        
        const bateStatus = filtroStatus === "" || equipamento.status === filtroStatus;

        return bateTexto && bateCategoria && bateStatus;
    });

    return (
        <section className="h-screen w-full flex flex-row">
            <LayoutUsuario titulo="Equipamentos">
                <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                    <div className="w-full">
                        
                        <Pesquisa
                            termo={termo}
                            setTermo={setTermo}
                            
                            categoria={categoria}
                            setCategoria={setCategoria}
                            listaCategorias={["Informática", "Audiovisual", "Laboratório", "Ferramentas", "Redes", "Acessórios"]}
                            
                            status={filtroStatus}
                            setStatus={setFiltroStatus}
                            listaStatus={["Disponível", "Emprestado", "Em Manutenção", "Inativo"]}
                            
                            placeholderTexto="Buscar por nome ou patrimônio..."
                            placeholderCategoria="Todas as Categorias"
                            placeholderStatus="Todos os Status"
                            
                            extras={
                                <div className="ml-auto">
                                    <Botao 
                                        onClick={() => setPopUpCadastrarEquipamento(true)}
                                        type="button"
                                        estilo="novo" 
                                        icone={true}  
                                    >
                                        Cadastrar Equipamento
                                    </Botao>
                                </div>
                            }
                        />
                    </div>

                    <div className="w-full">
                        <TabelaGipar
                            colunas={[
                                { titulo: "Nome", chave: "nome" },
                                { titulo: "Patrimônio", chave: "patrimonio" },
                                { titulo: "Categoria", chave: "categoria" },
                                { titulo: "Status", chave: "status", render: (valor) => <StatusBadge status={valor} /> },
                            ]}
                            dados={equipamentosFiltrados} 
                            onEditar={(equipamento) => {
                                setEquipamentoSelecionado(equipamento);
                                setPopUpEditarEquipamento(true);
                            }}
                            onDeletar={(equipamento) => {
                                setEquipamentoSelecionado(equipamento);
                                setPopUpExclusao(true);
                            }}
                        />
                    </div>

                    {/* MODAIS */}
                    {popUpEditarEquipamento && (
                        <>
                            <div className="fixed inset-0 bg-black/40 z-40" onClick={fecharPopUp} />
                            <div className="fixed inset-0 flex items-center justify-center z-50">
                                <PopUpCadastrarEditarEquipamento DadosIniciais={equipamentoSelecionado} cancelar={fecharPopUp} salvar={salvarEquipamento} modoEdicao={true} />
                            </div>
                        </>
                    )}
                    {popUpCadastrarEquipamento && (
                        <>
                            <div className="fixed inset-0 bg-black/40 z-40" onClick={fecharPopUp} />
                            <div className="fixed inset-0 flex items-center justify-center z-50">
                                <PopUpCadastrarEditarEquipamento cancelar={fecharPopUp} salvar={salvarEquipamento} modoEdicao={false} />
                            </div>
                        </>
                    )}
                    {popUpExclusao && (
                        <>
                            <div className="fixed inset-0 bg-black/40 z-40" onClick={fecharPopUp} />
                            <div className="fixed inset-0 flex items-center justify-center z-50">
                                <PopUpExclusao
                                    titulo="Confirmar Exclusão"
                                    subtitulo="Essa ação não poderá ser desfeita."
                                    objeto={equipamentoSelecionado ? equipamentoSelecionado.nome : "Equipamento"}
                                    confirmarExclusao={excluirEquipamento}
                                    cancelarExclusao={fecharPopUp}
                                />
                            </div>
                        </>
                    )}

                </main>
            </LayoutUsuario>
        </section>  
    );
}