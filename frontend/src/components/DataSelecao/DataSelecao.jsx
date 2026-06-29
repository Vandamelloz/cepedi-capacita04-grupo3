export default function DataSelecao({ id, label }) { 
    return (
        <div className="w-full flex items-center justify-start gap-4">
            <label htmlFor={id}>{label}</label>
            <input
                type="date"
                id={id}
                className="w-auto h-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
        </div>
    );
}   