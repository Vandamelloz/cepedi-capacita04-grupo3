import LayoutUsuario from "../../layouts/usuario";
import PopUpCadastrarEditarUsuario from "../../components/PopUpCadastrarEditarUsuario";
import Pesquisa from "../../components/Pesquisa/Pesquisa";
import TabelaGipar from "../../components/tabelaGipar/TabelaGipar";
import Botao from "../../components/Botao";
import PopUpExclusao from "../../components/PopUpExclusao";

import { useState, useEffect, useCallback } from "react";

export default function Usuario() {
    const [popUpEditarUsuario, setPopUpEditarUsuario] = useState(false);
    const [popUpCadastrarUsuario, setPopUpCadastrarUsuario] = useState(false);
    const [popUpExclusao, setPopUpExclusao] = useState(false);

    const [termo, setTermo] = useState("");
    const [categoria, setCategoria] = useState("");
    const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
    const [usuarios, setUsuarios] = useState([]);

    const carregarUsuarios = useCallback(async () => {
        try {
            const resposta = await fetch("http://localhost:3001/usuarios");
            const dados = await resposta.json();
            setUsuarios(dados);
        } catch (erro) {
            console.error("Erro ao buscar usuários:", erro);
        }
    }, []);

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
            
            fecharPopUp();
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
            
            fecharPopUp();

        }

        carregarUsuarios();
        setPopUpEditarUsuario(false);
        setPopUpCadastrarUsuario(false);
        
    };

    const usuariosFiltrados = usuarios.filter((usuario) => {
        const termoMinusculo = termo.toLowerCase();

        const bateTexto = 
            usuario.nome?.toLowerCase().includes(termoMinusculo) ||
            usuario.email?.toLowerCase().includes(termoMinusculo);

        const bateCategoria = categoria === "" || usuario.perfil === categoria;


        return bateTexto && bateCategoria;
    });

    
    const excluirUsuario = async () => {
        if (usuarioSelecionado) {
            try {
                await fetch(`http://localhost:3001/usuarios/${usuarioSelecionado.id}`, {
                    method: "DELETE"
                });

                carregarUsuarios();
                fecharPopUp();


            } catch (erro) {
                console.error("Erro ao excluir usuário:", erro);
            }
        }
    };

    const fecharPopUp = () => {
        setPopUpExclusao(false);
        setPopUpEditarUsuario(false);
        setPopUpCadastrarUsuario(false);
        setUsuarioSelecionado(null);
    };

    return (
        <section className="h-screen w-full flex flex-row">
            <LayoutUsuario tipoUsuario="adm" titulo="Usuários" cargo="Administrador" nome="John Doe">
                
                <Pesquisa
                    termo={termo}
                    setTermo={setTermo}
                    categoria={categoria}
                    setCategoria={setCategoria}
                    listaCategorias={["Administrador", "Estagiário", "Aluno"]}
                    placeholderTexto="Buscar por nome do usuário..."
                    placeholderCategoria="Todos os Perfis" 
                    

                    extras={
                        <div className="ml-auto">
                            <Botao 
                                onClick={() => setPopUpCadastrarUsuario(true)}
                                type="button"
                                estilo="salvar"
                            >
                                Cadastrar Usuário
                            </Botao>
                        </div>
                    }
                />

                <TabelaGipar
                    colunas={[
                        { titulo: "Nome", chave: "nome" },
                        { titulo: "Email", chave: "email" },
                        { titulo: "Perfil", chave: "perfil" },
                        { titulo: "Status", chave: "status" },
                    ]}
                    dados={usuariosFiltrados} 
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

            </LayoutUsuario>
        </section>  
    );
}