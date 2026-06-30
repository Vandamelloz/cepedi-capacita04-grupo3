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


export default function PopUpCadastrarEditarManutenção({ modoEdicao = false, onFechar }) {
    return (
        <div className="bg-[#F3F4F6] flex flex-col fixed top-[200px] w-[550px] justify-around rounded-xl shadow-sm p-5">

    {/* Botão X */}
      <button
        onClick={onFechar}
        className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-2xl font-bold"
      >
        ×
      </button>

      {/* Título e subtítulo alinhados à esquerda */}
      <div className="mb-6">
        <TituloPagina>
          {modoEdicao ? "Editar Manutenção" : "Registrar Manutenção"}
        </TituloPagina>
        <SubTitulo>
          {modoEdicao ? "Faça as alterações necessárias no formulário abaixo." : "Registre uma nova manutenção de equipamento."}
        </SubTitulo>
      </div>

            <form className="w-full flex flex-col gap-[15px]">
                <CaixaSelecao label="Equipamento *" id="equipamento" placeholder="Selecione o equipamento" opcoes={categoriasDisponiveis} />
                <CaixaSelecao label="Tipo *" id="tipo" placeholder="Selecione o tipo de manutenção" opcoes={[
                    { valor: "Preventiva", texto: "Preventiva" },
                    { valor: "Corretiva", texto: "Corretiva" },
                    { valor: "Urgente", texto: "Urgente" }
                ]} />
                <CaixaTexto label="Defeito Relatado *" id="defeito" placeholder="Digite o defeito relatado" />
                <DataSelecao id="data" label="Data de Envio *" />

                <div className="flex justify-end gap-3 mt-2">
                    <Botao
                        children="Cancelar"
                        onClick={onFechar}
                        type="button"
                        estilo="cancelar"
                        icone={false}
                    />

                    <Botao 
                        children={modoEdicao ? "Salvar" : "Registrar"}
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