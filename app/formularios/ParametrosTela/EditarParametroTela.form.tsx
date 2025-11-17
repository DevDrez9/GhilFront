import "./ParametrosTelaEdit.style.css"
import React, { useState, useEffect, useMemo } from "react";
import InputText1 from "~/componentes/InputText1";
import Boton1 from "~/componentes/Boton1";
import ComboBox1 from "~/componentes/ComboBox1";

import { useParametrosTela } from "~/hooks/useParametrosTela";
import { EstadoPrenda, ParametrosTelaResponseDto } from "~/models/ParametrosTela";
import { useProductos } from "~/hooks/useProductos";
import { useInventarioTelas } from "~/hooks/useInventarioTelas";
import { useAlert } from "~/componentes/alerts/AlertContext";

// ----------------------------------------------------
// TIPOS REQUERIDOS
// ----------------------------------------------------


interface EditarParametrosTelaFormProps {
    visible: boolean;
    onClose: () => void;
    // 🎯 Propiedad para recibir los datos a editar
    initialData: ParametrosTelaResponseDto | null; 
}

interface TallaConsumoItem {
    talla: string;
    consumo: number | string;
}

// Tallas base que queremos soportar
const TALLAS_STANDARD: string[] = ["S", "M", "L", "XL", "XXL"]; 

// Estado del formulario (debe coincidir con la estructura de ParametrosTelaResponseDto, pero con los IDs como number/undefined)
interface ParametrosTelaFormState {
    codigoReferencia: string;
    nombreModelo: string;
    tipoTelaRecomendada: string;
    estadoPrenda: EstadoPrenda;
    fotoReferenciaUrl: string;
    cantidadEstandarPorLote: number;
    tabla: string;
    tallasDisponibles: string;
    consumoTelaPorTalla: string; // JSON string
    consumoTelaPorLote: number;
    tiempoFabricacionPorUnidad: number;
    tiempoTotalPorLote: number;
    productoId?: number;
    telaId?: number;
}


// ----------------------------------------------------
// COMPONENTE DE EDICIÓN
// ----------------------------------------------------
const EditarParametrosTelaForm: React.FC<EditarParametrosTelaFormProps> = ({
    visible,
    onClose,
    initialData, // 🎯 Dato a editar
}) => {
    // 🚨 Usamos updateParametroTela
    const { updateParametroTela, isUpdating, updateError } = useParametrosTela(); 

    const containerClasses = [
        "contenedorFormParametrosTelaEdit",
        visible ? "visible" : "noVisible",
    ]
    .filter(Boolean)
    .join(" ");

    const [debouncedSearch, setDebouncedSearch] = useState("");
    const {
        productos,
        isLoading: isLoadingProds,
    } = useProductos(debouncedSearch);

    const [filters, setFilters] = useState({
        search: "",
        tipoTela: "",
        color: "",
    });
    const {
        inventario,
        isLoading,
    } = useInventarioTelas(filters);

    // Estado inicial de formData
    const [formData, setFormData] = useState<ParametrosTelaFormState>({
        codigoReferencia: "",
        nombreModelo: "",
        tipoTelaRecomendada: "",
        estadoPrenda: EstadoPrenda.APROBADO,
        fotoReferenciaUrl: "",
        cantidadEstandarPorLote: 0,
        tabla: "",
        tallasDisponibles: "",
        consumoTelaPorTalla: "{}", 
        consumoTelaPorLote: 0,
        tiempoFabricacionPorUnidad: 0,
        tiempoTotalPorLote: 0,
        productoId: undefined,
        telaId: undefined,
    });
    
    const [tallaConsumoData, setTallaConsumoData] = useState<TallaConsumoItem[]>(
        TALLAS_STANDARD.map((talla) => ({ talla, consumo: "" }))
    );


    // ----------------------------------------------------
    // EFECTO DE INICIALIZACIÓN (Cargar initialData)
    // ----------------------------------------------------
    useEffect(() => {
        if (initialData) {
            // 1. Cargar formData
            setFormData({
                codigoReferencia: initialData.codigoReferencia,
                nombreModelo: initialData.nombreModelo,
                tipoTelaRecomendada: initialData.tipoTelaRecomendada || "",
                estadoPrenda: initialData.estadoPrenda as EstadoPrenda,
                fotoReferenciaUrl: initialData.fotoReferenciaUrl || "",
                cantidadEstandarPorLote: initialData.cantidadEstandarPorLote,
                tabla: "", // Campo no usado en el DTO, inicializado vacío
                tallasDisponibles: "", // Campo no usado en el DTO, inicializado vacío
                consumoTelaPorTalla: initialData.consumoTelaPorTalla,
                consumoTelaPorLote: initialData.consumoTelaPorLote,
                tiempoFabricacionPorUnidad: initialData.tiempoFabricacionPorUnidad,
                tiempoTotalPorLote: initialData.tiempoTotalPorLote,
                productoId: initialData.productoId,
                telaId: initialData.tela?.id,
            });

            // 2. Cargar tallaConsumoData desde el JSON string
            try {
                const consumoJson: Record<string, number> = JSON.parse(initialData.consumoTelaPorTalla);
                
                // Mapear tallas estándar, usando el valor del JSON si existe
                const newTallaConsumoData: TallaConsumoItem[] = TALLAS_STANDARD.map(talla => ({
                    talla,
                    consumo: consumoJson[talla] !== undefined ? consumoJson[talla] : "",
                }));
                setTallaConsumoData(newTallaConsumoData);
            } catch (e) {
                console.error("Error al parsear consumoTelaPorTalla:", e);
                setTallaConsumoData(TALLAS_STANDARD.map((talla) => ({ talla, consumo: "" })));
            }

            setErrors({});
        }
    }, [initialData]);


    // ----------------------------------------------------
    // LÓGICA DE MANEJO DE ESTADO (Reutilizada)
    // ----------------------------------------------------
    
    const productoOptions = useMemo(
        () =>
            (Array.isArray(productos) ? productos : []).map((p) => ({
                value: p.id.toString(),
                label: `${p.nombre}  ${p.id})`,
            })),
        [productos]
    );

    const telasOptions = useMemo(
        () =>
            (Array.isArray(inventario) ? inventario : []).map((p) => ({
                value: p.id.toString(),
                label: `${p.tela?.nombreComercial}  (${p.color})`,
            })),
        [inventario]
    ); 

    const handleChange = (field: keyof ParametrosTelaFormState, value: any) => {
        let finalValue: any = value;

        if (field.endsWith("Id") && typeof value === "string") {
            if (value === "" || value === "0") {
                finalValue = undefined; 
            } else {
                finalValue = Number(value);
            }
        }
        else if (
            field === "cantidadEstandarPorLote" || 
            field === "consumoTelaPorLote" || 
            field === "tiempoFabricacionPorUnidad" || 
            field === "tiempoTotalPorLote"
        ) {
            finalValue = value === "" ? 0 : Number(value);
        }
        // FotoReferenciaUrl es usado para el costo en tu formulario
        else if (field === "fotoReferenciaUrl") { 
             finalValue = value === "" ? "" : value; 
        }

        setFormData((prev) => ({
            ...prev,
            [field]: finalValue,
        }));
    };
    
    // 🎯 MANEJADOR DE CAMBIOS EN LOS INPUTS DE LA TABLA
    const handleConsumoChange = (talla: string, value: string) => {
        setTallaConsumoData((prev) =>
            prev.map((item) =>
                item.talla === talla ? { ...item, consumo: value } : item
            )
        );
    };

    // 🎯 EFECTO DE SINCRONIZACIÓN: DE TABLA A JSON
    useEffect(() => {
        let newJson: Record<string, number> = {};

        tallaConsumoData.forEach((item) => {
            const consumoNum = parseFloat(String(item.consumo).replace(",", "."));

            if (!isNaN(consumoNum) && consumoNum > 0) {
                newJson[item.talla] = Number(consumoNum.toFixed(3)); 
            }
        });

        const newJsonString = JSON.stringify(newJson);

        if (newJsonString !== formData.consumoTelaPorTalla) {
            setFormData((prev) => ({ ...prev, consumoTelaPorTalla: newJsonString }));
        }
    }, [tallaConsumoData, formData.consumoTelaPorTalla]);

    const [errors, setErrors] = useState<Record<string, string>>({});

    // La validación se mantiene igual
    const validate = () => {
        const newErrors: Record<string, string> = {}; 

        if (!formData.codigoReferencia.trim())
            newErrors.codigoReferenciaError =
                "El código de referencia es obligatorio";

        if (!formData.fotoReferenciaUrl)
            newErrors.fotoReferenciaUrl = "Debe agregar un costo por unidad"; 

        try {
            const parsed = JSON.parse(formData.consumoTelaPorTalla);
            if (Object.keys(parsed).length === 0) {
                newErrors.consumoTelaPorTallaError =
                    "Debe ingresar al menos un consumo por talla.";
            }
        } catch (e) {
            newErrors.consumoTelaPorTallaError = "Error interno de formato de JSON.";
        }

        if (
            !formData.tiempoFabricacionPorUnidad ||
            formData.tiempoFabricacionPorUnidad <= 0
        )
            newErrors.tiempoFabricacionPorUnidadError =
                "El tiempo de fabricación debe ser mayor a 0";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    // ----------------------------------------------------
    // SUBMIT (ACTUALIZAR)
    // ----------------------------------------------------

   // 1. Importar el hook al inicio del componente
  const { showAlert } = useAlert();

  // ...

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialData) return; // Validación de seguridad

    if (validate()) {
      try {
        // 1. Obtener nombreModelo de forma eficiente
        const productoSeleccionado = productos.find(p => p.id === formData.productoId);
        const nombreModelo = productoSeleccionado ? productoSeleccionado.nombre : "";

        // 2. Creamos el DTO de actualización
        const dataToSend = {
          ...formData,
          nombreModelo: nombreModelo,
          cantidadEstandarPorLote: Number(formData.cantidadEstandarPorLote),
          consumoTelaPorLote: Number(formData.consumoTelaPorLote),
          tiempoFabricacionPorUnidad: Number(formData.tiempoFabricacionPorUnidad),
          tiempoTotalPorLote: Number(formData.tiempoTotalPorLote),
          productoId: formData.productoId,
          telaId: formData.telaId,
          // El JSON string se envía tal cual
          consumoTelaPorTalla: formData.consumoTelaPorTalla, 
        };

        // 3. Ejecutar la actualización
        await updateParametroTela({ 
            id: initialData.id, 
            data: dataToSend as any // Cast si el tipo estricto del hook difiere ligeramente
        });

        // 
        // 4. ÉXITO: Si llegamos aquí, la promesa se resolvió bien
        await showAlert(`Parámetros (${initialData.codigoReferencia}) actualizados correctamente.`, "success");
        
        onClose();

      } catch (error: any) {
        console.error("Error al actualizar:", error);
        
        // Intentamos obtener el mensaje del error capturado o del estado del hook
        const msg = error?.message || updateError?.message || "Ocurrió un error desconocido al actualizar.";
        
        showAlert(`Error al actualizar: ${msg}`, "error");
      }
    } else {
      showAlert("El formulario contiene errores. Por favor revísalos.", "warning");
    }
  };
    // ----------------------------------------------------
    // RENDERIZADO
    // ----------------------------------------------------

    const isDisabled = isUpdating;

    if (!initialData) {
        return <div className={containerClasses}><div className="cuerpoParametrosTelaForm">Cargando datos para edición...</div></div>;
    }

    return (
        <div className={containerClasses}>
            <div className="cuerpoParametrosTelaForm">
                <h2>Editar Parámetro: {initialData.codigoReferencia}</h2>
                <Boton1
                    type="button"
                    size="medium"
                    variant="info"
                    onClick={onClose}
                >
                    Atrás
                </Boton1>
                
                <div className="formParametrosTela">
                    <form onSubmit={handleSubmit}>
                        
                        <div className="form-row">
                            {/* CÓDIGO DE REFERENCIA (SOLO LECTURA) */}
                            <InputText1
                                label="Código de Referencia *"
                                value={formData.codigoReferencia}
                                onChange={() => {}} // No permitir cambio
                                required
                                type="text"
                                width="100%"
                                readOnly // 🚨 Solo Lectura
                                disabled
                            />
                            <ComboBox1
                                label="Producto *"
                                value={formData.productoId?.toString() || ""}
                                onChange={(val) => handleChange("productoId", val)}
                                options={productoOptions}
                                disabled={isLoadingProds || isDisabled}
                                required
                                placeholder={isLoadingProds ? "Cargando productos..." : "Seleccione producto"}
                                errorMessage={errors.productoIdError}
                                width="100%"
                            />
                            <ComboBox1
                                label="Tela Inventario *"
                                value={formData.telaId?.toString() || ""}
                                onChange={(val) => handleChange("telaId", val)}
                                options={telasOptions}
                                disabled={isLoading || isDisabled}
                                required
                                placeholder={isLoading ? "Cargando telas..." : "Seleccione tela"}
                                errorMessage={errors.telaIdError}
                                width="100%"
                            />
                        </div>

                        <div className="linea"></div>

                        {/* 🎯 REEMPLAZO DEL INPUT DE CONSUMO POR TALLA (REUTILIZADO) */}
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                width: "450px",
                                marginBottom: "15px",
                            }}
                        >
                            <div
                                style={{
                                    color: errors.consumoTelaPorTallaError ? "red" : "inherit",
                                    marginBottom: "8px",
                                    fontWeight: "bold",
                                }}
                            >
                                Consumo de Tela por Talla (kg): *
                            </div>

                            <div className="consumo-talla-container">
                                {tallaConsumoData.map((item) => (
                                    <div
                                        key={item.talla}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            marginBottom: "10px",
                                            gap: "10px",
                                        }}
                                    >
                                        <label style={{ width: "60px", fontWeight: "bold" }}>
                                            {item.talla}:
                                        </label>
                                        <InputText1
                                            value={item.consumo + ""}
                                            onChange={(val) => handleConsumoChange(item.talla, val)}
                                            type="number"
                                            placeholder="Consumo (Ej: 1.5)"
                                            width="calc(100% - 70px)"
                                            disabled={isDisabled}
                                        />
                                    </div>
                                ))}
                            </div>

                            {errors.consumoTelaPorTallaError && (
                                <p style={{ color: "red", fontSize: "12px", marginTop: "5px" }}>
                                    {errors.consumoTelaPorTallaError}
                                </p>
                            )}

                            <small style={{ marginTop: "5px", color: "#666" }}>
                                * Solo los campos con valor numérico mayor a 0 se guardarán.
                            </small>
                        </div>
                        {/* 🎯 FIN DEL REEMPLAZO */}

                        <div className="form-row">
                            <InputText1
                                label="Tiempo Fabricación por Unidad (horas) *"
                                value={formData.tiempoFabricacionPorUnidad + ""}
                                onChange={(val) => handleChange("tiempoFabricacionPorUnidad", val)}
                                errorMessage={errors.tiempoFabricacionPorUnidadError}
                                required
                                type="number"
                                width="100%"
                                disabled={isDisabled}
                            />
                        </div>
                        <InputText1
                            label="Costo de producción por unidad (Bs) "
                            value={formData.fotoReferenciaUrl}
                            onChange={(val) => handleChange("fotoReferenciaUrl", val)}
                            type="number"
                            required
                            width="100%"
                            disabled={isDisabled}
                        />

                        <Boton1
                            type="submit"
                            fullWidth
                            size="medium"
                            disabled={isDisabled}
                            style={{ marginTop: '20px' }}
                        >
                            {isUpdating ? "Actualizando Parámetros..." : "Guardar Cambios"}
                        </Boton1>

                        {updateError && (
                            <div className="error-alert">
                                Error: {updateError.message}
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditarParametrosTelaForm;