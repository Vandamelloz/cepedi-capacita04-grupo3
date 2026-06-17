import * as React from 'react'
import TituloPagina from '../TituloPagina/index' 

export default function CabecalhoModulo({ titulo, descricao }) {
  return (
    <div className="mb-6">
      
      <TituloPagina>{titulo}</TituloPagina>
      
      
      {descricao && (
        <p className="text-sm text-gray-500 mt-1">
          {descricao}
        </p>
      )}
    </div>
  )
}