import { useState } from "react";
import TituloPagina from "../TituloPagina";
import SubTitulo from "../SubTitulo";
import CaixaTexto from "../CaixaTexto/CaixaTexto";
import CaixaSelecao from "../CaixadeSelecao/CaixadeSelecao";
import Botao from "../Botao";

const categoriasDisponiveis = [
  { valor: "ADMINISTRADOR", texto: "Administrador (Acesso Total)" },
  { valor: "TECNICO", texto: "Estagiário / Técnico (Manutenção e Empréstimos)" },
  { valor: "COMUM", texto: "Professor / Aluno (Consulta e Empréstimos Pessoais)" }
];
export default function PopUpCadastrarEditarUsuario({ cancelar, salvar, DadosIniciais = null, modoEdicao = false }) {
    const [nome, setNome] = useState(DadosIniciais?.nome || "");
    const [email, setEmail] = useState(DadosIniciais?.email || "");
    const [login, setLogin] = useState(DadosIniciais?.login || "");
    const [senha, setSenha] = useState(DadosIniciais?.senha || "");
    const [perfil, setPerfil] = useState(DadosIniciais?.perfil || "");
    
    // Controla o status corretamente mapeando o booleano do banco ou o padrão Ativo
    const [status, setStatus] = useState(
        DadosIniciais?.ativo === false ? "Inativo" : "Ativo"
    );

    const [erro, setErro] = useState("");

    const handleSubmit = (event) => {
        event.preventDefault();
        setErro("");

        // 1. Impedir campos obrigatórios vazios
        if (!nome.trim() || !email.trim() || !login.trim() || !perfil || !status) {
            setErro("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        // 2. Impedir nome com menos de 3 letras
        if (nome.trim().length < 3) {
            setErro("O nome deve ter pelo menos 3 letras.");
            return;
        }

        // 3. Impedir nome com números
        if (/\d/.test(nome)) {
            setErro("O nome não pode conter números.");
            return;
        }

        // 4. Impedir e-mail fora do padrão
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexEmail.test(email)) {
            setErro("Por favor, insira um endereço de e-mail válido.");
            return;
        }

        const dadosSubmetidos = {
            nome: nome.trim(),
            email: email.trim(),
            login: login.trim(),
            tipo_usuario: perfil,
            ativo: status === "Ativo", 
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
                <CaixaTexto 
                    label="Nome Completo *" 
                    id="nome" 
                    placeholder="Digite o nome completo" 
                    value={nome} 
                    onChange={(e) => setNome(e.target.value)} 
                />
                <CaixaTexto 
                    label="E-mail *" 
                    id="email" 
                    placeholder="Digite o email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                />
                <CaixaTexto 
                    label="Login *" 
                    id="login" 
                    placeholder="Digite o login" 
                    value={login} 
                    onChange={(e) => setLogin(e.target.value)} 
                />
                <CaixaTexto 
                    label="Senha" 
                    id="senha" 
                    placeholder="Digite a senha" 
                    type="password" 
                    value={senha} 
                    onChange={(e) => setSenha(e.target.value)} 
                />
                
                <div className="w-[500px] flex flex-row gap-6">
                    <CaixaSelecao 
                        label="Cargo *" 
                        id="cargo" 
                        placeholder="Selecione o cargo" 
                        value={perfil} 
                        opcoes={categoriasDisponiveis} 
                        onChange={(e) => setPerfil(e.target.value)}
                    />
                    <CaixaSelecao 
                        label="Status *" 
                        id="status" 
                        placeholder="Selecione o status" 
                        value={status} 
                        opcoes={[
                            { valor: "Ativo", texto: "Ativo" },
                            { valor: "Inativo", texto: "Inativo" }
                        ]} 
                        onChange={(e) => setStatus(e.target.value)}
                    />
                </div>
                
                <div className="w-[500px] flex flex-row gap-6">
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
    );
}