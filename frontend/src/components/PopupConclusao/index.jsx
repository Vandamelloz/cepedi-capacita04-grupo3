import { useState } from "react";
import Botao from "../Botao"
import TituloPagina from "../TituloPagina";
import CaixaSelecao from "../CaixadeSelecao/CaixadeSelecao";

export default function PopUpConclusao({ nomeEquipamento, onFechar, onConfirmar }) {

const [statusFinal, setStatusFinal] = useState("Disponível");

  return (
    <div className="bg-[#F3F4F6] flex flex-col w-[550px] rounded-2xl shadow-lg p-8 relative">
      
      {/* Botão X */}
      <button
        onClick={onFechar}
        className="absolute top-4 right-4 text-gray-600 hover:text-gray-600 text-2xl font-light"
      >
        ×
      </button>

      {/* Título */}
      <TituloPagina>Concluir Manutenção</TituloPagina>

      {/* Descrição */}
      <p className="text-[18px] leading-[25px] text-[#6B7280] font-normal mb-4">
        Confirmar a conclusão da manutenção do equipamento{" "}
        <strong className="text-[#6B7280] font-bold">{nomeEquipamento}</strong>?
        Selecione o status final do equipamento.
      </p>

      <CaixaSelecao
        label="Status do equipamento após a manutenção"
        labelClassName="text-[#6B7280]"
        id="statusFinal"
        value={statusFinal}
        onChange={(e) =>
          setStatusFinal(e.target.value)
        }
        opcoes={[
          {
            valor: "Disponível",
            texto: "Disponível",
          },
          {
            valor: "Inativo",
            texto: "Inativo (Perda)",
          },
        ]}
    />

      {/* Botões */}
      <div className="flex gap-3 justify-end mt-6">
        <Botao estilo="cancelar" onClick={onFechar}>
          Cancelar
        </Botao>
        <Botao estilo="salvar" onClick={() => onConfirmar(statusFinal)}>
          Concluir Manutenção
        </Botao>
      </div>

    </div>
  );
}