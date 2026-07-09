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
    atualizarEmprestimo 
} from "../../services/Emprestimos/emprestimos.service";

export default function EmprestimosAdm() {
    const [emprestimos, setEmprestimos] = useState([]);
    const [popUpCadastro, setPopUpCadastro] = useState(false);
    
    // Modais de Cancelamento
    const [popUpExclusao, setPopUpExclusao] = useState(false);
    const [idParaExcluir, setIdParaExcluir] = useState(null);


    const [termo, setTermo] = useState("");
    const [filtroStatus, setFiltroStatus] = useState("");

    const carregar = useCallback(async () => {
        try {
            const dados = await buscarEmprestimos();
            const dataDeHoje = new Date().toISOString().split('T')[0];

            // Varredura de status dinâmico
            const dadosComStatusDinamico = dados.map(emp => {
                if (emp.status === "Ativo" && emp.dataDevolucao < dataDeHoje) {
                    return { ...emp, status: "Atrasado" };
                }
                return emp;
            });

            setEmprestimos(dadosComStatusDinamico);
        } catch (erro) {
            console.error("Erro ao carregar empréstimos:", erro);
        }
    }, []);

    useEffect(() => { 
        // eslint-disable-next-line react-hooks/set-state-in-effect
        carregar(); 
    }, [carregar]);

    const handleDevolver = async (id) => {
        try {
            await devolverEmprestimo(id);
            carregar();
        } catch (erro) {
            console.error("Erro ao devolver:", erro);
            alert("Não foi possível devolver o equipamento.");
        }
    };

    const handleRenovar = async (emp) => {
        try {
            const dataAtual = new Date(emp.dataDevolucao);
            dataAtual.setDate(dataAtual.getDate() + 7);
            const novaData = dataAtual.toISOString().split('T')[0];
            
            await atualizarEmprestimo(emp.id, { 
                ...emp, 
                dataDevolucao: novaData, 
                status: "Ativo" 
            });
            carregar();
        } catch (erro) {
            console.error("Erro ao renovar:", erro);
        }
    };

    const confirmarCancelamento = async () => {
        try {
            if (idParaExcluir) {
                const emprestimoAlvo = emprestimos.find(e => e.id === idParaExcluir);
                await atualizarEmprestimo(idParaExcluir, { 
                    ...emprestimoAlvo, 
                    status: "Cancelado" 
                });
                setPopUpExclusao(false);
                setIdParaExcluir(null);
                carregar(); 
            }
        } catch (erro) {
            console.error("Erro ao cancelar:", erro);
            setPopUpExclusao(false);
        }
    };

   
    const emprestimosFiltrados = emprestimos.filter((emp) => {
        const buscaTexto = termo.toLowerCase();
        const bateTexto = 
            (emp.equipamento && emp.equipamento.toLowerCase().includes(buscaTexto)) ||
            (emp.patrimonio && emp.patrimonio.toLowerCase().includes(buscaTexto)) ||
            (emp.usuario && emp.usuario.toLowerCase().includes(buscaTexto));

        // Verifica o select de Status exato
        const bateStatus = filtroStatus === "" || emp.status === filtroStatus;

        return bateTexto && bateStatus;
    });

    return (
        <LayoutUsuario tipoUsuario="adm" titulo="Gestão de Empréstimos" cargo="Administrador" nome="Paulo Victor">
            <main className="p-6">
                
                
                <Pesquisa 
                    termo={termo}
                    setTermo={setTermo}
                    
                    status={filtroStatus}
                    setStatus={setFiltroStatus}
                    listaStatus={["Ativo", "Atrasado", "Concluído", "Cancelado"]}
                    
                    extras={
                    <div className="ml-auto">
                    <Botao estilo="novo" icone onClick={() => setPopUpCadastro(true)}>Novo Empréstimo</Botao>
                    </div>}
                />
                
                <div className="flex flex-wrap gap-6 mt-6">
                    {emprestimosFiltrados.map(emp => (
                        <CardEmprestimo 
                            key={emp.id} 
                            {...emp} 
                            onDevolver={() => handleDevolver(emp.id)} 
                            onRenovar={() => handleRenovar(emp)}
                            onExcluir={() => {
                                setIdParaExcluir(emp.id);
                                setPopUpExclusao(true);
                            }} 
                        />
                    ))}
                    
                    {emprestimosFiltrados.length === 0 && (
                        <div className="w-full text-center py-10 text-gray-500">
                            Nenhum empréstimo encontrado para esta pesquisa.
                        </div>
                    )}
                </div>

                {popUpCadastro && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                        <PopUpEmprestimo fechar={() => setPopUpCadastro(false)} aoSalvar={carregar} />
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