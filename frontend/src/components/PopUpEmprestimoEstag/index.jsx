import { useState, useEffect } from "react";
import TituloPagina from "../TituloPagina";
import SubTitulo from "../SubTitulo";
import CaixaSelecao from "../CaixadeSelecao/CaixadeSelecao";
import DataSelecao from "../DataSelecao/DataSelecao";
import Botao from "../Botao";

import { buscarUsuarios } from "../../services/usuarios/usuarios.service";
import { buscarEquipamentos } from "../../services/Equipamentos/equipamentos.service";
import { criarEmprestimo } from "../../services/Emprestimos/emprestimosEstag.service";

export default function PopUpEmprestimoEstag({
    fechar,
    aoSalvar
}) {

    const [usuarios, setUsuarios] = useState([]);
    const [equipamentos, setEquipamentos] = useState([]);
    const [erro, setErro] = useState("");
    const [salvando, setSalvando] = useState(false);

    useEffect(() => {

        async function carregar() {

            const [u, e] = await Promise.all([
                buscarUsuarios(),
                buscarEquipamentos()
            ]);

            setUsuarios(u);
            setEquipamentos(
                e.filter(eq => eq.status === "Disponível")
            );
        }

        carregar();

    }, []);

    const opcoesUsuarios = usuarios.map(u => ({
        valor: u.id,
        texto: u.nome
    }));

    const opcoesEquipamentos = equipamentos.map(eq => ({
        valor: eq.id,
        texto: eq.nome
    }));

    async function handleSubmit(e) {

        e.preventDefault();

        setSalvando(true);

        const usuario = usuarios.find(
            u => String(u.id) === e.target.usuario.value
        );

        const equipamento = equipamentos.find(
            eq => String(eq.id) === e.target.equipamento.value
        );

        const dataHoje = new Date().toISOString().split("T")[0];

        const novoEmprestimo = {

            id: crypto.randomUUID(),

            equipamento: equipamento.nome,

            usuario: usuario.nome,

            patrimonio: equipamento.patrimonio,

            data: dataHoje,

            dataDevolucao: e.target.dataDevolucao.value,

            status: "Ativo"

        };

        try {

            await criarEmprestimo(novoEmprestimo);

            aoSalvar();

            fechar();

        } catch {

            setErro("Erro ao registrar empréstimo.");

        } finally {

            setSalvando(false);

        }

    }

    return (

        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

            <div className="relative w-[560px] rounded-xl bg-[#F3F4F6] border border-[#D1D5DB] p-6 shadow-xl">

                <button
                    onClick={fechar}
                    className="absolute top-4 right-5 text-2xl text-gray-500 hover:text-gray-700"
                >
                    ×
                </button>

                <TituloPagina>
                    Registrar Empréstimo
                </TituloPagina>

                <SubTitulo>
                    Prazo máximo: 15 dias. Usuários com atraso não podem fazer novos empréstimos.
                </SubTitulo>

                {erro && (

                    <p className="text-red-600 text-sm mt-3">

                        {erro}

                    </p>

                )}

                <form
                    onSubmit={handleSubmit}
                    className="mt-6 flex flex-col gap-5"
                >

                    <CaixaSelecao
                        label="Equipamento"
                        id="equipamento"
                        placeholder="Selecione um equipamento"
                        opcoes={opcoesEquipamentos}
                    />

                    <CaixaSelecao
                        label="Usuário"
                        id="usuario"
                        placeholder="Selecione um usuário"
                        opcoes={opcoesUsuarios}
                    />

                    <DataSelecao
                        id="dataDevolucao"
                        name="dataDevolucao"
                        label="Data de Devolução (máx. 15 dias)"
                    />

                    <div className="flex justify-end gap-3 mt-2">

                        <Botao
                            type="button"
                            estilo="cancelar"
                            onClick={fechar}
                        >
                            Cancelar
                        </Botao>

                        <Botao
                            type="submit"
                            estilo="registrar"
                            disabled={salvando}
                        >
                            {salvando ? "Registrando..." : "Registrar"}
                        </Botao>

                    </div>

                </form>

            </div>

        </div>

    );

}