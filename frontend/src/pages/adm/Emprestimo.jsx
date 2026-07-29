import { useState, useEffect, useCallback } from "react";
import LayoutUsuario from "../../layouts/usuario/LayoutUsuario";
import Pesquisa from "../../components/Pesquisa/Pesquisa";
import CardEmprestimo from "../../components/CardEmprestimo/CardEmprestimo";
import PopUpEmprestimo from "../../components/PopUpEmprestimo/index";
import PopUpExclusao from "../../components/PopUpExclusao";
import Botao from "../../components/Botao";

import { 
    buscarEmprestimos, 
    devolverEmprestimo, 
    atualizarEmprestimo,
    cancelarEmprestimo   // ← ADICIONADO
} from "../../services/Emprestimos/emprestimos.service";

export default function EmprestimosAdm() {
    const [emprestimos, setEmprestimos] = useState([]);
    const [popUpCadastro, setPopUpCadastro] = useState(false);
    const [popUpExclusao, setPopUpExclusao] = useState(false);
    const [idParaExcluir, setIdParaExcluir] = useState(null);
    const [termo, setTermo] = useState("");
    const [filtroStatus, setFiltroStatus] = useState("");

    const carregar = useCallback(async () => {
        try {
            const dados = await buscarEmprestimos();
            console.log("📦 Empréstimos recebidos do backend:", dados);
            
            const dataDeHoje = new Date().toISOString().split('T')[0];

            const dadosProcessados = dados.map(emp => {
                const id = emp.id || emp.emprestimo_id;
                
                let statusFrontend = emp.status || "Ativo";
                if (emp.status === "ATIVO") statusFrontend = "Ativo";
                else if (emp.status === "ATRASADO") statusFrontend = "Atrasado";
                else if (emp.status === "DEVOLVIDO") statusFrontend = "Concluído";
                else if (emp.status === "CANCELADO") statusFrontend = "Cancelado";  // ← ADICIONADO
                
                if (statusFrontend === "Ativo") {
                    const dataPrevisao = emp.data_previsao_devolucao || emp.dataDevolucao;
                    if (dataPrevisao && dataPrevisao < dataDeHoje) {
                        statusFrontend = "Atrasado";
                    }
                }
                
                return { 
                    ...emp,
                    id: id,
                    status: statusFrontend,
                    equipamento: emp.nome_equipamento || emp.equipamento,
                    usuario: emp.nome_usuario || emp.usuario,
                    data: emp.data_retirada || emp.data,
                    dataDevolucao: emp.data_previsao_devolucao || emp.dataDevolucao,
                    dataDevolucaoReal: emp.data_devolucao_real || emp.dataDevolucaoReal,
                    patrimonio: emp.codigo_patrimonio || emp.patrimonio,
                    id_equipamento: emp.id_equipamento,
                    id_usuario: emp.id_usuario
                };
            });

            console.log("📦 Empréstimos processados:", dadosProcessados);
            setEmprestimos(dadosProcessados);
        } catch (erro) {
            console.error("❌ Erro ao carregar empréstimos:", erro);
        }
    }, []);

    useEffect(() => { 
        carregar(); 
    }, [carregar]);

    const handleDevolver = async (id) => {
        if (!id) {
            console.error("❌ ID do empréstimo é undefined!");
            alert("Erro: ID do empréstimo não encontrado.");
            return;
        }
        try {
            console.log("🔄 Devolvendo empréstimo ID:", id);
            await devolverEmprestimo(id);
            await carregar();
            alert("✅ Devolução registrada com sucesso!");
        } catch (erro) {
            console.error("Erro ao devolver:", erro);
            alert("Não foi possível devolver o equipamento: " + (erro.message || ""));
        }
    };

    const handleRenovar = async (emp) => {
        if (!emp || !emp.id) {
            console.error("❌ Empréstimo inválido para renovação!");
            alert("Erro: Dados do empréstimo inválidos.");
            return;
        }
        try {
            console.log("🔄 Renovando empréstimo ID:", emp.id);
            const dataAtual = new Date(emp.dataDevolucao);
            dataAtual.setDate(dataAtual.getDate() + 7);
            const novaData = dataAtual.toISOString();
            
            await atualizarEmprestimo(emp.id, { 
                data_previsao_devolucao: novaData
            });
            await carregar();
            alert("✅ Empréstimo renovado com sucesso!");
        } catch (erro) {
            console.error("Erro ao renovar:", erro);
            alert("Não foi possível renovar o empréstimo: " + (erro.message || ""));
        }
    };

    const confirmarCancelamento = async () => {
        try {
            if (idParaExcluir) {
                console.log("🔄 Cancelando empréstimo ID:", idParaExcluir);
                await cancelarEmprestimo(idParaExcluir);
                setPopUpExclusao(false);
                setIdParaExcluir(null);
                await carregar();
                alert("✅ Empréstimo cancelado com sucesso!");
            }
        } catch (erro) {
            console.error("Erro ao cancelar:", erro);
            alert("Erro ao cancelar empréstimo: " + (erro.message || ""));
            setPopUpExclusao(false);
        }
    };

    const emprestimosFiltrados = emprestimos.filter((emp) => {
        const buscaTexto = termo.toLowerCase();
        const bateTexto = 
            (emp.equipamento && emp.equipamento.toLowerCase().includes(buscaTexto)) ||
            (emp.patrimonio && emp.patrimonio.toLowerCase().includes(buscaTexto)) ||
            (emp.usuario && emp.usuario.toLowerCase().includes(buscaTexto));

        const bateStatus = filtroStatus === "" || emp.status === filtroStatus;
        return bateTexto && bateStatus;
    });

    return (
        <LayoutUsuario titulo="Gestão de Empréstimos">
            <main className="p-6">
                
                <Pesquisa 
                    termo={termo}
                    setTermo={setTermo}
                    status={filtroStatus}
                    setStatus={setFiltroStatus}
                    listaStatus={["Ativo", "Atrasado", "Concluído", "Cancelado"]}
                    extras={
                        <div className="ml-auto">
                            <Botao 
                                estilo="novo" 
                                icone 
                                onClick={() => {
                                    console.log("🟢 Abrindo popup de empréstimo");
                                    setPopUpCadastro(true);
                                }}
                            >
                                Novo Empréstimo
                            </Botao>
                        </div>
                    }
                />
                
                <div className="flex flex-wrap gap-6 mt-6">
                    {emprestimosFiltrados.length > 0 ? (
                        emprestimosFiltrados.map(emp => (
                            <CardEmprestimo 
                                key={emp.id || emp.emprestimo_id}
                                id={emp.id}
                                equipamento={emp.equipamento}
                                patrimonio={emp.patrimonio}
                                usuario={emp.usuario}
                                status={emp.status}
                                data={emp.data}
                                dataDevolucao={emp.dataDevolucao}
                                dataDevolucaoReal={emp.dataDevolucaoReal}
                                onDevolver={() => handleDevolver(emp.id)} 
                                onRenovar={() => handleRenovar(emp)}
                                onExcluir={() => {
                                    setIdParaExcluir(emp.id);
                                    setPopUpExclusao(true);
                                }} 
                            />
                        ))
                    ) : (
                        <div className="w-full text-center py-10 text-gray-500">
                            Nenhum empréstimo encontrado.
                        </div>
                    )}
                </div>

                {popUpCadastro && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                        <PopUpEmprestimo 
                            fechar={() => {
                                console.log("🔴 Fechando popup");
                                setPopUpCadastro(false);
                            }} 
                            aoSalvar={async () => {
                                console.log("🔄 Recarregando lista após salvar");
                                await carregar();
                            }} 
                        />
                    </div>
                )}
                
                {popUpExclusao && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                        <PopUpExclusao 
                            titulo="Cancelar Empréstimo"
                            subtitulo="Deseja realmente cancelar este registro?"
                            objeto="empréstimo"
                            cancelarExclusao={() => {
                                setPopUpExclusao(false);
                                setIdParaExcluir(null);
                            }}
                            confirmarExclusao={confirmarCancelamento} 
                        />
                    </div>
                )}

            </main>
        </LayoutUsuario>
    );
}