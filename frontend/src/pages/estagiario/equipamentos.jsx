import LayoutUsuario from "../../layouts/usuario/LayoutUsuario.jsx";
import Pesquisa from "../../components/Pesquisa/Pesquisa";
import TabelaGipar from "../../components/tabelaGipar/TabelaGipar";
import StatusBadge from "../../components/ui/StatusBadge";

import { useState, useEffect, useCallback } from "react";
import { buscarEquipamentos } from "../../services/Equipamentos/equipamentos.service";

export default function Equipamentos() {
    const [termo, setTermo] = useState("");
    const [categoria, setCategoria] = useState("");
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
        const bateTexto = 
            equipamento.nome?.toLowerCase().includes(termoMinusculo) ||
            equipamento.patrimonio?.toLowerCase().includes(termoMinusculo);
        const bateCategoria = categoria === "" || equipamento.categoria === categoria;
        return bateTexto && bateCategoria;
    });

    return (
        <section className="h-screen w-full flex flex-row">
            <LayoutUsuario 
                tipoUsuario="estagiario" // Ajustado de adm para estagiário
                titulo="Equipamentos" 
                cargo="Estagiário"       // Ajustado de Administrador para Estagiário
                nome="John Doe"
                notificacoes={[]}        // O 'cd' que estava aqui foi removido
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
                            listaCategorias={["Informática", "Audiovisual", "Laboratório", "Ferramentas", "Redes", "Acessórios"]} // Deixei todas as categorias aqui
                            placeholderTexto="Buscar por nome ou patrimônio..."
                            placeholderCategoria="Todas as Categorias" 
                        />
                    </div>

                    <div className="w-full">
                        <TabelaGipar
                            colunas={[
                                { 
                                    titulo: "Nome", 
                                    chave: "nome",
                                    // O 'render' permite customizar como a célula inteira vai aparecer!
                                    render: (valor, linha) => (
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900">{linha.nome}</span>
                                            {linha.descricao && (
                                                <span className="text-xs text-gray-500 mt-0.5">{linha.descricao}</span>
                                            )}
                                        </div>
                                    )
                                },
                                { titulo: "Patrimônio", chave: "patrimonio" },
                                { titulo: "Categoria", chave: "categoria" },
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