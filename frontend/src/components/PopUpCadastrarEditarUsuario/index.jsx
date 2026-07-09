import { useState } from "react";
import TituloPagina from "../TituloPagina";
import SubTitulo from "../SubTitulo";
import CaixaTexto from "../CaixaTexto/CaixaTexto";
import CaixaSelecao from "../CaixadeSelecao/CaixadeSelecao";
import Botao from "../Botao";


const categoriasDisponiveis = [
  { valor: "Aluno", texto: "Aluno" },
  { valor: "Professor", texto: "Professor" },
  { valor: "Estagiário", texto: "Estagiário" },
  { valor: "Administrador", texto: "Administrador" }
];

export default function PopUpCadastrarEditarUsuario({ cancelar, salvar, DadosIniciais = null, modoEdicao = false }) {


    const [erro, setErro] = useState("");

    const handleSubmit = (event) => {
        event.preventDefault();
        setErro("");

        const nome = event.target.nome.value.trim();
        const email = event.target.email.value.trim();
        const login = event.target.login.value.trim();
        const perfil = event.target.cargo.value;
        const status = event.target.status.value;
        const senha = event.target.senha.value;


        // 1. Impedir campos obrigatórios vazios
        if (!nome || !email || !login || !perfil || !status) {
            setErro("Por favor, preencha todos os campos obrigatórios.");
            return; // O "return" para a execução aqui e não deixa salvar!
        }

        // 2. Impedir nome com menos de 3 letras
        if (nome.length < 3) {
            setErro("O nome deve ter pelo menos 3 letras.");
            return;
        }

        // 3. Impedir nome com números (/\d/ procura por qualquer dígito de 0 a 9)
        if (/\d/.test(nome)) {
            setErro("O nome não pode conter números.");
            return;
        }

        // 4. Impedir e-mail fora do padrão (exige ter algo@algo.algo)
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexEmail.test(email)) {
            setErro("Por favor, insira um endereço de e-mail válido.");
            return;
        }

        const dadosSubmetidos = {
            nome,
            email,
            login,
            perfil,
            status,
            senha
        };
        
        salvar(dadosSubmetidos);
    };

    return (
        <div className="bg-white flex flex-col fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] items-center justify-around rounded-xl shadow-sm p-5 border border-gray-300 gap-4 z-50">
            <TituloPagina>
                {modoEdicao ? "Editar Usuário" : "Cadastrar Usuário"}
            </TituloPagina>
            <SubTitulo>
                {modoEdicao ? "Faça as alterações necessárias no formulário abaixo." : "Preencha o formulário abaixo para cadastrar um novo usuário."}
            </SubTitulo>


            {erro && (
                <div className="w-full bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-md text-sm font-medium text-center">
                    {erro}
                </div>
            )}

            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-[15px]">
                <CaixaTexto label="Nome Completo *" id="nome" placeholder="Digite o nome completo" defaultValue={DadosIniciais?.nome || ""} />
                <CaixaTexto label="E-mail *" id="email" placeholder="Digite o email" defaultValue={DadosIniciais?.email || ""} />
                <CaixaTexto label="Login *" id="login" placeholder="Digite o login" defaultValue={DadosIniciais?.login || ""} />
                <CaixaTexto label="Senha" id="senha" placeholder="Digite a senha" type="password" defaultValue={DadosIniciais?.senha || ""} />
                
                <div className=" w-[500px] flex flex-row gap-6">
                    <CaixaSelecao label="Cargo *" id="cargo" placeholder="Selecione o cargo" defaultValue={DadosIniciais?.perfil || ""} opcoes={categoriasDisponiveis} />
                    <CaixaSelecao label="Status *" id="status" placeholder="Selecione o status" defaultValue={DadosIniciais?.status || ""} opcoes={[
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
                        type="submit"
                        estilo={modoEdicao ? "salvar" : "registrar"}
                        icone={false}
                    />
                </div>
            </form>
        </div>
    )
}