import LayoutUsuario from "../../layouts/usuario/LayoutUsuario.jsx";
import PopUpCadastrarEditarEquipamento from "../../components/PopUpCadastrarEditarEquipamento/index.jsx";
import Pesquisa from "../../components/Pesquisa/Pesquisa";
import TabelaGipar from "../../components/tabelaGipar/TabelaGipar";
import Botao from "../../components/Botao";
import PopUpExclusao from "../../components/PopUpExclusao";
import StatusBadge from "../../components/ui/StatusBadge";

import { useState, useEffect, useCallback } from "react";
import { buscarEquipamentos, criarEquipamento, atualizarEquipamento, deletarEquipamento } from "../../services/Equipamentos/equipamentos.service";


export default function Equipamentos() {
    const [popUpEditarEquipamento, setPopUpEditarEquipamento] = useState(false);
    const [popUpCadastrarEquipamento, setPopUpCadastrarEquipamento] = useState(false);
    const [popUpExclusao, setPopUpExclusao] = useState(false);

    const [termo, setTermo] = useState("");
    const [categoria, setCategoria] = useState("");
    const [equipamentoSelecionado, setEquipamentoSelecionado] = useState(null);
    const [equipamentos, setEquipamentos] = useState([]);


    const carregarEquipamentos = useCallback(async () => {
        try {
            const dados = await buscarEquipamentos();
            setEquipamentos(dados);
        } catch (erro) {
            console.error(erro);
        }
    }, []);

    useEffect(() => {
        carregarEquipamentos();
    }, [carregarEquipamentos]);

    const salvarEquipamento = async (dadosDoFormulario) => {
        try {
            if (equipamentoSelecionado) {
                await atualizarEquipamento(equipamentoSelecionado.id, { ...equipamentoSelecionado, ...dadosDoFormulario });
            } else {
                const novoEquipamento = {
                    id: String(Date.now()), 
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
        return bateTexto && bateCategoria;
    });


    return (

        <section className="h-screen w-full flex flex-row">
            <LayoutUsuario 
                tipoUsuario="adm" 
                titulo="Equipamentos" 
                cargo="Administrador" 
                nome="John Doe"
                notificacoes={[]}cd 
                onMarcarNotificacaoLida={() => console.log("Notificação marcada como lida")}
                onMarcarTodasNotificacoesLidas={() => console.log("Todas as notificações marcadas como lidas")}
                onLogout={() => console.log("logout")}
            >

                <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                    <div className="w-full">
                        <Pesquisa
                            termo={termo}
                            setTermo={setTermo}
                            categoria={categoria}
                            setCategoria={setCategoria}
                            listaCategorias={["Informática", "Audiovisual", "Laboratório"]}
                            placeholderTexto="Buscar por nome ou patrimônio..."
                            placeholderCategoria="Todas as Categorias" 
                            extras={
                                <div className="ml-auto">
                                    <Botao 
                                        onClick={() => setPopUpCadastrarEquipamento(true)}
                                        type="button"
                                        estilo="novo" // Mudado para "novo" para ficar verde igual aos botões dos seus colegas
                                        icone={true}  // Adicionado o ícone de +
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

                    {/* MODAIS (mantidos exatamente como estavam, apenas com a película escura de fundo se você não tivesse colocado antes) */}
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