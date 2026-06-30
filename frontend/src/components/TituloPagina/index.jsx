export default function TituloPagina({ children, className = "" }) {
  return (
    <h1
      className={`text-lg font-semibold leading-tight text-[#111827] sm:text-[20px] sm:leading-[28px] ${className}`.trim()}
    >
      {children}
    </h1>
  );
}
