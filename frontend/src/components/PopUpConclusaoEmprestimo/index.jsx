import { useState } from "react";
import Botao from "../Botao"
import TituloPagina from "../TituloPagina";
import CaixaSelecao from "../CaixadeSelecao/CaixadeSelecao";

export default function PopUpConclusaoEmprestimo({ nomeEquipamento, onFechar, onConfirmar }) {

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
      <TituloPagina>Concluir Empréstimo</TituloPagina>

      {/* Descrição */}
      <p className="text-[18px] leading-[25px] text-[#6B7280] font-normal mb-4">
        Confirmar a conclusão do empréstimo do equipamento{" "}
        <strong className="font-semibold">
        {nomeEquipamento}
        </strong>
      </p>

      {/* Botões */}
      <div className="flex gap-3 justify-end mt-6">
        <Botao estilo="cancelar" onClick={onFechar}>
          Cancelar
        </Botao>
        <Botao estilo="salvar" onClick={onConfirmar}>
            Concluir Empréstimo
        </Botao>
      </div>

    </div>
  );
}