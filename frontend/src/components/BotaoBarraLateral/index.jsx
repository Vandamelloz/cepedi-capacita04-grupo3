
export function BotaoBarraLateral({ label, labelClass, icon: Icon, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`bg-[#1E3A8A] w-full flex items-center gap-10 px-5 py-3 rounded-md transition-colors font-medium text-left
        ${isActive 
          ? 'bg-[#2563EB] text-white' 
          : 'text-white/70 hover:bg-white/10 hover:text-white' 
        }`}
    >
      {Icon && <Icon className="w-5 h-5" />}
      <span className={labelClass}>{label}</span>
    </button>
  );
}