import { useEffect, useState } from "react";
import InputText1 from "~/componentes/InputText1";
import Boton1 from "~/componentes/Boton1";
import Switch1 from "~/componentes/switch1"; 
import { useSucursales } from "~/hooks/useSucursales"; // Importa el hook (asumimos que tiene updateSucursal)
import "./SucursalesForm.style.css" // Reutiliza los estilos
import type { CreateSucursalDto, SucursalResponseDto } from "~/models/sucursal";

// 🚨 Define los tipos necesarios para la edición
// Asume que tienes un tipo de DTO para la actualización (ej: UpdateSucursalDto)

// 🚨 Interfaz de Props: Recibe los datos de la sucursal a editar
interface SucursalEditFormProps {
  visible: boolean;
  onClose: () => void;
  initialData: SucursalResponseDto; // Datos de la sucursal actual
}

// 🚨 Función para mapear el DTO al estado del formulario
const mapDtoToFormState = (sucursal: SucursalResponseDto) => ({
    // Estos son obligatorios, deberían ser string
    nombre: sucursal.nombre,
    direccion: sucursal.direccion,
    
    // 🚨 CLAVE: Estos campos opcionales DEBEN ser mapeados a string vacío si son null/undefined
    telefono: sucursal.telefono || "", 
    email: sucursal.email || "",
    responsable: sucursal.responsable || "",
    
    activa: sucursal.activa,
    tiendaId: sucursal.tiendaId, // number
});
const SucursalEditForm: React.FC<SucursalEditFormProps> = ({ visible, onClose, initialData }) => {

    console.log(initialData)
    // 1. Hook de Actualización: Usamos el hook y obtenemos la función updateSucursal
    const { updateSucursal, isUpdating, error } = useSucursales(); 

    const containerClasses = [
        "contenedorFormSucursal",
        visible ? "visible" : "noVisible",
    ].filter(Boolean).join(" ");

    // 2. Estado inicial: Mapeamos los datos recibidos
    const [formData, setFormData] = useState(() => mapDtoToFormState(initialData));

 // 🚨 Solución al problema de que los datos no se actualizan:
    // Reinicia el estado CADA VEZ que initialData (la sucursal a editar) cambie.
    useEffect(() => {
        setFormData(mapDtoToFormState(initialData));
        setErrors({}); // Limpiar errores al cambiar de sucursal
    }, [initialData]); 

    const [errors, setErrors] = useState<Record<string, string>>({});
    
    // 3. Modificación del handleChange: Incluye conversión de number a string (para InputText)
    const handleChange = (field: string, value: string | number) => {
        let finalValue: string | number = value;

        // Convertir el valor a number si el campo es tiendaId y el InputText lo devuelve como string
        if (field === 'tiendaId' && typeof value === 'string') {
             finalValue = Number(value);
        }
        
        setFormData((prev) => ({
            ...prev,
            [field]: finalValue,
        }));
    };
    
    const handleSwitchChange = (value: boolean) => {
        setFormData((prev) => ({
            ...prev,
            activa: value,
        }));
    };

    // La validación se mantiene igual
    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.nombre.trim()) newErrors.nombreError = "El nombre es obligatorio";
        if (!formData.direccion.trim()) newErrors.direccionError = "La dirección es obligatoria";
        if (!formData.tiendaId || Number(formData.tiendaId) <= 0) newErrors.tiendaIdError = "El ID de la tienda es obligatorio";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // 4. Modificación del handleSubmit: Usar updateSucursal y enviar el ID
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            try {
                const dataToSend: CreateSucursalDto = {
                    ...formData,
                    tiendaId: Number(formData.tiendaId),
                };
                
                // 🚨 Llamar a la mutación de actualización con el ID de la sucursal
                await updateSucursal({ id: initialData.id, data: dataToSend });
                
                alert("✅ Sucursal actualizada con éxito.");
                onClose();
            } catch (error) {
                alert("❌ No se pudo actualizar la sucursal.");
                console.error("Error al actualizar:", error);
            }
        } else {
            console.log("Formulario no válido");
        }
    };

    return (
        <>
            <div className={containerClasses}>
                <div className="cuerpoSucursalForm">
                    {/* 🚨 Cambiamos el título */}
                    <h2>Editar Sucursal (ID: {initialData.id})</h2>

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
                                width={450}
                            />
                            <InputText1
                                label="Dirección *"
                                value={formData.direccion}
                                onChange={(val) => handleChange("direccion", val)}
                                errorMessage={errors.direccionError}
                                required
                                type="text"
                                width={450}
                            />
                            <InputText1
                                label="ID de Tienda *"
                                value={formData.tiendaId.toString()} // 🚨 Convertir a string para el InputText1
                                onChange={(val) => handleChange("tiendaId", val)}
                                errorMessage={errors.tiendaIdError}
                                required
                                type="number"
                                width={450}
                            />

                            <hr />

                            <h2>Información de Contacto</h2>

                            <div className="form-row">
                                <InputText1
                                    label="Teléfono"
                                    value={formData.telefono}
                                    onChange={(val) => handleChange("telefono", val)}
                                    type="text"
                                    width={220}
                                />
                                <InputText1
                                    label="Email"
                                    value={formData.email}
                                    onChange={(val) => handleChange("email", val)}
                                    type="email"
                                    width={220}
                                />
                            </div>

                            <InputText1
                                label="Responsable"
                                value={formData.responsable}
                                onChange={(val) => handleChange("responsable", val)}
                                type="text"
                                width={450}
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
                                disabled={isUpdating}
                            >
                                {isUpdating ? "Actualizando..." : "Actualizar Sucursal"}
                            </Boton1>

                            {error && (
                                <div className="error-alert">
                                    Error: {error.message}
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SucursalEditForm;