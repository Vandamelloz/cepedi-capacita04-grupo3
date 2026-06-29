export default function CaixaSelecao({ label, id, opcoes, placeholder, defaultValue = "" }) {
  return (
    <div className="flex flex-col gap-1 w-full text-left">

      {label && (
        <label className=" text-[14px]" htmlFor={id}>
          {label}
        </label>
      )}

      <select
        id={id}
        defaultValue={defaultValue}
        className="w-full h-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        
        <option className=" text-[10px] font-ligth" value="" disabled>
          {placeholder}
        </option>
        
        {opcoes && opcoes.map((opcao, index) => (
          <option key={index} value={opcao.valor}>
            {opcao.texto}
          </option>
        ))}
      </select>
    </div>
  );
}