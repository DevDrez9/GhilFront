import { useState } from "react";
// ASUME que estos componentes están definidos en tu proyecto
import InputText1 from "~/componentes/InputText1"; 
import Boton1 from "~/componentes/Boton1";
import Switch1 from "~/componentes/switch1"; 
import { useProductos } from "~/hooks/useProductos"; // ASUME la existencia de este hook
import { CreateImagenProductoDto } from "~/models/productoCreate"; // ASUME la existencia de este DTO

import "./Productos.style.css"
// Define las props del componente
interface ProductoFormProps {
  visible: boolean;
  onClose: () => void;
}

// Tipo para la gestión de la previsualización en el estado local
type PreviewImage = { 
    id: number; 
    dataUrl: string; // La cadena Base64
    name: string; 
};

const ProductoForm: React.FC<ProductoFormProps> = ({ visible, onClose }) => {
  // Asume que useProductos devuelve las funciones de mutación y estados
  const { createProducto, isCreating, createError } = useProductos();

  const containerClasses = [
    "contenedorFormProducto",
    visible ? "visible" : "noVisible",
  ]
    .filter(Boolean)
    .join(" ");

  // 1. ESTADO PRINCIPAL DEL FORMULARIO
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
    imagenUrl: "",
    categoriaId: 0,
    subcategoriaId: undefined as number | undefined,
    tiendaId: 0,
    proveedorId: undefined as number | undefined,
  });

  // 2. ESTADO PARA IMÁGENES BASE64 (LISTAS PARA EL ENVÍO A LA API)
  // El 'url' de CreateImagenProductoDto contendrá la cadena Base64
  const [imagenesBase64, setImagenesBase64] = useState<CreateImagenProductoDto[]>([]);
  
  // 3. ESTADO PARA LA VISTA PREVIA
  const [previewUrls, setPreviewUrls] = useState<PreviewImage[]>([]);
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ----------------------------------------------------
  // MANEJADORES DE CAMBIOS Y VALIDACIÓN
  // ----------------------------------------------------

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  
  const handleSwitchChange = (field: string, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const filesArray = Array.from(e.target.files);
    
    // Si no se seleccionan archivos, limpiamos los estados
    if (filesArray.length === 0) {
        setPreviewUrls([]);
        setImagenesBase64([]);
        return;
    }

    const base64Promises: Promise<CreateImagenProductoDto>[] = [];
    const previewPromises: Promise<PreviewImage>[] = [];

    filesArray.forEach((file, index) => {
      const id = Date.now() + index; // ID único para gestión local
      
      const promise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve(event.target?.result as string);
        };
        reader.readAsDataURL(file); // Genera la cadena Base64
      });
      
      // Promesa para la vista previa
      previewPromises.push(promise.then(dataUrl => ({ 
          id, 
          dataUrl, 
          name: file.name 
      })));
      
      // Promesa para el envío a la API (usa la misma cadena Base64)
      base64Promises.push(promise.then(dataUrl => ({ 
           url: dataUrl, 
           orden: previewUrls.length + index + 1 // Mantiene el orden basado en el total
      })));
    });

    // Actualizar estados: añadimos las nuevas imágenes a las existentes
    Promise.all(previewPromises).then(newPreviews => setPreviewUrls(prev => [...prev, ...newPreviews]));
    Promise.all(base64Promises).then(newBase64s => setImagenesBase64(prev => [...prev, ...newBase64s]));
  };
  
  const removeImage = (idToRemove: number) => {
    const dataUrlToRemove = previewUrls.find(p => p.id === idToRemove)?.dataUrl;

    if (!dataUrlToRemove) return;

    // 1. Eliminar de la vista previa y actualizar el orden
    const newPreviewUrls = previewUrls.filter(p => p.id !== idToRemove)
    setPreviewUrls(newPreviewUrls);

    // 2. Eliminar del array de Base64 y reordenar
    const newBase64s = imagenesBase64
        .filter(img => img.url !== dataUrlToRemove)
        .map((img, index) => ({...img, orden: index + 1})); // Reasigna el orden
        
    setImagenesBase64(newBase64s);
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

  

  // ----------------------------------------------------
  // SUBMIT
  // ----------------------------------------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      try {
        const dataToSend = {
          ...formData,
          // Conversión de strings a Number
          precio: Number(formData.precio),
          precioOferta: formData.precioOferta ? Number(formData.precioOferta) : undefined,
          stock: formData.stock ? Number(formData.stock) : undefined,
          stockMinimo: formData.stockMinimo ? Number(formData.stockMinimo) : undefined,
          categoriaId: Number(formData.categoriaId),
          subcategoriaId: formData.subcategoriaId ? Number(formData.subcategoriaId) : undefined,
          tiendaId: Number(formData.tiendaId),
          proveedorId: formData.proveedorId ? Number(formData.proveedorId) : undefined,
          
          // Adjuntar el array de Base64
          imagenes: imagenesBase64.length > 0 ? imagenesBase64 : undefined,
        };
        
        await createProducto(dataToSend as any); 
        onClose();
      } catch (error) {
        alert("No se pudo guardar el producto");
        console.error("Error al guardar:", error);
      }
    } else {
      console.log("Formulario no válido");
    }
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
                  label="SKU"
                  value={formData.sku}
                  onChange={(val) => handleChange("sku", val)}
                  type="text"
                  width={450}
                />
              </fieldset>

              {/* === PRECIOS Y STOCK === */}
              <fieldset>
                <legend>Precios y Stock</legend>
                <div className="form-row">
                  <InputText1
                    label="Precio *"
                    value={formData.precio+""}
                    onChange={(val) => handleChange("precio", val)}
                    errorMessage={errors.precioError}
                    required
                    type="number"
                    width={150}
                  />
                  <InputText1
                    label="Precio de Oferta"
                    value={formData.precioOferta+""}
                    onChange={(val) => handleChange("precioOferta", val)}
                    type="number"
                    width={150}
                  />
                  <div style={{ width: 150, paddingLeft: 10 }}>
                    <Switch1
                      label="En Oferta"
                      checked={formData.enOferta}
                      onChange={(val) => handleSwitchChange("enOferta", val)}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <InputText1
                    label="Stock"
                    value={formData.stock+""}
                    onChange={(val) => handleChange("stock", val)}
                    type="number"
                    width={220}
                  />
                  <InputText1
                    label="Stock Mínimo"
                    value={formData.stockMinimo+""}
                    onChange={(val) => handleChange("stockMinimo", val)}
                    type="number"
                    width={220}
                  />
                </div>
              </fieldset>

              {/* === CLASIFICACIÓN Y PROVEEDOR === */}
              <fieldset>
                <legend>Clasificación y Ubicación</legend>
                <div className="form-row">
                  <InputText1
                    label="ID de Categoría *"
                    value={formData.categoriaId+""}
                    onChange={(val) => handleChange("categoriaId", val)}
                    errorMessage={errors.categoriaIdError}
                    required
                    type="number"
                    width={150}
                  />
                  <InputText1
                    label="ID de Subcategoría"
                    value={formData.subcategoriaId+""}
                    onChange={(val) => handleChange("subcategoriaId", val)}
                    type="number"
                    width={150}
                  />
                  <InputText1
                    label="ID de Proveedor"
                    value={formData.proveedorId+""}
                    onChange={(val) => handleChange("proveedorId", val)}
                    type="number"
                    width={150}
                  />
                </div>
                <InputText1
                  label="ID de Tienda *"
                  value={formData.tiendaId+""}
                  onChange={(val) => handleChange("tiendaId", val)}
                  errorMessage={errors.tiendaIdError}
                  required
                  type="number"
                  width={450}
                />
              </fieldset>

              {/* === IMÁGENES Y DESTACADOS === */}
              <fieldset>
                <legend>Imágenes y Opciones</legend>
                
                {/* CAMPO DE SUBIDA DE IMÁGENES */}
                <div className="custom-file-upload" style={{ marginBottom: '10px' }}>
                  <label htmlFor="file-upload-input" className="custom-file-label">
                    + Añadir Imágenes ({previewUrls.length})
                  </label>
                  <input
                    id="file-upload-input" 
                    type="file"
                    multiple // Permite selección de múltiples archivos
                    accept="image/*"
                    onChange={handleFileChange}
                    // IMPORTANTE: El input nativo se oculta para usar el label como botón
                    style={{ display: 'none' }} 
                  />
                </div>
                
                {/* SECCIÓN DE VISTA PREVIA */}
                {previewUrls.length > 0 && (
                  <div className="image-preview-container">
                    {previewUrls.map((preview, index) => (
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

                <InputText1
                  label="Imagen Principal URL (Opcional/Fallback)"
                  value={formData.imagenUrl}
                  onChange={(val) => handleChange("imagenUrl", val)}
                  type="text"
                  width={450}
                />
                
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
              >
                {isCreating ? "Guardando..." : "Guardar Producto"}
              </Boton1>

              {createError && (
                <div className="error-alert">
                  Error: {createError.message}
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