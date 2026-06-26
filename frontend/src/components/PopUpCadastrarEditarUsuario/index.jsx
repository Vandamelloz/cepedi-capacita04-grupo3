import TituloPagina from "../TituloPagina";
import SubTitulo from "../SubTitulo";
import CaixaTexto from "../CaixaTexto"
import CaixaSelecao from "../CaixadeSelecao"
import Botao from "../Botao"

const categoriasDisponiveis = [
  { valor: "aluno", texto: "Aluno" },
  { valor: "professor", texto: "Professor" },
  { valor: "estagiarios", texto: "Estagiário" },
  { valor: "administradores", texto: "Administrador" }
];


export default function PopUpCadastrarEditarUsuario({ modoEdicao = false }) {
    return (
        <div className="bg-white flex flex-col fixed top-[200px] w-[550px] items-center justify-around rounded-xl shadow-sm p-5">

            <TituloPagina>
                {modoEdicao ? "Editar Usuário" : "Cadastrar Usuário"}
            </TituloPagina>
            <SubTitulo>
                {modoEdicao ? "Faça as alterações necessárias no formulário abaixo." : "Preencha o formulário abaixo para cadastrar um novo usuário."}
            </SubTitulo>

            <form className="w-full flex flex-col gap-[15px]">
                <CaixaTexto label="Nome Completo *" id="nome" placeholder="Digite o nome completo" />
                <CaixaTexto label="E-mail *" id="email" placeholder="Digite o email" />
                <CaixaTexto label="Login" id="login" placeholder="Digite o login" />
                <CaixaTexto label="Senha" id="senha" placeholder="Digite a senha" type="password" />
                <CaixaSelecao label="Cargo" id="cargo" placeholder="Selecione o cargo" opcoes={categoriasDisponiveis} />
                <CaixaSelecao label="Status" id="status" placeholder="Selecione o status do usuário" opcoes={[
                    { valor: "Ativo", texto: "Ativo" },
                    { valor: "Inativo", texto: "Inativo" }
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
                        onClick={() => console.log(modoEdicao ? "Usuário editado!" : "Usuário cadastrado!")}
                        type="submit"
                        estilo={modoEdicao ? "salvar" : "registrar"}
                        icone={false}
                    />
                </div>
            </form>
        </div>
    )
}