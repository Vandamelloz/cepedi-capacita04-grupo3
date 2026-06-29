import LayoutUsuario from "../../layouts/usuario";



export default function AdmDashboard() {
    return (
        <section className="h-screen w-full flex row ">
            <LayoutUsuario tipoUsuario="adm" titulo="Dashboard" cargo="Administrador" nome="John Doe">

            </LayoutUsuario>
        </section>  
    );
}