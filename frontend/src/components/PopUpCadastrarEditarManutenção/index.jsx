import { useState, useEffect } from "react";
import TituloPagina from "../TituloPagina";
import SubTitulo from "../SubTitulo";
import CaixaTexto from "../CaixaTexto/CaixaTexto";
import CaixaSelecao from "../CaixadeSelecao/CaixadeSelecao";
import DataSelecao from "../DataSelecao/DataSelecao";
import Botao from "../Botao";

const API_URL = "http://localhost:3001/manutencoes";
const EQUIPAMENTOS_URL = "http://localhost:3001/equipamentos";

export default function PopUpCadastrarEditarManutenção({
  modoEdicao = false,
  manutencao = null,
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
    const buscarEquipamentos = async () => {
      try {
        const response = await fetch(EQUIPAMENTOS_URL);

        if (!response.ok) {
          throw new Error();
        }

        const dados = await response.json();

        setEquipamentos(dados);
      } catch {
        setErro(
          "Erro ao carregar equipamentos."
        );
      }
    };

    buscarEquipamentos();
  }, []);


  const opcoesEquipamentos = equipamentos.map(
    (equipamento) => ({
      valor: equipamento.id,
      texto: `${equipamento.nome} (${equipamento.patrimonio})`
    })
  );


const handleSubmit = async (e) => {
  e.preventDefault();

  if (
    !equipamento ||
    !tipo ||
    !defeito ||
    !data
  ) {
    setErro(
      "Preencha todos os campos obrigatórios."
    );

    return;
  }

  setSalvando(true);
  setErro("");

  const equipamentoSelecionado =
    equipamentos.find(
      (eq) =>
        String(eq.id) ===
        String(equipamento)
    );

  if (!equipamentoSelecionado) {
    setErro("Equipamento inválido.");
    setSalvando(false);
    return;
  }

  const payload = {
    id_equipamento: equipamentoSelecionado.id,

    nome: equipamentoSelecionado.nome,

    patrimonio: equipamentoSelecionado.patrimonio,

    tipo: tipo,

    descricao_defeito: defeito,

    data_abertura: data,

    data_conclusao:
      manutencao?.data_conclusao || null,

    concluida:
      manutencao?.concluida || false
  };

  try {
    const response = modoEdicao
      ? await fetch(
          `${API_URL}/${manutencao.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json"
            },
            body: JSON.stringify(payload)
          }
        )

      : await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify(payload)
        });

    if (!response.ok) {
      throw new Error();
    }

    await fetch(
      `${EQUIPAMENTOS_URL}/${equipamentoSelecionado.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status: "Indisponível"
        })
      }
    );

    const dadosSalvos =
      await response.json();

    onSalvar(dadosSalvos);

    onFechar();

  } catch {
    setErro(
      "Erro ao salvar manutenção."
    );

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
          {modoEdicao
            ? "Editar Manutenção"
            : "Registrar Manutenção"}
        </TituloPagina>

        <SubTitulo>
          {modoEdicao
            ? "Faça as alterações necessárias."
            : "Registre uma nova manutenção."}
        </SubTitulo>
      </div>

      {erro && (
        <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg mb-3">
          {erro}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="w-full flex flex-col gap-[15px]"
      >
        <CaixaSelecao
          label="Equipamento *"
          id="equipamento"
          placeholder="Selecione o equipamento"
          opcoes={opcoesEquipamentos}
          value={equipamento}
          onChange={(e) =>
            setEquipamento(e.target.value)
          }
        />

        <CaixaSelecao
          label="Tipo *"
          id="tipo"
          placeholder="Selecione o tipo"
          opcoes={[
            {
              valor: "Preventiva",
              texto: "Preventiva"
            },
            {
              valor: "Corretiva",
              texto: "Corretiva"
            }
          ]}
          value={tipo}
          onChange={(e) =>
            setTipo(e.target.value)
          }
        />

        <CaixaTexto
          label="Defeito Relatado *"
          id="defeito"
          placeholder="Digite o defeito"
          value={defeito}
          onChange={(e) =>
            setDefeito(e.target.value)
          }
        />

        <DataSelecao
          id="data"
          label="Data de Envio *"
          value={data}
          onChange={(e) =>
            setData(e.target.value)
          }
        />

      {!modoEdicao && (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm px-4 py-3 rounded-lg">
      Ao registrar a manutenção, o equipamento será marcado como <strong>Indisponível</strong>.
      </div>
    )}

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
            estilo={
              modoEdicao
                ? "salvar"
                : "registrar"
            }
            icone={false}
            disabled={salvando}
          />
        </div>
      </form>
    </div>
  );
}