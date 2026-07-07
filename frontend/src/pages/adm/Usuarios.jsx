import LayoutUsuario from "../../layouts/usuario/LayoutUsuario";
import PopUpCadastrarEditarUsuario from "../../components/PopUpCadastrarEditarUsuario";
import Pesquisa from "../../components/Pesquisa/Pesquisa";
import TabelaGipar from "../../components/tabelaGipar/TabelaGipar";
import Botao from "../../components/Botao";
import PopUpExclusao from "../../components/PopUpExclusao";
import StatusBadge from "../../components/ui/StatusBadge";

import { useState, useEffect, useCallback } from "react";
import { buscarUsuarios, criarUsuario, atualizarUsuario, deletarUsuario } from "../../services/usuarios/usuarios.service";

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
            const dados = await buscarUsuarios();
            setUsuarios(dados);
        } catch (erro) {
            console.error(erro);
        }
    }, []);

    useEffect(() => {
        carregarUsuarios();
    }, [carregarUsuarios]);

    const salvarUsuario = async (dadosDoFormulario) => {
        try {
            if (usuarioSelecionado) {
                await atualizarUsuario(usuarioSelecionado.id, { ...usuarioSelecionado, ...dadosDoFormulario });
            } else {
                const novoUsuario = {
                    id: String(Date.now()), 
                    ...dadosDoFormulario
                };
                await criarUsuario(novoUsuario);
            }
            carregarUsuarios();
            fecharPopUp();
        } catch (erro) {
            console.error(erro);
        }
    };

    // 🌟 A EXCLUSÃO AGORA CHAMA APENAS UMA FUNÇÃO
    const excluirUsuario = async () => {
        if (usuarioSelecionado) {
            try {
                await deletarUsuario(usuarioSelecionado.id);
                carregarUsuarios();
                fecharPopUp();
            } catch (erro) {
                console.error(erro);
            }
        }
    };

    const fecharPopUp = () => {
        setPopUpExclusao(false);
        setPopUpEditarUsuario(false);
        setPopUpCadastrarUsuario(false);
        setUsuarioSelecionado(null);
    };

    const usuariosFiltrados = usuarios.filter((usuario) => {
        const termoMinusculo = termo.toLowerCase();
        const bateTexto = 
            usuario.nome?.toLowerCase().includes(termoMinusculo) ||
            usuario.email?.toLowerCase().includes(termoMinusculo);
        const bateCategoria = categoria === "" || usuario.perfil === categoria;
        return bateTexto && bateCategoria;
    });


    return (

        <section className="h-screen w-full flex flex-row">
            <LayoutUsuario 
                tipoUsuario="adm" 
                titulo="Usuários" 
                cargo="Administrador" 
                nome="John Doe"
                notificacoes={[]}cd 
                onMarcarNotificacaoLida={() => console.log("Notificação marcada como lida")}
                onMarcarTodasNotificacoesLidas={() => console.log("Todas as notificações marcadas como lidas")}
                onLogout={() => console.log("logout")}
            >

                <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                    <div className="w-full">
                        <Pesquisa
                            termo={termo}
                            setTermo={setTermo}
                            categoria={categoria}
                            setCategoria={setCategoria}
                            listaCategorias={["Administrador", "Estagiário", "Aluno", "Professor"]}
                            placeholderTexto="Buscar por nome ou email..."
                            placeholderCategoria="Todos os Perfis" 
                            extras={
                                <div className="ml-auto">
                                    <Botao 
                                        onClick={() => setPopUpCadastrarUsuario(true)}
                                        type="button"
                                        estilo="novo" // Mudado para "novo" para ficar verde igual aos botões dos seus colegas
                                        icone={true}  // Adicionado o ícone de +
                                    >
                                        Cadastrar Usuário
                                    </Botao>
                                </div>
                            }
                        />
                    </div>

                    <div className="w-full">
                        <TabelaGipar
                            colunas={[
                                { titulo: "Nome", chave: "nome" },
                                { titulo: "Email", chave: "email" },
                                { titulo: "Perfil", chave: "perfil" },
                                { titulo: "Status", chave: "status", render: (valor) => <StatusBadge status={valor} /> },
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
                    </div>

                    {/* MODAIS (mantidos exatamente como estavam, apenas com a película escura de fundo se você não tivesse colocado antes) */}
                    {popUpEditarUsuario && (
                        <>
                            <div className="fixed inset-0 bg-black/40 z-40" onClick={fecharPopUp} />
                            <div className="fixed inset-0 flex items-center justify-center z-50">
                                <PopUpCadastrarEditarUsuario DadosIniciais={usuarioSelecionado} cancelar={fecharPopUp} salvar={salvarUsuario} modoEdicao={true} />
                            </div>
                        </>
                    )}
                    {popUpCadastrarUsuario && (
                        <>
                            <div className="fixed inset-0 bg-black/40 z-40" onClick={fecharPopUp} />
                            <div className="fixed inset-0 flex items-center justify-center z-50">
                                <PopUpCadastrarEditarUsuario cancelar={fecharPopUp} salvar={salvarUsuario} modoEdicao={false} />
                            </div>
                        </>
                    )}
                    {popUpExclusao && (
                        <>
                            <div className="fixed inset-0 bg-black/40 z-40" onClick={fecharPopUp} />
                            <div className="fixed inset-0 flex items-center justify-center z-50">
                                <PopUpExclusao
                                    titulo="Confirmar Exclusão"
                                    subtitulo="Essa ação não poderá ser desfeita."
                                    objeto={usuarioSelecionado ? usuarioSelecionado.nome : "Usuário"}
                                    confirmarExclusao={excluirUsuario}
                                    cancelarExclusao={fecharPopUp}
                                />
                            </div>
                        </>
                    )}

                </main>
            </LayoutUsuario>
        </section>  
    );
}