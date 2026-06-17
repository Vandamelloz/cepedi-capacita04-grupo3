import * as React from 'react'

// Ícones SVG nativos (Lápis e Lixo) iguais aos da imagem
const IconeEditar = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
)

const IconeDeletar = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

export default function TabelaGipar({ colunas, dados, onEditar, onDeletar }) {
  // Verifica se pelo menos uma ação foi fornecida para exibir a coluna
  const temAcoes = onEditar || onDeletar

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white">
      <table className="w-full text-sm text-left text-gray-600 border-collapse">
        
        {/* Cabeçalho */}
        <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b border-gray-200">
          <tr>
            {colunas.map((col, index) => (
              <th key={index} className={`px-6 py-3 font-semibold ${col.align === 'right' ? 'text-right' : ''}`}>
                {col.titulo}
              </th>
            ))}
            {temAcoes && <th className="px-6 py-3 text-center font-semibold w-24">Ações</th>}
          </tr>
        </thead>
        
        {/* Corpo da Tabela */}
        <tbody className="divide-y divide-gray-200">
          {dados.length === 0 ? (
            <tr>
              <td colSpan={colunas.length + (temAcoes ? 1 : 0)} className="px-6 py-10 text-center text-gray-400 bg-white">
                Nenhum dado encontrado.
              </td>
            </tr>
          ) : (
            dados.map((linha, indexLinha) => (
              <tr key={linha.id || indexLinha} className="hover:bg-gray-50/80 transition-colors bg-white">
                
                {colunas.map((col, indexCol) => (
                  <td 
                    key={indexCol} 
                    className={`px-6 py-4 ${col.align === 'right' ? 'text-right' : ''} ${col.className || ''}`}
                  >
                    {col.render ? col.render(linha[col.chave], linha) : linha[col.chave]}
                  </td>
                ))}

                {/* Coluna de Botões com Ícones Flutuantes */}
                {temAcoes && (
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3">
                      {onEditar && (
                        <button 
                          onClick={() => onEditar(linha)}
                          title="Editar"
                          className="p-1 text-gray-500 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors"
                        >
                          <IconeEditar />
                        </button>
                      )}
                      
                      {onDeletar && (
                        <button 
                          onClick={() => onDeletar(linha)}
                          title="Excluir"
                          className="p-1 text-red-500 hover:text-red-700 rounded-md hover:bg-red-50 transition-colors"
                        >
                          <IconeDeletar />
                        </button>
                      )}
                    </div>
                  </td>
                )}

              </tr>
            ))
          )}
        </tbody>

      </table>
    </div>
  )
}