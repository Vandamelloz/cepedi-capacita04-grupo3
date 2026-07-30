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

    // 🔴 ESTADOS PARA SALVAR OS VALORES DOS CAMPOS EM TEMPO REAL
    const [equipamentoId, setEquipamentoId] = useState("");
    const [usuarioId, setUsuarioId] = useState("");
    const [dataDevolucao, setDataDevolucao] = useState("");

    useEffect(() => {
        async function carregar() {
            try {
                const [u, e] = await Promise.all([
                    buscarUsuarios(),
                    buscarEquipamentos()
                ]);
                setUsuarios(u);
                setEquipamentos(e.filter(eq => eq.status === "DISPONIVEL"));
            } catch (error) {
                console.error("Erro ao carregar dados:", error);
                setErro("Falha ao carregar formulário.");
            }
        }
        carregar();
    }, []);

    const opcoesUsuarios = usuarios.map(u => ({
        valor: u.id,
        texto: u.nome
    }));

    const opcoesEquipamentos = equipamentos.map(eq => ({
        valor: eq.id,
        texto: `${eq.nome} (${eq.codigo_patrimonio || eq.patrimonio || 'S/N'})`
    }));

    async function handleSubmit(e) {
        e.preventDefault();
        setSalvando(true);
        setErro("");

        // 🔴 AGORA LÊ OS VALORES DIRETAMENTE DOS ESTADOS
        if (!usuarioId || !equipamentoId || !dataDevolucao) {
            setErro("Preencha todos os campos obrigatórios.");
            setSalvando(false);
            return;
        }

        const novoEmprestimo = {
            id_equipamento: Number(equipamentoId),
            id_usuario: Number(usuarioId),
            id_tecnico_saida: 1, // Atenção: Se puder, puxe esse ID do estagiário logado depois!
            data_previsao_devolucao: `${dataDevolucao}T23:59:59`,
            status: "ATIVO"
        };

        try {
            await criarEmprestimo(novoEmprestimo);
            aoSalvar();
            fechar();
        } catch (error) {
            console.error("Erro ao registrar empréstimo:", error);
            setErro(error?.response?.data?.detail || "Erro ao registrar empréstimo no banco de dados.");
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

                <TituloPagina>Registrar Empréstimo</TituloPagina>

                <SubTitulo>
                    Prazo máximo: 15 dias. Usuários com atraso não podem fazer novos empréstimos.
                </SubTitulo>

                {erro && (
                    <p className="text-red-600 text-sm mt-3 bg-red-50 p-2 rounded border border-red-200">
                        {erro}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
                    
                    <CaixaSelecao
                        label="Equipamento *"
                        id="equipamento"
                        placeholder="Selecione um equipamento"
                        opcoes={opcoesEquipamentos}
                        value={equipamentoId}
                        onChange={(e) => setEquipamentoId(e.target.value)} // 🔴 ATUALIZA O ESTADO AO CLICAR
                    />

                    <CaixaSelecao
                        label="Usuário *"
                        id="usuario"
                        placeholder="Selecione um usuário"
                        opcoes={opcoesUsuarios}
                        value={usuarioId}
                        onChange={(e) => setUsuarioId(e.target.value)} // 🔴 ATUALIZA O ESTADO AO CLICAR
                    />

                    <DataSelecao
                        id="dataDevolucao"
                        name="dataDevolucao"
                        label="Data de Devolução (máx. 15 dias) *"
                        value={dataDevolucao}
                        onChange={(e) => setDataDevolucao(e.target.value)} // 🔴 ATUALIZA O ESTADO AO CLICAR
                    />

                    <div className="flex justify-end gap-3 mt-2">
                        <Botao type="button" estilo="cancelar" onClick={fechar} icone={false}>
                            Cancelar
                        </Botao>
                        <Botao type="submit" estilo="registrar" disabled={salvando} icone={false}>
                            {salvando ? "Registrando..." : "Registrar"}
                        </Botao>
                    </div>
                </form>
            </div>
        </div>
    );
}