import TituloPagina from "../TituloPagina";
import SubTitulo from "../SubTitulo";
import CaixaTexto from "../CaixaTexto/CaixaTexto"
import CaixaSelecao from "../CaixadeSelecao/CaixadeSelecao"
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


export default function PopUpCadastrarEditarEquipamento({ modoEdicao = false }) {
    return (
        <div className="bg-white flex flex-col fixed top-[200px] w-[550px] items-center justify-around rounded-xl shadow-sm p-5">
            
            {/* 2. O Título muda dinamicamente usando chaves {} */}
            <TituloPagina>
                {modoEdicao ? "Editar Equipamento" : "Cadastrar Equipamento"}
            </TituloPagina>
            <SubTitulo>
                {modoEdicao ? "Faça as alterações necessárias no formulário abaixo." : "Preencha o formulário abaixo para cadastrar um novo equipamento."}
            </SubTitulo>

            <form className="w-full flex flex-col gap-[10px]">
                <CaixaTexto label="Nome" id="nome" placeholder="Digite o nome do equipamento" />
                <CaixaSelecao label="Marca" id="marca" placeholder="Selecione a marca do equipamento" opcoes={categoriasDisponiveis} />
                <CaixaTexto label="Nº do Patrimônio" id="patrimonio" placeholder="Digite o número do patrimônio do equipamento" />
                <CaixaTexto label="Descrição" id="descricao" placeholder="Digite a descrição do equipamento" />
                <CaixaSelecao label="Status" id="status" placeholder="Selecione o status do equipamento" opcoes={[
                    { valor: "Disponível", texto: "Disponível" },
                    { valor: "Em Manutenção", texto: "Em Manutenção" },
                    { valor: "Indisponível", texto: "Indisponível" }
                ]} />

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
