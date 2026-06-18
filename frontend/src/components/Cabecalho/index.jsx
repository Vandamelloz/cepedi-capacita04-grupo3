import TituloPagina from "../TituloPagina";

export default function Cabecalho({ titulo, cargo, nome}) {
  return (
    <header className="w-100 h-[60px] bg-gray-100 flex justify-around items-center text-center gap-[200px] p-4">
      <TituloPagina>{titulo}</TituloPagina>
      <p>BEM VINDO, {cargo} {nome}</p>
    </header>
  );
}