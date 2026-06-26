export default function CaixaSelecao({ label, id, opcoes, placeholder }) {
  return (
    <div className="flex flex-col gap-1 w-full text-left">

      {label && (
        <label htmlFor={id}>
          {label}
        </label>
      )}

      <select
        id={id}
        defaultValue=""
        className="w-full h-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        
        <option value="" disabled>
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