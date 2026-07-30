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

  // 🔴 1. Captura da identidade blindada (do hook ou do navegador)
  const sessaoTexto = sessionStorage.getItem("usuario") || sessionStorage.getItem("user") || "{}";
  const usuarioLogado = JSON.parse(sessaoTexto);
  const meuId = usuario?.id || usuarioLogado.id;
  const meuNome = usuario?.nome || usuarioLogado.nome;

  // 🔴 2. Filtro de Segurança Reforçado para Ativos
  const meusAtivos = emprestimosAtivos.filter(emp => {
    if (!meuId && !meuNome) return false; // Bloqueia se a sessão falhar
    
    const ehMeuId = emp.id_usuario && meuId && String(emp.id_usuario) === String(meuId);
    const ehMeuNomeOficial = emp.nome_usuario && meuNome && emp.nome_usuario === meuNome;
    const ehMeuNomeAntigo = emp.usuario && meuNome && emp.usuario === meuNome;

    return ehMeuId || ehMeuNomeOficial || ehMeuNomeAntigo;
  });

  // 🔴 3. Filtro de Segurança Reforçado para Histórico
  const meuHistorico = historico.filter(emp => {
    if (!meuId && !meuNome) return false; // Bloqueia se a sessão falhar
    
    const ehMeuId = emp.id_usuario && meuId && String(emp.id_usuario) === String(meuId);
    const ehMeuNomeOficial = emp.nome_usuario && meuNome && emp.nome_usuario === meuNome;
    const ehMeuNomeAntigo = emp.usuario && meuNome && emp.usuario === meuNome;

    return ehMeuId || ehMeuNomeOficial || ehMeuNomeAntigo;
  });

  // Recalcula o estado vazio baseando-se nas listas filtradas
  const paginaRealmenteVazia = meusAtivos.length === 0 && meuHistorico.length === 0;

  return (
    <LayoutUsuario
      // Uso de Optional Chaining (?.) para evitar quebra caso 'usuario' demore 1 milissegundo a carregar
      tipoUsuario={usuario?.role || usuarioLogado.role || "comum"}
      titulo="Meus Empréstimos"
      cargo={usuario?.perfil || usuarioLogado.perfil || "Aluno"}
      nome={usuario?.nome || usuarioLogado.nome || "Usuário"}
      notificacoes={notificacoes}
      onMarcarNotificacaoLida={marcarNotificacaoLida}
      onMarcarTodasNotificacoesLidas={marcarTodasNotificacoesLidas}
      onLogout={handleLogout}
    >
      {carregando && <DashboardEstadoPainel tipo="carregando" />}

      {!carregando && erro && (
        <DashboardEstadoPainel tipo="erro" mensagem={erro} onRecarregar={recarregar} />
      )}

      {!carregando && !erro && paginaRealmenteVazia && <DashboardEstadoPainel tipo="vazio" />}

      {!carregando && !erro && !paginaRealmenteVazia && (
        <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-3 py-3 sm:px-6 sm:py-6">

          {possuiAtraso && (
            <AlertaBanner
              titulo="Você possui empréstimos em atraso"
              descricao="Regularize sua situação para poder fazer novos empréstimos."
            />
          )}

          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Empréstimos Ativos ({meusAtivos.length})
            </h2>

            {meusAtivos.length === 0 ? (
              <EstadoVazio mensagem="Nenhum empréstimo ativo no momento" />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {meusAtivos.map((emprestimo) => (
                  <CardEmprestimoAluno
                    key={emprestimo.id}
                    // 🔴 Chaves mapeadas corretamente com a API
                    equipamento={emprestimo.nome_equipamento || emprestimo.equipamento}
                    patrimonio={emprestimo.codigo_patrimonio || emprestimo.patrimonio}
                    status={emprestimo.status}
                    data={emprestimo.data_retirada || emprestimo.data}
                    dataDevolucao={emprestimo.data_previsao_devolucao || emprestimo.dataDevolucao}
                    diasAtraso={emprestimo.diasAtraso}
                    onClick={() => abrirDetalheEmprestimo(emprestimo)}
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Histórico ({meuHistorico.length})
            </h2>

            {meuHistorico.length === 0 ? (
              <EstadoVazio mensagem="Nenhum empréstimo concluído" />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {meuHistorico.map((emprestimo) => (
                  <CardEmprestimoAluno
                    key={emprestimo.id}
                    // 🔴 Chaves mapeadas corretamente com a API
                    equipamento={emprestimo.nome_equipamento || emprestimo.equipamento}
                    patrimonio={emprestimo.codigo_patrimonio || emprestimo.patrimonio}
                    status={emprestimo.status}
                    data={emprestimo.data_retirada || emprestimo.data}
                    dataDevolucao={emprestimo.data_previsao_devolucao || emprestimo.dataDevolucao}
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