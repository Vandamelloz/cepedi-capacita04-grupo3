import Botao from "../Botao";
import TituloPagina from "../TituloPagina";
import SubTitulo from "../SubTitulo";
import { Calendar, Clock, User, CheckCircle, RotateCcw, X, CheckSquare } from "lucide-react";
import StatusBadge from "../ui/StatusBadge";

export default function CardEmprestimo({ 
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
  
  const formatarData = (iso) => iso ? iso.split('T')[0].split('-').reverse().join('/') : "--/--/----";

  // Lógica para deixar a borda vermelha se estiver atrasado
  const corBorda = status === "Atrasado" 
    ? "border-red-500 border-2" 
    : "border-gray-200";

  return (
    <div className={`w-[390px] min-h-[300px] flex flex-col bg-white p-4 shadow-sm rounded-lg hover:shadow-md transition-all duration-300 ${corBorda}`}>
      
      <div className="flex-1 flex flex-col justify-evenly">
        <div className="flex items-start justify-between">
          <div>
            <TituloPagina>{equipamento}</TituloPagina>
            <SubTitulo>{patrimonio}</SubTitulo>
          </div>
          <StatusBadge status={status} />
        </div>

        <div className="space-y-3 text-sm text-gray-600 my-2">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1 text-gray-400"><User size={14}/> Usuário:</span>
            <span className="font-semibold text-gray-900">{usuario}</span>
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

          {/* Adiciona a linha da devolução apenas quando o status for concluído */}
          {status === "Concluído" && (
            <div className="flex justify-between items-center mt-2 border-t pt-2 border-gray-100">
              <span className="flex items-center gap-1 text-green-600"><CheckSquare size={14}/> Devolvido em:</span>
              <span className="font-semibold text-green-600">
                {/* Fallback: se não existir dataDevolucaoReal, mostra a data de previsão que foi atualizada */}
                {formatarData(dataDevolucaoReal || dataDevolucao)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Os botões só aparecem se o empréstimo ainda não tiver sido concluído ou cancelado */}
      {status !== "Concluído" && status !== "Cancelado" && (
        <div className="border-t pt-3 flex items-center justify-evenly gap-2 mt-auto">
          <Botao 
            type="button"
            estilo="cancelar"
            onClick={onDevolver}
          >
            <CheckCircle size={14}/> Devolver
          </Botao>
          
          <Botao 
            type="button"
            estilo="cancelar"
            onClick={onRenovar}
          >
            <RotateCcw size={14}/> Renovar
          </Botao>
          
          <button 
            onClick={onExcluir} 
            className="p-2 hover:bg-red-50 rounded-full transition-colors flex items-center justify-center"
            title="Excluir Empréstimo"
          >
            <X color="#ff0000" size={20}/>
          </button>
        </div>
      )}

    </div>
  );
}