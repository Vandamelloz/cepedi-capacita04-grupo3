import TituloPagina from "../TituloPagina"
import SubTitulo from "../SubTitulo"
import Botao from "../Botao"

export default function PopUpConclusao({titulo, subtitulo, objeto, nome}) {
    return (
        <div className="bg-white flex flex-col fixed top-[200px] w-[550px] items-center justify-around rounded-xl shadow-sm p-5">
            <TituloPagina >{titulo}</TituloPagina>
            <SubTitulo >{subtitulo}</SubTitulo>
            <p className="mb-4">O {objeto} foi {nome} com sucesso.</p>
            <Botao
                estilo="salvar"
                children="Fechar"
                onClick={() => console.log("Fechar popup")}
                />
        </div>
    )
}