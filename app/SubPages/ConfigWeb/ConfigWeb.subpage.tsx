import { useState } from "react";
import ConfigWebForm from "~/formularios/ConfigWeb/ConfigWeb.form";

export default function ConfigWeb() {
    const [mostrarForm, setMostrarForm] = useState(true);
     const handleNuevo = () => {
    setMostrarForm(!mostrarForm);
  };

    
    return (<>
        <ConfigWebForm onClose={()=>{}} visible={mostrarForm}/>
    </>)
}