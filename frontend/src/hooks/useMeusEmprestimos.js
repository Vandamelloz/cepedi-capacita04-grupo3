import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { buscarMeusEmprestimos } from "../services/Emprestimos/emprestimosAluno.service";

// 🔴 Todos os status possíveis que indicam que o empréstimo encerrou
const STATUS_HISTORICO = ["DEVOLVIDO", "CANCELADO", "CONCLUIDO", "CONCLUÍDO"];

export default function useMeusEmprestimos() {
  const { usuario } = useAuth();
  
  const [emprestimos, setEmprestimos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [emprestimoSelecionado, setEmprestimoSelecionado] = useState(null);

  const carregar = useCallback(async () => {
    // 1. Se o contexto ainda não carregou o usuário, aguarda.
    if (!usuario || !usuario.nome) {
        setCarregando(false);
        return;
    }

    setCarregando(true);
    setErro(null);

    try {
      const dados = await buscarMeusEmprestimos(usuario.nome);
      const listaGeral = Array.isArray(dados) ? dados : [];

      // 🔴 FILTRO BLINDADO CONTRA "UNDEFINED"
      const meusDados = listaGeral.filter(emp => {
        // Pega os IDs com segurança (se não existir, fica null para não bugar)
        const empId = emp.id_usuario ? String(emp.id_usuario) : null;
        const meuId = usuario.id ? String(usuario.id) : null;
        
        // Pega os Nomes com segurança
        const empNome = String(emp.nome_usuario || emp.usuario || "").toLowerCase().trim();
        const meuNome = String(usuario.nome || "").toLowerCase().trim();

        // Compara IDs (apenas se ambos existirem)
        let bateId = false;
        if (empId !== null && meuId !== null) {
            bateId = (empId === meuId);
        }

        // Compara Nomes (apenas se ambos existirem)
        let bateNome = false;
        if (empNome !== "" && meuNome !== "") {
            bateNome = (empNome === meuNome);
        }

        // Se bater o ID OU o Nome, passa no filtro
        return bateId || bateNome;
      });

      setEmprestimos(meusDados);
      setEmprestimoSelecionado(null);
    } catch (err) {
      console.error("Erro na API:", err);
      setErro(err.message ?? "Erro ao carregar seus empréstimos.");
      setEmprestimos([]);
    } finally {
      setCarregando(false);
    }
  }, [usuario]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const emprestimosAtivos = useMemo(() => {
    return emprestimos.filter((e) => {
        const statusAtual = String(e.status || "").toUpperCase().trim();
        return !STATUS_HISTORICO.includes(statusAtual);
    });
  }, [emprestimos]);

  const historico = useMemo(() => {
    return emprestimos.filter((e) => {
        const statusAtual = String(e.status || "").toUpperCase().trim();
        return STATUS_HISTORICO.includes(statusAtual);
    });
  }, [emprestimos]);

  const possuiAtraso = emprestimosAtivos.some((e) => {
    const statusAtual = String(e.status || "").toUpperCase().trim();
    return statusAtual === "ATRASADO" || e.diasAtraso > 0;
  });

  const paginaVazia = !carregando && !erro && emprestimosAtivos.length === 0 && historico.length === 0;

  return {
    usuario,
    emprestimosAtivos,
    historico,
    notificacoes: [],
    carregando,
    erro,
    paginaVazia,
    possuiAtraso,
    recarregar: carregar,
    emprestimoSelecionado,
    abrirDetalheEmprestimo: setEmprestimoSelecionado,
    fecharDetalheEmprestimo: () => setEmprestimoSelecionado(null),
    marcarNotificacaoLida: () => {},
    marcarTodasNotificacoesLidas: () => {},
  };
}