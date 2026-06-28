import { useState } from "react";
import Sidebar from "../../components/BarraLateral";
import Cabecalho from "../../components/Cabecalho";
import SummaryCard, { WrenchIcon, AlertIcon, CheckCircleIcon } from "../../components/CardsTopoPagina";
import CardManutencao from "../../components/CardsManutencao";
import CampoPesquisa from '../../components/Pesquisa/Pesquisa'
import Botao from "../../components/Botao";
import dadosIniciais from "./manutencoes.json";
import PopUpConclusao from "../../components/PopupConclusao";
import PopUpCadastrarEditarManutenção from "../../components/PopUpCadastrarEditarManutenção";

export default function Manutencoes({ userRole, cargo, nome }) {
  const [manutencoes, setManutencoes] = useState(dadosIniciais);
  const [termo, setTermo] = useState("");
  const [mostrarConcluidas, setMostrarConcluidas] = useState(false);
  const [popupVisivel, setPopupVisivel] = useState(false);      
  const [nomeConcluido, setNomeConcluido] = useState(""); 
  const [idSelecionado, setIdSelecionado] = useState(null);
  const [popupCadastroVisivel, setPopupCadastroVisivel] = useState(false);

// Abre o popup ao clicar no card
const abrirPopup = (id) => {
  const manutencao = manutencoes.find((m) => m.id === id);
  setNomeConcluido(manutencao.name);
  setIdSelecionado(id);
  setPopupVisivel(true);
};

// Confirma a conclusão
const handleConcluir = () => {
  setManutencoes((prev) =>
    prev.map((m) => (m.id === idSelecionado ? { ...m, concluida: true } : m))
  );
  setPopupVisivel(false);
};
  
  const manutencoesFiltradas = manutencoes.filter((m) => {
    const buscaOk = m.name.toLowerCase().includes(termo.toLowerCase()) ||
                    m.pat.toLowerCase().includes(termo.toLowerCase());
    const statusOk = mostrarConcluidas ? true : !m.concluida;
    return buscaOk && statusOk;
  });

  const emManutencao = manutencoes.filter((m) => !m.concluida).length;
  const corretivas   = manutencoes.filter((m) => m.type === "Corretiva" && !m.concluida).length;
  const concluidas   = manutencoes.filter((m) => m.concluida).length;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* ── Barra lateral ── */}
      <Sidebar userRole={userRole} />

     {/* ── Área direita: cabeçalho + conteúdo ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── Cabeçalho ── */}
        <Cabecalho titulo="Manutenções" cargo={cargo} nome={nome} />

      {/* ── Conteúdo principal ── */}
      <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">

        {/* ── Cards de resumo ── */}
        <div className="flex gap-4 flex-wrap">
          <SummaryCard icon={<WrenchIcon />}      label="Em Manutenção" count={emManutencao} color="orange" />
          <SummaryCard icon={<AlertIcon />}       label="Corretivas"    count={corretivas}   color="red"    />
          <SummaryCard icon={<CheckCircleIcon />} label="Concluídas"    count={concluidas}   color="green"  />
        </div>

{/* Barra de pesquisa + checkbox + botão */}
<div className="w-full">
  <CampoPesquisa
  termo={termo}
  setTermo={setTermo}
  placeholderTexto="Buscar por equipamento..."
  listaStatus={[]}
  listaCategorias={[]}
  extras={
    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={mostrarConcluidas}
        onChange={(e) => setMostrarConcluidas(e.target.checked)}
        className="w-4 h-4 rounded border-gray-300 cursor-pointer"
      />
      Mostrar concluídas
    </label>
  }
>
  <div className="ml-auto">
     <Botao
        estilo="novo"
        icone
        onClick={() => setPopupCadastroVisivel(true)}
>
      Registrar Manutenção
      </Botao>
    </div>
  </CampoPesquisa>
  </div>

        {/* Cards de manutenção */}
        <div className="flex gap-4 w-full">
          {manutencoesFiltradas.length === 0 ? (
            <p className="text-gray-400 text-sm">Nenhuma manutenção encontrada.</p>
          ) : (
            manutencoesFiltradas.map((m) => (
              <CardManutencao
                key={m.id}
                name={m.name}
                pat={m.pat}
                type={m.type}
                defect={m.defect}
                sentAt={m.sentAt}
                concluida={m.concluida}
                onComplete={() => abrirPopup(m.id)}
              />
            ))
          )}
        </div>

  {popupVisivel && (
  <>
    {/* Overlay escuro */}
    <div
      className="fixed inset-0 bg-black/40 z-40"
      onClick={() => setPopupVisivel(false)}
    />

    {/* Popup centralizado */}
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <PopUpConclusao
        nomeEquipamento={nomeConcluido}
        onFechar={() => setPopupVisivel(false)}
        onConfirmar={() => {
          handleConcluir(idSelecionado);
          setPopupVisivel(false);
        }}
      />
    </div>
  </>
)}

{popupCadastroVisivel && (
  <>
    {/* Overlay */}
    <div
      className="fixed inset-0 bg-black/40 z-40"
      onClick={() => setPopupCadastroVisivel(false)}
    />

    {/* Popup */}
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <PopUpCadastrarEditarManutenção
        modoEdicao={false}
        onFechar={() => setPopupCadastroVisivel(false)}
      />
    </div>
  </>
)}
</main>
      </div>
    </div>
  );
}