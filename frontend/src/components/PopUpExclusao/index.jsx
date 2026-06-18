import TituloPagina from "../TituloPagina"
import SubTitulo from "../SubTitulo"
import Botao from "../Botao"

export default function PopUpExclusao({titulo, subtitulo, objeto}) {
    return (
        <div className="bg-white flex flex-col fixed top-[200px] w-[400px] items-center justify-around rounded-xl shadow-sm p-5">
            <TituloPagina >{titulo}</TituloPagina>
            <SubTitulo >{subtitulo}</SubTitulo>
            <p className="mb-4">O {objeto} sera excluido, tem certeza?</p>
            <div className=" w-[400px] flex flex-row justify-around items-center gap-6">
                <Botao
                    estilo="cancelar"
                    children="Cancelar"
                    onClick={() => console.log("Ação cancelada!")}
                    />
                <Botao
                    estilo="excluir"
                    children="Excluir"
                    onClick={() => console.log("Ação confirmada!")}
                    />
            </div>
        </div>
    )
}