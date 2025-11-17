import { useState } from "react";
import InputText1 from "~/componentes/InputText1";
import Boton1 from "~/componentes/Boton1";
import Switch1 from "~/componentes/switch1"; 
import { useSucursales } from "~/hooks/useSucursales"; // Importa el hook
import "./SucursalesForm.style.css"
import { useAlert } from "~/componentes/alerts/AlertContext";

interface SucursalFormProps {
  visible: boolean;
  onClose: () => void;
}

const SucursalForm: React.FC<SucursalFormProps> = ({ visible, onClose }) => {
  const { createSucursal, isCreating, createError } = useSucursales();

  const containerClasses = [
    "contenedorFormSucursal",
    visible ? "visible" : "noVisible",
  ]
    .filter(Boolean)
    .join(" ");

  // Estado inicial del formulario
  const [formData, setFormData] = useState({
    nombre: "",
    direccion: "",
    telefono: "",
    email: "",
    responsable: "",
    activa: true, // Valor por defecto true para el switch
    tiendaId: 1, 
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  
  const handleSwitchChange = (value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      activa: value,
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) newErrors.nombreError = "El nombre es obligatorio";
    if (!formData.direccion.trim()) newErrors.direccionError = "La dirección es obligatoria";
    if (!formData.tiendaId || Number(formData.tiendaId) <= 0) newErrors.tiendaIdError = "El ID de la tienda es obligatorio";

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
        // 2. Preparar datos
        const dataToSend = {
          ...formData,
          tiendaId: Number(formData.tiendaId),
        };
        
        // 3. Ejecutar creación
        await createSucursal(dataToSend);
        
        

        // 4. ÉXITO
        await showAlert("Sucursal creada correctamente.", "success");
        
        onClose();

      } catch (error: any) {
        console.error("Error al guardar:", error);
        
        // 5. ERROR
        const msg = error?.message || "No se pudo guardar la sucursal.";
        showAlert(msg, "error");
      }

    } else {
      // 6. Validación fallida
      showAlert("El formulario no es válido. Por favor revisa los campos.", "warning");
    }
  };

  return (
    <>
      <div className={containerClasses}>
        <div className="cuerpoSucursalForm">
          <h2>Nueva Sucursal</h2>

          <Boton1
            type="button"
            size="medium"
            variant="info"
            onClick={onClose}
          >
            Atrás
          </Boton1>

          <div className="formSucursal">
            <form onSubmit={handleSubmit}>
              
              <h2>Datos Principales</h2>

              <InputText1
                label="Nombre *"
                value={formData.nombre}
                onChange={(val) => handleChange("nombre", val)}
                errorMessage={errors.nombreError}
                required
                type="text"
                width="100%"
              />
              <InputText1
                label="Dirección *"
                value={formData.direccion}
                onChange={(val) => handleChange("direccion", val)}
                errorMessage={errors.direccionError}
                required
                type="text"
                width="100%"
              />
            {/*  <InputText1
                label="ID de Tienda *"
                value={formData.tiendaId+""}
                onChange={(val) => handleChange("tiendaId", val)}
                errorMessage={errors.tiendaIdError}
                required
                type="number"
                width="100%"
              />*/}

              <hr />

              <h2>Información de Contacto</h2>

              <div className="form-row">
                <InputText1
                  label="Teléfono"
                  value={formData.telefono}
                  onChange={(val) => handleChange("telefono", val)}
                  type="number"
                  width="100%"
                  
                />
                <InputText1
                  label="Email"
                  value={formData.email}
                  onChange={(val) => handleChange("email", val)}
                  type="email"
                  width="100%"
                />
              </div>

              <InputText1
                label="Responsable"
                value={formData.responsable}
                onChange={(val) => handleChange("responsable", val)}
                type="text"
                width="100%"
              />
              
              <div style={{ marginTop: '20px' }}>
                <Switch1
                  label="Sucursal Activa"
                  checked={formData.activa}
                  onChange={handleSwitchChange}
                />
              </div>

              <Boton1
                type="submit"
                fullWidth
                size="medium"
                disabled={isCreating}
                style={{width:"100%"}}
              >
                {isCreating ? "Guardando..." : "Guardar Sucursal"}
              </Boton1>

              {createError && (
                <div className="error-alert">
                  Error: {createError.message}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default SucursalForm;