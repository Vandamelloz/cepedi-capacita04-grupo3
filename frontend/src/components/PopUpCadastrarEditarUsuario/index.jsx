import TituloPagina from "../TituloPagina";
import SubTitulo from "../SubTitulo";
import CaixaTexto from "../CaixaTexto/CaixaTexto"
import CaixaSelecao from "../CaixadeSelecao/CaixadeSelecao"
import Botao from "../Botao"

const categoriasDisponiveis = [
  { valor: "aluno", texto: "Aluno" },
  { valor: "professor", texto: "Professor" },
  { valor: "estagiarios", texto: "Estagiário" },
  { valor: "administradores", texto: "Administrador" }
];


export default function PopUpCadastrarEditarUsuario({cancelar, salvar, DadosIniciais = null, modoEdicao = false }) {

    const handleSubmit = (event) => {
        event.preventDefault();

        const dadosSubmetidos = {
            nome: event.target.nome.value,
            email: event.target.email.value,
            login: event.target.login.value,
            perfil: event.target.cargo.value,
            status: event.target.status.value,
            senha: event.target.senha.value
        };
        salvar(dadosSubmetidos);
    };

    return (
        <div className="bg-white flex flex-col fixed top-[200px] w-[550px] items-center justify-around rounded-xl shadow-sm p-5 border border-gray-300 gap-4 z-50">

            <TituloPagina>
                {modoEdicao ? "Editar Usuário" : "Cadastrar Usuário"}
            </TituloPagina>
            <SubTitulo>
                {modoEdicao ? "Faça as alterações necessárias no formulário abaixo." : "Preencha o formulário abaixo para cadastrar um novo usuário."}
            </SubTitulo>

            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-[15px]">
                <CaixaTexto label="Nome Completo *" id="nome" placeholder="Digite o nome completo" defaultValue={DadosIniciais?.nome || ""} />
                <CaixaTexto label="E-mail *" id="email" placeholder="Digite o email" defaultValue={DadosIniciais?.email || ""} />
                <CaixaTexto label="Login" id="login" placeholder="Digite o login" defaultValue={DadosIniciais?.login || ""} />
                <CaixaTexto label="Senha" id="senha" placeholder="Digite a senha" type="password" defaultValue={DadosIniciais?.senha || ""} />
                <div className=" w-[500px] flex flex-row gap-6">
                <CaixaSelecao label="Cargo" id="cargo" placeholder="Selecione o cargo" defaultValue={DadosIniciais?.perfil || ""} opcoes={categoriasDisponiveis} />
                <CaixaSelecao label="Status" id="status" placeholder="Selecione o status" defaultValue={DadosIniciais?.status || ""} opcoes={[
                    { valor: "Ativo", texto: "Ativo" },
                    { valor: "Inativo", texto: "Inativo" }
                ]} />
                </div>
                <div className=" w-[500px] flex flex-row gap-6">
                    <Botao
                        children="Cancelar"
                        onClick={cancelar}
                        type="button"
                        estilo="cancelar"
                        icone={false}
                    />

                    <Botao 
                        children={modoEdicao ? "Salvar" : "Cadastrar"}
                        onClick={salvar}
                        type="submit"
                        estilo={modoEdicao ? "salvar" : "registrar"}
                        icone={false}
                    />
                </div>
            </form>
        </div>
    )
}