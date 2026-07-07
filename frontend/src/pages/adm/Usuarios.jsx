import LayoutUsuario from "../../layouts/usuario";
import PopUpCadastrarEditarUsuario from "../../components/PopUpCadastrarEditarUsuario";
import Pesquisa from "../../components/Pesquisa/Pesquisa";
import TabelaGipar from "../../components/tabelaGipar/TabelaGipar";
import Botao from "../../components/Botao";
import PopUpConclusao from "../../components/PopupConclusao";
import PopUpExclusao from "../../components/PopUpExclusao";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

import { useState, useEffect } from "react";

export default function Usuario() {
    const navigate = useNavigate();
    const { usuario: usuarioLogado, logout } = useAuth();
    const [popUpEditarUsuario, setPopUpEditarUsuario] = useState(false);
    const [popUpCadastrarUsuario, setPopUpCadastrarUsuario] = useState(false);
    const [popUpExclusao, setPopUpExclusao] = useState(false);


    const [popUpConclusao, setPopUpConclusao] = useState(false);
    const [mensagemConclusao, setMensagemConclusao] = useState("");

    const [termo, setTermo] = useState("");
    const [categoria, setCategoria] = useState("");
    const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
    const [usuarios, setUsuarios] = useState([]);

    const carregarUsuarios = async () => {
        try {
            const resposta = await fetch("http://localhost:3001/usuarios");
            const dados = await resposta.json();
            setUsuarios(dados);
        } catch (erro) {
            console.error("Erro ao buscar usuários:", erro);
        }
    };

    useEffect(() => {
        carregarUsuarios();
    }, []);

    const salvarUsuario = async (dadosDoFormulario) => {
        if (usuarioSelecionado) {
            // MODO EDIÇÃO (PUT)
            await fetch(`http://localhost:3001/usuarios/${usuarioSelecionado.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...usuarioSelecionado, ...dadosDoFormulario })
            });
            
            setMensagemConclusao("O usuário foi editado com sucesso.");
        } else {
            
            const novoUsuario = {
                id: String(Date.now()), 
                ...dadosDoFormulario
            };

            await fetch("http://localhost:3001/usuarios", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(novoUsuario)
            });
            
            setMensagemConclusao("Novo usuário cadastrado com sucesso.");
        }

        carregarUsuarios();
        
        
        setPopUpEditarUsuario(false);
        setPopUpCadastrarUsuario(false);
        setPopUpConclusao(true);
    };

    
    const excluirUsuario = async () => {
        if (usuarioSelecionado) {
            try {
                await fetch(`http://localhost:3001/usuarios/${usuarioSelecionado.id}`, {
                    method: "DELETE"
                });

                carregarUsuarios();
                setMensagemConclusao("O usuário foi excluído com sucesso.");
                setPopUpExclusao(false);
                setPopUpConclusao(true); 

            } catch (erro) {
                console.error("Erro ao excluir usuário:", erro);
            }
        }
    };

    const fecharPopUp = () => {
        setPopUpExclusao(false);
        setPopUpEditarUsuario(false);
        setPopUpCadastrarUsuario(false);
        setPopUpConclusao(false); 
        setUsuarioSelecionado(null);
    };

    return (
        <section className="h-screen w-full flex flex-row">
            <LayoutUsuario
                tipoUsuario={usuarioLogado.role}
                titulo="Usuários"
                cargo={usuarioLogado.perfil}
                nome={usuarioLogado.nome}
                onLogout={() => {
                    logout();
                    navigate("/login");
                }}
            >
                
                <Pesquisa
                    termo={termo}
                    setTermo={setTermo}
                    categoria={categoria}
                    setCategoria={setCategoria}
                    listaCategorias={["Administrador", "Professor", "Estagiário", "Aluno"]}
                    placeholderTexto="Buscar por nome do usuário..."
                    placeholderCategoria="Todos os Perfis" 
                >
                    <Botao 
                        onClick={() => setPopUpCadastrarUsuario(true)}
                        type="button"
                        estilo="salvar"
                    >
                        Cadastrar Usuário
                    </Botao>
                </Pesquisa>

                <TabelaGipar
                    colunas={[
                        { titulo: "Nome", chave: "nome" },
                        { titulo: "Email", chave: "email" },
                        { titulo: "Perfil", chave: "perfil" },
                        { titulo: "Status", chave: "status" },
                    ]}
                    dados={usuarios} 
                    onEditar={(usuario) => {
                        setUsuarioSelecionado(usuario);
                        setPopUpEditarUsuario(true);
                    }}
                    onDeletar={(usuario) => {
                        setUsuarioSelecionado(usuario);
                        setPopUpExclusao(true);
                    }}
                />

                {popUpEditarUsuario && (
                    <PopUpCadastrarEditarUsuario DadosIniciais={usuarioSelecionado} cancelar={fecharPopUp} salvar={salvarUsuario} modoEdicao={true} />
                )}
                {popUpCadastrarUsuario && (
                    <PopUpCadastrarEditarUsuario cancelar={fecharPopUp} salvar={salvarUsuario} modoEdicao={false} />
                )}
                
                {popUpExclusao && (
                    <PopUpExclusao
                        titulo="Confirmar de Exclusão"
                        subtitulo="Esse ação não poderá ser desfeita."
                        objeto={usuarioSelecionado ? usuarioSelecionado.nome : "Usuário"}
                        confirmarExclusao={excluirUsuario}
                        cancelarExclusao={fecharPopUp}
                    />
                )}

                {popUpConclusao && (
                    <PopUpConclusao 
                        titulo="Sucesso!"
                        subtitulo={mensagemConclusao}
                        fechar={fecharPopUp} 
                    />
                )}
                
            </LayoutUsuario>
        </section>  
    );
}