import TituloPagina from "../TituloPagina"
import SubTitulo from "../SubTitulo"
import Botao from "../Botao"

export default function PopUpExclusao({titulo, subtitulo, objeto, confirmarExclusao, cancelarExclusao}) {
    return (
        <div className="bg-white flex flex-col fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] items-center justify-around rounded-xl shadow-sm p-5 border border-gray-300 gap-4 z-50">
            <TituloPagina >{titulo}</TituloPagina>
            <SubTitulo >{subtitulo}</SubTitulo>
            <p className="mb-4">O {objeto} sera excluido, tem certeza?</p>
            <div className=" w-[400px] flex flex-row justify-around items-center gap-6">
                <Botao
                    estilo="cancelar"
                    children="Cancelar"
                    onClick={cancelarExclusao}
                    />
                <Botao
                    estilo="excluir"
                    children="Excluir"
                    onClick={confirmarExclusao}
                    />
            </div>
        </div>
    )
}