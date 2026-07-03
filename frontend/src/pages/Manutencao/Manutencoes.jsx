import { useState, useEffect } from "react";
import LayoutUsuario from "../../layouts/usuario";
import SummaryCard, {WrenchIcon, AlertIcon, CheckCircleIcon} from "../../components/CardsTopoPagina";
import CardManutencao from "../../components/CardsManutencao";
import CampoPesquisa from "../../components/Pesquisa/Pesquisa";
import Botao from "../../components/Botao";
import PopUpConclusao from "../../components/PopupConclusao";
import PopUpCadastrarEditarManutenção from "../../components/PopUpCadastrarEditarManutenção";

const API_URL = "http://localhost:3001/manutencoes";

export default function Manutencoes({ userRole, cargo, nome }) {

  const [manutencoes, setManutencoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroApi, setErroApi] = useState("");

  const [termo, setTermo] = useState("");
  const [mostrarConcluidas, setMostrarConcluidas] = useState(false);

  const [popupVisivel, setPopupVisivel] = useState(false);
  const [nomeConcluido, setNomeConcluido] = useState("");
  const [idSelecionado, setIdSelecionado] = useState(null);
  const [manutencaoEditando, setManutencaoEditando] = useState(null);

  const [popupCadastroVisivel, setPopupCadastroVisivel] = useState(false);


  const buscarManutencoes = async () => {
    setCarregando(true);
    setErroApi("");

    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error();
      }

      const dados = await response.json();

      setManutencoes(dados);
    } catch {
      setErroApi(
        "Não foi possível carregar as manutenções. Verifique se o json-server está rodando."
      );
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarManutencoes();
  }, []);

  
  // popup 
  const abrirPopup = (id) => {
    const manutencao = manutencoes.find((m) => m.id === id);

    setNomeConcluido(manutencao?.nome || "");
    setIdSelecionado(id);
    setPopupVisivel(true);
  };

  // popup edicao
  const abrirEdicao = (manutencao) => {
  setManutencaoEditando(manutencao);
  setPopupCadastroVisivel(true);
};

  // Concluir manutenção
  const handleConcluir = async () => {
    try {
      const response = await fetch(`${API_URL}/${idSelecionado}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
        concluida: true,
        data_conclusao: new Date().toISOString()
      })
  });

      if (!response.ok) {
        throw new Error();
      }

      // Busca manutencao
    const manutencao = manutencoes.find(
      (m) => m.id === idSelecionado
    );

    // Devolve equipamento para disponivel
    await fetch(
      `http://localhost:3001/equipamentos/${manutencao.id_equipamento}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status: "Disponível"
        })
      }
    );

      setManutencoes((prev) =>
        prev.map((m) =>

          m.id === idSelecionado

            ? {
                ...m,

                concluida: true,

                data_conclusao:
                  new Date().toISOString()
              }

            : m
        )
      );

    } catch {

      setErroApi("Erro ao concluir manutenção.");

    } finally {

      setPopupVisivel(false);
    }
  };

  
  // Salva manutenção
  const handleSalvarManutencao = (manutencaoSalva) => {

  if (manutencaoEditando) {

    setManutencoes((prev) =>
      prev.map((m) =>
        m.id === manutencaoSalva.id
          ? manutencaoSalva
          : m
      )
    );

  } else {

    setManutencoes((prev) => [
      ...prev,
      manutencaoSalva
    ]);
  }

  setManutencaoEditando(null);
};

  // Filtros pesquisa
  const manutencoesFiltradas = manutencoes.filter((m) => {
    const buscaOk =
      (m.nome || "")
        .toLowerCase()
        .includes(termo.toLowerCase()) ||
      (m.patrimonio || "")
        .toLowerCase()
        .includes(termo.toLowerCase());

    const statusOk = mostrarConcluidas
      ? m.concluida
      : !m.concluida;

    return buscaOk && statusOk;
  });


  // Cards 
  const emManutencao = manutencoes.filter(
    (m) => !m.concluida
  ).length;

  const corretivas = manutencoes.filter(
    (m) =>
      m.tipo === "Corretiva" &&
      !m.concluida
  ).length;

  const concluidas = manutencoes.filter(
    (m) => m.concluida
  ).length;

  return (
    <LayoutUsuario
    tipoUsuario="adm"
    titulo="Manutenções"
    cargo="Admin"
    nome="Admin Sistema"
    notificacoes={[]}
    onLogout={() => console.log("logout")}
  >

        <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {erroApi && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {erroApi}
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
                      checked={mostrarConcluidas}
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
                        setPopupCadastroVisivel(true)
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
                defect={m.descricao_defeito}
                sentAt={m.data_abertura}
                finishedAt={m.data_conclusao}
                concluida={m.concluida}
                onComplete={() => abrirPopup(m.id)}
                onClick={
                  !m.concluida 
                    ? () => abrirEdicao(m) 
                    : undefined
                  }
                />
              ))
            )}
          </div>

          {popupVisivel && (
            <>
              <div
                className="fixed inset-0 bg-black/40 z-40"
                onClick={() =>
                  setPopupVisivel(false)
                }
              />

              <div className="fixed inset-0 flex items-center justify-center z-50">
                <PopUpConclusao
                  nomeEquipamento={nomeConcluido}
                  onFechar={() =>
                    setPopupVisivel(false)
                  }
                  onConfirmar={handleConcluir}
                />
              </div>
            </>
          )}

          {popupCadastroVisivel && (
            <>
              <div
                className="fixed inset-0 bg-black/40 z-40"
                onClick={() =>
                  setPopupCadastroVisivel(false)
                }
              />

              <div className="fixed inset-0 flex items-center justify-center z-50">
                <PopUpCadastrarEditarManutenção
                  modoEdicao={!!manutencaoEditando}
                  manutencao={manutencaoEditando}
                  onFechar={() => {
                  setPopupCadastroVisivel(false);
                  setManutencaoEditando(null);
                  }}
                  onSalvar={handleSalvarManutencao}
                />
              </div>
            </>
          )}
        </main>
      </LayoutUsuario>
  );
}