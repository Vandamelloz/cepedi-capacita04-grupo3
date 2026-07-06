import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MOCK_USUARIO_ALUNO } from "../mocks/usuarioAluno.mock";
import { buscarMeusEmprestimos } from "../services/emprestimos/emprestimosAluno.service";

export default function useMeusEmprestimos() {
  const [searchParams] = useSearchParams();
  const simularErro = searchParams.get("erro") === "1";
  const simularVazio = searchParams.get("vazio") === "1";

  const [emprestimosAtivos, setEmprestimosAtivos] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [notificacoes, setNotificacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [emprestimoSelecionado, setEmprestimoSelecionado] = useState(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);

    try {
      const dados = await buscarMeusEmprestimos({ simularErro, simularVazio });
      setEmprestimosAtivos(dados.emprestimosAtivos);
      setHistorico(dados.historico);
      setNotificacoes(dados.notificacoes);
      setEmprestimoSelecionado(null);
    } catch (err) {
      setErro(err.message ?? "Erro ao carregar seus empréstimos.");
      setEmprestimosAtivos([]);
      setHistorico([]);
      setNotificacoes([]);
    } finally {
      setCarregando(false);
    }
  }, [simularErro, simularVazio]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const possuiAtraso = emprestimosAtivos.some((e) => e.status === "Atrasado");

  const paginaVazia =
    !carregando && !erro && emprestimosAtivos.length === 0 && historico.length === 0;

  function abrirDetalheEmprestimo(emprestimo) {
    setEmprestimoSelecionado(emprestimo);
  }

  function fecharDetalheEmprestimo() {
    setEmprestimoSelecionado(null);
  }

  function marcarNotificacaoLida(id) {
    setNotificacoes((lista) =>
      lista.map((notificacao) =>
        notificacao.id === id ? { ...notificacao, lida: true } : notificacao
      )
    );
  }

  function marcarTodasNotificacoesLidas() {
    setNotificacoes((lista) => lista.map((n) => ({ ...n, lida: true })));
  }

  return {
    usuario: MOCK_USUARIO_ALUNO,
    emprestimosAtivos,
    historico,
    notificacoes,
    carregando,
    erro,
    paginaVazia,
    possuiAtraso,
    recarregar: carregar,
    emprestimoSelecionado,
    abrirDetalheEmprestimo,
    fecharDetalheEmprestimo,
    marcarNotificacaoLida,
    marcarTodasNotificacoesLidas,
  };
}