import { AlertTriangle } from "lucide-react";

/**
 * Banner de alerta genérico.
 *
 * Props:
 * - titulo: string
 * - descricao: string
 * - variante: "erro" | "aviso" (default: "erro")
 */
export default function AlertaBanner({ titulo, descricao, variante = "erro" }) {
  const estilos = {
    erro: {
      wrapper: "border-red-200 bg-red-50",
      icone: "text-red-500",
      titulo: "text-red-700",
      descricao: "text-red-600",
    },
    aviso: {
      wrapper: "border-amber-200 bg-amber-50",
      icone: "text-amber-500",
      titulo: "text-amber-700",
      descricao: "text-amber-600",
    },
  }[variante];

  return (
    <div className={`flex items-start gap-3 rounded-xl border p-5 ${estilos.wrapper}`}>
      <AlertTriangle className={`h-5 w-5 shrink-0 mt-0.5 ${estilos.icone}`} />
      <div>
        <p className={`font-semibold ${estilos.titulo}`}>{titulo}</p>
        {descricao && <p className={`text-sm ${estilos.descricao}`}>{descricao}</p>}
      </div>
    </div>
  );
}
