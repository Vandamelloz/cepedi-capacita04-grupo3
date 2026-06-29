export default function CaixaTexto ({ label, id, placeholder, defaultValue = "" }) {
    return (
        <>
            <label className=" text-[14px]" htmlFor={id}>{label}</label>
            <input 
                type="text" 
                id={id}
                className="w-full h-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                placeholder={placeholder} 
                defaultValue={defaultValue}
            />
        </>
    )}