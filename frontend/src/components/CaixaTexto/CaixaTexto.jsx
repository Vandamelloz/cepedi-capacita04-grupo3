import { useState } from "react";

// O mesmo ícone do seu Login!
function IconeOlho({ visivel }) {
  if (visivel) {
    return (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default function CaixaTexto({ label, id, placeholder, type = "text", defaultValue, disabled = false }) {
  // Estado para controlar se a senha aparece ou não
  const [mostrarSenha, setMostrarSenha] = useState(false);

  // Se o tipo for "password", alternamos entre "text" e "password". Se não for, segue normal.
  const tipoInput = type === "password" ? (mostrarSenha ? "text" : "password") : type;

  return (
    <div className="flex flex-col gap-1 w-full text-left">
      <label htmlFor={id}>
        {label}
      </label>

      {/* Container "relative" para podermos posicionar o olho solto no lado direito */}
      <div className="relative">
        <input
          type={tipoInput}
          id={id}
          name={id}
          defaultValue={defaultValue}
          disabled={disabled}
          // Se for senha, adicionamos "pr-10" (padding-right) para o texto não encostar no olho
          className={`w-full h-10 bg-[#F3F4F6] border border-[#D1D5DB] rounded-md pl-3 ${type === "password" ? "pr-10" : "pr-3"} py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-[#6B7280]`}
          placeholder={placeholder}
        />
        
        {/* Renderiza o botão do olho APENAS se o type for password */}
        {type === "password" && (
          <button
            type="button"
            onClick={() => setMostrarSenha(!mostrarSenha)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] transition-colors hover:text-[#6B7280] focus:outline-none"
            title={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
          >
            <IconeOlho visivel={mostrarSenha} />
          </button>
        )}
      </div>
    </div>
  );
}