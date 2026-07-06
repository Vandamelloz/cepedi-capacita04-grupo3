export default function DataSelecao({
  id,
  label,
  value,
  onChange,
  disabled=false
}) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label htmlFor={id}>
        {label}
      </label>

      <input
        type="date"
        id={id}
        value={value || ""}
        onChange={onChange}
        disabled={disabled}
        className="w-full h-10 bg-[#F3F4F6] border border-[#D1D5DB] rounded-md px-3 py-2 text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}