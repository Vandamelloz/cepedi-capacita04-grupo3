// ================================================================
// useManutencoes.js - Hook para gerenciar manutenções
// ================================================================

import { useState, useEffect, useMemo, useCallback } from "react";
import { 
    buscarManutencoes, 
    criarManutencao, 
    atualizarManutencao, 
    excluirManutencao,
    concluirManutencao 
} from "../services/manutencao/manutencoes.service";

export default function useManutencoes() {
    const [manutencoes, setManutencoes] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [termo, setTermo] = useState("");
    const [mostrarConcluidas, setMostrarConcluidas] = useState(false);
    
    // Popups
    const [popupConclusaoAberto, setPopupConclusaoAberto] = useState(false);
    const [popupCadastroAberto, setPopupCadastroAberto] = useState(false);
    const [popupExclusaoAberto, setPopupExclusaoAberto] = useState(false);
    const [manutencaoSelecionada, setManutencaoSelecionada] = useState(null);

    // ============================================================
    // CARREGAR MANUTENÇÕES
    // ============================================================
    const carregarManutencoes = useCallback(async () => {
        setCarregando(true);
        setErro("");
        try {
            const dados = await buscarManutencoes();
            console.log("📦 Manutenções carregadas no hook:", dados);
            setManutencoes(Array.isArray(dados) ? dados : []);
        } catch (err) {
            console.error("❌ Erro no hook:", err);
            setErro("Erro ao carregar manutenções. Tente novamente.");
            setManutencoes([]);
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        carregarManutencoes();
    }, [carregarManutencoes]);

    // ============================================================
    // FILTROS
    // ============================================================
    const manutencoesFiltradas = useMemo(() => {
        let filtradas = manutencoes;

        // Filtro por termo de busca (nome do equipamento)
        if (termo.trim()) {
            const busca = termo.toLowerCase();
            filtradas = filtradas.filter(m => 
                (m.nome_equipamento || m.nome || "").toLowerCase().includes(busca) ||
                (m.descricao_defeito || "").toLowerCase().includes(busca)
            );
        }

        // Filtro por "Mostrar concluídas"
        if (!mostrarConcluidas) {
            filtradas = filtradas.filter(m => m.status !== "CONCLUIDO");
        }

        return filtradas;
    }, [manutencoes, termo, mostrarConcluidas]);

    // ============================================================
    // CONTAGENS PARA OS CARDS
    // ============================================================
    const emManutencao = useMemo(() => {
        return manutencoes.filter(m => m.status === "PENDENTE" || m.status === "EM_ANDAMENTO").length;
    }, [manutencoes]);

    const corretivas = useMemo(() => {
        return manutencoes.filter(m => 
            m.tipo === "CORRETIVA" && (m.status === "PENDENTE" || m.status === "EM_ANDAMENTO")
        ).length;
    }, [manutencoes]);

    const concluidas = useMemo(() => {
        return manutencoes.filter(m => m.status === "CONCLUIDO").length;
    }, [manutencoes]);

    // ============================================================
    // FUNÇÕES DOS POPUPS
    // ============================================================
    const abrirPopupConclusao = (manutencao) => {
        setManutencaoSelecionada(manutencao);
        setPopupConclusaoAberto(true);
    };

    const fecharPopupConclusao = () => {
        setPopupConclusaoAberto(false);
        setManutencaoSelecionada(null);
    };

    const abrirPopupCadastro = (manutencao = null) => {
        setManutencaoSelecionada(manutencao);
        setPopupCadastroAberto(true);
    };

    const fecharPopupCadastro = () => {
        setPopupCadastroAberto(false);
        setManutencaoSelecionada(null);
    };

    const abrirPopupExclusao = (manutencao) => {
        setManutencaoSelecionada(manutencao);
        setPopupExclusaoAberto(true);
    };

    const fecharPopupExclusao = () => {
        setPopupExclusaoAberto(false);
        setManutencaoSelecionada(null);
    };

    // ============================================================
    // FUNÇÕES CRUD
    // ============================================================
    const salvarManutencao = async (dados) => {
        try {
            let resultado;
            if (dados.id) {
                resultado = await atualizarManutencao(dados.id, dados);
            } else {
                resultado = await criarManutencao(dados);
            }
            console.log("✅ Manutenção salva:", resultado);
            await carregarManutencoes();
            fecharPopupCadastro();
        } catch (err) {
            console.error("❌ Erro ao salvar manutenção:", err);
            setErro("Erro ao salvar manutenção: " + (err.message || ""));
        }
    };

    const handleConcluir = async () => {
        if (!manutencaoSelecionada) return;
        try {
            await concluirManutencao(manutencaoSelecionada.id);
            console.log("✅ Manutenção concluída!");
            await carregarManutencoes();
            fecharPopupConclusao();
        } catch (err) {
            console.error("❌ Erro ao concluir manutenção:", err);
            setErro("Erro ao concluir manutenção: " + (err.message || ""));
        }
    };

    const handleExcluir = async () => {
        if (!manutencaoSelecionada) return;
        try {
            await excluirManutencao(manutencaoSelecionada.id);
            console.log("✅ Manutenção excluída!");
            await carregarManutencoes();
            fecharPopupExclusao();
        } catch (err) {
            console.error("❌ Erro ao excluir manutenção:", err);
            setErro("Erro ao excluir manutenção: " + (err.message || ""));
        }
    };

    // ============================================================
    // RETORNO
    // ============================================================
    return {
        manutencoes,
        manutencoesFiltradas,
        carregando,
        erro,
        termo,
        setTermo,
        mostrarConcluidas,
        setMostrarConcluidas,
        emManutencao,
        corretivas,
        concluidas,
        popupConclusaoAberto,
        popupCadastroAberto,
        popupExclusaoAberto,
        manutencaoSelecionada,
        abrirPopupConclusao,
        fecharPopupConclusao,
        abrirPopupCadastro,
        fecharPopupCadastro,
        abrirPopupExclusao,
        fecharPopupExclusao,
        handleExcluir,
        handleConcluir,
        salvarManutencao,
        carregarManutencoes,
    };
}