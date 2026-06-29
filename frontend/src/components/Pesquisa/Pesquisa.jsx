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
   <div className="py-7 px-6 bg-white border border-gray-200/80 rounded-xl shadow-xs flex items-center gap-6 w-full">

      {/* 1. Input de Texto */}
      <div className="relative w-full max-w-xs">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <IconeLupa />
        </div>
        <input
          type="text"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder={placeholderTexto} // 🌟 Ficou dinâmico!
          className="w-full pl-9 pr-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
        />
      </div>

      {/* 2. Select de Status */}
      {exibirStatus && (
        <div className="relative">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="appearance-none pl-3 pr-8 py-1.5 text-sm bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs cursor-pointer"
          >
            
            <option value="">{placeholderStatus}</option>
            {listaStatus.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-gray-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      )}

      {/* 3. Select de Categorias */}
      {exibirCategorias && (
        <div className="relative">
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="appearance-none pl-3 pr-8 py-1.5 text-sm bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs cursor-pointer"
          >
            {/* 🌟 Agora exibe a propriedade dinâmica */}
            <option value="">{placeholderCategoria}</option>
            {listaCategorias.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-gray-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      )}
      {extras}
    </div>
  )
}