import { useState, useMemo, useEffect } from "react"; 
import { useQuery } from "@tanstack/react-query";

// 🚨 AJUSTA LAS RUTAS DE IMPORTACIÓN SEGÚN TU PROYECTO
import InputText1 from "~/componentes/InputText1"; 
import Boton1 from "~/componentes/Boton1";
import Switch1 from "~/componentes/switch1"; 
import ComboBox1 from "~/componentes/ComboBox1"; 

// Hooks simulados (debes tenerlos definidos en tu carpeta hooks)
import { useProductos } from "~/hooks/useProductos"; 
import { useCategorias } from "~/hooks/useCategorias"; // Asume que este hook utiliza el query que definiste
import { useProveedores } from "~/hooks/useProveedores"; // Asume que este hook devuelve un array de Proveedores

// Modelos/DTOs
import { CreateImagenProductoDto } from "~/models/productoCreate"; 
import "./Productos.style.css"
import { useAlert } from "~/componentes/alerts/AlertContext";


// Interfaces y Tipos
interface ProductoFormProps {
  visible: boolean;
  onClose: () => void;
}

type PreviewImage = { 
    id: number; 
    dataUrl: string; 
    name: string; 
};

// ====================================================================
// COMPONENTE PRINCIPAL
// ====================================================================

const ProductoForm: React.FC<ProductoFormProps> = ({ visible, onClose }) => {
    const { createProducto, isCreating, createError } = useProductos();
    
    // Estado para el término de búsqueda (necesario si useCategorias lo requiere)
    const [debouncedSearch, setDebouncedSearch] = useState(""); 

    // 1. CONSUMO DE DATOS DE CATEGORÍAS (AJUSTADO: usamos 'categorias' directamente)
    const { 
        categorias, 
        isLoading: isLoadingCats // Usamos 'isLoading' del hook, que es tu 'categoriasQuery.isLoading'
    } = useCategorias(debouncedSearch); 
    
    // NOTA: 'categorias' aquí será de tipo CategoriaResponseDto[] o el valor por defecto (tu hook usa '[]')
    // No necesitamos desestructurar 'data: categoriasData'
     // ✅ SOLUCIÓN 2: Agregamos containerClasses
    const containerClasses = [
        "contenedorFormProducto",
        visible ? "visible" : "noVisible",
    ]
        .filter(Boolean)
        .join(" ");

    // 2. CONSUMO DE DATOS DE PROVEEDORES
    const { proveedores, isLoading: isLoadingProv } = useProveedores(debouncedSearch);

    // ... [containerClasses y estados del formulario se mantienen igual] ...
    
    // ESTADO PRINCIPAL DEL FORMULARIO
    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: "",
        precio: 0,
        precioOferta: undefined as number | undefined,
        enOferta: false,
        esNuevo: false,
        esDestacado: false,
        stock: undefined as number | undefined,
        stockMinimo: undefined as number | undefined,
        sku: "",
        tallas:"",
        imagenUrl: "",
        categoriaId: 0, 
        subcategoriaId: undefined as number | undefined,
        tiendaId: 0,
        proveedorId: undefined as number | undefined,
    });

    const [imagenesBase64Nuevos, setImagenesBase64] = useState<CreateImagenProductoDto[]>([]);
    const [previewUrlsNuevos, setPreviewUrls] = useState<PreviewImage[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
  

   // 4. LÓGICA DE SUBCATEGORÍAS EN CASCADA
const subcategoriasDisponibles = useMemo(() => {
    if (formData.categoriaId > 0 && Array.isArray(categorias)) {
        const categoriaSeleccionada = categorias.find((c) => c.id === Number(formData.categoriaId));
        return categoriaSeleccionada ? categoriaSeleccionada.subcategorias : [];
    }
    return [];
}, [formData.categoriaId, categorias]);
  
    // 4. EFECTO: Limpiar Subcategoría al cambiar Categoría
   useEffect(() => {
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
    
    // IMPORTANTE: El efecto solo debe depender de la CATEGORÍA y la lista de SUBCATEGORÍAS, 
    // NO del subcategoriaId, para evitar que se borre a sí mismo.
}, [formData.categoriaId, subcategoriasDisponibles]); // Eliminamos formData.subcategoriaId de las dependencias


    // 5. PREPARACIÓN DE LAS OPTIONS PARA COMBOBOX1
    const categoriaOptions = useMemo(() => 
    Array.isArray(categorias) 
        ? categorias.map(c => ({ 
            value: c.id.toString(), // Convertimos el ID a string
            label: c.nombre 
          }))
        : [] // Devolvemos un array vacío si no es un array válido
, [categorias]);

    const subcategoriaOptions = useMemo(() => 
    subcategoriasDisponibles.map(s => ({ value: s.id.toString(), label: s.nombre }))
, [subcategoriasDisponibles]);

    const proveedorOptions = useMemo(() => 
        (proveedores || []).map(p => ({ value: p.id.toString(), label: p.nombre }))
    , [proveedores]);


    // 6. MANEJADORES (Se mantienen igual)
    const handleChange = (field: string, value: any) => {
        let finalValue: any = value;

        if (field === 'subcategoriaId' || field === 'proveedorId') {
            finalValue = (value === '' || value === 0) ? undefined : Number(value);
        } else if (field.endsWith('Id') && (typeof value === 'string' || typeof value === 'number')) {
            finalValue = Number(value);
        } else if (typeof value === 'string' && (field === 'precio' || field === 'precioOferta' || field === 'stock' || field === 'stockMinimo')) {
            finalValue = value === '' ? undefined : Number(value);
        }

        setFormData((prev) => ({
            ...prev,
            [field]: finalValue,
        }));
    };
    
    const handleSwitchChange = (field: string, value: boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.nombre.trim()) newErrors.nombreError = "El nombre es obligatorio";
        if (!formData.precio || Number(formData.precio) <= 0) newErrors.precioError = "El precio debe ser mayor a 0";
        if (!formData.categoriaId || Number(formData.categoriaId) <= 0) newErrors.categoriaIdError = "La categoría es obligatoria";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    // 1. Asegúrate de tener el hook al inicio del componente
  const { showAlert } = useAlert();

  // ...

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      try {
        // 2. Preparar el objeto de datos
        const dataToSend = {
          ...formData,
          // Conversiones numéricas
          precio: Number(formData.precio),
          precioOferta: formData.precioOferta ? Number(formData.precioOferta) : undefined,
          stock: formData.stock ? Number(formData.stock) : undefined,
          stockMinimo: formData.stockMinimo ? Number(formData.stockMinimo) : undefined,
          
          // IDs relacionados
          categoriaId: Number(formData.categoriaId),
          subcategoriaId: formData.subcategoriaId ? Number(formData.subcategoriaId) : undefined,
          tiendaId: 1, // Ojo: Si esto es dinámico, asegúrate de obtenerlo del contexto
          proveedorId: formData.proveedorId ? Number(formData.proveedorId) : undefined,
          
          // Imágenes (Solo enviamos si hay nuevas)
          imagenes: imagenesBase64Nuevos.length > 0 ? imagenesBase64Nuevos : undefined,
        };

        // 3. Ejecutar la creación
        await createProducto(dataToSend as any);

        // 
        // 4. ÉXITO: Notificar y cerrar
        await showAlert("Producto guardado exitosamente.", "success");
        onClose();

      } catch (error: any) {
        console.error("Error al guardar:", error);
        
        // 5. ERROR: Mostrar mensaje específico
        const errorMsg = error?.message || "No se pudo guardar el producto. Verifique los datos.";
        showAlert(errorMsg, "error");
      }
    } else {
      // 6. Validación fallida
      showAlert("El formulario tiene errores. Revise los campos obligatorios.", "warning");
    }
  };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        const filesArray = Array.from(e.target.files);
        if (filesArray.length === 0) return;

        const base64Promises: Promise<CreateImagenProductoDto>[] = [];
        const previewPromises: Promise<PreviewImage>[] = [];
        const startIndex = previewUrlsNuevos.length; 

        filesArray.forEach((file, index) => {
          const id = Date.now() + index; 
          
          const promise = new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => {
              resolve(event.target?.result as string);
            };
            reader.readAsDataURL(file); 
          });
          
          previewPromises.push(promise.then(dataUrl => ({ 
              id, 
              dataUrl, 
              name: file.name 
          })));
          
          base64Promises.push(promise.then(dataUrl => ({ 
                  url: dataUrl, 
                  orden: startIndex + index + 1
          })));
        });

        Promise.all(previewPromises).then(newPreviews => setPreviewUrls(prev => [...prev, ...newPreviews]));
        Promise.all(base64Promises).then(newBase64s => setImagenesBase64(prev => [...prev, ...newBase64s]));
    };
    
    const removeImage = (idToRemove: number) => {
        const dataUrlToRemove = previewUrlsNuevos.find(p => p.id === idToRemove)?.dataUrl;
    
        if (!dataUrlToRemove) return;
    
        const newPreviewUrls = previewUrlsNuevos.filter(p => p.id !== idToRemove)
        setPreviewUrls(newPreviewUrls);
    
        const newBase64s = imagenesBase64Nuevos
            .filter(img => img.url !== dataUrlToRemove)
            .map((img, index) => ({...img, orden: index + 1})); 
            
        setImagenesBase64(newBase64s);
    };

    // ----------------------------------------------------
    // RENDERIZADO
    // ----------------------------------------------------

    return (
        <>
            <div className={containerClasses}>
                <div className="cuerpoProductoForm">
                    <h2>Nuevo Producto</h2>
                    <Boton1 type="button" size="medium" variant="info" onClick={onClose}>
                        Atrás
                    </Boton1>

                    <div className="formProducto">
                        <form onSubmit={handleSubmit}>
                            
                            {/* === INFORMACIÓN BÁSICA === */}
                            <fieldset>
                                <legend>Información Básica</legend>
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
                                    label="Descripción"
                                    value={formData.descripcion}
                                    onChange={(val) => handleChange("descripcion", val)}
                                    type="text"
                                    width={450}
                                />
                                <InputText1
                                    label="Sku"
                                    value={formData.sku}
                                    onChange={(val) => handleChange("sku", val)}
                                    type="text"
                                    width={450}
                                    placeholder="Añadir sku para identificar"
                                    
                                    
                                />
                                <InputText1
                                    label="Tallas"
                                    value={formData.tallas}
                                    onChange={(val) => handleChange("tallas", val)}
                                    type="text"
                                    width={450}
                                    placeholder="Añadir tallas separadas por coma (S,L,M)"
                                    
                                    
                                />
                            </fieldset>

                            {/* === PRECIOS Y STOCK === */}
                            <fieldset>
                                <legend>Precios </legend>
                                <div className="form-row">
                                    <InputText1
                                        label="Precio *"
                                        value={formData.precio + ""}
                                        onChange={(val) => handleChange("precio", val)}
                                        errorMessage={errors.precioError}
                                        required
                                        type="number"
                                        width="100%"
                                    />
                                    <InputText1
                                        label="Precio de Oferta"
                                        value={formData.precioOferta + ""}
                                        onChange={(val) => handleChange("precioOferta", val)}
                                        type="number"
                                        width="100%"
                                    />
                                    <div style={{ width: 150, paddingLeft: 10 }}>
                                        <Switch1
                                            label="En Oferta"
                                            checked={formData.enOferta}
                                            onChange={(val) => handleSwitchChange("enOferta", val)}
                                        />
                                    </div>
                                </div>
                               {/* <div className="form-row">
                                    <InputText1
                                        label="Stock"
                                        value={formData.stock+ ""}
                                        onChange={(val) => handleChange("stock", val)}
                                        type="number"
                                        width={220}
                                    />
                                    <InputText1
                                        label="Stock Mínimo"
                                        value={formData.stockMinimo+ ""}
                                        onChange={(val) => handleChange("stockMinimo", val)}
                                        type="number"
                                        width={220}
                                    />
                                </div>*/}
                            </fieldset>

                            {/* === CLASIFICACIÓN Y PROVEEDOR (COMBOBOXES) === */}
                            <fieldset>
                                <legend>Clasificación y Ubicación</legend>
                                <div className="form-row">
                                    
                                    {/* ComboBox1: CATEGORÍA (Obligatorio) */}
                                    <ComboBox1
                                        label="Categoría *"
                                        value={formData.categoriaId+""}
                                        onChange={(val) => handleChange("categoriaId", val)}
                                        options={categoriaOptions}
                                        disabled={isLoadingCats}
                                        required={true}
                                        placeholder={isLoadingCats ? 'Cargando...' : 'Seleccione'}
                                        errorMessage={errors.categoriaIdError}
                                        width="100%" 
                                    />

                                    {/* ComboBox1: SUBCATEGORÍA (Dependiente/Opcional) */}
                                    <ComboBox1
                                        label="Subcategoría"
                                        value={formData.subcategoriaId+""} 
                                        onChange={(val) => handleChange("subcategoriaId", val)}
                                        options={subcategoriaOptions}
                                        disabled={formData.categoriaId === 0 || subcategoriaOptions.length === 0}
                                        placeholder={formData.categoriaId === 0 ? 'Seleccione Categoría' : 'Opcional'}
                                        width="100%"
                                    />

                                    {/* ComboBox1: PROVEEDOR (Opcional) */}
                                    <ComboBox1
                                        label="Proveedor"
                                        value={formData.proveedorId+""} 
                                        onChange={(val) => handleChange("proveedorId", val)}
                                        options={proveedorOptions}
                                        disabled={isLoadingProv}
                                        placeholder={isLoadingProv ? 'Cargando...' : 'Opcional'}
                                        width="100%"
                                    />
                                </div>
                            </fieldset>
                            
                            {/* === IMÁGENES Y OPCIONES === */}
                            <fieldset>
                                <legend>Imágenes y Opciones</legend>
                                
                                <div className="custom-file-upload" style={{ marginBottom: '10px' }}>
                                    <label htmlFor="file-upload-input" className="custom-file-label">
                                        + Añadir Imágenes ({previewUrlsNuevos.length})
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
                                
                                {previewUrlsNuevos.length > 0 && (
                                    <div className="image-preview-container">
                                        {previewUrlsNuevos.map((preview, index) => (
                                            <div key={preview.id} className="image-preview-item">
                                                <img 
                                                    src={preview.dataUrl} 
                                                    alt={`Vista previa ${index + 1}`} 
                                                />
                                                <div className="image-order-label">{index + 1}</div>
                                                <button 
                                                    type="button" 
                                                    className="remove-image-btn"
                                                    onClick={() => removeImage(preview.id)}
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
{/*
                                <InputText1
                                    label="Imagen Principal URL (Opcional/Fallback)"
                                    value={formData.imagenUrl}
                                    onChange={(val) => handleChange("imagenUrl", val)}
                                    type="text"
                                    width={450}
                                />
                                */}
                                <div className="form-row" style={{ marginTop: '15px' }}>
                                    <Switch1
                                        label="Es Nuevo"
                                        checked={formData.esNuevo}
                                        onChange={(val) => handleSwitchChange("esNuevo", val)}
                                    />
                                    <Switch1
                                        label="Es Destacado"
                                        checked={formData.esDestacado}
                                        onChange={(val) => handleSwitchChange("esDestacado", val)}
                                    />
                                </div>
                            </fieldset>

                            <Boton1 
                                type="submit" 
                                fullWidth 
                                size="large" 
                                disabled={isCreating}
style={{width:"100%"}}
                            >
                                {isCreating ? "Guardando..." : "Guardar Producto"}
                            </Boton1>
                            
                            {createError && (
                                <div className="error-alert">
                                    Error al crear el producto: {(createError as Error).message}
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProductoForm;