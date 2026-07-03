import * as React from 'react'

const IconeLupa = () => (
  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

export default function CampoPesquisa({ 
  termo, setTermo, 
  status, setStatus, 
  categoria, setCategoria,
  listaCategorias = [],
  listaStatus = [],
  placeholderTexto = "Buscar por nome ou patrimônio...",
  placeholderStatus = "Todos Status",       
  placeholderCategoria = "Todas Categorias",
  extras
}) {
  
  const exibirStatus = listaStatus.length > 0
  const exibirCategorias = listaCategorias.length > 0

return (
  <div className="py-9 px-6 bg-white border border-gray-200/80 rounded-xl shadow-xs flex items-center w-full">

    {/* Lado esquerdo */}
    <div className="flex items-center gap-6 flex-1">

      {/* Input */}
      <div className="relative w-full max-w-xs">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <IconeLupa />
        </div>

        <input
          type="text"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder={placeholderTexto}
          className="w-full pl-9 pr-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400"
        />
      </div>

      {/* Status */}
      {exibirStatus && (
        <div className="relative">
          <select>
            ...
          </select>
        </div>
      )}

      {/* Categoria */}
      {exibirCategorias && (
        <div className="relative">
          <select>
            ...
          </select>
        </div>
      )}

      {/* Extras */}
      <div className="flex items-center gap-4 flex-1">
        {extras}
      </div>

    </div>

  </div>
)
}