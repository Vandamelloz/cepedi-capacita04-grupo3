const ESTILOS_STATUS = {
  
  Ativo: "bg-blue-100 text-blue-700",
  Atrasado: "bg-red-100 text-red-700",
  Concluído: "bg-green-100 text-green-700",
  Cancelado: "bg-gray-100 text-gray-600",

  "Disponível": "bg-green-100 text-green-700",
  "Emprestado": "bg-blue-100 text-blue-700",
  "Em Manutenção": "bg-amber-100 text-amber-700", 
  "Inativo": "bg-gray-100 text-gray-500",
};

export default function StatusBadge({ status }) {
  const classeCor = ESTILOS_STATUS[status] ?? "bg-gray-100 text-gray-700";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${classeCor}`}
    >
      {status}
    </span>
  );
}