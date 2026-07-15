import TituloPagina from "../TituloPagina";
import SubTitulo from "../SubTitulo";
import Botao from "../Botao";

export default function PopUpExclusao({
    titulo,
    subtitulo,
    confirmarExclusao,
    cancelarExclusao,
}) {
    return (
    <div className="relative bg-[#F3F4F6] w-[530px] rounded-2xl shadow-lg p-6">

      {/* Botão X */}
        <button
        onClick={cancelarExclusao}
        className="absolute top-4 right-4 text-gray-600 hover:text-gray-600 text-2xl font-light"
        >
        ×
        </button>

        <div className="mb-5 mt-1">
        <TituloPagina>{titulo}</TituloPagina>

        <SubTitulo className="text-[18px] leading-[25px] text-[#6B7280] font-normal mb-4">
            {subtitulo}
        </SubTitulo>
        </div>

        <div className="flex justify-end gap-3">
        <Botao
            estilo="cancelar"
            onClick={cancelarExclusao}
        >
            Cancelar
        </Botao>

        <Botao
            estilo="excluir"
            onClick={confirmarExclusao}
        >
            Excluir
        </Botao>
        </div>
    </div>
    );
}