import React, { useState } from "react";
import InputText1 from "~/componentes/InputText1";
import Boton1 from "~/componentes/Boton1";
import ComboBox1 from "~/componentes/ComboBox1"; 


import { useUsuarios } from "~/hooks/useUsuarios";
import { CreateUsuarioDto, Rol } from "~/models/usuario";
import Switch1 from "~/componentes/switch1";
import "./UsuariosForm.style.css"

// Tipo de estado local para el formulario
interface UsuarioFormState {
    email: string;
    password: string;
    nombre: string;
    apellido: string;
    rol: Rol;
    // 🎯 Renombrado a isActive para coincidir con la lógica del Switch1
    isActive: boolean; 
    confirmPassword?: string; 
}

interface CrearUsuarioFormProps {
    visible: boolean;
    onClose: () => void;
}

// Opciones para el ComboBox de Rol
const rolOptions = Object.values(Rol).map(r => ({ value: r, label: r.charAt(0) + r.slice(1).toLowerCase() }));

const CrearUsuarioForm: React.FC<CrearUsuarioFormProps> = ({ visible, onClose }) => {
    const { createUsuario, isCreating, createError } = useUsuarios();

    // Estado inicial
    const [formData, setFormData] = useState<UsuarioFormState>({
        email: "",
        password: "",
        nombre: "",
        apellido: "",
        rol: Rol.USER, 
        isActive: true, // 🎯 Corresponde al campo 'activo' del DTO
        confirmPassword: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const containerClasses = [
        "contenedorFormUsuario",
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

        if (!formData.email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
            newErrors.email = "El email no es válido.";
        }
        if (formData.password.length < 6) {
            newErrors.password = "La contraseña debe tener al menos 6 caracteres.";
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Las contraseñas no coinciden.";
        }
        if (!formData.nombre.trim()) {
            newErrors.nombre = "El nombre es obligatorio.";
        }
        if (!Object.values(Rol).includes(formData.rol)) {
            newErrors.rol = "Debe seleccionar un Rol válido.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ----------------------------------------------------
    // SUBMIT
    // ----------------------------------------------------

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            try {
                // 🎯 Mapeo de 'isActive' a 'activo' para el DTO
                const dataToSend: CreateUsuarioDto = {
                    email: formData.email.trim(),
                    password: formData.password,
                    nombre: formData.nombre.trim(),
                    apellido: formData.apellido.trim() || undefined,
                    rol: formData.rol,
                    activo: formData.isActive, // 🎯 Uso de isActive del estado para el campo activo del DTO
                };
                
                await createUsuario(dataToSend);
                
                alert(`✅ Usuario ${dataToSend.email} creado con éxito.`);
                
                onClose();
            } catch (error) {
                alert("❌ Error al crear el usuario.");
                console.error("Error en submit:", error);
            }
        }
    };

    // ----------------------------------------------------
    // RENDERIZADO
    // ----------------------------------------------------

    const isDisabled = isCreating;

    return (
        <div className={containerClasses}>
            <div className="cuerpoUsuarioForm">
                <h2>Crear Nuevo Usuario</h2>
                
                <div className="formUsuario">
                    <form onSubmit={handleSubmit}>
                        
                        <div className="form-row">
                            {/* EMAIL */}
                            <InputText1
                                label="Email *"
                                value={formData.email}
                                onChange={(val) => handleChange("email", val)}
                                errorMessage={errors.email}
                                required
                                type="email"
                                width={220}
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
                                width={220}
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
                                width={220}
                            />
                            
                            {/* APELLIDO */}
                            <InputText1
                                label="Apellido"
                                value={formData.apellido}
                                onChange={(val) => handleChange("apellido", val)}
                                width={220}
                            />
                        </div>

                        <div className="form-row">
                            {/* PASSWORD */}
                            <InputText1
                                label="Contraseña *"
                                value={formData.password}
                                onChange={(val) => handleChange("password", val)}
                                errorMessage={errors.password}
                                required
                                type="password"
                                width={220}
                            />
                            
                            {/* CONFIRMAR PASSWORD */}
                            <InputText1
                                label="Confirmar Contraseña *"
                                value={formData.confirmPassword || ''}
                                onChange={(val) => handleChange("confirmPassword", val)}
                                errorMessage={errors.confirmPassword}
                                required
                                type="password"
                                width={220}
                            />
                        </div>

                        {/* 🎯 SWITCH1 (En lugar de Checkbox) */}
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
                            style={{ marginTop: '20px' }}
                        >
                            {isCreating ? "Creando Usuario..." : "Crear Usuario"}
                        </Boton1>

                        {createError && (
                            <div className="error-alert">Error: {createError.message}</div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CrearUsuarioForm;