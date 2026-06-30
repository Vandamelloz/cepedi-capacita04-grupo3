import StatusBadge from "../../components/ui/StatusBadge";

const CELULA_OCULTA_MOBILE = "hidden md:table-cell";

export const COLUNAS_EMPRESTIMOS = [
  {
    titulo: "Equipamento",
    chave: "equipamento",
    className: "font-medium text-gray-900 max-w-[140px] sm:max-w-none",
    ordenavel: true,
  },
  {
    titulo: "Usuário",
    chave: "usuario",
    className: `${CELULA_OCULTA_MOBILE} text-gray-600`,
    thClassName: CELULA_OCULTA_MOBILE,
    ordenavel: true,
  },
  {
    titulo: "Data",
    chave: "dataFormatada",
    className: "text-gray-600 whitespace-nowrap",
    ordenavel: true,
    campoOrdenacao: "data",
  },
  {
    titulo: "Status",
    chave: "status",
    ordenavel: true,
    render: (valor) => <StatusBadge status={valor} />,
  },
];
