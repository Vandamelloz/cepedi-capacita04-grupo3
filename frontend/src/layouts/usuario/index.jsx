import BarraLateral from "../../components/BarraLateral";
import Cabecalho from "../../components/Cabecalho";


export default function LayoutUsuario({tipoUsuario , titulo, cargo, nome, children}) {
    return (
        <section className="h-screen w-full flex row ">
            <BarraLateral userRole={tipoUsuario} />
            <div className="bg-gray-100 w-full flex flex-col items-center justify-start gap-10 pl-5 pr-5">
                <Cabecalho titulo={titulo} cargo={cargo} nome={nome} />
                {children}
            </div>

        </section>  
    );
}