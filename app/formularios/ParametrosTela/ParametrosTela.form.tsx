import "./ParametrosTela.style.css";

import { useState, useEffect, useMemo } from "react"; // 🎯 IMPORTAR useEffect

import Switch1 from "~/componentes/switch1";
import InputText1 from "~/componentes/InputText1";
import Boton1 from "~/componentes/Boton1";
import { useParametrosTela } from "~/hooks/useParametrosTela";
import { EstadoPrenda } from "~/models/ParametrosTela";
import { useProductos } from "~/hooks/useProductos";
import ComboBox1 from "~/componentes/ComboBox1";


interface ParametrosTelaFormProps {
  visible: boolean;
  onClose: () => void;
}
interface TallaConsumoItem {
    talla: string;
    consumo: number | string; // Lo mantenemos como string/number para el input
}

// Tallas base que queremos soportar (puedes ajustar esto)
const TALLAS_STANDARD: string[] = ["S", "M", "L", "XL", "XXL"]; // 🎯 USAMOS ESTA CONSTANTE

const ParametrosTelaForm: React.FC<ParametrosTelaFormProps> = ({
  visible,
  onClose,
}) => {
  const { createParametroTela, isCreating, createError } =
    useParametrosTela(); 

  const containerClasses = [
    "contenedorFormParametrosTela",
    visible ? "visible" : "noVisible",
  ]
    .filter(Boolean)
    .join(" ");

 const [debouncedSearch, setDebouncedSearch] = useState("");
    const {
        productos,
        isLoading: isLoadingProds, // Renombramos para evitar conflicto con otros isLoading
    } = useProductos(debouncedSearch);

  const [formData, setFormData] = useState({
    codigoReferencia: "",
    nombreModelo: "",
    tipoTelaRecomendada: "",
    estadoPrenda: EstadoPrenda.PENDIENTE,
    fotoReferenciaUrl: "",
    cantidadEstandarPorLote: 0,
    tabla: "",
    tallasDisponibles: "",
    consumoTelaPorTalla: "{}", // JSON string vacío
    consumoTelaPorLote: 0,
    tiempoFabricacionPorUnidad: 0,
    tiempoTotalPorLote: 0,
    productoId: undefined,
    telaId: undefined,
  });

// 2. Preparación de las options
const productoOptions = useMemo(() => 
    (Array.isArray(productos) ? productos : []).map(p => ({ 
        // ¡Crucial!: El valor debe ser string
        value: p.id.toString(), 
        label: `${p.nombre} (ID: ${p.id})` 
    }))
, [productos]);

  // 🎯 NUEVO ESTADO LOCAL PARA LA TABLA
  const [tallaConsumoData, setTallaConsumoData] = useState<TallaConsumoItem[]>(
        TALLAS_STANDARD.map(talla => ({ talla, consumo: "" }))
    );

  const handleChange = (field: string, value: any) => {
    let finalValue: any = value;

    // 🚨 Nueva lógica de conversión para campos ID (ProductoId, CategoriaId, etc.)
    // Asumimos que los ComboBoxes devuelven siempre un string.
    if (field.endsWith('Id') && typeof value === 'string') {
        
        // Si el valor es una cadena vacía (''), significa que se seleccionó la opción "sin seleccionar"
        if (value === '' || value === '0') {
             // Si el ID es opcional (como subcategoriaId) sería undefined.
             // Pero si es obligatorio (como productoId), se podría forzar a 0 o al valor que manejes para "no seleccionado"
             // Para productoId, asumiremos que debe ser un número (o 0 si no se selecciona nada).
             finalValue = 0; // O undefined, si tu modelo lo permite. Usaremos 0 por ser un ID generalmente obligatorio.
        } else {
            // Si tiene valor (ej: "15"), lo convertimos a número (15)
            finalValue = Number(value); 
        }
    } 
    // 🚨 También podrías necesitar lógica para convertir 'stock' o 'precio' si InputText1 devuelve string.
    else if (field === 'precio' || field === 'stock') {
        finalValue = value === '' ? 0 : Number(value);
    }
    // Para booleanos (Switch) o strings de texto, se usa el valor directamente
    else {
         finalValue = value;
    }

    setFormData((prev) => ({
        ...prev,
        [field]: finalValue,
    }));
};
    
  // 🎯 MANEJADOR DE CAMBIOS EN LOS INPUTS DE LA TABLA
  const handleConsumoChange = (talla: string, value: string) => {
    setTallaConsumoData(prev => 
        prev.map(item => 
            item.talla === talla ? { ...item, consumo: value } : item
        )
    );
  };
    
  // 🎯 EFECTO DE SINCRONIZACIÓN: DE TABLA A JSON
  useEffect(() => {
    let newJson: Record<string, number> = {};
    
    tallaConsumoData.forEach(item => {
        // Usamos parseFloat para manejar decimales y Number para el tipo
        const consumoNum = parseFloat(String(item.consumo).replace(',', '.'));
        
        // Solo incluimos tallas con un consumo numérico válido (mayor a 0)
        if (!isNaN(consumoNum) && consumoNum > 0) {
            newJson[item.talla] = Number(consumoNum.toFixed(3)); // Redondear a 3 decimales
        }
    });

    const newJsonString = JSON.stringify(newJson);
    
    // Solo actualiza el formData si el JSON ha cambiado para evitar bucles.
    if (newJsonString !== formData.consumoTelaPorTalla) {
        // Usamos setFormData directamente ya que handleChange solo maneja el estado del padre.
        setFormData(prev => ({ ...prev, consumoTelaPorTalla: newJsonString }));
    }

  }, [tallaConsumoData, formData.consumoTelaPorTalla]);


  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // ... [Validaciones existentes] ...

    if (!formData.codigoReferencia.trim())
      newErrors.codigoReferenciaError = "El código de referencia es obligatorio";

    if (!formData.nombreModelo.trim())
      newErrors.nombreModeloError = "El nombre del modelo es obligatorio";

    if (!formData.tipoTelaRecomendada.trim())
      newErrors.tipoTelaRecomendadaError =
        "El tipo de tela recomendada es obligatorio";

    if (!formData.cantidadEstandarPorLote || formData.cantidadEstandarPorLote <= 0)
      newErrors.cantidadEstandarPorLoteError = "La cantidad por lote debe ser mayor a 0";

    if (!formData.tallasDisponibles.trim())
      newErrors.tallasDisponiblesError = "Las tallas disponibles son obligatorias";

    // 🎯 VALIDACIÓN SIMPLIFICADA DEL JSON (solo verifica que no esté vacío)
    try {
        const parsed = JSON.parse(formData.consumoTelaPorTalla);
        if (Object.keys(parsed).length === 0) {
            newErrors.consumoTelaPorTallaError = "Debe ingresar al menos un consumo por talla.";
        }
    } catch (e) {
        // En teoría, el useEffect se encarga de que siempre sea un JSON válido.
        newErrors.consumoTelaPorTallaError = "Error interno de formato de JSON.";
    }


    if (!formData.consumoTelaPorLote || formData.consumoTelaPorLote <= 0)
      newErrors.consumoTelaPorLoteError = "El consumo por lote debe ser mayor a 0";

    if (!formData.tiempoFabricacionPorUnidad || formData.tiempoFabricacionPorUnidad <= 0)
      newErrors.tiempoFabricacionPorUnidadError = "El tiempo de fabricación debe ser mayor a 0";

    if (!formData.tiempoTotalPorLote || formData.tiempoTotalPorLote <= 0)
      newErrors.tiempoTotalPorLoteError = "El tiempo total por lote debe ser mayor a 0";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      try {
        const dataToSend = {
          ...formData,
          // ... [Conversiones a number] ...
          
          // 🎯 consumoTelaPorTalla YA ES UN JSON STRING VÁLIDO GRACIAS AL useEffect
          consumoTelaPorTalla: formData.consumoTelaPorTalla,
          // ... [Conversiones a number] ...
           cantidadEstandarPorLote: Number(formData.cantidadEstandarPorLote),
          consumoTelaPorLote: Number(formData.consumoTelaPorLote),
          tiempoFabricacionPorUnidad: Number(formData.tiempoFabricacionPorUnidad),
          tiempoTotalPorLote: Number(formData.tiempoTotalPorLote),
          productoId: formData.productoId ? Number(formData.productoId) : undefined,
          telaId: formData.telaId ? Number(formData.telaId) : undefined,
        };

        await createParametroTela(dataToSend as any); // Usamos 'as any' si el DTO no está tipado
        onClose();
      } catch (error) {
        alert("No se pudo guardar los parámetros de la tela");
        console.error("Error al guardar:", error);
      }
    } else {
      console.log("Formulario no válido");
    }
  };

  return (
    <>
      <div className={containerClasses}>
        <div className="cuerpoParametrosTelaForm">
          <h2>Nuevo Parámetro de Prenda</h2>

          <Boton1
            type="button"
            size="medium"
            variant="info"
            onClick={() => {
              onClose();
            }}
          >
            Atrás
          </Boton1>

          <div className="formParametrosTela">
            <form onSubmit={handleSubmit}>
              <h2>Datos de la Prenda</h2>

              {/* ... [Campos de Datos de la Prenda] ... */}
                <div className="form-row">
                <InputText1
                  label="Código de Referencia *"
                  value={formData.codigoReferencia}
                  onChange={(val) => handleChange("codigoReferencia", val)}
                  errorMessage={errors.codigoReferenciaError}
                  required
                  type="text"
                  width={220}
                />

<ComboBox1
    label="Producto *"
    // Muestra el ID NUMÉRICO como STRING para que coincida con las options
    value={formData.productoId+""} 
    // El onChange enviará el ID como string (ej: "15") a handleChange
    onChange={(val) => handleChange("productoId", val)} 
    options={productoOptions}
    disabled={isLoadingProds}
    required={true}
    placeholder={isLoadingProds ? "Cargando productos..." : "Seleccione producto"}
    errorMessage={errors.productoIdError}
    width={220}
/>
                <InputText1
                  label="Nombre del Modelo *"
                  value={formData.nombreModelo}
                  onChange={(val) => handleChange("nombreModelo", val)}
                  errorMessage={errors.nombreModeloError}
                  required
                  type="text"
                  width={220}
                />
              </div>
                <div className="form-row">
                <InputText1
                  label="Tipo de Tela Recomendada *"
                  value={formData.tipoTelaRecomendada}
                  onChange={(val) => handleChange("tipoTelaRecomendada", val)}
                  errorMessage={errors.tipoTelaRecomendadaError}
                  required
                  type="text"
                  width={220}
                />
                <div className="estado-container">
                  <label>Estado de la Prenda *</label>
                  <select
                    value={formData.estadoPrenda}
                    onChange={(e) => handleChange("estadoPrenda", e.target.value)}
                    className="estado-select"
                  >
                    <option value={EstadoPrenda.PENDIENTE}>Pendiente</option>
                    <option value={EstadoPrenda.APROBADO}>Aprobado</option>
                    <option value={EstadoPrenda.OBSERVADO}>Observado</option>
                  </select>
                </div>
              </div>
              <InputText1
                label="Tallas Disponibles *"
                value={formData.tallasDisponibles}
                onChange={(val) => handleChange("tallasDisponibles", val)}
                errorMessage={errors.tallasDisponiblesError}
                required
                type="text"
                width={450}
              />

              <div className="linea"></div>

              <h2>Consumo y Tiempos de Producción</h2>

              <div className="form-row">
                <InputText1
                  label="Cantidad por Lote *"
                  value={formData.cantidadEstandarPorLote+""}
                  onChange={(val) => handleChange("cantidadEstandarPorLote", val)}
                  errorMessage={errors.cantidadEstandarPorLoteError}
                  required
                  type="number"
                  width={220}
                />
                <InputText1
                  label="Consumo de Tela por Lote *"
                  value={formData.consumoTelaPorLote+""}
                  onChange={(val) => handleChange("consumoTelaPorLote", val)}
                  errorMessage={errors.consumoTelaPorLoteError}
                  required
                  type="number"
                  width={220}
                />
              </div>

              {/* 🎯 REEMPLAZO DEL INPUT DE CONSUMO POR TALLA */}
                <div style={{ display: 'flex', flexDirection: 'column', width: '450px', marginBottom: '15px' }}>
                    <div style={{ color: errors.consumoTelaPorTallaError ? 'red' : 'inherit', marginBottom: '8px', fontWeight: 'bold' }}>
                        Consumo de Tela por Talla (metros): *
                    </div>
                    
                    {/* Tabla/Lista de Consumo por Talla */}
                    <div className="consumo-talla-container">
                        {tallaConsumoData.map(item => (
                            <div key={item.talla} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', gap: '10px' }}>
                                <label style={{ width: '60px', fontWeight: 'bold' }}>{item.talla}:</label>
                                <InputText1 
                                    value={item.consumo+""} 
                                    onChange={(val) => handleConsumoChange(item.talla, val)} 
                                    type="number" 
                                    placeholder="Consumo (Ej: 1.5)"
                                    width="calc(100% - 70px)"
                                />
                            </div>
                        ))}
                    </div>
                    
                    {/* Mensaje de Error General */}
                    {errors.consumoTelaPorTallaError && (
                        <p style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
                            {errors.consumoTelaPorTallaError}
                        </p>
                    )}
                    
                    <small style={{ marginTop: '5px', color: '#666' }}>
                        * Solo los campos con valor numérico mayor a 0 se guardarán.
                    </small>
                </div>
                {/* 🎯 FIN DEL REEMPLAZO */}

              <div className="form-row">
                <InputText1
                  label="Tiempo Fabricación por Unidad (horas) *"
                  value={formData.tiempoFabricacionPorUnidad+""}
                  onChange={(val) => handleChange("tiempoFabricacionPorUnidad", val)}
                  errorMessage={errors.tiempoFabricacionPorUnidadError}
                  required
                  type="number"
                  width={220}
                />
                <InputText1
                  label="Tiempo Total por Lote (horas) *"
                  value={formData.tiempoTotalPorLote+""}
                  onChange={(val) => handleChange("tiempoTotalPorLote", val)}
                  errorMessage={errors.tiempoTotalPorLoteError}
                  required
                  type="number"
                  width={220}
                />
              </div>
                {/*
              <div className="linea"></div>

              <h2>Relaciones (opcional)</h2>

              <div className="form-row">
                <InputText1
                  label="ID de Producto"
                  value={formData.productoId}
                  onChange={(val) => handleChange("productoId", val)}
                  type="number"
                  width={220}
                />
                <InputText1
                  label="ID de Tela"
                  value={formData.telaId}
                  onChange={(val) => handleChange("telaId", val)}
                  type="number"
                  width={220}
                />
              </div>*/}

              <Boton1
                type="submit"
                fullWidth
                size="medium"
                disabled={isCreating}
              >
                {isCreating ? "Guardando..." : "Guardar Parámetros"}
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

export default ParametrosTelaForm;