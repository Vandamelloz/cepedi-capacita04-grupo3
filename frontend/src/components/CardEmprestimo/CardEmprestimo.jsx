import Botao from "../Botao";
import TituloPagina from "../TituloPagina";
import SubTitulo from "../SubTitulo";
import { Calendar, Clock, User, CheckCircle, RotateCcw, X, CheckSquare } from "lucide-react";
import StatusBadge from "../ui/StatusBadge";

export default function CardEmprestimo({ 
  id,
  equipamento, 
  patrimonio, 
  usuario, 
  status, 
  data, 
  dataDevolucao,
  dataDevolucaoReal, 
  onDevolver, 
  onRenovar, 
  onExcluir 
}) {
  
  const formatarData = (iso) => {
    if (!iso) return "--/--/----";
    try {
      return iso.split('T')[0].split('-').reverse().join('/');
    } catch {
      return "--/--/----";
    }
  };

  const corBorda = status === "Atrasado" 
    ? "border-red-500 border-2" 
    : "border-gray-200";

  return (
    <div className={`w-[390px] min-h-[300px] flex flex-col bg-white p-4 shadow-sm rounded-lg hover:shadow-md transition-all duration-300 ${corBorda}`}>
      
      <div className="flex-1 flex flex-col justify-evenly">
        <div className="flex items-start justify-between">
          <div>
            <TituloPagina>{equipamento || "Equipamento"}</TituloPagina>
            <SubTitulo>{patrimonio || "Sem patrimônio"}</SubTitulo>
          </div>
          <StatusBadge status={status} />
        </div>

        <div className="space-y-3 text-sm text-gray-600 my-2">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1 text-gray-400"><User size={14}/> Usuário:</span>
            <span className="font-semibold text-gray-900">{usuario || "Não informado"}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1 text-gray-400"><Calendar size={14}/> Retirada:</span>
            <span className="font-semibold">{formatarData(data)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1 text-gray-400"><Clock size={14}/> Devolução Prevista:</span>
            <span className={`font-semibold ${status === "Atrasado" ? "text-red-600" : "text-gray-900"}`}>
              {formatarData(dataDevolucao)}
            </span>
          </div>

          {status === "Concluído" && (
            <div className="flex justify-between items-center mt-2 border-t pt-2 border-gray-100">
              <span className="flex items-center gap-1 text-green-600"><CheckSquare size={14}/> Devolvido em:</span>
              <span className="font-semibold text-green-600">
                {formatarData(dataDevolucaoReal || dataDevolucao)}
              </span>
            </div>
          )}
        </div>
      </div>

      {status !== "Concluído" && status !== "Cancelado" && (
        <div className="border-t pt-3 flex items-center justify-evenly gap-2 mt-auto">
          <Botao 
            type="button"
            estilo="cancelar"
            onClick={() => {
              console.log("🔵 Botão Devolver clicado para ID:", id);
              onDevolver();
            }}
          >
            <CheckCircle size={14}/> Devolver
          </Botao>
          
          <Botao 
            type="button"
            estilo="cancelar"
            onClick={() => {
              console.log("🔵 Botão Renovar clicado para ID:", id);
              onRenovar();
            }}
          >
            <RotateCcw size={14}/> Renovar
          </Botao>
          
          <button 
            onClick={() => {
              console.log("🔴 Botão Excluir clicado para ID:", id);
              onExcluir();
            }} 
            className="p-2 hover:bg-red-50 rounded-full transition-colors flex items-center justify-center"
            title="Cancelar Empréstimo"
          >
            <X color="#ff0000" size={20}/>
          </button>
        </div>
      )}

    </div>
  );
}