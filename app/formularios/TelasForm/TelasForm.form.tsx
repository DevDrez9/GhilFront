import { useState } from "react";
import "./TelasForm.style.css";
import Switch1 from "~/componentes/switch1";
import InputText1 from "~/componentes/InputText1";
import Boton1 from "~/componentes/Boton1";
import { useProveedores } from "~/hooks/useProveedores";
import { useTelas } from "~/hooks/useTelas";

interface TelasFormProps {
  visible: boolean;
  onClose: () => void;
}

const TelasForm: React.FC<TelasFormProps> = ({ visible, onClose, }) => {


  const { createTela, isCreating, createError } = useTelas();

 
  const containerClasses = [
    "contenedorFormTelas",
    visible ? "visible" : "noVisible",
  ]
    .filter(Boolean)
    .join(" ");

  const [formDataTelas, setFormData] = useState({
     nombreComercial: "",
  tipoTela:"",
  composicion:"",
  gramaje: 0,
  acabado:"",
  rendimiento: 0,
  colores:"",
  nota:"",
  estado:"ACTIVA",
  proveedorId: 0,
  parametrosFisicosId: 0
  });
  const handleSwitchChange = (field: string, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const handleChange = (field: string, value: string | boolean) => {
    setFormData({
      ...formDataTelas,
      [field]: value,
    });
  };
  const [errors, setErrors] = useState<Record<string, string>>({});
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formDataTelas.nombreComercial)
      newErrors.nombreError = "El tipo de empresa es obligatorio";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
     
      try{
        
        let respuesta =await createTela(formDataTelas);
        if(isCreating){
          alert("Tela no creada correctamente")
         ;
        }else{
          alert("Tela creada correctamente")
           onClose();
        }
      
      }catch{
        alert("No se pudo guardar el proveedor")
      }
       

      //
    } else {
      console.log("no valido ");
    }
  };

  return (
    <>
      <div className={containerClasses}>
        <div className="cuerpoProveedorForm">
          <h2>Nueva Tela</h2>
        
            <Boton1 type="button" size="medium" variant="info" onClick={() => {
                onClose()
            }}> Atras </Boton1>

          <div className="formProveedor">
            <form onSubmit={handleSubmit}>
              <h2>Datos Tipo de Tela</h2>
              <Switch1
                label="Habilitado"
                checked={formDataTelas.estado =="ACTIVA"?true: false}
                onChange={(value) => handleSwitchChange("estado", value)}
                width="200px"
                size="medium"
              />
              <InputText1
                label="Nombre Comercial"
                value={formDataTelas.nombreComercial}
                onChange={(val) => handleChange("nombreComercial", val)}
                errorMessage={errors.nombreError}
                required
                type="text"
               width="100%"
              />
              <InputText1
                label="Tipo Tela"
                value={formDataTelas.tipoTela}
                onChange={(val) => handleChange("tipoTela", val)}
               width="100%"
              required
                type="text"
              />
              <InputText1
                label="Composicion"
                value={formDataTelas.composicion}
                onChange={(val) => handleChange("composicion", val)}
               width="100%"
               required
                type="text"
              />
              <InputText1
                label="Gramage g/m2"
                value={formDataTelas.gramaje+""}
                onChange={(val) => handleChange("gramaje", val)}
               width="100%"
               required
                type="number"
              />
              <InputText1
                label="Acabado"
                value={formDataTelas.acabado+""}
                onChange={(val) => handleChange("acabado", val)}
               width="100%"
                required
                type="text"
                placeholder="Reactivo, Anti Pelling, etc"
              />
              <div style={{ display: "flex", justifyContent: "space-around" }}>
                <InputText1
                  label="Rendimiento (mts/Kg)"
                  value={formDataTelas.rendimiento+""}
                  onChange={(val) => handleChange("rendimiento", val)}
                  width="100%"
                 
                  type="text"
                />
                <InputText1
                  label="Colores"
                  value={formDataTelas.colores}
                  onChange={(val) => handleChange("colores", val)}
                 width="100%"
                  type="text"
                />
              </div>
              <div className="linea"></div>
              <h3>Notas</h3>
              <div style={{ display: "flex", justifyContent: "space-around" }}>
                <InputText1
                  label="Notas"
                  value={formDataTelas.nota}
                  onChange={(val) => handleChange("nota", val)}
                 width="100%"
                
                  type="text"
                />
               
              </div>

              <Boton1 type="submit" style={{width:"100%"}} size="medium" onClick={() => {}}>
                Guardar Tela
              </Boton1>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default TelasForm;
