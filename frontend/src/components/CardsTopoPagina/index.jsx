import React from "react";

const corQuadradoIcone = {
  orange: { bg: "bg-orange-50",  icon: "text-orange-500" },
  red:    { bg: "bg-red-50",     icon: "text-red-500"    },
  green:  { bg: "bg-green-50",   icon: "text-green-500"  },
  blue:   { bg: "bg-blue-50",    icon: "text-blue-500"   },
};

// icones
export const WrenchIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

// Triângulo de alerta — Corretivas, Atrasos
export const AlertIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

// Círculo com check — Concluídas
export const CheckCircleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="m9 11 3 3L22 4" />
  </svg>
);

// Caixa/cubo — Itens Disponíveis
export const BoxIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5" />
    <path d="M12 22V12" />
  </svg>
);

// Setas — Itens Emprestados
export const ArrowsIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m17 4 4 4-4 4" />
    <path d="M3 8h18" />
    <path d="m7 20-4-4 4-4" />
    <path d="M21 16H3" />
  </svg>
);

export default function CardsTopoPagina({
  icon,
  label,
  count,
  color = "orange",
  highlight = false,
  countDestaque = false,
  onClick,
  ativo = false,
}) {
  const colors = corQuadradoIcone[color] ?? corQuadradoIcone.orange;
  const interativo = typeof onClick === "function";
  const Componente = interativo ? "button" : "div";

  return (
    <Componente
      type={interativo ? "button" : undefined}
      onClick={onClick}
      className={`
        flex items-center gap-3 sm:gap-4
        bg-white rounded-xl px-4 sm:px-6
        shadow-sm 
        min-h-[140px] sm:min-h-[140px] min-w-0 flex-1 py-3 sm:py-4
        text-left
        ${highlight && !ativo ? "border-2 border-orange-500" : "border border-gray-200"}
        ${ativo ? "border-2 border-[#2563EB] ring-1 ring-[#2563EB]/30" : ""}
        ${interativo ? "cursor-pointer transition-shadow hover:shadow-md" : ""}
      `}
      style={highlight && !ativo ? { borderColor: "#FF9900" } : {}}
    >
      {/* Quadrado colorido com o ícone */}
      <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-lg flex items-center justify-center shrink-0 ${colors.bg} ${colors.icon}`}>
        {icon}
      </div>

      <div className="flex min-w-0 flex-col gap-0.5 sm:gap-1">
        <span className="truncate text-xs font-medium text-gray-500 sm:text-sm">{label}</span>
        <span
          className={`text-xl font-bold leading-none sm:text-2xl ${
            countDestaque ? "text-red-600" : "text-gray-900"
          }`}
        >
          {count}
        </span>
      </div>
    </Componente>
  );
}
