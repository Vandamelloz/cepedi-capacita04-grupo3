import LayoutUsuario from "../../layouts/usuario";
import PopUpCadastrarEditarEquipamento from "../../components/PopUpCadastrarEditarEquipamento";
import PopUpCadastrarEditarManutenção from "../../components/PopUpCadastrarEditarManutenção";
import PopUpCadastrarEditarUsuario from "../../components/PopUpCadastrarEditarUsuario";
import PopUpEmprestimo from "../../components/PopUpEmprestimo";
import PopUpConclusao from "../../components/PopupConclusao";
import PopUpExclusao from "../../components/PopUpExclusao";
import { use, useState } from "react";


export default function AdmDashboard() {
    return (
        <section className="h-screen w-full flex row ">
            <LayoutUsuario tipoUsuario="adm" titulo="Dashboard" cargo="Administrador" nome="John Doe">

                
                
            </LayoutUsuario>
        </section>  
    );
}