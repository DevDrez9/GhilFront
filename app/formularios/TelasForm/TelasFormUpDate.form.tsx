import { useEffect, useState } from "react";
import "./TelasForm.style.css";
import Switch1 from "~/componentes/switch1";
import InputText1 from "~/componentes/InputText1";
import Boton1 from "~/componentes/Boton1";
import { useProveedores } from "~/hooks/useProveedores";
import { useTelas } from "~/hooks/useTelas";
import type { TelaResponseDto } from "~/models/telas.model";

interface TelasFormUpDateProps {
  visible: boolean;
  onClose: () => void;
  tela:TelaResponseDto
}

const TelasFormUpDate: React.FC<TelasFormUpDateProps> = ({ visible, onClose, tela}) => {


  const { updateTela, isUpdating, createError } = useTelas();

 
  const containerClasses = [
    "contenedorFormTelas",
    visible ? "visible" : "noVisible",
  ]
    .filter(Boolean)
    .join(" ");

  const [formDataTelasUpDate, setFormData] = useState({
     nombreComercial: tela.nombreComercial,
  tipoTela:tela.tipoTela,
  composicion:tela.composicion,
  gramaje:tela.gramaje,
  acabado:tela.acabado,
  rendimiento: tela.rendimiento,
  colores:tela.colores,
  nota:tela.nota,
  estado:tela.estado,
  proveedorId: tela.proveedorId,
  parametrosFisicosId: 0

  });


    useEffect(() => {
        setFormData({
         nombreComercial: tela.nombreComercial,
  tipoTela:tela.tipoTela,
  composicion:tela.composicion,
  gramaje:tela.gramaje,
  acabado:tela.acabado,
  rendimiento: tela.rendimiento,
  colores:tela.colores,
  nota:tela.nota,
  estado:tela.estado,
  proveedorId: tela.proveedorId,
  parametrosFisicosId: 0
        });
      }, [tela]); // Se ejecuta cuando cambia el parámetro
    
  const handleSwitchChange = (field: string, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const handleChange = (field: string, value: string | boolean) => {
    setFormData({
      ...formDataTelasUpDate,
      [field]: value,
    });
  };
  const [errors, setErrors] = useState<Record<string, string>>({});
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formDataTelasUpDate.nombreComercial)
      newErrors.nombreError = "El tipo de empresa es obligatorio";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
     
      try{
        
        await updateTela({id:tela.id,data: formDataTelasUpDate});
        if(isUpdating){
          alert("Tela no actualizada correctamente")
         
        }else{
          alert("Tela actualizada correctamente")
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
          <h2>Acttualizar Datos Tipo de Tela</h2>
        
            <Boton1 type="button" size="medium" variant="info" onClick={() => {
                onClose()
            }}> Atras </Boton1>

          <div className="formProveedor">
            <form onSubmit={handleSubmit}>
              <h2>Datos Proveedor</h2>
              <Switch1
                label="Habilitado"
                checked={formDataTelasUpDate.estado =="ACTIVA"?true: false}
                onChange={(value) => handleSwitchChange("estado", value)}
                width="200px"
                size="medium"
              />
              <InputText1
                label="Nombre Comercial"
                value={formDataTelasUpDate.nombreComercial}
                onChange={(val) => handleChange("nombreComercial", val)}
                errorMessage={errors.nombreError}
                required
                type="text"
                width="100%"
              />
              <InputText1
                label="Tipo Tela"
                value={formDataTelasUpDate.tipoTela}
                onChange={(val) => handleChange("tipoTela", val)}
                width="100%"
              required
                type="text"
              />
              <InputText1
                label="Composicion"
                value={formDataTelasUpDate.composicion}
                onChange={(val) => handleChange("composicion", val)}
                width="100%"
               required
                type="text"
              />
              <InputText1
                label="Gramage g/m2"
                value={formDataTelasUpDate.gramaje+""}
                onChange={(val) => handleChange("gramaje", val)}
                width="100%"
               required
                type="number"
              />
              <InputText1
                label="Acabado"
                value={formDataTelasUpDate.acabado+""}
                onChange={(val) => handleChange("acabado", val)}
                width="100%"
               type="text"
                placeholder="Reactivo, Anti Pelling, etc"
                required
              />
              <div style={{ display: "flex", justifyContent: "space-around" }}>
                <InputText1
                  label="Rendimiento (mts/Kg)"
                  value={formDataTelasUpDate.rendimiento+""}
                  onChange={(val) => handleChange("rendimiento", val)}
                  width={220}
                 
                  type="text"
                />
                <InputText1
                  label="Colores"
                  value={formDataTelasUpDate.colores}
                  onChange={(val) => handleChange("colores", val)}
                  width={220}
                  
                  type="text"
                />
              </div>
              <div className="linea"></div>
              <h3>Notas</h3>
              <div style={{ display: "flex", justifyContent: "space-around" }}>
                <InputText1
                  label="Notas"
                  value={formDataTelasUpDate.nota}
                  onChange={(val) => handleChange("nota", val)}
                  width="100%"
                
                  type="text"
                />
               
              </div>

              <Boton1 type="submit"  style={{width:"100%"}} size="medium" onClick={() => {}}>
                Guardar Tela
              </Boton1>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default TelasFormUpDate;
