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
  placeholderStatus = "Todos os Status",       
  placeholderCategoria = "Todas as Categorias",
  extras
}) {
  
  const exibirStatus = listaStatus.length > 0
  const exibirCategorias = listaCategorias.length > 0

  return (
    <div className="py-9 px-6 bg-white border border-gray-200/80 rounded-xl shadow-xs flex items-center w-full">

      {/* Lado esquerdo */}
      <div className="flex items-center gap-6 flex-1">

        {/* Input de Texto */}
        <div className="relative w-full max-w-xs">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <IconeLupa />
          </div>

          <input
            type="text"
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            placeholder={placeholderTexto}
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 outline-none focus:border-[#1A6B74] focus:ring-1 focus:ring-[#1A6B74]"
          />
        </div>

        {/* Select de Status */}
        {exibirStatus && (
          <div className="relative w-48">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 outline-none focus:border-[#1A6B74] focus:ring-1 focus:ring-[#1A6B74] cursor-pointer"
            >
              <option value="">{placeholderStatus}</option>
              {listaStatus.map((item, index) => (
                <option key={index} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Select de Categoria */}
        {exibirCategorias && (
          <div className="relative w-48">
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 outline-none focus:border-[#1A6B74] focus:ring-1 focus:ring-[#1A6B74] cursor-pointer"
            >
              <option value="">{placeholderCategoria}</option>
              {listaCategorias.map((item, index) => (
                <option key={index} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Extras (Botões, etc) */}
        <div className="flex items-center gap-4 flex-1">
          {extras}
        </div>

      </div>

    </div>
  )
}