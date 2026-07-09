import LayoutUsuario from "../../layouts/usuario/LayoutUsuario";
import PopUpCadastrarEditarUsuario from "../../components/PopUpCadastrarEditarUsuario";
import Pesquisa from "../../components/Pesquisa/Pesquisa";
import TabelaGipar from "../../components/tabelaGipar/TabelaGipar";
import Botao from "../../components/Botao";
import PopUpExclusao from "../../components/PopUpExclusao";
import StatusBadge from "../../components/ui/StatusBadge";

import { useState, useEffect, useCallback } from "react";
import { buscarUsuarios, criarUsuario, atualizarUsuario, deletarUsuario } from "../../services/usuarios/usuarios.service";

const gerarIdUsuario = () => String(Date.now());

export default function Usuario() {
    const [popUpEditarUsuario, setPopUpEditarUsuario] = useState(false);
    const [popUpCadastrarUsuario, setPopUpCadastrarUsuario] = useState(false);
    const [popUpExclusao, setPopUpExclusao] = useState(false);

    const [termo, setTermo] = useState("");
    const [filtroPerfil, setFiltroPerfil] = useState(""); 
    const [filtroStatus, setFiltroStatus] = useState(""); 

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
        let montado = true;
        (async () => {
            try {
                const dados = await buscarUsuarios();
                if (montado) setUsuarios(dados);
            } catch (erro) {
                console.error(erro);
            }
        })();
        return () => { montado = false; };
    }, []);

    const salvarUsuario = async (dadosDoFormulario) => {
        try {
            if (usuarioSelecionado) {
                await atualizarUsuario(usuarioSelecionado.id, { ...usuarioSelecionado, ...dadosDoFormulario });
            } else {
                const novoUsuario = {
                    id: gerarIdUsuario(),
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
            
        // Filtra pelo perfil (Administrador, Aluno, etc.)
        const batePerfil = filtroPerfil === "" || usuario.perfil === filtroPerfil;
        
        // Filtra pelo status (Ativo, Inativo)
        const bateStatus = filtroStatus === "" || usuario.status === filtroStatus;

        return bateTexto && batePerfil && bateStatus;
    });

    return (
        <section className="h-screen w-full flex flex-row">
            <LayoutUsuario 
                tipoUsuario="adm" 
                titulo="Usuários" 
                cargo="Administrador" 
                nome="Paulo Victor"
                notificacoes={[]} 
                onMarcarNotificacaoLida={() => console.log("Notificação marcada como lida")}
                onMarcarTodasNotificacoesLidas={() => console.log("Todas as notificações marcadas como lidas")}
                onLogout={() => console.log("logout")}
            >

                <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                    <div className="w-full">
                       
                        <Pesquisa
                            termo={termo}
                            setTermo={setTermo}
                            
                            // Usamos a prop 'categoria' do componente genérico para passar os Perfis
                            categoria={filtroPerfil}
                            setCategoria={setFiltroPerfil}
                            listaCategorias={["Administrador", "Estagiário", "Aluno", "Professor"]}
                            placeholderCategoria="Todos os Perfis" 
                            
                            // Filtro de Status
                            status={filtroStatus}
                            setStatus={setFiltroStatus}
                            listaStatus={["Ativo", "Inativo"]}
                            placeholderStatus="Todos os Status"
                            
                            placeholderTexto="Buscar por nome ou email..."
                            extras={
                                <div className="ml-auto">
                                    <Botao 
                                        onClick={() => setPopUpCadastrarUsuario(true)}
                                        type="button"
                                        estilo="novo"
                                        icone={true}
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

                    {/* MODAIS */}
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