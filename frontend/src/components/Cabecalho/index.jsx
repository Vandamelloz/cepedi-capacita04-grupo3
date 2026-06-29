import TituloPagina from "../TituloPagina";

export default function Cabecalho({ titulo, cargo, nome }) {
  return (
    <header className="w-full h-[60px] bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <TituloPagina>{titulo}</TituloPagina>
      <p className="text-sm text-gray-600">Bem-vindo, <span className="font-semibold text-gray-900">{cargo} {nome}</span></p>
    </header>
  );
}