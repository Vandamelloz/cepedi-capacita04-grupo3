import { useNavigate } from "react-router-dom";
import LayoutUsuario from "../../layouts/usuario/LayoutUsuario";
import ModalDetalheEmprestimo from "../../components/ModalDetalheEmprestimo";
import useMeusEmprestimos from "../../hooks/useMeusEmprestimos";
import DashboardEstadoPainel from "../adm/components/DashboardEstadoPainel";
import AlertaBanner from "../../components/AlertaBanner/AlertaBanner";
import CardEmprestimoAluno from "../../components/CardEmprestimoAluno/CardEmprestimoAluno";
import EstadoVazio from "../../components/EstadoVazio/EstadoVazio";
import { useAuth } from "../../contexts/AuthContext";

export default function MeusEmprestimos() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const {
    usuario,
    emprestimosAtivos,
    historico,
    notificacoes,
    carregando,
    erro,
    paginaVazia,
    possuiAtraso,
    recarregar,
    emprestimoSelecionado,
    abrirDetalheEmprestimo,
    fecharDetalheEmprestimo,
    marcarNotificacaoLida,
    marcarTodasNotificacoesLidas,
  } = useMeusEmprestimos();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <LayoutUsuario
      tipoUsuario={usuario.role}
      titulo="Meus Empréstimos"
      cargo={usuario.perfil}
      nome={usuario.nome}
      notificacoes={notificacoes}
      onMarcarNotificacaoLida={marcarNotificacaoLida}
      onMarcarTodasNotificacoesLidas={marcarTodasNotificacoesLidas}
      onLogout={handleLogout}
    >
      {carregando && <DashboardEstadoPainel tipo="carregando" />}

      {!carregando && erro && (
        <DashboardEstadoPainel tipo="erro" mensagem={erro} onRecarregar={recarregar} />
      )}

      {!carregando && !erro && paginaVazia && <DashboardEstadoPainel tipo="vazio" />}

      {!carregando && !erro && !paginaVazia && (
        <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-3 py-3 sm:px-6 sm:py-6">

          {possuiAtraso && (
            <AlertaBanner
              titulo="Você possui empréstimos em atraso"
              descricao="Regularize sua situação para poder fazer novos empréstimos."
            />
          )}

          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Empréstimos Ativos ({emprestimosAtivos.length})
            </h2>

            {emprestimosAtivos.length === 0 ? (
              <EstadoVazio mensagem="Nenhum empréstimo ativo no momento" />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {emprestimosAtivos.map((emprestimo) => (
                  <CardEmprestimoAluno
                    key={emprestimo.id}
                    equipamento={emprestimo.equipamento}
                    patrimonio={emprestimo.patrimonio}
                    status={emprestimo.status}
                    data={emprestimo.data}
                    dataDevolucao={emprestimo.dataDevolucao}
                    diasAtraso={emprestimo.diasAtraso}
                    onClick={() => abrirDetalheEmprestimo(emprestimo)}
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Histórico ({historico.length})
            </h2>

            {historico.length === 0 ? (
              <EstadoVazio mensagem="Nenhum empréstimo concluído" />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {historico.map((emprestimo) => (
                  <CardEmprestimoAluno
                    key={emprestimo.id}
                    equipamento={emprestimo.equipamento}
                    patrimonio={emprestimo.patrimonio}
                    status={emprestimo.status}
                    data={emprestimo.data}
                    dataDevolucao={emprestimo.dataDevolucao}
                    onClick={() => abrirDetalheEmprestimo(emprestimo)}
                  />
                ))}
              </div>
            )}
          </section>
        </main>
      )}

      <ModalDetalheEmprestimo
        emprestimo={emprestimoSelecionado}
        aberto={Boolean(emprestimoSelecionado)}
        onFechar={fecharDetalheEmprestimo}
      />
    </LayoutUsuario>
  );
}