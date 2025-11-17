import "./Costureros.style.css"
import { useEffect, useState } from "react";

import Switch1 from "~/componentes/switch1";
import InputText1 from "~/componentes/InputText1";
import Boton1 from "~/componentes/Boton1";

// 🚨 Ajustar el hook para incluir la función de actualización
import { useCostureros } from "~/hooks/useCostureros"; 
import { EstadoCosturero, type CreateCostureroDto } from "~/models/costureros";
import { useAlert } from "~/componentes/alerts/AlertContext";

// ====================================================================
// TIPOS Y CONSTANTES
// ====================================================================

// 🚨 1. DEFINIR EL TIPO DE RESPUESTA
// Asume que el DTO de respuesta tiene un ID
interface CostureroResponseDto extends CreateCostureroDto {
  id: number; 
  // Asegúrate de que los tipos de fecha sean los esperados (string ISO o Date)
}

// 🚨 2. DEFINIR EL ESTADO INICIAL
const INITIAL_STATE = {
  nombre: "",
  apellido: "",
  telefono: "",
  email: "",
  direccion: "",
  estado: EstadoCosturero.ACTIVO,
  fechaInicio: new Date().toISOString().substring(0, 10), // Formato YYYY-MM-DD para input type="date"
  nota: "",
  tiendaId: 1,
};

// 🚨 3. ACTUALIZAR LAS PROPIEDADES DEL COMPONENTE
interface CostureroFormEditProps {
  visible: boolean;
  onClose: () => void;
  // Acepta el objeto de edición. Si es null o undefined, es una operación de creación.
  initialData?: CostureroResponseDto | null; 
}

// ====================================================================
// COMPONENTE PRINCIPAL (Ahora maneja Creación y Edición)
// ====================================================================

const CostureroFormEdit: React.FC<CostureroFormEditProps> = ({ visible, onClose, initialData }) => {
  // 🚨 Desestructuramos el hook para incluir la función de actualización y el estado.
  const { 
    createCosturero, 
    isCreating, 
    createError, 
updateError,
    // 🚨 Aquí es donde debes desestructurar la función de actualización
    updateCosturero, 
    isUpdating,      // Asume que tienes este estado en tu hook
   
  } = useCostureros();

  // Determinar si estamos en modo edición (si se proporciona initialData y tiene un ID)
  const isEditMode = !!initialData?.id; 

  // 🚨 ESTADO PRINCIPAL: Se inicializa con los datos iniciales o el estado vacío
  // Mapeo de la fecha: Asegúrate de que la fecha venga en formato YYYY-MM-DD para el input type="date"
  const mappedInitialState = initialData ? {
    ...initialData,
    // Asegura que la fecha esté en formato ISO corto (YYYY-MM-DD) para el input[type=date]
    fechaInicio: initialData.fechaInicio ? new Date(initialData.fechaInicio).toISOString().substring(0, 10) : INITIAL_STATE.fechaInicio,
  } : INITIAL_STATE;

  const [formDataCosturero, setFormData] = useState(mappedInitialState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 🚨 EFECTO PARA REINICIALIZAR ESTADO AL ABRIR/CAMBIAR PRODUCTO
  useEffect(() => {
    if (visible) {
      // Reinicializa el estado cuando el modal se abre o cuando initialData cambia
      const mappedState = initialData ? {
        ...initialData,
        fechaInicio: initialData.fechaInicio ? new Date(initialData.fechaInicio).toISOString().substring(0, 10) : INITIAL_STATE.fechaInicio,
      } : INITIAL_STATE;
      setFormData(mappedState);
      setErrors({}); // Limpia errores
    }
    // Dependemos de 'visible' y 'initialData' (para detectar si el producto a editar ha cambiado)
  }, [visible, initialData]); 

  // Lógica de clases CSS
  const containerClasses = [
    "contenedorFormCosturero",
    visible ? "visible" : "noVisible",
  ]
    .filter(Boolean)
    .join(" ");

  // ... (Tu lógica de handleSwitchChange y handleChange se mantiene igual)

  const handleSwitchChange = (name: string, isChecked: boolean) => {
    const estadoValue = isChecked ? EstadoCosturero.ACTIVO : EstadoCosturero.INACTIVO;
    handleChange(name, estadoValue); 
  };
  
  const handleChange = (field: string, value: string | boolean | number) => {
    setFormData({
      ...formDataCosturero,
      [field]: value,
    });
  };

  // ... (Tu lógica de validate se mantiene igual)

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

const { showAlert } = useAlert();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validación con alerta visual
    if (!validate()) {
      showAlert("Por favor, completa los campos obligatorios correctamente.", "warning");
      return;
    }

    // Preparar datos para el DTO
    const dataToSend = {
      ...formDataCosturero,
      tiendaId: Number(formDataCosturero.tiendaId), 
      // Conversión de fecha a objeto Date
      fechaInicio: new Date(formDataCosturero.fechaInicio), 
    } as CreateCostureroDto; 

    try {
      if (isEditMode && initialData?.id) {
        // --- MODO EDICIÓN ---
        await updateCosturero({ 
            id: initialData.id, 
            data: dataToSend 
        });
        
        // ✅ Alerta de éxito para edición
        await showAlert("Costurero actualizado correctamente.", "success");

      } else {
        // --- MODO CREACIÓN (Bloque agregado) ---
        // Asumo que 'createCosturero' viene de tu hook useCostureros
        await createCosturero(dataToSend);
        
        // ✅ Alerta de éxito para creación
        await showAlert("Costurero creado correctamente.", "success");
      }
      
      // Cerramos solo si todo salió bien
      onClose();

    } catch (error: any) {
      console.error(`Error al ${isEditMode ? 'actualizar' : 'guardar'}:`, error);
      
      // ✅ Alerta de error con el mensaje del backend si existe
      const mensajeError = error?.message || `No se pudo ${isEditMode ? 'actualizar' : 'guardar'} el costurero.`;
      showAlert(mensajeError, "error");
    }
  };
  
  // Determinar el estado de carga y error para la UI
  const isLoading = isCreating || isUpdating;
  const currentError = createError || updateError;


  return (
    <>
      <div className={containerClasses}>
        <div className="cuerpoCostureroForm">
          <h2>{isEditMode ? `Editar Costurero: ${initialData?.nombre}` : "Nuevo Costurero"}</h2>

          <Boton1
            type="button"
            size="medium"
            variant="info"
            onClick={() => {
              onClose();
            }}
          >
            Atrás
          </Boton1>

          <div className="formCosturero">
            <form onSubmit={handleSubmit}>
              <h2>Datos Personales</h2>
              
              {/* Resto del formulario (Inputs) se mantiene igual, usando formDataCosturero */}
              
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
                  type="number"
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
        label="Estado costurero" 
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
                disabled={isLoading}
                variant={isEditMode ? "warning" : "primary"}
              >
                {isLoading ? "Guardando..." : isEditMode ? "Actualizar Costurero" : "Guardar Costurero"}
              </Boton1>

              {currentError && (
                <div className="error-alert">
                  Error: {currentError.message}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CostureroFormEdit;