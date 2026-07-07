export default function CaixaSelecao({label, id, opcoes, defaultValue, placeholder, onChange, disabled = false}) {
  return (
    <div className="flex flex-col gap-1 w-full text-left">
      {label && (
        <label htmlFor={id}>
          {label}
        </label>
      )}

      <select
        id={id}
        name={id}
        defaultValue={defaultValue || ""}
        onChange={onChange}
        disabled={disabled}
        required
        className={`w-full h-10 bg-[#F3F4F6] border border-[#D1D5DB] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          !defaultValue
            ? "text-[#6B7280]"
            : "text-gray-900"
        }`}
      >
        <option value="" disabled>
          {placeholder}
        </option>

        {opcoes?.map((opcao, index) => (
          <option
            key={index}
            value={opcao.valor}
            className="text-gray-900"
          >
            {opcao.texto}
          </option>
        ))}
      </select>
    </div>
  );
}