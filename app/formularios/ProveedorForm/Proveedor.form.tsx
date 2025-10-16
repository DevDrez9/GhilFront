import { useState } from "react";
import "./Proveedor.style.css";
import Switch1 from "~/componentes/switch1";
import InputText1 from "~/componentes/InputText1";
import Boton1 from "~/componentes/Boton1";
import { useProveedores } from "~/hooks/useProveedores";

interface ProveedorFormProps {
  visible: boolean;
  onClose: () => void;
}

const ProveedorForm: React.FC<ProveedorFormProps> = ({ visible, onClose, }) => {


  const { createProveedor, isCreating, createError } = useProveedores();

 
  const containerClasses = [
    "contenedorFormProveedor",
    visible ? "visible" : "noVisible",
  ]
    .filter(Boolean)
    .join(" ");

  const [formDataProveedor, setFormData] = useState({
    nombre: "",
    ruc: "",
    pais: "",
    ciudad: "",
    contacto: "",
    nit: "",
    direccion: "",
    telefono: "",
    email: "",

    activo: false,
  });
  const handleSwitchChange = (field: string, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const handleChange = (field: string, value: string | boolean) => {
    setFormData({
      ...formDataProveedor,
      [field]: value,
    });
  };
  const [errors, setErrors] = useState<Record<string, string>>({});
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formDataProveedor.nombre)
      newErrors.nombreError = "El tipo de empresa es obligatorio";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
     
      try{
        let respuesta =await createProveedor(formDataProveedor);
        if(isCreating){
          alert("Proveedor no creado correctamente")
         ;
        }else{
          alert("Proveedor  creado correctamente")
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
          <h2>Nuevo Proveedor</h2>
        
            <Boton1 type="button" size="medium" variant="info" onClick={() => {
                onClose()
            }}> Atras </Boton1>

          <div className="formProveedor">
            <form onSubmit={handleSubmit}>
              <h2>Datos Proveedor</h2>
              <Switch1
                label="Habilitado"
                checked={formDataProveedor.activo}
                onChange={(value) => handleSwitchChange("activo", value)}
                width="200px"
                size="medium"
              />
              <InputText1
                label="Nombre Proveedor"
                value={formDataProveedor.nombre}
                onChange={(val) => handleChange("nombre", val)}
                errorMessage={errors.nombreError}
                required
                type="text"
                width={450}
              />
              <InputText1
                label="Nit / Ci"
                value={formDataProveedor.nit}
                onChange={(val) => handleChange("nit", val)}
                width={450}
              
                type="text"
              />
              <InputText1
                label="Razon Social"
                value={formDataProveedor.ruc}
                onChange={(val) => handleChange("ruc", val)}
                width={450}
               
                type="text"
              />
              <InputText1
                label="Direccion de la Empresa"
                value={formDataProveedor.direccion}
                onChange={(val) => handleChange("direccion", val)}
                width={450}
               
                type="text"
              />
              <div style={{ display: "flex", justifyContent: "space-around" }}>
                <InputText1
                  label="Ciudad"
                  value={formDataProveedor.ciudad}
                  onChange={(val) => handleChange("ciudad", val)}
                  width={220}
                 
                  type="text"
                />
                <InputText1
                  label="Pais"
                  value={formDataProveedor.pais}
                  onChange={(val) => handleChange("pais", val)}
                  width={220}
                  
                  type="text"
                />
              </div>
              <div className="linea"></div>
              <h3>Datos de contacto</h3>
              <div style={{ display: "flex", justifyContent: "space-around" }}>
                <InputText1
                  label="Telefono"
                  value={formDataProveedor.telefono}
                  onChange={(val) => handleChange("telefono", val)}
                  width={220}
                
                  type="number"
                />
                <InputText1
                  label="Correo Electronico"
                  value={formDataProveedor.email}
                  onChange={(val) => handleChange("email", val)}
                  width={220}
                 
                  type="email"
                />
              </div>

              <Boton1 type="submit" fullWidth size="medium" onClick={() => {}}>
                Guardar Proveedor
              </Boton1>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProveedorForm;
