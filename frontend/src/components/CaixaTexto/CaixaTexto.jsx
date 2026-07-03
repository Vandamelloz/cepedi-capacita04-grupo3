export default function CaixaTexto({label, id, placeholder, value, onChange}) {
  return (
    <>
      <label
        htmlFor={id}
      >
        {label}
      </label>

      <input
        type="text"
        id={id}
        value={value || ""}
        onChange={onChange}
        className="w-full h-10 bg-[#F3F4F6] border border-[#D1D5DB] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-[#6B7280]"
        placeholder={placeholder}
      />
    </>
  );
}