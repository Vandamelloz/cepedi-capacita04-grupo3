import Botao from "../Botao"
import TituloPagina from "../TituloPagina";

export default function PopUpConclusao({ nomeEquipamento, onFechar, onConfirmar }) {
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
      <p className="text-[18px] leading-[25px] text-[#6B7280] font-normal mb-8">
        Confirmar a conclusão da manutenção do equipamento{" "}
    <strong className="text-[#6B7280] font-bold">
    {nomeEquipamento}
    </strong>
        ? O equipamento será liberado para uso.
    </p>

      {/* Botões */}
      <div className="flex gap-3 justify-end">
        <Botao estilo="cancelar" onClick={onFechar}>
          Cancelar
        </Botao>
        <Botao estilo="salvar" onClick={onConfirmar}>
          Concluir Manutenção
        </Botao>
      </div>

    </div>
  );
}