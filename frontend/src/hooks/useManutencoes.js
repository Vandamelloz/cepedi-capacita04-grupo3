import {useCallback, useEffect, useState,} from "react";
import { useSearchParams } from "react-router-dom";
import {buscarManutencoes, concluirManutencao,} from "../services/manutencao/manutencoes.service";

export default function useManutencoes() {

  const [searchParams] = useSearchParams();

  // Simulações
  const simularErro = searchParams.get("erro") === "1";
  const simularVazio = searchParams.get("vazio") === "1";

  // Estados principais
  const [manutencoes, setManutencoes] = useState([]);
  const [notificacoes, setNotificacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  // Pesquisa/Filtros
  const [termo, setTermo] = useState("");
  const [mostrarConcluidas, setMostrarConcluidas] = useState(false);

  // Popups
  const [popupConclusaoAberto, setPopupConclusaoAberto] = useState(false);
  const [popupCadastroAberto, setPopupCadastroAberto] = useState(false);

  // Manutenção selecionada
  const [manutencaoSelecionada,setManutencaoSelecionada] = useState(null);

  // Carregar dados
  const carregar = useCallback(
    async () => {

      setCarregando(true);

      setErro(null);

      try {

        const dados =
          await buscarManutencoes({
            simularErro,
            simularVazio,
          });

        setManutencoes(
          dados.manutencoes
        );

        setNotificacoes(
          dados.notificacoes
        );

      } catch (err) {

        setErro(
          err.message ??
          "Erro ao carregar manutenções."
        );

        setManutencoes([]);

        setNotificacoes([]);

      } finally {

        setCarregando(false);
      }
    },

    [simularErro, simularVazio]
  );

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Filtro pesquisa
  const manutencoesFiltradas =
  (manutencoes || []).filter((m) => {

      const termoBusca = termo.toLowerCase();

      const buscaOk =
      (m.nome || "")
        .toLowerCase()
        .includes(termoBusca) ||

      (m.patrimonio || "")
        .toLowerCase()
        .includes(termoBusca) ||

      (m.dataAberturaFormatada || "")
        .toLowerCase()
        .includes(termoBusca) ||

      (m.dataConclusaoFormatada || "")
        .toLowerCase()
        .includes(termoBusca);

      const statusOk =
        mostrarConcluidas
          ? m.concluida
          : !m.concluida;

      return buscaOk && statusOk;
    });

  // Cards topo
  const emManutencao =
    (manutencoes || []).filter(
      (m) => !m.concluida
    ).length;

  const corretivas =
     (manutencoes || []).filter(
      (m) =>
        m.tipo === "Corretiva" &&
        !m.concluida
    ).length;

  const concluidas =
    (manutencoes || []).filter(
      (m) => m.concluida
    ).length;

  // Popup conclusão
  function abrirPopupConclusao(
    manutencao
  ) {

    setManutencaoSelecionada(
      manutencao
    );

    setPopupConclusaoAberto(
      true
    );
  }

  function fecharPopupConclusao() {

    setPopupConclusaoAberto(
      false
    );

    setManutencaoSelecionada(
      null
    );
  }

  // Popup cadastro/edição
  function abrirPopupCadastro(
    manutencao = null
  ) {

    setManutencaoSelecionada(
      manutencao
    );

    setPopupCadastroAberto(
      true
    );
  }

  function fecharPopupCadastro() {

    setPopupCadastroAberto(
      false
    );

    setManutencaoSelecionada(
      null
    );
  }

  // Concluir manutenção
  async function handleConcluir() {

    if (!manutencaoSelecionada) {
      return;
    }

    try {

      const atualizada =
        await concluirManutencao(
          manutencaoSelecionada.id
        );

      setManutencoes((lista) =>
        lista.map((m) =>
          m.id === atualizada.id
            ? atualizada
            : m
        )
      );

      fecharPopupConclusao();

    } catch (err) {

      setErro(
        err.message ??
        "Erro ao concluir manutenção."
      );
    }
  }

  // Salvar manutenção
  function salvarManutencao(
    manutencaoSalva
  ) {

    const existe =
      manutencoes.some(
        (m) =>
          m.id ===
          manutencaoSalva.id
      );

    if (existe) {

      setManutencoes((lista) =>
        lista.map((m) =>
          m.id ===
          manutencaoSalva.id
            ? manutencaoSalva
            : m
        )
      );

    } else {

      setManutencoes((lista) => [
        ...lista,
        manutencaoSalva,
      ]);
    }

    fecharPopupCadastro();
  }

  // Notificações
  function marcarNotificacaoLida(
    id
  ) {

    setNotificacoes((lista) =>
      lista.map((n) =>
        n.id === id
          ? {
              ...n,
              lida: true,
            }
          : n
      )
    );
  }

  function marcarTodasNotificacoesLidas() {

    setNotificacoes((lista) =>
      lista.map((n) => ({
        ...n,
        lida: true,
      }))
    );
  }

  return {
    manutencoes,
    manutencoesFiltradas,

    notificacoes,

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

    manutencaoSelecionada,

    abrirPopupConclusao,
    fecharPopupConclusao,

    abrirPopupCadastro,
    fecharPopupCadastro,

    handleConcluir,

    salvarManutencao,

    marcarNotificacaoLida,
    marcarTodasNotificacoesLidas,

    recarregar: carregar,
  };
}