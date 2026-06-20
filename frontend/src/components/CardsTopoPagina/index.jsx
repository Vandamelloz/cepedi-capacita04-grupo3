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
}) {
  const colors = corQuadradoIcone[color] ?? corQuadradoIcone.orange;

  return (
    <div
      className={`
        flex items-center gap-4
        bg-white rounded-xl px-6
        shadow-sm 
        flex-1 min-w-[200px] h-[130px]
        ${highlight ? "border-2 border-orange-500" : "border border-gray-200"}
      `}
      style={highlight ? { borderColor: "#FF9900" } : {}}
    >
      {/* Quadrado colorido com o ícone */}
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${colors.bg} ${colors.icon}`}>
        {icon}
      </div>

      {/* Label em cima, número em baixo */}
      <div className="flex flex-col gap-1">
        <span className="text-sm text-gray-500 font-medium">{label}</span>
        <span className="text-2xl font-bold text-gray-900 leading-none">{count}</span>
      </div>
    </div>
  );
}
