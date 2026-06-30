import * as React from 'react'

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

function IconeOrdenacao({ ativo, direcao }) {
  if (!ativo) {
    return (
      <svg className="ml-1 inline h-3 w-3 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M8 9l4-4 4 4M8 15l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  return (
    <svg className="ml-1 inline h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      {direcao === 'asc' ? (
        <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M12 5v14M19 12l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  )
}

export default function TabelaGipar({
  colunas,
  dados,
  onEditar,
  onDeletar,
  onLinhaClick,
  ordenacao,
  onOrdenarColuna,
}) {
  const temAcoes = onEditar || onDeletar

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white">
      <table className="w-full text-sm text-left text-gray-600 border-collapse">
        <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b border-gray-200">
          <tr>
            {colunas.map((col, index) => {
              const campoOrdenacao = col.campoOrdenacao ?? col.chave
              const ordenavel = col.ordenavel && onOrdenarColuna
              const ativo = ordenacao?.campo === campoOrdenacao

              return (
                <th
                  key={index}
                  className={`px-3 py-2.5 font-semibold sm:px-6 sm:py-3 ${col.align === 'right' ? 'text-right' : ''} ${col.thClassName || ''}`}
                >
                  {ordenavel ? (
                    <button
                      type="button"
                      onClick={() => onOrdenarColuna(campoOrdenacao)}
                      className="inline-flex items-center uppercase transition-colors hover:text-gray-800"
                    >
                      {col.titulo}
                      <IconeOrdenacao ativo={ativo} direcao={ordenacao?.direcao} />
                    </button>
                  ) : (
                    col.titulo
                  )}
                </th>
              )
            })}
            {temAcoes && <th className="w-24 px-3 py-2.5 text-center font-semibold sm:px-6 sm:py-3">Ações</th>}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200">
          {dados.length === 0 ? (
            <tr>
              <td colSpan={colunas.length + (temAcoes ? 1 : 0)} className="bg-white px-3 py-8 text-center text-gray-400 sm:px-6 sm:py-10">
                Nenhum dado encontrado.
              </td>
            </tr>
          ) : (
            dados.map((linha, indexLinha) => (
              <tr
                key={linha.id || indexLinha}
                onClick={onLinhaClick ? () => onLinhaClick(linha) : undefined}
                className={`bg-white transition-colors ${
                  onLinhaClick ? 'cursor-pointer hover:bg-blue-50/50' : 'hover:bg-gray-50/80'
                }`}
              >
                {colunas.map((col, indexCol) => (
                  <td
                    key={indexCol}
                    className={`px-3 py-3 sm:px-6 sm:py-4 ${col.align === 'right' ? 'text-right' : ''} ${col.className || ''}`}
                  >
                    {col.render ? col.render(linha[col.chave], linha) : linha[col.chave]}
                  </td>
                ))}

                {temAcoes && (
                  <td className="px-3 py-3 sm:px-6 sm:py-4">
                    <div className="flex items-center justify-center gap-3">
                      {onEditar && (
                        <button
                          onClick={(event) => {
                            event.stopPropagation()
                            onEditar(linha)
                          }}
                          title="Editar"
                          className="p-1 text-gray-500 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors"
                        >
                          <IconeEditar />
                        </button>
                      )}

                      {onDeletar && (
                        <button
                          onClick={(event) => {
                            event.stopPropagation()
                            onDeletar(linha)
                          }}
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
