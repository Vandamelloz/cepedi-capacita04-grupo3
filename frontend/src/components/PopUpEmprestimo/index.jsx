import TituloPagina from "../TituloPagina";
import SubTitulo from "../SubTitulo";
import DataSelecao from "../DataSelecao/DataSelecao";
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

const ListaDeUsuarios = [
    { valor: "usuario1", texto: "Usuário 1" },
    { valor: "usuario2", texto: "Usuário 2" },
    { valor: "usuario3", texto: "Usuário 3" },
    { valor: "usuario4", texto: "Usuário 4" },
    { valor: "usuario5", texto: "Usuário 5" }
];


export default function PopUpEmprestimo({ modoEdicao = false }) {
    return (
        <div className="bg-white flex flex-col fixed top-[200px] w-[550px] items-center justify-around rounded-xl shadow-sm p-5">

            <TituloPagina>
                {modoEdicao ? "Editar emprestimo" : "Registrar emprestimo"}
            </TituloPagina>
            <SubTitulo>
                {modoEdicao ? "Faça as alterações necessárias no formulário abaixo." : "Preencha o formulário abaixo para cadastrar um novo empréstimo."}
            </SubTitulo>

            <form className="w-full flex flex-col gap-[15px]">
                
                <CaixaSelecao label="Equipamento" id="cargo" placeholder="Selecione o equipamento" opcoes={categoriasDisponiveis} />
                <CaixaSelecao label="Usuário" id="status" placeholder="Selecione o status do usuário" opcoes={ListaDeUsuarios} />
                <DataSelecao id="dataEmprestimo" label="Selecione a data de empréstimo:" />
                <DataSelecao id="dataDevolucao" label="Selecione a data de devolução:" />
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
                        onClick={() => console.log(modoEdicao ? "Emprestimo editado!" : "Emprestimo cadastrado!")}
                        type="submit"
                        estilo={modoEdicao ? "salvar" : "registrar"}
                        icone={false}
                    />
                </div>
            </form>
        </div>
    )
}