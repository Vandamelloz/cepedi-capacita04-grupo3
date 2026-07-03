
export function BotaoBarraLateral({
  label,
  labelClass,
  icon: Icon,
  isActive,
  onClick,
  compact = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center rounded-lg font-medium transition-colors ${
        compact ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5 text-left"
      } ${
        isActive
          ? "bg-[#2563EB] text-white"
          : "text-white/70 hover:bg-white/10 hover:text-white"
      }`}
    >
      {Icon && <Icon className="h-5 w-5 shrink-0" />}
      <span className={`text-sm ${labelClass}`}>{label}</span>
    </button>
  );
}
