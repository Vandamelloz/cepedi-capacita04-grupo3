import LayoutUsuario from "../../layouts/usuario/LayoutUsuario.jsx";
import Pesquisa from "../../components/Pesquisa/Pesquisa";
import TabelaGipar from "../../components/tabelaGipar/TabelaGipar";
import StatusBadge from "../../components/ui/StatusBadge";
import { useState, useEffect, useCallback } from "react";
import { buscarEquipamentos } from "../../services/Equipamentos/equipamentos.service";

export default function Equipamentos() {
    const [termo, setTermo] = useState("");
    const [categoria, setCategoria] = useState("");
    const [filtroStatus, setFiltroStatus] = useState("");
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

    const equipamentosFiltrados = equipamentos.filter((equipamento) => {
        const termoMinusculo = termo.toLowerCase();
        
        // Puxando o codigo_patrimonio real do backend
        const patrimonio = (equipamento.codigo_patrimonio || equipamento.patrimonio || "").toLowerCase();
        const nomeEq = (equipamento.nome || "").toLowerCase();
            
        const bateTexto = nomeEq.includes(termoMinusculo) || patrimonio.includes(termoMinusculo);
            
        const cat = equipamento.nome_categoria || equipamento.categoria || "";
        const bateCategoria = categoria === "" || cat === categoria;
        
        const bateStatus = filtroStatus === "" || equipamento.status === filtroStatus;

        return bateTexto && bateCategoria && bateStatus;
    });

    return (
        <section className="h-screen w-full flex flex-row">
            <LayoutUsuario 
                tipoUsuario="estagiario" 
                titulo="Equipamentos" 
                cargo="Estagiário"       
                nome="Paulo Victor"
                notificacoes={[]}        
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
                            listaCategorias={["Informática", "Audiovisual", "Laboratório", "Ferramentas", "Redes", "Acessórios"]}
                            status={filtroStatus}
                            setStatus={setFiltroStatus}
                            listaStatus={["Disponível", "Emprestado", "Em Manutenção", "Inativo"]}
                            placeholderTexto="Buscar por nome ou patrimônio..."
                            placeholderCategoria="Todas as Categorias"
                            placeholderStatus="Todos os Status"
                        />
                    </div>

                    <div className="w-full">
                        <TabelaGipar
                            colunas={[
                                { 
                                    titulo: "Nome", 
                                    chave: "nome",
                                    render: (valor, linha) => (
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900">{linha.nome}</span>
                                            {linha.descricao && (
                                                <span className="text-xs text-gray-500 mt-0.5">{linha.descricao}</span>
                                            )}
                                        </div>
                                    )
                                },
                                // Chave corrigida para bater com o MySQL
                                { titulo: "Patrimônio", chave: "codigo_patrimonio", render: (valor, linha) => valor || linha.patrimonio },
                                // Ajuste preventivo para aceitar nome_categoria do banco de dados
                                { titulo: "Categoria", chave: "nome_categoria", render: (valor, linha) => valor || linha.categoria },
                                { titulo: "Status", chave: "status" ,render: (valor) => <StatusBadge status={valor} />},
                            ]}
                            dados={equipamentosFiltrados} 
                        />
                    </div>
                </main>
            </LayoutUsuario>
        </section>  
    );
}