import { CheckCircle2, XCircle, Wrench } from "lucide-react";

const STATUS_CONFIG = {
  Disponível: {
    Icone: CheckCircle2,
    icone: "text-green-500",
    badge: "bg-green-50 text-green-700",
  },
  Emprestado: {
    Icone: XCircle,
    icone: "text-blue-400",
    badge: "bg-blue-50 text-blue-600",
  },
  "Em Manutenção": {
    Icone: Wrench,
    icone: "text-amber-500",
    badge: "bg-amber-50 text-amber-600",
  },
};

export default function CardEquipamento({ nome, patrimonio, descricao, status }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG["Disponível"];
  const Icone = config.Icone;
  const indisponivel = status !== "Disponível";

  return (
    <div
      className={`rounded-xl border bg-white p-5 ${
        indisponivel ? "border-gray-100 opacity-80" : "border-gray-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-gray-900">{nome}</h3>
          <p className="text-sm text-gray-500">{patrimonio}</p>
        </div>
        <Icone className={`h-5 w-5 shrink-0 ${config.icone}`} />
      </div>

      {descricao && <p className="mt-3 text-sm text-gray-500">{descricao}</p>}

      <span
        className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-medium ${config.badge}`}
      >
        {status}
      </span>
    </div>
  );
}
