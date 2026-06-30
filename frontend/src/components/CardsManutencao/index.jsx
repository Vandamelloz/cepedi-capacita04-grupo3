import React from "react";
import Botao from "../Botao";

// Tag colorida de tipo da manutenção
const Badge = ({ type }) => {
  const estilos = {
    Corretiva:  "bg-red-50 text-red-500 border border-red-200",
    Preventiva: "bg-blue-50 text-blue-500 border border-blue-200",
    Urgente:    "bg-red-50 text-red-500 border border-red-200",
  };

  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${estilos[type] ?? "bg-gray-100 text-gray-500"}`}>
      {type}
    </span>
  );
};

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="m9 11 3 3L22 4" />
  </svg>
);

export default function CardManutencao({ name, pat, type, defect, sentAt,concluida, onComplete }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-6 pt-5 pb-9 shadow-sm flex flex-col gap-4 w-[336px]">
        
      {/* Cabeçalho: nome + badge */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-gray-900">{name}</p>
          <p className="text-sm text-gray-400 mt-0.5">{pat}</p>
        </div>
        <Badge type={type} />
      </div>

      {/* Corpo: defeito + data */}
      <div className="flex flex-col gap-2 text-sm">
        <p className="text-sm text-gray-900">
          <span className="text-gray-500">Defeito: </span>
            {defect}
            </p>
        <div className="flex justify-between gap-2">
          <span className="text-gray-500">Enviado em:</span>
          <span className="text-gray-900 font-semibold">{sentAt}</span>
        </div>
      </div>

      {/* Botão concluir */}
      <Botao
        estilo={concluida ? "concluida" : "novo"}
        onClick={!concluida ? onComplete : undefined}
        disabled={concluida}
>
  <CheckIcon />
  {concluida ? "Manutenção Concluída" : "Concluir Manutenção"}
</Botao>
    </div>
  );
}
