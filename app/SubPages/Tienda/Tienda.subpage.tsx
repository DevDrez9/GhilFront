import { useState } from "react";
import TiendaForm from "~/formularios/TiendaForm/TiendaForm.form";


export default function Tienda() {
    const [mostrarForm, setMostrarForm] = useState(true);
     const handleNuevo = () => {
    setMostrarForm(!mostrarForm);
  };

    
    return (<>
        <TiendaForm onClose={()=>{}} visible={mostrarForm}/>
    </>)
}