function obterInicial(nome = "") {
  return nome.trim().charAt(0).toUpperCase() || "?";
}

export default function Avatar({ nome, tamanho = 36, className = "" }) {
  const tamanhoPx = typeof tamanho === "number" ? `${tamanho}px` : tamanho;

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-[#2563EB] font-semibold text-white ${className}`}
      style={{ width: tamanhoPx, height: tamanhoPx, fontSize: tamanho * 0.4 }}
      aria-hidden="true"
    >
      {obterInicial(nome)}
    </span>
  );
}
