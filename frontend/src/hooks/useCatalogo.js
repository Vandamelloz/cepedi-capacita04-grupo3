import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { buscarCatalogo } from "../services/catalogo/catalogo.service";

export default function useCatalogo() {
  const { usuario } = useAuth(); // vem do AuthContext (sessão real), não mais de um mock

  const [searchParams] = useSearchParams();
  const simularErro = searchParams.get("erro") === "1";
  const simularVazio = searchParams.get("vazio") === "1";

  const [equipamentos, setEquipamentos] = useState([]);
  const [notificacoes, setNotificacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const [termo, setTermo] = useState("");
  const [status, setStatus] = useState("");
  const [categoria, setCategoria] = useState("");

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);

    try {
      const dados = await buscarCatalogo({ simularErro, simularVazio });
      setEquipamentos(dados.equipamentos);
    } catch (err) {
      setErro(err.message ?? "Erro ao carregar o catálogo.");
      setEquipamentos([]);
    } finally {
      setCarregando(false);
    }
  }, [simularErro, simularVazio]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const listaCategorias = useMemo(
    () => [...new Set(equipamentos.map((e) => e.categoria))],
    [equipamentos]
  );

  const listaStatus = useMemo(
    () => [...new Set(equipamentos.map((e) => e.status))],
    [equipamentos]
  );

  const equipamentosFiltrados = useMemo(() => {
    const termoNormalizado = termo.trim().toLowerCase();

    return equipamentos.filter((equipamento) => {
      const bateTermo =
        !termoNormalizado ||
        equipamento.nome.toLowerCase().includes(termoNormalizado) ||
        equipamento.patrimonio.toLowerCase().includes(termoNormalizado);

      const bateStatus = !status || equipamento.status === status;
      const bateCategoria = !categoria || equipamento.categoria === categoria;

      return bateTermo && bateStatus && bateCategoria;
    });
  }, [equipamentos, termo, status, categoria]);

  const equipamentosPorCategoria = useMemo(() => {
    const grupos = {};

    equipamentosFiltrados.forEach((equipamento) => {
      if (!grupos[equipamento.categoria]) {
        grupos[equipamento.categoria] = [];
      }
      grupos[equipamento.categoria].push(equipamento);
    });

    return grupos;
  }, [equipamentosFiltrados]);

  const paginaVazia = !carregando && !erro && equipamentos.length === 0;
  const filtroSemResultado =
    !carregando && !erro && equipamentos.length > 0 && equipamentosFiltrados.length === 0;

  return {
    usuario,
    notificacoes,
    carregando,
    erro,
    paginaVazia,
    filtroSemResultado,
    recarregar: carregar,
    termo,
    setTermo,
    status,
    setStatus,
    categoria,
    setCategoria,
    listaCategorias,
    listaStatus,
    equipamentosPorCategoria,
  };
}
