import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  DASHBOARD_CONFIG,
  FILTROS_POR_METRICA,
  MOCK_METRICAS,
  MOCK_USUARIO,
} from "../mocks/dashboard.mock";
import { buscarDadosDashboard } from "../services/dashboard/dashboard.service";

const ORDEM_STATUS = {
  Ativo: 1,
  Atrasado: 2,
  Concluído: 3,
  Cancelado: 4,
};

function compararEmprestimos(a, b, campo, direcao) {
  const fator = direcao === "asc" ? 1 : -1;

  if (campo === "data") {
    return a.data.localeCompare(b.data) * fator;
  }

  if (campo === "status") {
    const ordemA = ORDEM_STATUS[a.status] ?? 99;
    const ordemB = ORDEM_STATUS[b.status] ?? 99;
    return (ordemA - ordemB) * fator;
  }

  const valorA = (a[campo] ?? "").toString().toLowerCase();
  const valorB = (b[campo] ?? "").toString().toLowerCase();
  return valorA.localeCompare(valorB, "pt-BR") * fator;
}

export default function useDashboard() {
  const [searchParams] = useSearchParams();
  const simularErro = searchParams.get("erro") === "1";
  const simularVazio = searchParams.get("vazio") === "1";

  const [metricas, setMetricas] = useState([]);
  const [emprestimos, setEmprestimos] = useState([]);
  const [itensMaisUsados, setItensMaisUsados] = useState([]);
  const [notificacoes, setNotificacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const [ordenacao, setOrdenacao] = useState(DASHBOARD_CONFIG.ordenacaoPadrao);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [filtroMetricaId, setFiltroMetricaId] = useState(null);
  const [emprestimoSelecionado, setEmprestimoSelecionado] = useState(null);
  const [itemGraficoSelecionado, setItemGraficoSelecionado] = useState(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);

    try {
      const dados = await buscarDadosDashboard({ simularErro, simularVazio });
      setMetricas(dados.metricas);
      setEmprestimos(dados.emprestimos);
      setItensMaisUsados(dados.itensMaisUsados);
      setNotificacoes(dados.notificacoes);
      setPaginaAtual(1);
      setFiltroMetricaId(null);
      setEmprestimoSelecionado(null);
      setItemGraficoSelecionado(null);
    } catch (err) {
      setErro(err.message ?? "Erro ao carregar o dashboard.");
      setMetricas([]);
      setEmprestimos([]);
      setItensMaisUsados([]);
      setNotificacoes([]);
    } finally {
      setCarregando(false);
    }
  }, [simularErro, simularVazio]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const filtroAtivo = useMemo(() => {
    if (!filtroMetricaId) {
      return null;
    }

    return MOCK_METRICAS.find((metrica) => metrica.id === filtroMetricaId) ?? null;
  }, [filtroMetricaId]);

  const emprestimosFiltrados = useMemo(() => {
    if (!filtroMetricaId || !FILTROS_POR_METRICA[filtroMetricaId]) {
      return emprestimos;
    }

    return emprestimos.filter(FILTROS_POR_METRICA[filtroMetricaId]);
  }, [emprestimos, filtroMetricaId]);

  const emprestimosOrdenados = useMemo(() => {
    const copia = [...emprestimosFiltrados];
    copia.sort((a, b) =>
      compararEmprestimos(a, b, ordenacao.campo, ordenacao.direcao)
    );
    return copia;
  }, [emprestimosFiltrados, ordenacao]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(emprestimosOrdenados.length / DASHBOARD_CONFIG.itensPorPagina)
  );

  const paginaNormalizada = Math.min(paginaAtual, totalPaginas);

  const emprestimosPaginados = useMemo(() => {
    const inicio = (paginaNormalizada - 1) * DASHBOARD_CONFIG.itensPorPagina;
    const fim = inicio + DASHBOARD_CONFIG.itensPorPagina;
    return emprestimosOrdenados.slice(inicio, fim);
  }, [emprestimosOrdenados, paginaNormalizada]);

  const notificacoesNaoLidas = notificacoes.filter((n) => !n.lida).length;

  const dashboardVazio =
    !carregando &&
    !erro &&
    emprestimos.length === 0 &&
    itensMaisUsados.length === 0 &&
    metricas.every((metrica) => metrica.count === 0);

  function alterarOrdenacao(campo) {
    setOrdenacao((atual) => {
      if (atual.campo === campo) {
        return {
          campo,
          direcao: atual.direcao === "asc" ? "desc" : "asc",
        };
      }

      return { campo, direcao: "asc" };
    });
    setPaginaAtual(1);
  }

  function irParaPagina(pagina) {
    setPaginaAtual(Math.min(Math.max(1, pagina), totalPaginas));
  }

  function alternarFiltroMetrica(metricaId) {
    setFiltroMetricaId((atual) => (atual === metricaId ? null : metricaId));
    setPaginaAtual(1);
  }

  function limparFiltroMetrica() {
    setFiltroMetricaId(null);
    setPaginaAtual(1);
  }

  function abrirDetalheEmprestimo(emprestimo) {
    setEmprestimoSelecionado(emprestimo);
  }

  function fecharDetalheEmprestimo() {
    setEmprestimoSelecionado(null);
  }

  function alternarItemGrafico(itemId) {
    setItemGraficoSelecionado((atual) => (atual === itemId ? null : itemId));
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
    usuario: MOCK_USUARIO,
    metricas,
    emprestimosPaginados,
    itensMaisUsados,
    notificacoes,
    notificacoesNaoLidas,
    carregando,
    erro,
    dashboardVazio,
    recarregar: carregar,
    ordenacao,
    alterarOrdenacao,
    paginaAtual: paginaNormalizada,
    totalPaginas,
    itensPorPagina: DASHBOARD_CONFIG.itensPorPagina,
    totalEmprestimos: emprestimosOrdenados.length,
    irParaPagina,
    filtroMetricaId,
    filtroAtivo,
    alternarFiltroMetrica,
    limparFiltroMetrica,
    emprestimoSelecionado,
    abrirDetalheEmprestimo,
    fecharDetalheEmprestimo,
    itemGraficoSelecionado,
    alternarItemGrafico,
    marcarNotificacaoLida,
    marcarTodasNotificacoesLidas,
  };
}
