import { useCallback, useEffect, useState } from "react";
import { Download, Eye, FileText } from "lucide-react";
import LayoutUsuario from "../../layouts/usuario/LayoutUsuario";
import CaixaSelecao from "../../components/CaixadeSelecao/CaixadeSelecao";
import DataSelecao from "../../components/DataSelecao/DataSelecao";
import Botao from "../../components/Botao";
import TabelaGipar from "../../components/tabelaGipar/TabelaGipar";
import StatusBadge from "../../components/ui/StatusBadge";
import EstadoVazio from "../../components/EstadoVazio/EstadoVazio";
import { TIPOS_RELATORIO } from "../../constants/relatorios.constants";
import {
  buscarDadosRelatorio,
  obterLabelTipoRelatorio,
} from "../../services/relatorios/relatorios.service";

const COLUNAS_RELATORIO = [
  { titulo: "Nome", chave: "nome", className: "font-semibold text-gray-900" },
  { titulo: "Categoria", chave: "categoria", className: "text-gray-500" },
  {
    titulo: "Patrimônio",
    chave: "patrimonio",
    className: "font-mono text-xs text-gray-600",
  },
  {
    titulo: "Status",
    chave: "status",
    render: (valor) => <StatusBadge status={valor} />,
  },
];

export default function Relatorios() {
  const [tipoRelatorio, setTipoRelatorio] = useState("inventario-completo");
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");
  const [dadosPreview, setDadosPreview] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [previewGerada, setPreviewGerada] = useState(false);
  const [tipoRelatorioPreview, setTipoRelatorioPreview] = useState("inventario-completo");

  const labelRelatorio = obterLabelTipoRelatorio(tipoRelatorioPreview);

  const gerarPreview = useCallback(async () => {
    if (dataInicial && dataFinal && dataInicial > dataFinal) {
      setErro("A data inicial não pode ser posterior à data final.");
      return;
    }

    setErro("");
    setCarregando(true);

    try {
      const dados = await buscarDadosRelatorio({
        tipo: tipoRelatorio,
        dataInicial,
        dataFinal,
      });
      setDadosPreview(dados);
      setTipoRelatorioPreview(tipoRelatorio);
      setPreviewGerada(true);
    } catch {
      setErro("Não foi possível gerar a pré-visualização. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }, [tipoRelatorio, dataInicial, dataFinal]);

  useEffect(() => {
    
    // eslint-disable-next-line react-hooks/set-state-in-effect
    gerarPreview();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <LayoutUsuario titulo="Relatórios">
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 xl:grid-cols-[minmax(280px,360px)_1fr] xl:gap-6">
          <article className="flex flex-col gap-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <header className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#1A6B74]" aria-hidden="true" />
              <h2 className="text-base font-semibold text-[#111827] sm:text-lg">
                Gerar Relatório
              </h2>
            </header>

            <CaixaSelecao
              label="Tipo de Relatório"
              id="tipo-relatorio"
              placeholder="Selecione o tipo"
              value={tipoRelatorio}
              onChange={(event) => setTipoRelatorio(event.target.value)}
              opcoes={TIPOS_RELATORIO}
            />

            <div className="flex flex-col gap-3">
              <span className="text-sm font-medium text-[#111827]">
                Período (opcional)
              </span>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DataSelecao
                  id="data-inicial"
                  label="Data Inicial"
                  value={dataInicial}
                  onChange={(event) => setDataInicial(event.target.value)}
                />
                <DataSelecao
                  id="data-final"
                  label="Data Final"
                  value={dataFinal}
                  onChange={(event) => setDataFinal(event.target.value)}
                />
              </div>
            </div>

            {erro && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {erro}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <div className="w-full [&_button]:w-full">
                <Botao estilo="novo" onClick={gerarPreview} disabled={carregando}>
                  <Eye className="h-4 w-4" aria-hidden="true" />
                  {carregando ? "Carregando..." : "Pré-visualizar"}
                </Botao>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Botao estilo="cancelar" disabled>
                  <Download className="h-4 w-4" aria-hidden="true" />
                  PDF
                </Botao>
                <button
                  type="button"
                  disabled
                  className="flex h-[38px] items-center justify-center gap-2 rounded-lg bg-orange-500 px-3 text-sm font-medium text-white opacity-60 transition-colors"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  CSV
                </button>
              </div>
            </div>
          </article>

          <article className="flex min-h-[320px] flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <header>
              <h2 className="text-base font-semibold text-[#111827] sm:text-lg">
                Pré-visualização: {labelRelatorio}
              </h2>
            </header>

            {carregando && (
              <div className="flex flex-1 items-center justify-center py-12 text-sm text-gray-500">
                <div className="mr-3 h-6 w-6 animate-spin rounded-full border-2 border-[#1A6B74] border-t-transparent" />
                Gerando pré-visualização...
              </div>
            )}

            {!carregando && previewGerada && dadosPreview.length === 0 && (
              <EstadoVazio mensagem="Nenhum registro encontrado para os filtros selecionados." />
            )}

            {!carregando && previewGerada && dadosPreview.length > 0 && (
              <TabelaGipar colunas={COLUNAS_RELATORIO} dados={dadosPreview} />
            )}
          </article>
        </div>
      </main>
    </LayoutUsuario>
  );
}
