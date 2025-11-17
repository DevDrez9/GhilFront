import React, { useState, useEffect } from "react";
import InputText1 from "~/componentes/InputText1";
import Boton1 from "~/componentes/Boton1";
import ComboBox1 from "~/componentes/ComboBox1";
import Switch1 from "~/componentes/switch1";

import { useUsuarios } from "~/hooks/useUsuarios";
import { CreateUsuarioDto, Rol, UpdateUsuarioDto, UsuarioResponseDto } from "~/models/usuario"; // Asegúrate de tener UpdateUsuarioDto
import "./UsuarioEdita.style.css"
import { useAlert } from "~/componentes/alerts/AlertContext";

// ----------------------------------------------------
// DTOs y Tipos Requeridos (ASUMIDOS)
// ----------------------------------------------------

// 🚨 ASUMIMOS esta estructura para el DTO de entrada (UsuarioDto)
interface UsuarioDto {
    id: number; // Necesitas el ID para actualizar
    email: string;
    nombre: string;
    apellido?: string;
    rol: Rol;
    telefono?: string;
    activo: boolean; // El campo que viene de la API
    createdAt: Date;
}

// Tipo de estado local para el formulario de edición
interface UsuarioFormState {
    email: string;
    // 🚨 La contraseña es opcional en la edición
    password: string; 
    nombre: string;
    apellido: string;
    rol: Rol;
    telefono: string;
    isActive: boolean;
    // 🚨 Confirmar contraseña también opcional
    confirmPassword?: string; 
}

interface EditarUsuarioFormProps {
    visible: boolean;
    onClose: () => void;
    // 🎯 Propiedad para recibir los datos del usuario a editar
    initialData: UsuarioResponseDto | null; 
}

// Opciones para el ComboBox de Rol
const rolOptions = Object.values(Rol).map(r => ({ value: r, label: r.charAt(0) + r.slice(1).toLowerCase() }));

// ----------------------------------------------------
// COMPONENTE PRINCIPAL
// ----------------------------------------------------
const EditarUsuarioForm: React.FC<EditarUsuarioFormProps> = ({ visible, onClose, initialData }) => {
    // 🚨 USAMOS updateUsuario, isUpdating, updateError
    const { updateUsuario, isUpdating, updateError } = useUsuarios(); 

    // Estado inicial (valores por defecto)
    const [formData, setFormData] = useState<UsuarioFormState>({
        email: "",
        password: "",
        nombre: "",
        apellido: "",
        rol: Rol.USER, 
        isActive: true, 
        confirmPassword: "",
        telefono: ""
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // ----------------------------------------------------
    // EFECTO DE INICIALIZACIÓN
    // ----------------------------------------------------
    useEffect(() => {
        if (initialData) {
            setFormData({
                email: initialData.email,
                password: "", // Nunca precargar la contraseña
                nombre: initialData.nombre,
                apellido: initialData.apellido || "",
                rol: initialData.rol, 
                telefono: initialData.telefono || "",
                isActive: initialData.activo, // Mapeo de 'activo' a 'isActive'
                confirmPassword: "",
            });
            setErrors({}); // Limpiar errores al cargar nuevo usuario
        }
    }, [initialData]);

    const containerClasses = [
        "contenedorFormUsuarioEdit",
        visible ? "visible" : "noVisible",
    ].filter(Boolean).join(" ");

    // ----------------------------------------------------
    // MANEJADORES
    // ----------------------------------------------------

    const handleChange = (field: keyof UsuarioFormState, value: string | boolean) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Validaciones obligatorias (sin cambio)
        if (!formData.nombre.trim()) {
            newErrors.nombre = "El nombre es obligatorio.";
        }
        if (!Object.values(Rol).includes(formData.rol)) {
            newErrors.rol = "Debe seleccionar un Rol válido.";
        }
        
        // 🚨 Validación de Contraseña (Solo si se está cambiando)
        const passwordProvided = formData.password.length > 0;
        
        if (passwordProvided) {
            if (formData.password.length < 6) {
                newErrors.password = "La contraseña debe tener al menos 6 caracteres.";
            }
            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = "Las contraseñas no coinciden.";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ----------------------------------------------------
    // SUBMIT (ACTUALIZAR)
    // ----------------------------------------------------

   // 1. Importar el hook
  const { showAlert } = useAlert();

  // ...

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialData) return; // Validación de seguridad

    // 1. Validación del formulario
    if (validate()) {
      try {
        // 2. Preparar DTO
        const dataToSend: UpdateUsuarioDto = {
          email: formData.email.trim(),
          nombre: formData.nombre.trim(),
          apellido: formData.apellido.trim() || undefined,
          rol: formData.rol,
          telefono: formData.telefono.trim() || undefined,
          activo: formData.isActive,
          // Si manejas cambio de contraseña aquí, asegúrate de incluirla solo si no está vacía
        };
        
        // 3. Ejecutar actualización
        await updateUsuario({ 
            id: initialData.id, 
            data: dataToSend 
        });
        
        

        // 4. ÉXITO
        await showAlert(`Usuario ${initialData.email} actualizado con éxito.`, "success");
        
        onClose();

      } catch (error: any) {
        console.error("Error en submit:", error);
        
        // 5. ERROR
        const msg = error?.message || "Error al actualizar el usuario.";
        showAlert(msg, "error");
      }
    } else {
      // 6. Validación fallida
      showAlert("El formulario contiene errores. Por favor revísalos.", "warning");
    }
  };
    // ----------------------------------------------------
    // RENDERIZADO
    // ----------------------------------------------------

    const isDisabled = isUpdating;
    const isPasswordRequired = formData.password.length > 0;

    if (!initialData) {
        return <div className={containerClasses}><div className="cuerpoUsuarioForm">Cargando datos...</div></div>;
    }

    return (
        <div className={containerClasses}>
            <div className="cuerpoUsuarioForm">
                <h2>Editar Usuario: {initialData.nombre}</h2>
                <Boton1 type="button" size="medium" variant="info" onClick={onClose}>
                    Atrás
                </Boton1>
                
                <div className="formUsuario">
                    <form onSubmit={handleSubmit}>
                        
                        <div className="form-row">
                            {/* EMAIL (READ-ONLY) */}
                            <InputText1
                                label="Email"
                                value={formData.email}
                                onChange={() => {}} // No permitir cambio
                                required
                                type="email"
                                width="100%"
                                readOnly // 🚨 Solo lectura
                                disabled={isDisabled || true}
                            />
                            
                            {/* ROL (COMBOBOX) */}
                            <ComboBox1
                                label="Rol *"
                                value={formData.rol}
                                onChange={(val) => handleChange("rol", val as Rol)}
                                options={rolOptions}
                                placeholder="Seleccione Rol"
                                errorMessage={errors.rol}
                                required
                                disabled={isDisabled}
                                width="100%"
                            />
                        </div>

                        <div className="form-row">
                            {/* NOMBRE */}
                            <InputText1
                                label="Nombre *"
                                value={formData.nombre}
                                onChange={(val) => handleChange("nombre", val)}
                                errorMessage={errors.nombre}
                                required
                                width="100%"
                            />
                            
                            {/* APELLIDO */}
                            <InputText1
                                label="Apellido"
                                value={formData.apellido}
                                onChange={(val) => handleChange("apellido", val)}
                                width="100%"
                            />
                            <InputText1
                                label="Teléfono"
                                value={formData.telefono}
                                onChange={(val) => handleChange("telefono", val)}
                                width="100%"
                                type="number"
                            />
                        </div>

                        {/* 🚨 SECCIÓN DE CAMBIO DE CONTRASEÑA (OPCIONAL) 
                        <fieldset style={{ border: '1px solid #ccc', padding: '15px', marginTop: '20px' }} disabled={isDisabled}>
                            <legend>Cambiar Contraseña (Dejar vacío para mantener la actual)</legend>
                            <div className="form-row">
                               
                                <InputText1
                                    label="Nueva Contraseña"
                                    value={formData.password}
                                    onChange={(val) => handleChange("password", val)}
                                    errorMessage={errors.password}
                                    type="password"
                                    width="100%"
                                />
                                
                                <InputText1
                                    label="Confirmar Nueva Contraseña"
                                    value={formData.confirmPassword || ''}
                                    onChange={(val) => handleChange("confirmPassword", val)}
                                    errorMessage={errors.confirmPassword}
                                    type="password"
                                    width="100%"
                                    // Marcar como requerido SOLO si ya se ingresó una contraseña
                                    required={isPasswordRequired} 
                                />
                            </div>
                        </fieldset>*/}

                        {/* SWITCH1 */}
                        <div style={{ marginTop: '15px' }}>
                            <Switch1
                                label="Usuario Activo"
                                checked={formData.isActive}
                                onChange={(value) => handleChange('isActive', value)}
                                width="80%"
                                size="medium"
                            />
                        </div>

                        <Boton1
                            type="submit"
                            fullWidth
                            size="large"
                            disabled={isDisabled}
                            style={{ marginTop: '20px', width:"100%" }}
                        >
                            {isUpdating ? "Guardando Cambios..." : "Guardar Cambios"}
                        </Boton1>

                        {updateError && (
                            <div className="error-alert">Error: {updateError.message}</div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditarUsuarioForm;