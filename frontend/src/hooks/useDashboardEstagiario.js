import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DASHBOARD_CONFIG,
  FILTROS_ESTAGIARIO_POR_METRICA,
  GRAFICO_DESTAQUE_ESTAGIARIO,
} from "../constants/dashboard.constants";
import { buscarDashboardEstagiario, mapearDadosParaGraficoBarras } from "../services/dashboard/dashboard.service";

const LIMITE_ULTIMOS_EMPRESTIMOS = DASHBOARD_CONFIG.itensPorPagina;

export default function useDashboardEstagiario() {
  const [metricas, setMetricas] = useState([]);
  const [statusEquipamentos, setStatusEquipamentos] = useState([]);
  const [emprestimos, setEmprestimos] = useState([]);
  const [notificacoes, setNotificacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [filtroSelecionado, setFiltroSelecionado] = useState(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);

    try {
      const dados = await buscarDashboardEstagiario();
      setMetricas(dados.metricas);
      setStatusEquipamentos(dados.statusEquipamentos);
      setEmprestimos(dados.emprestimos);
      setNotificacoes(dados.notificacoes);
      setFiltroSelecionado(null);
    } catch (err) {
      setErro(err.message ?? "Erro ao carregar o dashboard.");
      setMetricas([]);
      setStatusEquipamentos([]);
      setEmprestimos([]);
      setNotificacoes([]);
      setFiltroSelecionado(null);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const notificacoesNaoLidas = useMemo(
    () => notificacoes.filter((notificacao) => !notificacao.lida).length,
    [notificacoes]
  );

  const dashboardVazio = useMemo(
    () =>
      !carregando &&
      !erro &&
      metricas.every((metrica) => metrica.count === 0) &&
      emprestimos.length === 0,
    [carregando, erro, metricas, emprestimos]
  );

  const emprestimosFiltrados = useMemo(() => {
    if (!filtroSelecionado) {
      return emprestimos;
    }

    const filtro = FILTROS_ESTAGIARIO_POR_METRICA[filtroSelecionado];
    if (!filtro) {
      return emprestimos;
    }

    return emprestimos.filter(filtro);
  }, [emprestimos, filtroSelecionado]);

  const ultimosEmprestimos = useMemo(
    () =>
      [...emprestimosFiltrados]
        .sort((a, b) => b.data.localeCompare(a.data))
        .slice(0, LIMITE_ULTIMOS_EMPRESTIMOS),
    [emprestimosFiltrados]
  );

  const destaqueGrafico = filtroSelecionado
    ? GRAFICO_DESTAQUE_ESTAGIARIO[filtroSelecionado] ?? null
    : null;

  const statusEquipamentosGrafico = useMemo(
    () => mapearDadosParaGraficoBarras(statusEquipamentos),
    [statusEquipamentos]
  );

  function alternarFiltro(metricaId) {
    setFiltroSelecionado((atual) => (atual === metricaId ? null : metricaId));
  }

  function marcarNotificacaoLida(id) {
    setNotificacoes((lista) =>
      lista.map((notificacao) =>
        notificacao.id === id ? { ...notificacao, lida: true } : notificacao
      )
    );
  }

  function marcarTodasNotificacoesLidas() {
    setNotificacoes((lista) => lista.map((notificacao) => ({ ...notificacao, lida: true })));
  }

  return {
    metricas,
    statusEquipamentosGrafico,
    ultimosEmprestimos,
    notificacoes,
    notificacoesNaoLidas,
    carregando,
    erro,
    dashboardVazio,
    filtroSelecionado,
    destaqueGrafico,
    recarregar: carregar,
    alternarFiltro,
    marcarNotificacaoLida,
    marcarTodasNotificacoesLidas,
  };
}
