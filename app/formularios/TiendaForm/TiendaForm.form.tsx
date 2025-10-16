import React, { useState, useEffect } from "react";
import InputText1 from "~/componentes/InputText1";
import Boton1 from "~/componentes/Boton1";

import { useTienda } from "~/hooks/useTienda";
import { TiendaDto } from "~/models/tienda";
import "./TiendaForm.style.css"
import Switch1 from "~/componentes/switch1";


// --- Tipos de Estado Interno ---
interface TiendaFormState {
    nombre: string;
    descripcion: string;
    dominio: string;
    activa: boolean;
    esPrincipal: boolean;
}

interface TiendaFormProps {
    visible: boolean;
    onClose: () => void;
}

const TiendaForm: React.FC<TiendaFormProps> = ({ visible, onClose }) => {
    const { tienda, tiendaId, isLoading, isInitialLoading, createTienda, updateTienda, isMutating, mutationError } = useTienda();
    
    const [formData, setFormData] = useState<TiendaFormState>({
        nombre: "",
        descripcion: "",
        dominio: "",
        activa: true,
        esPrincipal: true, // Asumimos que este formulario maneja la única/principal
    });
    
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    // 🎯 EFECTO: Llenar el formulario si la tienda existe
    useEffect(() => {
        if (tienda) {
            setFormData({
                nombre: tienda.nombre || "",
                descripcion: tienda.descripcion || "",
                dominio: tienda.dominio || tienda.nombre ,
                activa: tienda.activa ?? true,
                esPrincipal: tienda.esPrincipal ?? true,
            });
        }
    }, [tienda]);


    const containerClasses = [
        "contenedorFormTienda",
        visible ? "visible" : "noVisible",
    ].filter(Boolean).join(" ");

    // ----------------------------------------------------
    // MANEJADORES DE ESTADO
    // ----------------------------------------------------

    const handleChange = (field: keyof TiendaFormState, value: string | boolean) => {
        setFormData((prev) => ({ 
            ...prev, 
            [field]: value 
        }));
    };
    
    // ----------------------------------------------------
    // VALIDACIÓN Y SUBMIT
    // ----------------------------------------------------

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        
        if (!formData.nombre.trim()) newErrors.nombre = "El nombre de la tienda es obligatorio.";
        if (!formData.dominio.trim()) newErrors.dominio = "El dominio es obligatorio (ej: mitienda.com).";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            try {
                const dataToSend: TiendaDto = {
                    nombre: formData.nombre.trim(),
                    descripcion: formData.descripcion.trim() || undefined,
                    dominio: formData.dominio.trim(),
                    activa: formData.activa,
                    esPrincipal: formData.esPrincipal,
                };

                if (tiendaId) {
                    // MODO EDICIÓN
                    await updateTienda({ id: tiendaId, data: dataToSend });
                    alert("✅ Tienda actualizada con éxito.");
                } else {
                    // MODO CREACIÓN
                    await createTienda(dataToSend);
                    alert("✅ Tienda registrada con éxito.");
                }
                
                onClose();
            } catch (error) {
                alert(`❌ Error al ${tiendaId ? 'actualizar' : 'registrar'} la tienda.`);
                console.error("Error en submit:", error);
            }
        }
    };

    // ----------------------------------------------------
    // RENDERIZADO
    // ----------------------------------------------------
    
    const isReady = !isInitialLoading && !isLoading;
    const isDisabled = isMutating || !isReady;
    const actionText = tiendaId ? "Actualizar Tienda" : "Registrar Tienda";

    if (isInitialLoading) {
        return <div className={containerClasses}><p>Cargando configuración de la tienda...</p></div>;
    }

    return (
        <div className={containerClasses}>
            <div className="cuerpoTiendaForm">
                <h2>{tiendaId ? "Editar Configuración de la Tienda" : "Registrar Tienda Principal"}</h2>
                
                <div className="formTienda">
                    <form onSubmit={handleSubmit}>
                        
                        <fieldset className="seccionDatosTienda" disabled={isDisabled}>
                            <legend>Datos Generales</legend>
                            
                            <InputText1
                                label="Nombre de la Tienda *"
                                value={formData.nombre}
                                onChange={(val) => handleChange("nombre", val)}
                                errorMessage={errors.nombre}
                                required
                                width="100%"
                            />
                            {/*
                            <InputText1
                                label="Dominio Principal *"
                                value={formData.dominio}
                                onChange={(val) => handleChange("dominio", val)}
                                errorMessage={errors.dominio}
                                required
                                width="100%"
                            />
                            */}
                            <InputText1
                                label="Descripción (Opcional)"
                                value={formData.descripcion}
                                onChange={(val) => handleChange("descripcion", val)}
                                width="100%"
                            />
                            
                            <div className="form-row" style={{ marginTop: '15px' }}>
                                <Switch1
                                    label="Tienda Activa"
                                    checked={formData.activa}
                                    onChange={(value) => handleChange('activa', value)}
                                    width="450px"
                                    size="medium"
                                />
                            </div>
                            
                            {/* Opcional: Mostrar si es principal o forzarlo */}
                            <div className="form-row" style={{ marginTop: '15px' }}>
                                <Switch1
                                    label="Es Tienda Principal"
                                    checked={formData.esPrincipal}
                                    onChange={(value) => handleChange('esPrincipal', value)}
                                    width="450px"
                                    size="medium"
                                    // Desactivar si ya existe y no queremos que se cambie fácilmente
                                    disabled={isDisabled || !!tiendaId} 
                                />
                            </div>

                        </fieldset>

                        <Boton1
                            type="submit"
                            fullWidth
                            size="large"
                            disabled={isDisabled}
                            style={{ marginTop: '20px' }}
                        >
                            {isMutating ? "Procesando..." : actionText}
                        </Boton1>

                        {mutationError && (
                            <div className="error-alert">Error: {mutationError.message}</div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TiendaForm;