import React, { useState, useEffect, useCallback, useMemo } from "react";
import InputText1 from "~/componentes/InputText1";
import Boton1 from "~/componentes/Boton1";
import { useConfigWeb } from "~/hooks/useConfigWeb";
import { CreateBannerDto,type UpdateConfigWebBase64Dto } from "~/models/configWeb";
import "./ConfigWeb.style.css"

// --- Tipos de Estado Interno ---
interface ConfigFormState {
    nombreSitio: string;
    colorPrimario: string;
    colorSecundario: string;
    currentLogoUrl: string;
    logoBase64: string | null;
    // Banners con un campo extra para Base64 si se sube una nueva imagen
    banners: (CreateBannerDto & { base64Data?: string | null })[]; 
}

interface ConfigWebFormProps {
    visible: boolean;
    onClose: () => void;
}

// ----------------------------------------------------
// LÓGICA CONSOLIDADA DE MANEJO DE IMAGEN Y BASE64
// ----------------------------------------------------

// Función utilitaria para convertir File a Base64
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};

// Componente Unificado para Subida de Imágenes (Logo y Banners)
interface ImageUploaderProps {
    label: string;
    currentUrl: string; // URL que llega del backend
    base64Data: string | null; // Base64 temporal
    onBase64Ready: (base64: string | null) => void;
    onUrlReset: () => void;
    disabled: boolean;
    width?: string;
}

const ImageBase64Uploader: React.FC<ImageUploaderProps> = ({ 
    label, 
    currentUrl, 
    base64Data, 
    onBase64Ready, 
    onUrlReset, 
    disabled, 
    width = '450px' 
}) => {
    
    // La previsualización usa Base64 si está presente, si no, usa la URL existente.
    const previewSource = base64Data ||  "http://localhost:3000"+currentUrl;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;
        
        if (file) {
            try {
                const base64 = await fileToBase64(file);
                onBase64Ready(base64); // Notifica al padre el Base64 listo
            } catch (error) {
                console.error("Error al convertir a Base64:", error);
                onBase64Ready(null);
            }
        } else {
            // Si el usuario cancela, resetea el Base64, manteniendo la URL si existe.
            onBase64Ready(null);
        }
    };
    
    const handleRemove = () => {
        onBase64Ready(null); // Limpiamos el Base64
        onUrlReset(); // Limpiamos la URL existente
    };

    return (
        <div style={{ width: width, marginBottom: '15px' }}>
            <label style={{ display: 'block', fontWeight: 'bold' }}>{label}</label>
            <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                disabled={disabled}
                style={{ marginBottom: '10px' }}
            />
            
            {previewSource && (
                <div style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}>
                    <img src={previewSource} alt="Vista Previa" style={{ maxWidth: '100%', maxHeight: '150px', display: 'block', objectFit: 'contain' }} />
                    <small style={{ marginTop: '5px', display: 'block', color: '#666' }}>
                        {base64Data ? "Archivo local (Base64 listo)" : "URL existente en servidor"}
                    </small>
                    <Boton1 
                        type="button" 
                        onClick={handleRemove} 
                        variant="danger" 
                        size="small"
                        disabled={disabled}
                        style={{ marginTop: '5px' }}
                    >
                        Remover Imagen
                    </Boton1>
                </div>
            )}
        </div>
    );
};
// ----------------------------------------------------
// FIN LÓGICA CONSOLIDADA DEL UPLOADER
// ----------------------------------------------------


const ConfigWebForm: React.FC<ConfigWebFormProps> = ({ visible, onClose }) => {
    const { config, configId, isLoading, isInitialLoading, createConfig, updateConfig, isMutating, mutationError } = useConfigWeb();
    
    const [formData, setFormData] = useState<ConfigFormState>({
        nombreSitio: "",
        colorPrimario: "#FFFFFF",
        colorSecundario: "#000000",
        currentLogoUrl: "",
        logoBase64: null,
        banners: [],
    });
    
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    // 🎯 EFECTO: Llenar el formulario si la configuración existe
    useEffect(() => {
        if (config) {
            setFormData({
                nombreSitio: config.nombreSitio || "",
                colorPrimario: config.colorPrimario || "#FFFFFF",
                colorSecundario: config.colorSecundario || "#000000",
                currentLogoUrl: config.logoUrl || "",
                logoBase64: null,
                banners: (config.banners || []).map(b => ({
                    ...b, 
                    url: b.url || "",
                    base64Data: null, // Campo temporal para la subida
                })),
            });
        }
    }, [config]);


    const containerClasses = [
        "contenedorFormConfigWeb",
        visible ? "visible" : "noVisible",
    ].filter(Boolean).join(" ");

    // ----------------------------------------------------
    // MANEJADORES DE ESTADO
    // ----------------------------------------------------

    const handleChange = (field: keyof Omit<ConfigFormState, 'banners' | 'logoBase64'>, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value as string }));
    };

    const handleBannerTextChange = (index: number, field: keyof CreateBannerDto, value: string | number) => {
        setFormData(prev => {
            const newBanners = [...prev.banners];
            newBanners[index] = {
                ...newBanners[index],
                [field]: value,
            };
            return { ...prev, banners: newBanners };
        });
    };
    
    // 🎯 MANEJADOR DE IMAGEN DEL BANNER
    const handleBannerImageChange = (index: number, base64: string | null) => {
        setFormData(prev => {
            const newBanners = [...prev.banners];
            newBanners[index] = {
                ...newBanners[index],
                base64Data: base64, // Guardamos el Base64 para enviar
                // Si hay Base64 nuevo, reseteamos la URL existente temporalmente (o no hacemos nada, depende de la lógica del backend)
                // Aquí solo gestionamos el Base64
            };
            return { ...prev, banners: newBanners };
        });
    };
    
    // 🎯 MANEJADOR DE RESESTEO DE URL DE BANNER
    const handleBannerUrlReset = (index: number) => {
        setFormData(prev => {
            const newBanners = [...prev.banners];
            newBanners[index] = {
                ...newBanners[index],
                url: "", // Limpiamos la URL existente
                base64Data: null, // Aseguramos que Base64 esté limpio
            };
            return { ...prev, banners: newBanners };
        });
    };

    const handleAddBanner = () => {
        setFormData(prev => ({
            ...prev,
            banners: [...prev.banners, { url: "", orden: prev.banners.length + 1, base64Data: null }],
        }));
    };
    
    const handleRemoveBanner = (index: number) => {
        setFormData(prev => ({
            ...prev,
            banners: prev.banners.filter((_, i) => i !== index),
        }));
    };
    
    // 🎯 Manejo del Logo (Desde el componente LogoUploader)
    const handleLogoBase64Ready = (base64: string | null) => {
        setFormData(prev => ({ ...prev, logoBase64: base64 }));
    };
    
    // 🎯 Manejo de reseteo de URL de Logo
    const handleLogoUrlReset = () => {
        setFormData(prev => ({ ...prev, currentLogoUrl: "" }));
    };
    
    // ----------------------------------------------------
    // VALIDACIÓN Y SUBMIT
    // ----------------------------------------------------

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        const hexColorRegex = /^#[0-9A-Fa-f]{6}$/i; 

        if (!formData.nombreSitio.trim()) newErrors.nombreSitio = "El nombre del sitio es obligatorio.";
        if (!formData.colorPrimario.match(hexColorRegex)) newErrors.colorPrimario = "Color Primario inválido (debe ser #RRGGBB).";
        if (!formData.colorSecundario.match(hexColorRegex)) newErrors.colorSecundario = "Color Secundario inválido (debe ser #RRGGBB).";
        
        // Validación de banners: Al menos una URL existente O un archivo nuevo (Base64) es necesario.
        formData.banners.forEach((b, index) => {
            if (!b.url.trim() && !b.base64Data) {
                newErrors[`bannerUrl${index}`] = `Debe seleccionar una imagen o proporcionar una URL para el Banner ${index + 1}.`;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            try {
                // Mapeo de banners antes de enviar
                const mappedBanners: CreateBannerDto[] = formData.banners.map(b => ({
                    // El backend DEBE entender que si base64Data está presente, debe ignorar b.url
                    // y usar base64Data para crear la URL final.
                    url: b.base64Data ? b.base64Data : b.url, // Usamos Base64 si existe, sino la URL existente
                    orden: b.orden || undefined,
                    titulo: b.titulo || undefined,
                    subtitulo: b.subtitulo || undefined,
                    enlace: b.enlace || undefined,
                    // Si el backend es más estricto, necesitarías un DTO diferente que envíe base64 por separado.
                    // Para simplificar, asumimos que el backend maneja el campo 'url' si es Base64.
                }));
                
                const dataToSend: UpdateConfigWebBase64Dto = {
                    nombreSitio: formData.nombreSitio.trim(),
                    colorPrimario: formData.colorPrimario,
                    colorSecundario: formData.colorSecundario,
                    banners: mappedBanners,
                };

                // Lógica para Logo
                if (formData.logoBase64) {
                    dataToSend.logoUrl = formData.logoBase64;
                   // dataToSend.logoUrl = undefined; 
                } else {
                    dataToSend.logoUrl = formData.currentLogoUrl || undefined; 
                }
                
                // --- Ejecución de Mutación ---
                if (configId) {
                    await updateConfig({ id: configId, data: dataToSend });
                    alert("✅ Configuración web actualizada con éxito.");
                } else {
                    await createConfig(dataToSend);
                    alert("✅ Configuración web creada con éxito.");
                }
                
                onClose();
            } catch (error) {
                alert(`❌ Error al ${configId ? 'editar' : 'crear'} la configuración.`);
                console.error("Error en submit:", error);
            }
        }
    };

    // ----------------------------------------------------
    // RENDERIZADO
    // ----------------------------------------------------
    
    const isReady = !isInitialLoading && !isLoading;
    const isDisabled = isMutating || !isReady;
    const submitText = configId ? "Guardar Cambios" : "Crear Configuración";

    if (isInitialLoading) {
        return <div className={containerClasses}><p>Cargando configuración...</p></div>;
    }

    return (
        <div className={containerClasses}>
            <div className="cuerpoConfigWebForm">
                <h2>{configId ? "Editar Configuración Web" : "Crear Configuración Web"}</h2>
                
                <div className="formConfigWeb">
                    <form onSubmit={handleSubmit}>
                        
                        {/* --- SECCIÓN DATOS PRINCIPALES --- */}
                        <fieldset className="seccionPrincipal" disabled={isDisabled}>
                            <legend>Datos Generales</legend>
                            
                            {/* 🎯 LOGO UPLOADER */}
                            <ImageBase64Uploader
                                label="Logo del Sitio"
                                currentUrl= {formData.currentLogoUrl}
                                base64Data={formData.logoBase64}
                                onBase64Ready={handleLogoBase64Ready}
                                onUrlReset={handleLogoUrlReset}
                                disabled={isDisabled}
                            />

                            <InputText1
                                label="Nombre del Sitio *"
                                value={formData.nombreSitio}
                                onChange={(val) => handleChange("nombreSitio", val)}
                                errorMessage={errors.nombreSitio}
                                required
                                width={450}
                            />
                            
                            <div className="form-row">
                                <InputText1
                                    label="Color Primario *"
                                    value={formData.colorPrimario}
                                    onChange={(val) => handleChange("colorPrimario", val)}
                                    errorMessage={errors.colorPrimario}
                                    type="color"
                                    required
                                    width={220}
                                />
                                <InputText1
                                    label="Color Secundario *"
                                    value={formData.colorSecundario}
                                    onChange={(val) => handleChange("colorSecundario", val)}
                                    errorMessage={errors.colorSecundario}
                                    type="color"
                                    required
                                    width={220}
                                />
                            </div>
                        </fieldset>

                        {/* --- SECCIÓN BANNERS --- */}
                        <fieldset className="seccionBanners" disabled={isDisabled}>
                            <legend>Banners de la Web ({formData.banners.length})</legend>
                            
                            {formData.banners.map((banner, index) => (
                                <div key={index} className="banner-item" style={{ border: '1px dashed #ccc', padding: '10px', marginBottom: '10px' }}>
                                    <h4>Banner #{index + 1}</h4>
                                    
                                    {/* 🎯 BANNER IMAGE UPLOADER */}
                                    <ImageBase64Uploader
                                        label={`Imagen de Banner ${index + 1}`}
                                        currentUrl={banner.url}
                                        base64Data={banner.base64Data || null}
                                        onBase64Ready={(base64) => handleBannerImageChange(index, base64)}
                                        onUrlReset={() => handleBannerUrlReset(index)}
                                        disabled={isDisabled}
                                        width="450px"
                                    />
                                    {errors[`bannerUrl${index}`] && <p style={{color: 'red', fontSize: '12px'}}>{errors[`bannerUrl${index}`]}</p>}

                                    <div className="form-row">
                                        <InputText1
                                            label="Título"
                                            value={banner.titulo || ""}
                                            onChange={(val) => handleBannerTextChange(index, "titulo", val)}
                                            width={220}
                                        />
                                        <InputText1
                                            label="Subtítulo"
                                            value={banner.subtitulo || ""}
                                            onChange={(val) => handleBannerTextChange(index, "subtitulo", val)}
                                            width={220}
                                        />
                                    </div>
                                    <div className="form-row">
                                        <InputText1
                                            label="Enlace"
                                            value={banner.enlace || ""}
                                            onChange={(val) => handleBannerTextChange(index, "enlace", val)}
                                            width={220}
                                        />
                                        <InputText1
                                            label="Orden"
                                            value={String(banner.orden || "")}
                                            onChange={(val) => handleBannerTextChange(index, "orden", Number(val))}
                                            type="number"
                                            width={220}
                                        />
                                    </div>
                                    
                                    <Boton1 
                                        type="button" 
                                        onClick={() => handleRemoveBanner(index)} 
                                        variant="danger" 
                                        size="small"
                                        style={{ marginTop: '10px' }}
                                    >
                                        Eliminar Banner
                                    </Boton1>
                                </div>
                            ))}
                            
                            <Boton1 type="button" onClick={handleAddBanner} disabled={isDisabled} style={{ marginTop: '10px' }}>
                                + Agregar Nuevo Banner
                            </Boton1>
                        </fieldset>

                        <Boton1
                            type="submit"
                            fullWidth
                            size="large"
                            disabled={isDisabled}
                            style={{ marginTop: '20px' }}
                        >
                            {isMutating ? "Guardando..." : submitText}
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

export default ConfigWebForm;