export default function CaixaTexto ({ label, id, placeholder }) {
    return (
           <div className="flex flex-col gap-1 w-full">
            <label htmlFor={id}>{label}</label>
            <input type="text" 
                id={id}
                className="w-full h-10 bg-[#F3F4F6] border border-[#D1D5DB] rounded-md px-3 py-2 placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={placeholder} 
            />
        </div>
    );
}