import React, { useState, useEffect } from "react";
import InputText1 from "~/componentes/InputText1";
import Boton1 from "~/componentes/Boton1";
import { useConfigWeb } from "~/hooks/useConfigWeb";
import { CreateBannerDto, type UpdateConfigWebBase64Dto } from "~/models/configWeb";
import "./ConfigWeb.style.css";
import { useAlert } from "~/componentes/alerts/AlertContext";

// ----------------------------------------------------
// TIPOS DE ESTADO INTERNO
// ----------------------------------------------------
interface ConfigFormState {
    nombreSitio: string;
    colorPrimario: string;
    colorSecundario: string;
    
    // LOGO
    currentLogoUrl: string;
    logoBase64: string | null;
    
    // CÓDIGO QR (NUEVO)
    currentImagenQrUrl: string;
    imagenQrBase64: string | null;

    // BANNERS
    banners: (CreateBannerDto & { base64Data?: string | null })[]; 
}

interface ConfigWebFormProps {
    visible: boolean;
    onClose: () => void;
}

// ----------------------------------------------------
// UTILIDADES DE IMAGEN (File -> Base64)
// ----------------------------------------------------
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};

// ----------------------------------------------------
// COMPONENTE REUTILIZABLE: ImageBase64Uploader
// ----------------------------------------------------
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
    label, currentUrl, base64Data, onBase64Ready, onUrlReset, disabled, width = '100%' 
}) => {
    // La previsualización usa Base64 si está presente, si no, usa la URL existente.
    const previewSource = base64Data || (currentUrl ? import.meta.env.VITE_API_URL + currentUrl : null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;
        if (file) {
            try {
                const base64 = await fileToBase64(file);
                onBase64Ready(base64);
            } catch (error) {
                console.error("Error al convertir a Base64:", error);
                onBase64Ready(null);
            }
        } else {
            onBase64Ready(null);
        }
    };
    
    const handleRemove = () => {
        onBase64Ready(null); // Limpiamos el Base64
        onUrlReset(); // Limpiamos la URL existente
    };

    return (
        <div style={{ width: width, marginBottom: '15px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#333' }}>{label}</label>
            
            {/* Input de Archivo */}
            <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                disabled={disabled}
                style={{ marginBottom: '10px', display: 'block', width: '100%' }}
            />
            
            {/* Previsualización */}
            {previewSource ? (
                <div style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '4px', backgroundColor: '#f9f9f9', textAlign: 'center' }}>
                    <img 
                        src={previewSource} 
                        alt="Vista Previa" 
                        style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #eee' }} 
                    />
                    <small style={{ marginTop: '8px', display: 'block', color: '#666' }}>
                        {base64Data ? "Archivo listo para subir" : "Imagen actual en servidor"}
                    </small>
                    <Boton1 
                        type="button" 
                        onClick={handleRemove} 
                        variant="danger" 
                        size="small"
                        disabled={disabled}
                        style={{ marginTop: '8px' }}
                    >
                        Quitar Imagen
                    </Boton1>
                </div>
            ) : (
                <div style={{ padding: '20px', border: '1px dashed #ccc', borderRadius: '4px', textAlign: 'center', color: '#999', fontSize: '0.9em' }}>
                    Sin imagen seleccionada
                </div>
            )}
        </div>
    );
};


// ----------------------------------------------------
// COMPONENTE PRINCIPAL: ConfigWebForm
// ----------------------------------------------------
const ConfigWebForm: React.FC<ConfigWebFormProps> = ({ visible, onClose }) => {
    const { config, configId, isLoading, isInitialLoading, createConfig, updateConfig, isMutating, mutationError } = useConfigWeb();
    
    const [formData, setFormData] = useState<ConfigFormState>({
        nombreSitio: "",
        colorPrimario: "#FFFFFF",
        colorSecundario: "#000000",
        
        // Logo
        currentLogoUrl: "",
        logoBase64: null,

        // QR
        currentImagenQrUrl: "",
        imagenQrBase64: null,

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

                currentImagenQrUrl: config.imagenQr || "",
                imagenQrBase64: null,

                banners: (config.banners || []).map(b => ({
                    ...b, 
                    url: b.url || "",
                    base64Data: null, 
                })),
            });
        }
    }, [config]);

    const containerClasses = ["contenedorFormConfigWeb", visible ? "visible" : "noVisible"].filter(Boolean).join(" ");

    // ----------------------------------------------------
    // MANEJADORES
    // ----------------------------------------------------

    const handleChange = (field: keyof Omit<ConfigFormState, 'banners' | 'logoBase64' | 'imagenQrBase64'>, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // --- Banners ---
    const handleBannerImageChange = (index: number, base64: string | null) => {
        setFormData(prev => {
            const newBanners = [...prev.banners];
            newBanners[index] = { ...newBanners[index], base64Data: base64 };
            return { ...prev, banners: newBanners };
        });
    };
    
    const handleBannerUrlReset = (index: number) => {
        setFormData(prev => {
            const newBanners = [...prev.banners];
            newBanners[index] = { ...newBanners[index], url: "", base64Data: null };
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
    
    // --- Logo ---
    const handleLogoBase64Ready = (base64: string | null) => setFormData(prev => ({ ...prev, logoBase64: base64 }));
    const handleLogoUrlReset = () => setFormData(prev => ({ ...prev, currentLogoUrl: "" }));

    // --- QR ---
    const handleQrBase64Ready = (base64: string | null) => setFormData(prev => ({ ...prev, imagenQrBase64: base64 }));
    const handleQrUrlReset = () => setFormData(prev => ({ ...prev, currentImagenQrUrl: "" }));

    // ----------------------------------------------------
    // VALIDACIÓN Y SUBMIT
    // ----------------------------------------------------

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        const hexColorRegex = /^#[0-9A-Fa-f]{6}$/i; 

        if (!formData.nombreSitio.trim()) newErrors.nombreSitio = "El nombre del sitio es obligatorio.";
        if (!formData.colorPrimario.match(hexColorRegex)) newErrors.colorPrimario = "Color inválido.";
        if (!formData.colorSecundario.match(hexColorRegex)) newErrors.colorSecundario = "Color inválido.";
        
        formData.banners.forEach((b, index) => {
            if (!b.url.trim() && !b.base64Data) {
                newErrors[`bannerUrl${index}`] = `Imagen requerida para Banner ${index + 1}.`;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const { showAlert } = useAlert();
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            try {
                const mappedBanners = formData.banners.map(b => ({
                    url: b.base64Data ? b.base64Data : b.url,
                    orden: b.orden,
                    // ... otros campos si tuvieras título, enlace, etc.
                }));
                
                const dataToSend: UpdateConfigWebBase64Dto = {
                    nombreSitio: formData.nombreSitio.trim(),
                    colorPrimario: formData.colorPrimario,
                    colorSecundario: formData.colorSecundario,
                    banners: mappedBanners,
                    
                    // LOGO
                    logoUrl: formData.logoBase64 ? formData.logoBase64 : (formData.currentLogoUrl || ""),

                    // QR
                    imagenQr: formData.imagenQrBase64 ? formData.imagenQrBase64 : (formData.currentImagenQrUrl || ""),
                };

                if (configId) {
                    await updateConfig({ id: configId, data: dataToSend });
                    // ✅ CAMBIO: Alerta de éxito
                    await showAlert("Configuración actualizada correctamente.", "success");
                } else {
                    await createConfig(dataToSend);
                    // ✅ CAMBIO: Alerta de éxito
                    await showAlert("Configuración creada correctamente.", "success");
                }
                
                onClose();
            } catch (error: any) {
                console.error(error);
                // ✅ CAMBIO: Mostrar el mensaje real del error
                const mensajeError = error?.message || "Ocurrió un error inesperado.";
                showAlert(`Error al guardar configuración: ${mensajeError}`, "error");
            }
        }
    };

    const isReady = !isInitialLoading && !isLoading;
    const isDisabled = isMutating || !isReady;

    if (isInitialLoading) return <div className={containerClasses}><p>Cargando...</p></div>;

    return (
        <div className={containerClasses}>
            <div className="cuerpoConfigWebForm">
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                    <h2>{configId ? "Editar Configuración Web" : "Crear Configuración Web"}</h2>
                    <Boton1 type="button" variant="info" onClick={onClose} size="small">Cerrar</Boton1>
                </div>
                
                <div className="formConfigWeb">
                    <form onSubmit={handleSubmit}>
                        
                        {/* --- IDENTIDAD VISUAL --- */}
                        <fieldset className="seccionPrincipal" disabled={isDisabled} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
                            <legend style={{ fontWeight: 'bold', color: '#007bff' }}>Identidad Visual</legend>
                            
                            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
                                {/* LOGO */}
                                <ImageBase64Uploader
                                    label="Logo del Sitio"
                                    currentUrl={formData.currentLogoUrl}
                                    base64Data={formData.logoBase64}
                                    onBase64Ready={handleLogoBase64Ready}
                                    onUrlReset={handleLogoUrlReset}
                                    disabled={isDisabled}
                                    width="48%"
                                />
                                
                                {/* QR */}
                                <ImageBase64Uploader
                                    label="Código QR (Pagos/Info)"
                                    currentUrl={formData.currentImagenQrUrl}
                                    base64Data={formData.imagenQrBase64}
                                    onBase64Ready={handleQrBase64Ready}
                                    onUrlReset={handleQrUrlReset}
                                    disabled={isDisabled}
                                    width="48%"
                                />
                            </div>

                            <InputText1
                                label="Nombre del Sitio *"
                                value={formData.nombreSitio}
                                onChange={(val) => handleChange("nombreSitio", val)}
                                errorMessage={errors.nombreSitio}
                                required
                                width="100%"
                            />
                            
                            <div className="form-row" style={{ display: 'flex', gap: '20px', marginTop: '15px' }}>
                                <div style={{ flex: 1 }}>
                                    <InputText1
                                        label="Color Primario *"
                                        value={formData.colorPrimario}
                                        onChange={(val) => handleChange("colorPrimario", val)}
                                        type="color"
                                        required
                                        width="100%"
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <InputText1
                                        label="Color Secundario *"
                                        value={formData.colorSecundario}
                                        onChange={(val) => handleChange("colorSecundario", val)}
                                        type="color"
                                        required
                                        width="100%"
                                    />
                                </div>
                            </div>
                        </fieldset>

                        {/* --- BANNERS --- */}
                        <fieldset className="seccionBanners" disabled={isDisabled} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
                            <legend style={{ fontWeight: 'bold', color: '#007bff' }}>Banners ({formData.banners.length})</legend>
                            
                            {formData.banners.map((banner, index) => (
                                <div key={index} className="banner-item" style={{ border: '1px dashed #ccc', padding: '15px', marginBottom: '15px', borderRadius: '5px', backgroundColor: '#fafafa' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <h4 style={{ margin: 0 }}>Banner #{index + 1}</h4>
                                        <Boton1 type="button" onClick={() => handleRemoveBanner(index)} variant="danger" size="small">Eliminar</Boton1>
                                    </div>
                                    
                                    <ImageBase64Uploader
                                        label={`Imagen del Banner`}
                                        currentUrl={banner.url}
                                        base64Data={banner.base64Data || null}
                                        onBase64Ready={(base64) => handleBannerImageChange(index, base64)}
                                        onUrlReset={() => handleBannerUrlReset(index)}
                                        disabled={isDisabled}
                                        width="100%"
                                    />
                                    {errors[`bannerUrl${index}`] && <p style={{color: 'red', fontSize: '12px', marginTop: '-10px'}}>{errors[`bannerUrl${index}`]}</p>}
                                </div>
                            ))}
                            
                            <Boton1 type="button" onClick={handleAddBanner} disabled={isDisabled} style={{ width: '100%' }} variant="secondary">
                                + Agregar Nuevo Banner
                            </Boton1>
                        </fieldset>

                        <Boton1 type="submit" fullWidth size="large" disabled={isDisabled} style={{ marginTop: '10px' }}>
                            {isMutating ? "Guardando..." : (configId ? "Guardar Cambios" : "Crear Configuración")}
                        </Boton1>

                        {mutationError && <div className="error-alert" style={{ marginTop: '15px', color: 'red' }}>Error: {mutationError.message}</div>}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ConfigWebForm;