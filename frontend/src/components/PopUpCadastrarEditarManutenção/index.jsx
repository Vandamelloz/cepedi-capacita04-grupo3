import TituloPagina from "../TituloPagina";
import SubTitulo from "../SubTitulo";
import CaixaTexto from "../CaixaTexto/CaixaTexto"
import CaixaSelecao from "../CaixadeSelecao/CaixadeSelecao"
import DataSelecao from "../DataSelecao/DataSelecao";
import Botao from "../Botao"

const categoriasDisponiveis = [
  { valor: "computadores", texto: "Computadores e Notebooks" },
  { valor: "perifericos", texto: "Periféricos (Mouse, Teclado, Monitor)" },
  { valor: "audiovisual", texto: "Áudio e Vídeo (Projetores, Câmeras, Caixas de Som)" },
  { valor: "redes", texto: "Redes e Conectividade (Roteadores, Switches, Cabos)" },
  { valor: "ferramentas", texto: "Ferramentas de Manutenção" },
  { valor: "laboratorio", texto: "Materiais de Laboratório (Multímetros, Placas, Componentes)" },
  { valor: "acessorios", texto: "Acessórios Diversos (Adaptadores, Pen Drives)" }
];


export default function PopUpCadastrarEditarManutenção({ modoEdicao = false }) {
    return (
        <div className="bg-white flex flex-col fixed top-[200px] w-[550px] items-center justify-around rounded-xl shadow-sm p-5">

            <TituloPagina>
                {modoEdicao ? "Editar Manutenção" : "Cadastrar Manutenção"}
            </TituloPagina>
            <SubTitulo>
                {modoEdicao ? "Faça as alterações necessárias no formulário abaixo." : "Preencha o formulário abaixo para cadastrar uma nova manutenção."}
            </SubTitulo>

            <form className="w-full flex flex-col gap-[15px]">
                <CaixaSelecao label="Equipamentos" id="equipamento" placeholder="Selecione o equipamento" opcoes={categoriasDisponiveis} />
                <CaixaSelecao label="Tipo" id="tipo" placeholder="Selecione o tipo de manutenção" opcoes={[
                    { valor: "Preventiva", texto: "Preventiva" },
                    { valor: "Corretiva", texto: "Corretiva" },
                    { valor: "Urgente", texto: "Urgente" }
                ]} />
                <CaixaTexto label="Defeito Relatado" id="defeito" placeholder="Digite o defeito relatado" />
                <DataSelecao id="data" label="Selecione a data:" />

                <div className=" w-[500px] flex flex-row gap-6">
                    <Botao
                        children="Cancelar"
                        onClick={() => console.log("Ação cancelada!")}
                        type="button"
                        estilo="cancelar"
                        icone={false}
                    />

                    <Botao 
                        children={modoEdicao ? "Salvar" : "Cadastrar"}
                        onClick={() => console.log(modoEdicao ? "Equipamento editado!" : "Equipamento cadastrado!")}
                        type="submit"
                        estilo={modoEdicao ? "salvar" : "registrar"}
                        icone={false}
                    />
                </div>
            </form>
        </div>
    )
}