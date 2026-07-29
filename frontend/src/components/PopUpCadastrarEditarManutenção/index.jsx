// ================================================================
// PopUpCadastrarEditarManutenção/index.jsx - CORRIGIDO
// ================================================================

// ✅ CORREÇÃO 1: Importar buscarEquipamentos do lugar certo
import { salvarManutencao, excluirManutencao } from "../../services/manutencao/manutencoes.service";
import { buscarEquipamentos } from "../../services/equipamentos/equipamentos.service";

import { useState, useEffect } from "react";
import TituloPagina from "../TituloPagina";
import SubTitulo from "../SubTitulo";
import CaixaTexto from "../CaixaTexto/CaixaTexto";
import CaixaSelecao from "../CaixadeSelecao/CaixadeSelecao";
import DataSelecao from "../DataSelecao/DataSelecao";
import Botao from "../Botao";

export default function PopUpCadastrarEditarManutenção({
  modoEdicao = false,
  manutencao = null,
  modoVisualizacao = false,
  onFechar,
  onSalvar
}) {

  const [equipamentos, setEquipamentos] = useState([]);
  const [equipamento, setEquipamento] = useState(manutencao?.id_equipamento || "");
  const [tipo, setTipo] = useState(manutencao?.tipo || "");
  const [defeito, setDefeito] = useState(manutencao?.descricao_defeito || "");
  const [data, setData] = useState(manutencao?.data_abertura || "");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarEquipamentos() {
      try {
        const dados = await buscarEquipamentos();

        if (modoEdicao || modoVisualizacao) {
          setEquipamentos(dados);
        } else {
          // ✅ CORREÇÃO 2: Filtra equipamentos com status "DISPONIVEL" (FastAPI)
          setEquipamentos(
            dados.filter(
              (equipamento) =>
                equipamento.status === "DISPONIVEL"  // ← agora em inglês
            )
          );
        }
      } catch {
        setErro("Erro ao carregar equipamentos.");
      }
    }

    carregarEquipamentos();
  }, []);

  // Preenche os campos ao editar/visualizar
  useEffect(() => {
    if (!manutencao) return;
    setEquipamento(String(manutencao.id_equipamento));
    setTipo(manutencao.tipo);
    setDefeito(manutencao.descricao_defeito);
    setData(manutencao.data_abertura);
  }, [manutencao]);

  // ✅ CORREÇÃO 3: Usa "codigo_patrimonio" em vez de "patrimonio"
  const opcoesEquipamentos = equipamentos.map(
    (equipamento) => ({
      valor: equipamento.id,
      texto: `${equipamento.nome} (${equipamento.codigo_patrimonio || equipamento.patrimonio})`
    })
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!equipamento || !tipo || !defeito || !data) {
      setErro("Preencha todos os campos obrigatórios.");
      return;
    }

    setSalvando(true);
    setErro("");

    const equipamentoSelecionado = equipamentos.find(
      (eq) => String(eq.id) === String(equipamento)
    );

    if (!equipamentoSelecionado) {
      setErro("Equipamento inválido");
      setSalvando(false);
      return;
    }

    const payload = {
      id: manutencao?.id,
      id_equipamento: Number(equipamento),
      tipo,
      descricao_defeito: defeito,
      data_abertura: data,
    };

    try {
      const dadosSalvos = await salvarManutencao(payload);
      onSalvar(dadosSalvos);
      onFechar();
    } catch {
      setErro("Erro ao salvar manutenção.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="bg-[#F3F4F6] relative flex flex-col w-[550px] max-w-[90vw] max-h-[90vh] overflow-y-auto rounded-xl shadow-sm p-5">
      <button
        onClick={onFechar}
        className="absolute top-4 right-4 text-gray-600 hover:text-gray-600 text-2xl font-light"
      >
        ×
      </button>

      <div className="mb-6">
        <TituloPagina>
          {modoVisualizacao
            ? "Manutenção Concluída"
            : modoEdicao
            ? "Editar Manutenção"
            : "Registrar Manutenção"}
        </TituloPagina>

        <SubTitulo>
          {modoVisualizacao
            ? "Visualize os detalhes da manutenção concluída."
            : modoEdicao
            ? "Faça as alterações necessárias."
            : "Registre uma nova manutenção."}
        </SubTitulo>
      </div>

      {erro && (
        <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg mb-3">
          {erro}
        </p>
      )}

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-[15px]">
        <CaixaSelecao
          label="Equipamento *"
          id="equipamento"
          placeholder="Selecione o equipamento"
          opcoes={opcoesEquipamentos}
          value={equipamento}
          disabled={modoVisualizacao}
          onChange={(e) => setEquipamento(e.target.value)}
        />

        <CaixaSelecao
          label="Tipo *"
          id="tipo"
          placeholder="Selecione o tipo"
          opcoes={[
            { valor: "Preventiva", texto: "Preventiva" },
            { valor: "Corretiva", texto: "Corretiva" }
          ]}
          value={tipo}
          disabled={modoVisualizacao}
          onChange={(e) => setTipo(e.target.value)}
        />

        <CaixaTexto
          label="Defeito Relatado *"
          id="defeito"
          placeholder="Digite o defeito"
          value={defeito}
          disabled={modoVisualizacao}
          onChange={(e) => setDefeito(e.target.value)}
        />

        <DataSelecao
          id="data"
          label="Data de Envio *"
          value={data}
          disabled={modoVisualizacao}
          onChange={(e) => setData(e.target.value)}
        />

        {!modoVisualizacao && (
          <div className="flex justify-end gap-3 mt-2">
            <Botao
              children="Cancelar"
              onClick={onFechar}
              type="button"
              estilo="cancelar"
              icone={false}
            />

            <Botao
              children={
                salvando
                  ? "Salvando..."
                  : modoEdicao
                  ? "Salvar"
                  : "Registrar"
              }
              type="submit"
              estilo={modoEdicao ? "salvar" : "registrar"}
              icone={false}
              disabled={salvando}
            />
          </div>
        )}
      </form>
    </div>
  );
}