import TituloPagina from "../TituloPagina";
import SubTitulo from "../SubTitulo";
import { Calendar, Clock, AlertTriangle } from "lucide-react";
import StatusBadge from "../ui/StatusBadge";

export default function CardEmprestimoAluno({
  equipamento,
  patrimonio,
  status,
  data,
  dataDevolucao,
  diasAtraso = 0,
  onClick,
}) {
  const formatarData = (iso) =>
    iso ? iso.split("T")[0].split("-").reverse().join("/") : "--/--/----";

  const emAtraso = status === "Atrasado" || diasAtraso > 0;
  const corBorda = emAtraso ? "border-red-500 border-2" : "border-gray-200";

  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`w-full min-h-[220px] flex flex-col bg-white p-4 text-left shadow-sm rounded-lg transition-all duration-300 ${corBorda} ${
        onClick ? "hover:shadow-md cursor-pointer" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <TituloPagina>{equipamento}</TituloPagina>
          <SubTitulo>{patrimonio}</SubTitulo>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="space-y-3 text-sm text-gray-600 my-4">
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1 text-gray-400">
            <Calendar size={14} /> Retirada:
          </span>
          <span className="font-semibold text-gray-900">{formatarData(data)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1 text-gray-400">
            <Clock size={14} /> Devolução:
          </span>
          <span className={`font-semibold ${emAtraso ? "text-red-600" : "text-gray-900"}`}>
            {formatarData(dataDevolucao)}
          </span>
        </div>
      </div>

      {emAtraso && (
        <div className="mt-auto flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertTriangle size={16} className="shrink-0" />
          <span>{diasAtraso} dias de atraso</span>
        </div>
      )}
    </Wrapper>
  );
}
