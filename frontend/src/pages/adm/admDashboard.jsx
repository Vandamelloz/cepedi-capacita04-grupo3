import BarraLateral from "../../components/BarraLateral";
import Cabecalho from "../../components/Cabecalho";

export default function AdmDashboard() {
    return (
        <section className="h-screen w-full flex row ">
            <BarraLateral userRole="adm" />
            <div className=" w-full flex col items-top justify-center">
                <Cabecalho titulo="Dashboard" cargo="Administrador" nome="John Doe" />

            </div>
        </section>  
    );
}