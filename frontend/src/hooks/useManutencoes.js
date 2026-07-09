import {useCallback, useEffect, useState,} from "react";
import {buscarManutencoes, concluirManutencao, excluirManutencao,} from "../services/manutencao/manutencoes.service";

export default function useManutencoes() {

  // Estados principais
  const [manutencoes, setManutencoes] = useState([]);
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

  const [popupExclusaoAberto, setPopupExclusaoAberto] = useState(false);

  // Carregar dados
  const carregar = useCallback(async () => {
  setCarregando(true);
  setErro(null);

  try {
    const dados = await buscarManutencoes();

    setManutencoes(dados.manutencoes);
  } catch (err) {
    setErro(err.message ?? "Erro ao carregar manutenções.");
    setManutencoes([]);
  } finally {
    setCarregando(false);
  }
}, []);

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

      (m.data_abertura || "")
        .toLowerCase()
        .includes(termoBusca) ||

      (m.data_conclusao || "")
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
async function handleConcluir(statusFinal) {

  if (!manutencaoSelecionada) {
    return;
  }

  try {

    await concluirManutencao(
      manutencaoSelecionada.id,
      statusFinal
    );

    fecharPopupConclusao();

    await carregar();

  } catch (err) {

    setErro(
      err.message ??
      "Erro ao concluir manutenção."
    );
  }
}

// Excluir manutenção
async function handleExcluir() {

  if (!manutencaoSelecionada) {
    return;
  }

  try {

    await excluirManutencao(
      manutencaoSelecionada.id
    );

    fecharPopupExclusao();

    await carregar();

  } catch (err) {

    setErro(
      err.message ??
      "Erro ao excluir manutenção."
    );
  }
}

  // Salvar manutenção
async function salvarManutencao() {

  try {

    fecharPopupCadastro();

    await carregar();

  } catch (err) {

    setErro(
      err.message ??
      "Erro ao atualizar a lista de manutenções."
    );
  }
}

function abrirPopupExclusao(manutencao) {
    setManutencaoSelecionada(manutencao);
    setPopupExclusaoAberto(true);
}

function fecharPopupExclusao() {
    setPopupExclusaoAberto(false);
    setManutencaoSelecionada(null);
}

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

    handleConcluir,

    handleExcluir,

    salvarManutencao,

    recarregar: carregar,
  };
}