import { useEffect, useState } from "react";
import "./Proveedor.style.css";
import Switch1 from "~/componentes/switch1";
import InputText1 from "~/componentes/InputText1";
import Boton1 from "~/componentes/Boton1";
import { useProveedores } from "~/hooks/useProveedores";
import type { ProveedorResponseDto } from "~/models/proveedor.model";
import { useAlert } from "~/componentes/alerts/AlertContext";

interface ProveedorFormProps {
  visible: boolean;
  onCloseUpDate: () => void;
  proveedor: ProveedorResponseDto
}

const ProveedorUpDatepForm: React.FC<ProveedorFormProps> = ({ visible, onCloseUpDate, proveedor}) => {


  const { updateProveedor, isCreating, createError, isUpdating } = useProveedores();

 
  const containerClasses = [
    "contenedorFormProveedor",
    visible ? "visible" : "noVisible",
  ]
    .filter(Boolean)
    .join(" ");


   const toBoolean = (value: any): boolean => {
    // Si ya es un booleano, lo devuelve.
    if (typeof value === 'boolean') {
        return value;
    }
    // Si es un número o string que se convierte a 1 (activo).
    if (value === 1 || value === '1' || String(value).toLowerCase() === 'true') {
        return true;
    }
    // Todos los demás valores (0, '0', null, undefined, "") se consideran inactivos.
    return false;
};

 
  const [formDataProveedorUpDate, setFormData] = useState({
    nombre: proveedor.nombre,
    ruc: proveedor.ruc,
    pais: proveedor.pais,
    ciudad: proveedor.ciudad,
    contacto: proveedor.contacto,
    nit: proveedor.nit,
    direccion: proveedor.direccion,
    telefono: proveedor.telefono,
    email: proveedor.email,

    activo: toBoolean(proveedor.activo),
  });

  useEffect(() => {
      
      setFormData({
       nombre: proveedor.nombre,
    ruc: proveedor.ruc,
    pais: proveedor.pais,
    ciudad: proveedor.ciudad,
    contacto: proveedor.contacto,
    nit: proveedor.nit,
    direccion: proveedor.direccion,
    telefono: proveedor.telefono,
    email: proveedor.email,
    activo: toBoolean(proveedor.activo),
      });
      console.log(proveedor.activo)
      

    }, [proveedor]); // Se ejecuta cuando cambia el parámetro
  
  const handleSwitchChange = (field: string, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const handleChange = (field: string, value: string | boolean) => {
    setFormData({
      ...formDataProveedorUpDate,
      [field]: value,
    });
  };
  const [errors, setErrors] = useState<Record<string, string>>({});
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formDataProveedorUpDate.nombre)
      newErrors.nombreError = "El tipo de empresa es obligatorio";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

 // 1. Importar el hook
  const { showAlert } = useAlert();

  // ...

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validación
    if (validate()) {
      try {
        // 2. Ejecutar la actualización
        await updateProveedor({ 
            id: proveedor.id, 
            data: formDataProveedorUpDate 
        });

        
        // 3. ÉXITO: Si llegamos aquí, todo salió bien
        await showAlert("Proveedor actualizado correctamente.", "success");
        
        onCloseUpDate();

      } catch (error: any) {
        console.error("Error al actualizar:", error);
        
        // 4. ERROR: Capturar mensaje
        const msg = error?.message || "No se pudo actualizar el proveedor.";
        showAlert(msg, "error");
      }

    } else {
      // 5. Validación fallida
      showAlert("El formulario contiene datos inválidos. Por favor revísalos.", "warning");
    }
  };
  return (
    <>
      <div className={containerClasses}>
        <div className="cuerpoProveedorForm">
          <h2>Nuevo Proveedor</h2>
        
            <Boton1 type="button" size="medium" variant="info" onClick={() => {
                onCloseUpDate()
            }}> Atras </Boton1>

          <div className="formProveedor">
            <form onSubmit={handleSubmit}>
              <h2>Datos Proveedor</h2>
              <Switch1
                label="Habilitado"
                checked={formDataProveedorUpDate.activo}
                onChange={(value) => handleSwitchChange("activo", value)}
                width="200px"
                size="medium"
              />
              <InputText1
                label="Nombre Proveedor"
                value={formDataProveedorUpDate.nombre}
                onChange={(val) => handleChange("nombre", val)}
                errorMessage={errors.nombreError}
                required
                type="text"
                width={450}
              />
              <InputText1
                label="Nit / Ci"
                value={formDataProveedorUpDate.nit}
                onChange={(val) => handleChange("nit", val)}
                width={450}
              
                type="text"
              />
              <InputText1
                label="Razon Social"
                value={formDataProveedorUpDate.ruc}
                onChange={(val) => handleChange("ruc", val)}
                width={450}
               
                type="text"
              />
              <InputText1
                label="Direccion de la Empresa"
                value={formDataProveedorUpDate.direccion}
                onChange={(val) => handleChange("direccion", val)}
                width={450}
               
                type="text"
              />
              <div style={{ display: "flex", justifyContent: "space-around" }}>
                <InputText1
                  label="Ciudad"
                  value={formDataProveedorUpDate.ciudad}
                  onChange={(val) => handleChange("ciudad", val)}
                  width={220}
                 
                  type="text"
                />
                <InputText1
                  label="Pais"
                  value={formDataProveedorUpDate.pais}
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
                  value={formDataProveedorUpDate.telefono}
                  onChange={(val) => handleChange("telefono", val)}
                  width={220}
                
                  type="number"
                />
                <InputText1
                  label="Correo Electronico"
                  value={formDataProveedorUpDate.email}
                  onChange={(val) => handleChange("email", val)}
                  width={220}
                 
                  type="email"
                />
              </div>

              <Boton1 type="submit" fullWidth size="medium" onClick={() => {}}>
                Guardar Editado
              </Boton1>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProveedorUpDatepForm;
