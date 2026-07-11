import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { buscarMeusEmprestimos } from "../services/emprestimos/emprestimosAluno.service";

const STATUS_HISTORICO = ["Concluído", "Cancelado"];

export default function useMeusEmprestimos() {
  const { usuario } = useAuth();

  const [emprestimos, setEmprestimos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [emprestimoSelecionado, setEmprestimoSelecionado] = useState(null);

  const carregar = useCallback(async () => {
    if (!usuario?.nome) return;

    setCarregando(true);
    setErro(null);

    try {
      const dados = await buscarMeusEmprestimos(usuario.nome);
      setEmprestimos(Array.isArray(dados) ? dados : []);
      setEmprestimoSelecionado(null);
    } catch (err) {
      setErro(err.message ?? "Erro ao carregar seus empréstimos.");
      setEmprestimos([]);
    } finally {
      setCarregando(false);
    }
  }, [usuario?.nome]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const emprestimosAtivos = useMemo(
    () => emprestimos.filter((e) => !STATUS_HISTORICO.includes(e.status)),
    [emprestimos]
  );

  const historico = useMemo(
    () => emprestimos.filter((e) => STATUS_HISTORICO.includes(e.status)),
    [emprestimos]
  );

  const possuiAtraso = emprestimosAtivos.some(
    (e) => e.status === "Atrasado" || e.diasAtraso > 0
  );

  const paginaVazia =
    !carregando && !erro && emprestimosAtivos.length === 0 && historico.length === 0;

  function abrirDetalheEmprestimo(emprestimo) {
    setEmprestimoSelecionado(emprestimo);
  }

  function fecharDetalheEmprestimo() {
    setEmprestimoSelecionado(null);
  }

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
    abrirDetalheEmprestimo,
    fecharDetalheEmprestimo,
    marcarNotificacaoLida: () => {},
    marcarTodasNotificacoesLidas: () => {},
  };
}