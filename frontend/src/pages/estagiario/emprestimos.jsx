import { useState, useEffect, useCallback } from "react";
import { CheckCircle } from "lucide-react";
import LayoutUsuario from "../../layouts/usuario/LayoutUsuario";
import Pesquisa from "../../components/Pesquisa/Pesquisa";
import TabelaGipar from "../../components/tabelaGipar/TabelaGipar";
import StatusBadge from "../../components/ui/StatusBadge";
import Botao from "../../components/Botao";
import PopUpEmprestimo from "../../components/PopUpEmprestimo/index";
import TituloPagina from "../../components/TituloPagina";

import { buscarEmprestimos } from "../../services/Emprestimos/emprestimosEstag.service";

export default function EstagEmprestimos() {

    const [termo, setTermo] = useState("");
    const [status, setStatus] = useState("");

    const [emprestimos, setEmprestimos] = useState([]);

    const [abrirPopup, setAbrirPopup] = useState(false);

    const carregarEmprestimos = useCallback(async () => {
        try {
            const dados = await buscarEmprestimos();
            setEmprestimos(dados);
        } catch (erro) {
            console.error(erro);
        }
    }, []);

    useEffect(() => {
        carregarEmprestimos();
    }, [carregarEmprestimos]);

    const emprestimosFiltrados = emprestimos.filter((emprestimo) => {

        const busca = termo.toLowerCase();

        const bateTexto =
            emprestimo.equipamento?.toLowerCase().includes(busca) ||
            emprestimo.usuario?.toLowerCase().includes(busca);

        const bateStatus =
            status === "" ||
            emprestimo.status === status;

        return bateTexto && bateStatus;
    });

    return (
        <section className="h-screen w-full flex">

            <LayoutUsuario
                tipoUsuario="estagiario"
                titulo="Empréstimos"
                cargo="Estagiário"
                nome="Paulo Victor"
                notificacoes={[]}
                onLogout={() => console.log("logout")}
            >

                <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">

                    <div className="flex justify-end mb-2">

                        <Botao
                            children="Novo Empréstimo"
                            estilo="novo"
                            icone
                            onClick={() => setAbrirPopup(true)}
                        />

                    </div>

                    <Pesquisa

                        termo={termo}
                        setTermo={setTermo}

                        status={status}
                        setStatus={setStatus}

                        listaStatus={[
                            "Ativo",
                            "Atrasado",
                            "Concluído",
                            "Cancelado"
                        ]}

                        placeholderTexto="Equipamento ou usuário..."
                        placeholderStatus="Todos"

                    />

    <TabelaGipar
    colunas={[
        { titulo: "Equipamento", chave: "equipamento" },
        { titulo: "Usuário", chave: "usuario" },
        { titulo: "Retirada", chave: "data" },
        { titulo: "Devolução Prevista", chave: "dataDevolucao" },
        {
            titulo: "Status",
            chave: "status",
            render: (valor) => <StatusBadge status={valor} />
        },
        {
            titulo: "Ações",
            render: (_, linha) =>
                (linha.status === "Ativo" || linha.status === "Atrasado") ? (
                <Botao
                type="button"
                estilo="cancelar"
                onClick={() => onDevolver(linha)}
            >
                <CheckCircle size={14} />
                Devolver
                </Botao>
                ) : null
    }
]}
    dados={emprestimosFiltrados}
/>

                </main>

            </LayoutUsuario>

            {
                abrirPopup &&
                <PopUpEmprestimo
                    fechar={() => setAbrirPopup(false)}
                    aoSalvar={carregarEmprestimos}
                />
            }

        </section>
    );

}