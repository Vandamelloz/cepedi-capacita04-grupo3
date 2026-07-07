import { useNavigate } from "react-router-dom";
import LayoutUsuario from "../../layouts/usuario";
import SummaryCard, {WrenchIcon, AlertIcon, CheckCircleIcon,} from "../../components/CardsTopoPagina";
import CardManutencao from "../../components/CardsManutencao";
import CampoPesquisa from "../../components/Pesquisa/Pesquisa";
import Botao from "../../components/Botao";
import PopUpConclusao from "../../components/PopupConclusao";
import PopUpCadastrarEditarManutenção from "../../components/PopUpCadastrarEditarManutenção";
import useManutencoes from "../../hooks/useManutencoes";
import { useAuth } from "../../contexts/AuthContext";

export default function Manutencoes() {
  const navigate = useNavigate();
  const { usuario: usuarioLogado, logout } = useAuth();

const {

manutencoesFiltradas,

carregando,
erro,

termo,
setTermo,

mostrarConcluidas,
setMostrarConcluidas,

emManutencao,
corretivas,
concluidas,

popupConclusaoAberto,
popupCadastroAberto,

manutencaoSelecionada,

abrirPopupConclusao,
fecharPopupConclusao,

abrirPopupCadastro,
fecharPopupCadastro,

handleConcluir,

salvarManutencao,

notificacoes,

marcarNotificacaoLida,
marcarTodasNotificacoesLidas,

} = useManutencoes();

return (

<LayoutUsuario
  tipoUsuario={usuarioLogado.role}
  titulo="Manutenções"
  cargo={usuarioLogado.perfil}
  nome={usuarioLogado.nome}
  notificacoes={notificacoes}
  onMarcarNotificacaoLida={marcarNotificacaoLida}
  onMarcarTodasNotificacoesLidas={marcarTodasNotificacoesLidas}
  onLogout={() => {
    logout();
    navigate("/login");
  }}
>

  <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">

    {erro && (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
        {erro}
      </div>
    )}

    <div className="flex gap-4 flex-wrap">

      <SummaryCard
        icon={<WrenchIcon />}
        label="Em Manutenção"
        count={emManutencao}
        color="orange"
      />

      <SummaryCard
        icon={<AlertIcon />}
        label="Corretivas"
        count={corretivas}
        color="red"
      />

      <SummaryCard
        icon={<CheckCircleIcon />}
        label="Concluídas"
        count={concluidas}
        color="green"
      />

    </div>

    <div className="w-full">

      <CampoPesquisa
        termo={termo}
        setTermo={setTermo}
        placeholderTexto="Buscar por equipamento..."
        listaStatus={[]}
        listaCategorias={[]}

        extras={
          <>

            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">

              <input
                type="checkbox"

                checked={
                  mostrarConcluidas
                }

                onChange={(e) =>
                  setMostrarConcluidas(
                    e.target.checked
                  )
                }

                className="w-4 h-4 rounded border-gray-300 cursor-pointer"
              />

              Mostrar concluídas

            </label>

            <div className="ml-auto">

              <Botao
                estilo="novo"
                icone

                onClick={() =>
                  abrirPopupCadastro()
                }
              >
                Registrar Manutenção
              </Botao>

            </div>

          </>
        }
      />

    </div>

    <div className="grid grid-cols-3 2xl:grid-cols-4 gap-4 w-full auto-rows-fr items-stretch">

      {carregando ? (

        <p className="text-gray-400 text-sm">
          Carregando manutenções...
        </p>

      ) : manutencoesFiltradas.length === 0 ? (

        <p className="text-gray-400 text-sm">
          Nenhuma manutenção encontrada.
        </p>

      ) : (

        manutencoesFiltradas.map((m) => (

          <CardManutencao
            key={m.id}

            name={m.nome}
            pat={m.patrimonio}
            type={m.tipo}

            defect={
              m.descricao_defeito
            }

            sentAt={
              m.data_abertura
            }

            finishedAt={
              m.data_conclusao
            }

            concluida={m.concluida}

            onComplete={() =>
              abrirPopupConclusao(m)
            }

            onClick={() =>
              abrirPopupCadastro(m)
            }
          />

        ))
      )}
    </div>

    {popupConclusaoAberto && (

      <>
        <div
          className="fixed inset-0 bg-black/40 z-40"

          onClick={
            fecharPopupConclusao
          }
        />

        <div className="fixed inset-0 flex items-center justify-center z-50">

          <PopUpConclusao
            nomeEquipamento={
              manutencaoSelecionada?.nome
            }

            onFechar={
              fecharPopupConclusao
            }

            onConfirmar={
              handleConcluir
            }
          />

        </div>
      </>
    )}

    {popupCadastroAberto && (

      <>
        <div
          className="fixed inset-0 bg-black/40 z-40"

          onClick={
            fecharPopupCadastro
          }
        />

        <div className="fixed inset-0 flex items-center justify-center z-50">

          <PopUpCadastrarEditarManutenção

            modoEdicao={
              !!manutencaoSelecionada &&
              !manutencaoSelecionada.concluida
            }

            modoVisualizacao={
              !!manutencaoSelecionada &&
              manutencaoSelecionada.concluida
            }

            manutencao={
              manutencaoSelecionada
            }

            onFechar={
              fecharPopupCadastro
            }

            onSalvar={
              salvarManutencao
            }
          />

        </div>
      </>
    )}

  </main>

</LayoutUsuario>
);
}
