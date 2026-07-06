export default function EstadoVazio({ mensagem = "Nenhum item encontrado" }) {
  return (
    <div className="w-full rounded-xl border border-gray-200 bg-white p-10 text-center">
      <p className="text-sm text-gray-500">{mensagem}</p>
    </div>
  );
}
