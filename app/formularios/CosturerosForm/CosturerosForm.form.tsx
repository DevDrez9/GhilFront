import "./Costureros.style.css"

// src/components/CostureroForm.tsx
import { useEffect, useState } from "react";

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
  const { createCostureroAsync, isCreating, createError } = useCostureros();

  const containerClasses = [
    "contenedorFormCosturero",
    visible ? "visible" : "noVisible",
  ]
    .filter(Boolean)
    .join(" ");

    useEffect(() => {
       setFormData({
         nombre: "",
    apellido: "",
    telefono: "",
    email: "",
    direccion: "",
    estado: EstadoCosturero.ACTIVO,
    fechaInicio: new Date().toISOString(), // Fecha actual
    nota: "",
    tiendaId: 1,
       })

    }, []); 

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

  const handleSwitchChange = (name, isChecked) => {
    // Convierte el valor booleano del switch al valor de ENUM/String esperado
    const estadoValue = isChecked ? EstadoCosturero.ACTIVO : EstadoCosturero.INACTIVO;
    
    // Llama a tu función original para actualizar el estado
    handleChange(name, estadoValue); 
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

     // Asumimos que tienes el DTO final listo para ser enviado (ej. con campos numéricos convertidos)
    const dataToSend = {
      // 🚨 IMPORTANTE: Asegúrate de hacer las conversiones de tipo aquí 
      // si tu backend espera números (ej. tiendaId) o fechas (ej. fechaInicio)
      ...formDataCosturero,
      tiendaId: Number(formDataCosturero.tiendaId), // Ejemplo de conversión
      fechaInicio: new Date(formDataCosturero.fechaInicio), // Ejemplo de conversión
      // El resto de campos (nombre, apellido, etc.) pasan directo.
    }

    if (validate()) {
     try {
        // 1. Ejecutar la mutación. Si es exitosa, continuamos.
        await createCostureroAsync(dataToSend);

        // 2. ÉXITO: Si la línea anterior no lanzó un error, fue exitoso.
        
        // Limpiar el formulario
        setFormData({
            nombre: "",
            apellido: "",
            telefono: "",
            email: "",
            direccion: "",
            estado: EstadoCosturero.ACTIVO,
            fechaInicio: new Date().toISOString(),
            nota: "",
            tiendaId: 1,
        });
        
        // Cerrar el modal o notificar éxito
        alert("Costurero creado correctamente.");
        onClose();

    } catch (error) {
        // 3. ERROR: Si la promesa se rechaza (por error de la API o de red), 
        // el control salta a este bloque.
        
        // Acceder al mensaje de error
        const errorMessage = (error as Error)?.message || "Ocurrió un error desconocido al crear el costurero.";
        
        // Mostrar el error
        alert(`❌ Error al crear: ${errorMessage}`);
        console.error("Fallo en la creación del costurero:", error);
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
               setFormData({
         nombre: "",
    apellido: "",
    telefono: "",
    email: "",
    direccion: "",
    estado: EstadoCosturero.ACTIVO,
    fechaInicio: new Date().toISOString(), // Fecha actual
    nota: "",
    tiendaId: 1,
       })
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
                  <Switch1
        label="Estado costurero" // Etiqueta del switch
        // El switch espera un booleano. Compara el estado actual con ACTIVO.
        checked={formDataCosturero.estado === EstadoCosturero.ACTIVO} 
        onChange={(value) => handleSwitchChange('estado', value)}
        width="80%"
        size="medium"
    />
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