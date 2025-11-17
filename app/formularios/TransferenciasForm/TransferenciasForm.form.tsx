import React, { useState, useMemo, useEffect } from "react";
import InputText1 from "~/componentes/InputText1";
import Boton1 from "~/componentes/Boton1";
import ComboBox1 from "~/componentes/ComboBox1"; 

// 🎯 Reutilizamos el hook de TRANSFERENCIA y sus modelos
import { useTransferencias } from "~/hooks/useTransferencias";
import { useSucursales } from "~/hooks/useSucursales"; // Para seleccionar destino
import { 
    CreateTransferenciaInventarioDto, 
 
    TipoOrigenTransferencia,
    TipoDestinoTransferencia,
    EstadoTransferencia
} from "~/models/transferencia";
import type { InventarioTiendaResponseDto } from "~/models/inventarioTienda";
import "./TransferenciasForm.style.css"
import { useAlert } from "~/componentes/alerts/AlertContext";

const USUARIO_ID_ACTUAL = 1;

interface TransferenciaFormState {
    motivo: string;
    destinoId: string;
}

interface CrearTransferenciaDesdeInventarioFormProps {
    visible: boolean;
    onClose: () => void;
    inventario: InventarioTiendaResponseDto;
}

interface SucursalResponseDto {
    id: number;
    nombre: string;
    direccion: string;
}

const destinoTipoOptions = [
    { value: TipoDestinoTransferencia.SUCURSAL, label: "SUCURSAL" }
];

const CrearTransferenciaDesdeInventarioForm: React.FC<CrearTransferenciaDesdeInventarioFormProps> = ({ visible, onClose, inventario }) => {
    const { createTransferencia, isCreating, createError } = useTransferencias();
    const { sucursales = [], isLoading: isLoadingSucursales } = useSucursales("");

    const sucursalOptions = useMemo(() => {
        return (sucursales as SucursalResponseDto[]).map(s => ({
            value: String(s.id),
            label: `${s.nombre} - ${s.direccion}`,
        }));
    }, [sucursales]);

    // --- ESTADOS ---
    const [formData, setFormData] = useState<TransferenciaFormState>({
        motivo: "",
        destinoId: "",
    });
    const [destinoTipo, setDestinoTipo] = useState<TipoDestinoTransferencia>(TipoDestinoTransferencia.SUCURSAL);

    // Estado para manejar las cantidades a transferir por talla
    const [cantidadesA_Transferir, setCantidadesA_Transferir] = useState<Record<string, string>>({});
    
    const [errors, setErrors] = useState<Record<string, string>>({});

    const containerClasses = [
        "contenedorFormTransferencia",
        visible ? "visible" : "noVisible",
    ].filter(Boolean).join(" ");

    // --- EFECTO DE INICIALIZACIÓN ---
    useEffect(() => {
        if (inventario && inventario.stock) {
            // Inicializamos el estado con las tallas disponibles en el inventario, pero con valor vacío
            const inicial: Record<string, string> = {};
            // Asumimos que inventario.stock es un objeto { "S": 10, "M": 5 }
            // Si es string en tu modelo de frontend, parsealo aquí: JSON.parse(inventario.stock)
            const stockObj = typeof inventario.stock === 'string' ? JSON.parse(inventario.stock) : inventario.stock;
            
            Object.keys(stockObj || {}).forEach(talla => {
                inicial[talla] = ""; // Empezamos vacío
            });
            setCantidadesA_Transferir(inicial);
            setFormData(prev => ({ ...prev, destinoId: "", motivo: "" }));
            setErrors({});
        }
    }, [inventario]);

    if (!inventario) return null;

    // --- LÓGICA ---

    const handleChange = (field: keyof TransferenciaFormState, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleCantidadTallaChange = (talla: string, value: string) => {
        setCantidadesA_Transferir(prev => ({ ...prev, [talla]: value }));
    };

    // Calcular total a transferir para validación global
    const totalTransferir = Object.values(cantidadesA_Transferir).reduce((acc, val) => acc + (Number(val) || 0), 0);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        
        if (!formData.destinoId) {
            newErrors.destinoId = "Debe seleccionar un destino.";
        }

        if (totalTransferir <= 0) {
            newErrors.general = "Debe transferir al menos una unidad.";
        }

        // Validar por talla
        const stockObj = typeof inventario.stock === 'string' ? JSON.parse(inventario.stock) : inventario.stock;
        
        Object.entries(cantidadesA_Transferir).forEach(([talla, valor]) => {
            const cantidad = Number(valor);
            const disponible = stockObj[talla] || 0;

            if (cantidad > disponible) {
                newErrors[talla] = `Máx: ${disponible}`;
            } else if (cantidad < 0) {
                newErrors[talla] = "No negativo";
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
// 1. Asegúrate de tener esto al inicio de tu componente
  const { showAlert } = useAlert();

  // ...

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validación con feedback
    if (validate()) {
      try {
        // 2. Preparar el objeto de cantidades (limpiar ceros)
        const cantidadFinal: Record<string, number> = {};
        Object.entries(cantidadesA_Transferir).forEach(([talla, valor]) => {
          const num = Number(valor);
          if (num > 0) cantidadFinal[talla] = num;
        });

        // 3. Preparar DTO
        const dataToSend: CreateTransferenciaInventarioDto = {
          productoId: inventario.productoId,
          usuarioId: USUARIO_ID_ACTUAL,
          origenTipo: TipoOrigenTransferencia.FABRICA,
          origenId: inventario.tiendaId,
          destinoTipo: destinoTipo,
          destinoId: Number(formData.destinoId),
          estado: EstadoTransferencia.PENDIENTE,
          
          // Objeto JSON directo
          cantidad: cantidadFinal, 
          
          motivo: formData.motivo.trim() || undefined,
        };

        // 4. Ejecutar la transferencia
        await createTransferencia(dataToSend);

        // 5. ÉXITO
        
        await showAlert("Transferencia creada exitosamente.", "success");
        
        onClose();

      } catch (error: any) {
        console.error("Error en submit:", error);
        
        // 6. ERROR
        const msg = error?.message || "Error al crear la transferencia.";
        showAlert(msg, "error");
      }
    } else {
      // 7. Validación fallida
      showAlert("El formulario tiene errores. Revisa las cantidades y el destino.", "warning");
    }
  };

    const isDisabled = isCreating || isLoadingSucursales;
    
    // Obtenemos el stock para mostrar
    const stockDisponible = typeof inventario.stock === 'string' ? JSON.parse(inventario.stock) : inventario.stock;

    return (
        <div className={containerClasses}>
            <div className="cuerpoTransferenciaForm">
                <Boton1 type="button" size="medium" variant="info" onClick={onClose}> Cancelar </Boton1>

                <h2>Crear Transferencia</h2>
                
                <div className="info-producto" style={{ marginBottom: '15px', padding: '10px', background: '#f0f0f0', borderRadius: '5px' }}>
                    <p style={{ margin: '5px 0' }}>📦 <strong>{inventario.producto.nombre}</strong></p>
                    <p style={{ margin: '5px 0', fontSize: '0.9em' }}>🏪 Origen: Tienda {inventario.tiendaId}</p>
                </div>

                <form onSubmit={handleSubmit}>
                    
                    <div className="form-row">
                        <ComboBox1
                            label="Tipo de Destino *"
                            value={destinoTipo}
                            onChange={(val) => {
                                setDestinoTipo(val as TipoDestinoTransferencia);
                                handleChange("destinoId", "");
                            }}
                            options={destinoTipoOptions}
                            placeholder="Seleccione Tipo"
                            required
                            width={220}
                        />
                        
                        {destinoTipo === TipoDestinoTransferencia.SUCURSAL ? (
                            <ComboBox1
                                label="Sucursal Destino *"
                                value={formData.destinoId}
                                onChange={(val) => handleChange("destinoId", val)}
                                options={sucursalOptions}
                                placeholder={isLoadingSucursales ? "Cargando..." : "Seleccione Sucursal"}
                                errorMessage={errors.destinoId}
                                required
                                disabled={isDisabled}
                                width={220}
                            />
                        ) : (
                            <InputText1
                                label="ID Destino *"
                                value={formData.destinoId}
                                onChange={(val) => handleChange("destinoId", val)}
                                errorMessage={errors.destinoId}
                                required
                                type="number"
                                width={220}
                            />
                        )}
                    </div>

                    {/* SECCIÓN DE TALLAS */}
                    <div className="tallas-transferencia" style={{ margin: '20px 0' }}>
                        <h4 style={{ marginBottom: '10px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>
                            Cantidades a Transferir
                        </h4>
                        
                        {Object.keys(stockDisponible || {}).length === 0 ? (
                            <p style={{ color: 'red' }}>No hay stock disponible para transferir.</p>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '15px' }}>
                                {Object.entries(stockDisponible as Record<string, number>).map(([talla, disponible]) => (
                                    <div key={talla} className="talla-item">
                                        <div style={{ fontSize: '0.85em', marginBottom: '5px', color: '#666' }}>
                                            Talla <strong>{talla}</strong> (Disp: {disponible})
                                        </div>
                                        <InputText1
                                            label="" 
                                            value={cantidadesA_Transferir[talla] || ""}
                                            onChange={(val) => handleCantidadTallaChange(talla, val)}
                                            type="number"
                                            min={0}
                                            max={disponible}
                                            width={130}
                                            errorMessage={errors[talla]}
                                            placeholder="0"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                        {errors.general && <div style={{ color: 'red', marginTop: '10px' }}>{errors.general}</div>}
                    </div>

                    <InputText1
                        label="Motivo (Opcional)"
                        value={formData.motivo}
                        onChange={(val) => handleChange("motivo", val)}
                        type="text"
                        width={450}
                    />

                    <Boton1
                        type="submit"
                        fullWidth
                        size="large"
                        disabled={isDisabled || totalTransferir <= 0}
                        style={{ marginTop: '20px' }}
                    >
                        {isCreating ? "Procesando..." : `Transferir ${totalTransferir} Unidades`}
                    </Boton1>

                    {createError && (
                        <div className="error-alert" style={{ marginTop: '15px' }}>
                            Error: {createError.message}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default CrearTransferenciaDesdeInventarioForm;