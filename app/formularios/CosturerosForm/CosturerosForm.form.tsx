import "./Costureros.style.css"

// src/components/CostureroForm.tsx
import { useState } from "react";

import Switch1 from "~/componentes/switch1";
import InputText1 from "~/componentes/InputText1";
import Boton1 from "~/componentes/Boton1";
import { useCostureros } from "~/hooks/useCostureros";
import { EstadoCosturero, type CreateCostureroDto } from "~/models/costureros";

interface CostureroFormProps {
  visible: boolean;
  onClose: () => void;
}

const CostureroForm: React.FC<CostureroFormProps> = ({ visible, onClose }) => {
  const { createCosturero, isCreating, createError } = useCostureros();

  const containerClasses = [
    "contenedorFormCosturero",
    visible ? "visible" : "noVisible",
  ]
    .filter(Boolean)
    .join(" ");

  const [formDataCosturero, setFormData] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    email: "",
    direccion: "",
    estado: EstadoCosturero.ACTIVO,
    fechaInicio: new Date().toISOString(), // Fecha actual
    nota: "",
    tiendaId: 1,
  });

  const handleSwitchChange = (field: string, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleChange = (field: string, value: string | boolean | number) => {
    setFormData({
      ...formDataCosturero,
      [field]: value,
    });
  };

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formDataCosturero.nombre.trim())
      newErrors.nombreError = "El nombre es obligatorio";

    if (!formDataCosturero.apellido.trim())
      newErrors.apellidoError = "El apellido es obligatorio";

    if (!formDataCosturero.tiendaId || formDataCosturero.tiendaId <= 0)
      newErrors.tiendaError = "La tienda es obligatoria";

    if (!formDataCosturero.fechaInicio)
      newErrors.fechaError = "La fecha de inicio es obligatoria";

    if (formDataCosturero.email && !/\S+@\S+\.\S+/.test(formDataCosturero.email))
      newErrors.emailError = "El email no es válido";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      try {
        await createCosturero(
          ...formDataCosturero 
         
        );
        onClose();
      } catch (error) {
        alert("No se pudo guardar el costurero");
        console.error("Error al guardar:", error);
      }
    } else {
      console.log("Formulario no válido");
    }
  };

  return (
    <>
      <div className={containerClasses}>
        <div className="cuerpoCostureroForm">
          <h2>Nuevo Costurero</h2>

          <Boton1
            type="button"
            size="medium"
            variant="info"
            onClick={() => {
              onClose();
            }}
          >
            Atras
          </Boton1>

          <div className="formCosturero">
            <form onSubmit={handleSubmit}>
              <h2>Datos Personales</h2>
              
              <div className="form-row">
                <InputText1
                  label="Nombre *"
                  value={formDataCosturero.nombre}
                  onChange={(val) => handleChange("nombre", val)}
                  errorMessage={errors.nombreError}
                  required
                  type="text"
                  width={220}
                />
                <InputText1
                  label="Apellido *"
                  value={formDataCosturero.apellido}
                  onChange={(val) => handleChange("apellido", val)}
                  errorMessage={errors.apellidoError}
                  required
                  type="text"
                  width={220}
                />
              </div>

              <div className="form-row">
                <InputText1
                  label="Teléfono"
                  value={formDataCosturero.telefono}
                  onChange={(val) => handleChange("telefono", val)}
                  type="tel"
                  width={220}
                />
                <InputText1
                  label="Email"
                  value={formDataCosturero.email}
                  onChange={(val) => handleChange("email", val)}
                  errorMessage={errors.emailError}
                  type="email"
                  width={220}
                />
              </div>

              <InputText1
                label="Dirección"
                value={formDataCosturero.direccion}
                onChange={(val) => handleChange("direccion", val)}
                type="text"
                width={450}
              />

              <div className="linea"></div>
              
              <h2>Datos Laborales</h2>

              <div className="form-row">
                <InputText1
                  label="Fecha de Inicio *"
                  value={formDataCosturero.fechaInicio}
                  onChange={(val) => handleChange("fechaInicio", val)}
                  errorMessage={errors.fechaError}
                  required
                  type="date"
                  width={220}
                />
                <div className="estado-container">
                  <label>Estado *</label>
                  <select
                    value={formDataCosturero.estado}
                    onChange={(e) => handleChange("estado", e.target.value)}
                    className="estado-select"
                  >
                    <option value={EstadoCosturero.ACTIVO}>Activo</option>
                    <option value={EstadoCosturero.INACTIVO}>Inactivo</option>
                    <option value={EstadoCosturero.VACACIONES}>Vacaciones</option>
                    <option value={EstadoCosturero.LICENCIA}>Licencia</option>
                  </select>
                  {errors.fechaError && (
                    <span className="error-message">{errors.fechaError}</span>
                  )}
                </div>
              </div>

              

              <InputText1
                label="Notas"
                value={formDataCosturero.nota}
                onChange={(val) => handleChange("nota", val)}
                type="text"
                width={450}
               
              />

              <Boton1 
                type="submit" 
                fullWidth 
                size="medium" 
                disabled={isCreating}
              >
                {isCreating ? "Guardando..." : "Guardar Costurero"}
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

export default CostureroForm;