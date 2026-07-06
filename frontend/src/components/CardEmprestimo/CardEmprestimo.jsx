import { Calendar, Clock, AlertTriangle } from "lucide-react";
import StatusBadge from "../ui/StatusBadge";

/**
 * Card de um empréstimo — usado tanto em "Empréstimos Ativos" quanto em "Histórico".
 *
 * Props:
 * - equipamento: string (ex: "Kit Arduino Completo")
 * - patrimonio: string (ex: "PAT-005")
 * - status: string a ser repassado pro StatusBadge (ex: "atrasado", "em_dia", "devolvido")
 * - dataRetirada: string já formatada (ex: "19/05/2024")
 * - dataDevolucao: string já formatada (ex: "02/06/2024")
 * - diasAtraso: number opcional — se > 0, mostra o aviso de atraso
 * - onClick: função opcional — se passada, o card fica clicável (ex: abrir modal de detalhes)
 */
export default function CardEmprestimo({
  equipamento,
  patrimonio,
  status,
  dataRetirada,
  dataDevolucao,
  diasAtraso = 0,
  onClick,
}) {
  const emAtraso = status === "Atrasado" || diasAtraso > 0;

  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`w-full rounded-xl border bg-white p-5 text-left transition-shadow
        ${emAtraso ? "border-red-300" : "border-gray-200"}
        ${onClick ? "hover:shadow-md cursor-pointer" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-gray-900">{equipamento}</h3>
          <p className="text-sm text-gray-500">{patrimonio}</p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="mt-4 space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>
            Retirada: <span className="font-medium text-gray-900">{dataRetirada}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-400" />
          <span>
            Devolução: <span className="font-medium text-gray-900">{dataDevolucao}</span>
          </span>
        </div>
      </div>

      {emAtraso && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{diasAtraso} dias de atraso</span>
        </div>
      )}
    </Wrapper>
  );
}