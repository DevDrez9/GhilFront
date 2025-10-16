// ~/componentes/ProductoEditForm.tsx (Versión optimizada para recibir el DTO)

import { useState, useEffect, useMemo } from "react";
// 🚨 AGREGAR IMPORTS DE COMPONENTES Y HOOKS NECESARIOS
import InputText1 from "~/componentes/InputText1"; 
import Boton1 from "~/componentes/Boton1";
import Switch1 from "~/componentes/switch1"; 
import ComboBox1 from "~/componentes/ComboBox1"; // ⬅️ AGREGADO
import { useProductos } from "~/hooks/useProductos"; 
import { useCategorias } from "~/hooks/useCategorias"; // ⬅️ AGREGADO
import { useProveedores } from "~/hooks/useProveedores"; // ⬅️ AGREGADO

import {type ProductoResponseDto, type UpdateProductoDto } from "~/models/producto.model"; // DTOs
import "./ProductoEditForm.style.css"
// --- Tipos ---
type LocalImage = { 
    localId: number; 
    backendId?: number; 
    url: string; 
    name: string; 
};

interface ProductoEditFormProps {
    visible: boolean;
    onClose: () => void;
    initialProductData: ProductoResponseDto; 
}

// --- VALORES INICIALES DERIVADOS ---
const mapProductToFormState = (product: ProductoResponseDto) => ({
    nombre: product.nombre || "",
    descripcion: product.descripcion || "",
    precio: product.precio || 0,
    precioOferta: product.precioOferta,
    enOferta: product.enOferta || false,
    esNuevo: product.esNuevo || false,
    esDestacado: product.esDestacado || false,
    stock: product.stock,
    stockMinimo: product.stockMinimo,
    sku: product.sku || "",
    imagenUrl: product.imagenUrl || "",
    categoriaId: product.categoriaId || 0,
    subcategoriaId: product.subcategoriaId,
    tiendaId: product.tiendaId || 0,
    proveedorId: product.proveedorId,
});

const mapProductImagesToLocalState = (product: ProductoResponseDto): LocalImage[] => {
    return product.imagenes.map(img => ({
        localId: Date.now() + img.id, 
        backendId: img.id, 
        url: img.url,
        name: img.url.substring(img.url.lastIndexOf('/') + 1),
    }));
};


const ProductoEditForm: React.FC<ProductoEditFormProps> = ({ visible, onClose, initialProductData }) => {
    
    const { updateProducto, isUpdating, updateError } = useProductos(); 
    const [debouncedSearch] = useState(""); // Usamos un estado simple para la búsqueda (o "" si no la necesitas)

    // 1. CONSUMO DE DATOS DE CATEGORÍAS Y PROVEEDORES
    const { categorias, isLoading: isLoadingCats } = useCategorias(debouncedSearch); 
    const { proveedores, isLoading: isLoadingProv } = useProveedores(debouncedSearch); 
    
    const isMutating = isUpdating;
    const containerClasses = [
        "contenedorEditFormProducto",
        visible ? "visible" : "noVisible",
    ].filter(Boolean).join(" ");

    // ESTADO INICIAL
    const [formData, setFormData] = useState(() => mapProductToFormState(initialProductData));
    const [localImages, setLocalImages] = useState(() => mapProductImagesToLocalState(initialProductData));
    const [errors, setErrors] = useState<Record<string, string>>({});
// ----------------------------------------------------------------------
// LÓGICA DE CASCADA (Mismo que en ProductoForm.tsx)
// ----------------------------------------------------------------------

    // 2. LÓGICA DE SUBCATEGORÍAS EN CASCADA
    const subcategoriasDisponibles = useMemo(() => {
        if (formData.categoriaId > 0 && Array.isArray(categorias)) {
            const categoriaSeleccionada = categorias.find((c) => c.id === Number(formData.categoriaId));
            return categoriaSeleccionada ? categoriaSeleccionada.subcategorias : [];
        }
        return [];
    }, [formData.categoriaId, categorias]);

    // 3. EFECTO: Limpiar Subcategoría al cambiar Categoría
    useEffect(() => {
            // Reinicializa formData con los datos del producto actual
        setFormData(mapProductToFormState(initialProductData));
        
        // Reinicializa localImages con las imágenes del producto actual
        setLocalImages(mapProductImagesToLocalState(initialProductData));

        // Si la Categoría seleccionada es 0 (o no hay categoría) y hay una subcategoría seleccionada, la limpiamos.
        if (formData.categoriaId === 0 && formData.subcategoriaId !== undefined) {
            setFormData(prev => ({ ...prev, subcategoriaId: undefined }));
            return;
        }
        
        // Si hay una categoría seleccionada y una subcategoría seleccionada,
        // pero el ID de la subcategoría seleccionada NO se encuentra en la nueva lista de disponibles, la limpiamos.
        if (formData.categoriaId !== 0 && formData.subcategoriaId !== undefined) {
            if (!subcategoriasDisponibles.some(s => s.id === formData.subcategoriaId)) {
                setFormData(prev => ({ ...prev, subcategoriaId: undefined }));
            }
        }

      
        
        setErrors({}); // Opcional: Limpia errores al cargar un nuevo producto
        // Dependemos solo de la categoría y las subcategorías disponibles (para evitar auto-borrado)
    }, [formData.categoriaId, subcategoriasDisponibles, initialProductData]); 
    
// ----------------------------------------------------------------------
// PREPARACIÓN DE OPTIONS (Conversión de ID number a value string)
// ----------------------------------------------------------------------

    // 4. PREPARACIÓN DE LAS OPTIONS
    const categoriaOptions = useMemo(() => 
        (Array.isArray(categorias) ? categorias : []).map(c => ({ 
            value: c.id.toString(), 
            label: c.nombre 
        }))
    , [categorias]);

    const subcategoriaOptions = useMemo(() => 
        subcategoriasDisponibles.map(s => ({ 
            value: s.id.toString(), 
            label: s.nombre 
        }))
    , [subcategoriasDisponibles]);

    const proveedorOptions = useMemo(() => 
        (Array.isArray(proveedores) ? proveedores : []).map(p => ({ 
            value: p.id.toString(), 
            label: p.nombre 
        }))
    , [proveedores]);


// ----------------------------------------------------------------------
// MANEJADORES DE CAMBIOS (Manejo de la conversión string <-> number/undefined)
// ----------------------------------------------------------------------
    
    const handleChange = (field: string, value: any) => {
        let finalValue: any = value;

        // --- Manejo de IDs (ComboBox1 devuelve un string) ---
        if (field.endsWith('Id') && typeof value === 'string') {
            
            // Si el valor es una cadena vacía ('') o "0", es un valor nulo o "sin seleccionar"
            if (value === '' || value === '0') {
                
                // subcategoriaId y proveedorId son opcionales
                if (field === 'subcategoriaId' || field === 'proveedorId') {
                     finalValue = undefined; 
                } else {
                     // categoriaId y tiendaId son obligatorios (se asume que TiendaId también usará ComboBox)
                     finalValue = 0; 
                }
            } else {
                // Si tiene valor, lo convertimos a número
                finalValue = Number(value); 
            }
        } 
        
        // --- Manejo de campos numéricos de InputText1 (puede devolver string) ---
        else if (typeof value === 'string' && (field === 'precio' || field === 'precioOferta' || field === 'stock' || field === 'stockMinimo')) {
            finalValue = value === '' ? undefined : Number(value);
        }
        // Para otros tipos (booleanos, etc.)
        else {
             finalValue = value;
        }

        setFormData((prev) => ({
            ...prev,
            [field]: finalValue,
        }));
    };
    
    // handleSwitchChange y validate se mantienen igual
    // ... [handleSwitchChange, handleFileChange, removeImage, validate, mapImagesToDto, handleSubmit se mantienen igual] ...
    
    // ... Código de manejadores de archivos y submit ...
    const handleSwitchChange = (field: string, value: boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value, }));
    };
    // [handleFileChange, removeImage, validate, mapImagesToDto, handleSubmit son iguales al original]
    
    // Función de subida de archivos (sólo añade Base64)
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        const filesArray = Array.from(e.target.files);
        if (filesArray.length === 0) return;

        const promises: Promise<LocalImage>[] = filesArray.map((file, index) => {
            const localId = Date.now() + index;
            return new Promise<LocalImage>((resolve) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    resolve({ 
                        localId, 
                        url: event.target?.result as string, // Base64
                        name: file.name 
                    });
                };
                reader.readAsDataURL(file);
            });
        });

        // Añadir las nuevas imágenes (Base64) a la lista existente
        Promise.all(promises).then(newImages => {
            setLocalImages(prev => [...prev, ...newImages]);
        });
    };
    
    // Función para eliminar imágenes (solo la quita del estado local)
    const removeImage = (localIdToRemove: number) => {
        setLocalImages(prev => prev.filter(img => img.localId !== localIdToRemove));
    };


    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.nombre.trim()) newErrors.nombreError = "El nombre es obligatorio";
        if (!formData.precio || Number(formData.precio) <= 0) newErrors.precioError = "El precio debe ser mayor a 0";
        if (!formData.categoriaId || Number(formData.categoriaId) <= 0) newErrors.categoriaIdError = "La categoría es obligatoria";
        if (!formData.tiendaId || Number(formData.tiendaId) <= 0) newErrors.tiendaIdError = "La tienda es obligatoria";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    // Mapea las imágenes locales al DTO de mutación
    const mapImagesToDto = (): UpdateProductoDto['imagenes'] => {
        return localImages.map((img, index) => ({
            // Envía el backendId para imágenes existentes. Si es undefined, el backend sabe que es nuevo (Base64).
            id: img.backendId, 
            url: img.url, 
            orden: index + 1, // El orden se reasigna según la posición actual
        }));
    };

    // ----------------------------------------------------
    // SUBMIT
    // ----------------------------------------------------

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return console.log("Formulario no válido");

        try {
            const dataToSend: UpdateProductoDto = {
                ...formData,
                precio: Number(formData.precio),
                precioOferta: formData.precioOferta ? Number(formData.precioOferta) : undefined,
                stock: formData.stock ? Number(formData.stock) : undefined,
                stockMinimo: formData.stockMinimo ? Number(formData.stockMinimo) : undefined,
                categoriaId: Number(formData.categoriaId),
                subcategoriaId: formData.subcategoriaId ? Number(formData.subcategoriaId) : undefined,
                tiendaId: Number(formData.tiendaId),
                proveedorId: formData.proveedorId ? Number(formData.proveedorId) : undefined,
                
                // Imágenes a enviar (Base64 nuevos + IDs de existentes)
                imagenes: mapImagesToDto(),
            };
            
            // Usamos el ID del producto que vino en la prop inicial
            await updateProducto({ id: initialProductData.id, data: dataToSend });
            
            alert("✅ Producto actualizado con éxito.");
            onClose();
            
        } catch (error) {
            alert(`❌ No se pudo actualizar el producto.`);
            console.error("Error en submit:", error);
        }
    };

    // ----------------------------------------------------
    // RENDERIZADO
    // ----------------------------------------------------

    const title = "Editar Producto";
    const buttonText = isMutating ? "Actualizando..." : "Actualizar Producto";
    const isDisabled = isMutating;

    return (
        <div className={containerClasses}>
            <div className="cuerpoProductoEditForm">
                <h2>{title}</h2>
                <Boton1 type="button" size="medium" variant="info" onClick={onClose}>
                    Atrás
                </Boton1>

                <div className="formEditProducto">
                    <form onSubmit={handleSubmit}>
                        
                        {/* === INFORMACIÓN BÁSICA (Y demás fieldsets) === */}
                        <fieldset disabled={isDisabled}>
                            <legend>Información Básica</legend>
                            <InputText1 label="Nombre *" value={formData.nombre} onChange={(val) => handleChange("nombre", val)} errorMessage={errors.nombreError} required type="text" width={450} />
                            <InputText1 label="Descripción" value={formData.descripcion} onChange={(val) => handleChange("descripcion", val)} type="text" width={450} />
                            <InputText1 label="Tallas" value={formData.sku } placeholder="Añadir tallas separadas por coma (S,L,M)"onChange={(val) => handleChange("sku", val)} type="text" width={450} />
                        </fieldset>

                        <fieldset disabled={isDisabled}>
                            <legend>Precios </legend>
                            <div className="form-row">
                                {/* Asegúrate de que los valores numéricos se muestren como strings */}
                                <InputText1 label="Precio *" value={formData.precio + ""} onChange={(val) => handleChange("precio", val)} errorMessage={errors.precioError} required type="number" width="100%" />
                                <InputText1 label="Precio de Oferta" value={formData.precioOferta+ ""} onChange={(val) => handleChange("precioOferta", val)} type="number" width="100%" />
                                <div style={{ width: 150, paddingLeft: 10 }}>
                                    <Switch1 label="En Oferta" checked={formData.enOferta} onChange={(val) => handleSwitchChange("enOferta", val)} />
                                </div>
                            </div>{/*
                            <div className="form-row">
                                <InputText1 label="Stock" value={formData.stock+ ""} onChange={(val) => handleChange("stock", val)} type="number" width={220} />
                                <InputText1 label="Stock Mínimo" value={formData.stockMinimo+ ""} onChange={(val) => handleChange("stockMinimo", val)} type="number" width={220} />
                            </div>*/}
                        </fieldset>

                        {/* === CLASIFICACIÓN Y PROVEEDOR (COMBOBOXES) === */}
                        <fieldset disabled={isDisabled}>
                            <legend>Clasificación y Ubicación</legend>
                            <div className="form-row">
                                
                                {/* ComboBox1: CATEGORÍA */}
                                <ComboBox1
                                    label="Categoría *"
                                    value={formData.categoriaId.toString()} 
                                    onChange={(val) => handleChange("categoriaId", val)}
                                    options={categoriaOptions}
                                    disabled={isLoadingCats}
                                    required={true}
                                    placeholder={isLoadingCats ? 'Cargando...' : 'Seleccione'}
                                    errorMessage={errors.categoriaIdError}
                                    width="100%"
                                />

                                {/* ComboBox1: SUBCATEGORÍA */}
                                <ComboBox1
                                    label="Subcategoría"
                                    value={(formData.subcategoriaId || '').toString()} 
                                    onChange={(val) => handleChange("subcategoriaId", val)}
                                    options={subcategoriaOptions}
                                    disabled={formData.categoriaId === 0 || subcategoriaOptions.length === 0}
                                    placeholder={formData.categoriaId === 0 ? 'Seleccione Categoría' : 'Opcional'}
                                    width="100%"
                                />

                                {/* ComboBox1: PROVEEDOR */}
                                <ComboBox1
                                    label="Proveedor"
                                    value={(formData.proveedorId || '').toString()} 
                                    onChange={(val) => handleChange("proveedorId", val)}
                                    options={proveedorOptions}
                                    disabled={isLoadingProv}
                                    placeholder={isLoadingProv ? 'Cargando...' : 'Opcional'}
                                    width="100%"
                                />
                            </div>
                                
                                {/* Si no usas ComboBox para tiendaId, déjalo como InputText1 
                            <InputText1 label="ID de Tienda *" value={formData.tiendaId.toString()} onChange={(val) => handleChange("tiendaId", val)} errorMessage={errors.tiendaIdError} required type="number" width={450} />
                       */} </fieldset>

                        {/* === IMÁGENES === */}
                        {/* ... (El resto del formulario de imágenes y botones se mantiene igual) ... */}
                        
                        <fieldset disabled={isDisabled}>
                            <legend>Imágenes y Opciones</legend>
                            
                            <div className="custom-file-upload" style={{ marginBottom: '10px' }}>
                                <label htmlFor="file-upload-input" className="custom-file-label">
                                    + Añadir Imágenes ({localImages.length})
                                </label>
                                <input
                                    id="file-upload-input" 
                                    type="file"
                                    multiple 
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }} 
                                />
                            </div>
                            
                            {localImages.length > 0 && (
                                <div className="image-preview-container">
                                    {localImages.map((img, index) => (
                                        <div key={img.localId} className="image-preview-item">
                                            <img 
                                                src={img.url.startsWith('data:image') ? img.url :  "http://localhost:3000/uploads/productos/"+img.url} 
                                                alt={`Vista previa ${index + 1}`} 
                                            />
                                            <div className="image-order-label">{index + 1}</div>
                                            {img.backendId && <div className="existing-tag">💾</div>}
                                            <button 
                                                type="button" 
                                                className="remove-image-btn"
                                                onClick={() => removeImage(img.localId)}
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
{/*
                            <InputText1 label="Imagen Principal URL (Opcional/Fallback)" value={formData.imagenUrl} onChange={(val) => handleChange("imagenUrl", val)} type="text" width={450} />
                            */}
                            <div className="form-row" style={{ marginTop: '15px' }}>
                                <Switch1 label="Es Nuevo" checked={formData.esNuevo} onChange={(val) => handleSwitchChange("esNuevo", val)} />
                                <Switch1 label="Es Destacado" checked={formData.esDestacado} onChange={(val) => handleSwitchChange("esDestacado", val)} />
                            </div>
                        </fieldset>

                        <Boton1 
                            type="submit" 
                            fullWidth 
                            size="large" 
                            disabled={isDisabled}
                            style={{ marginTop: '20px',width:"100%" }}

                        >
                            {buttonText}
                        </Boton1>

                        {updateError && (
                            <div className="error-alert">
                                Error al actualizar: {updateError.message}
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProductoEditForm;