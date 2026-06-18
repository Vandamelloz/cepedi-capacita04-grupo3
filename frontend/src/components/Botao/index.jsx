export default function Botao({
  children,
  onClick,
  type = "button",
  estilo = "salvar",
  icone = false,
}) {

  const estilos = {
  novo: "bg-[#1E3A8A] text-white hover:bg-[#1a9716]",
  registrar: "bg-[#1E3A8A] text-white hover:bg-[#1a9716]",
  salvar: "bg-[#1E3A8A] text-white hover:bg-[#1a9716]",
  concluir: "bg-[#479910] text-white hover:bg-[#1a9716]",
  cancelar: "bg-[#F3F4F6] text-[#111827] border border-[#D1D5DB] hover:bg-[#E5E7EB]",
  excluir: "bg-[#EF4444] text-white hover:bg-red-700"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center gap-2 h-[38px] px-[12px] rounded-[8px] outline-none text-[14px] font-medium font-inter transition-colors ${estilos[estilo]}`}
    >
      {icone && (
        <span className="w-4 h-4 flex items-center justify-center text-[16px] leading-none">
          +
        </span>
      )}

      {children}
    </button>
  );
}