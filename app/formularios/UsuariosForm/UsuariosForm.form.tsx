import React, { useState } from "react";
import InputText1 from "~/componentes/InputText1";
import Boton1 from "~/componentes/Boton1";
import ComboBox1 from "~/componentes/ComboBox1"; 


import { useUsuarios } from "~/hooks/useUsuarios";
import { CreateUsuarioDto, Rol } from "~/models/usuario";
import Switch1 from "~/componentes/switch1";
import "./UsuariosForm.style.css"
import { useAlert } from "~/componentes/alerts/AlertContext";

// Tipo de estado local para el formulario
interface UsuarioFormState {
    email: string;
    password: string;
    nombre: string;
    apellido: string;
    rol: Rol;
    telefono:string;
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
        telefono:""
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

            newErrors.password = "La contraseña debe tener al menos 6 caracteres";
            
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Las contraseñas no coinciden.";
        }
        if (seguridadPass.nivel != "Alta"){
            newErrors.password = "La contraseña debe ser de seguridad Alta";
            
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

   // 1. Importar el hook
  const { showAlert } = useAlert();

  // ...

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validación
    if (validate()) {
      try {
        // 2. Preparar DTO
        const dataToSend: CreateUsuarioDto = {
          email: formData.email.trim(),
          password: formData.password,
          nombre: formData.nombre.trim(),
          apellido: formData.apellido.trim() || undefined,
          rol: formData.rol,
          // Mejora: Enviar undefined si el string está vacío para no guardar ""
          telefono: formData.telefono?.trim() || undefined,
          activo: formData.isActive,
        };
        
        // 3. Ejecutar creación
        await createUsuario(dataToSend);
        
        

        // 4. ÉXITO
        await showAlert(`Usuario ${dataToSend.email} creado con éxito.`, "success");
        
        onClose();

      } catch (error: any) {
        console.error("Error en submit:", error);
        
        // 5. ERROR
        const msg = error?.message || "Error al crear el usuario.";
        showAlert(msg, "error");
      }

    } else {
      // 6. Validación fallida
      showAlert("El formulario contiene errores. Por favor revisa los campos.", "warning");
    }
  };
  const [seguridadPass, setSeguridadPass] = useState<Record<string, string>>({});

  

  const handleVerificarPass = (password) => {
    const tieneNumero = /\d/.test(password);
    const tieneMayuscula = /[A-Z]/.test(password);
    const tieneSimbolo = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const longitudOk = password.length >= 8;
  
    // Caso: ALTA (Todo lo anterior)
    if (tieneMayuscula && tieneNumero && tieneSimbolo && longitudOk) {
        
      return setSeguridadPass({ nivel: "Alta", color: "#2ecc71"});
      
    }
  
    // Caso: MEDIA (Mayúscula y Número)
    if (tieneMayuscula && tieneNumero) {
      return  setSeguridadPass({ nivel: "Media", color: "#f1c40f" });
    }
  
    // Caso: BAJA (Cualquier otro caso)
    return setSeguridadPass({ nivel: "Baja", color: "#e74c3c" });
  };
  


    // ----------------------------------------------------
    // RENDERIZADO
    // ----------------------------------------------------

    const isDisabled = isCreating;

    const barraContraseña=()=>{
        if(seguridadPass.nivel=="Alta"){
            return (<>
                <div className="seguridadApp" style={{display:"flex", alignItems:"center"}}>Alta <div style={{width:"150px", height:"5px", backgroundColor:"green", marginLeft:"30px"}}></div></div>
                </>)
        }else if(seguridadPass.nivel=="Media"){
            return (<>
            <div className="seguridadApp" style={{display:"flex", alignItems:"center"}}>Media <div style={{width:"100px", height:"5px", backgroundColor:"yellow", marginLeft:"30px"}}></div></div>
            </>)
        }
        else if(seguridadPass.nivel=="Baja"){
            return (<>
            <div className="seguridadApp" style={{display:"flex", alignItems:"center"}}>Baja <div style={{width:"50px", height:"5px", backgroundColor:"red", marginLeft:"30px"}}></div></div>
            </>)
        }
    }

    return (
        <div className={containerClasses}>
            <div className="cuerpoUsuarioForm">
                <h2>Crear Nuevo Usuario</h2>
                <Boton1 type="button" size="medium" variant="info" onClick={onClose}>
            Atrás
          </Boton1>
                
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
                                width="100%"
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
                                label="Telefono"
                                value={formData.telefono}
                                onChange={(val) => handleChange("telefono", val)}
                                 width="100%"
                                type="number"
                            />
                        </div>

                        <div className="form-row">
                            {/* PASSWORD */}
                            <InputText1
                                label="Contraseña *"
                                value={formData.password}
                                onChange={(val) => {
                                    handleChange("password", val);
                                    handleVerificarPass(val)
                                }}
                                errorMessage={errors.password}
                                required
                                type="password"
                                 width="100%"
                            />
                            
                                {barraContraseña()}
                            
                            {/* CONFIRMAR PASSWORD */}
                            <InputText1
                                label="Confirmar Contraseña *"
                                value={formData.confirmPassword || ''}
                                onChange={(val) => handleChange("confirmPassword", val)}
                                errorMessage={errors.confirmPassword}
                                required
                                type="password"
                                 width="100%"
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
                            style={{ marginTop: '20px', width:"100%" }}
                            
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


