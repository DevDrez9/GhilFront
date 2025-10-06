import React, { useState, useMemo } from "react";
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

// 🚨 SIMULACIÓN: ID de usuario de la sesión actual
const USUARIO_ID_ACTUAL = 1; 

// --- Tipos Asumidos ---
interface TransferenciaFormState {
    motivo: string;
    // OrigenTipo ahora es fijo a TIENDA, pero lo dejamos aquí por si el formulario se vuelve complejo
    // Si se hace un ComboBox para destinoTipo, se debe incluir aquí
    destinoId: string; // ID de la Sucursal/Almacén de destino
    cantidad: string;  
}

interface CrearTransferenciaDesdeInventarioFormProps {
    visible: boolean;
    onClose: () => void;
    // 🎯 Propiedad que recibe el objeto de inventario de la tienda
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
// -----------------------

const CrearTransferenciaDesdeInventarioForm: React.FC<CrearTransferenciaDesdeInventarioFormProps> = ({ visible, onClose, inventario }) => {
    // 🎯 Hook de TRANSFERENCIA
    const { createTransferencia, isCreating, createError } = useTransferencias();

    // Consumo de sucursales (para el destino TIENDA)
    const { sucursales = [], isLoading: isLoadingSucursales } = useSucursales(""); 

    // Mapeo de sucursales para el ComboBox
    const sucursalOptions = useMemo(() => {
        return (sucursales as SucursalResponseDto[]).map(s => ({
            value: String(s.id),
            label: `${s.nombre} - ${s.direccion}`,
        }));
    }, [sucursales]);

    // Estado inicial
    const [formData, setFormData] = useState<TransferenciaFormState>({
        motivo: "",
        destinoId: "", // ID de la Sucursal/Almacén de destino
        cantidad: "",
    });
    const [destinoTipo, setDestinoTipo] = useState<TipoDestinoTransferencia>(TipoDestinoTransferencia.SUCURSAL);


    const [errors, setErrors] = useState<Record<string, string>>({});

    const containerClasses = [
        "contenedorFormTransferencia",
        visible ? "visible" : "noVisible",
    ].filter(Boolean).join(" ");

    if (!inventario) return null; 
    
    // ----------------------------------------------------
    // LÓGICA
    // ----------------------------------------------------

    const handleChange = (field: keyof TransferenciaFormState, value: string | number) => {
        setFormData((prev) => ({ ...prev, [field]: String(value) }));
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        const cantidad = Number(formData.cantidad);
        const destinoId = formData.destinoId; 

        if (isNaN(cantidad) || cantidad <= 0) {
            newErrors.cantidad = "La cantidad debe ser mayor a 0.";
        } else if (cantidad > inventario.stock) {
            newErrors.cantidad = `Stock insuficiente. Máximo: ${inventario.stock}.`;
        }
        
        if (!destinoId || destinoId === "") {
            newErrors.destinoId = `Debe seleccionar un ID de Destino (${destinoTipo}).`;
        }

       


        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            try {
                const dataToSend: CreateTransferenciaInventarioDto = {
                    productoId: inventario.productoId,
                    usuarioId: USUARIO_ID_ACTUAL, 
                    
                    // Origen Fijo (se asume que el InventarioTiendaResponseDto viene de una TIENDA)
                    origenTipo: TipoOrigenTransferencia.FABRICA, 
                    origenId: inventario.tiendaId,              
                    
                    // Destino Configurable
                    destinoTipo: destinoTipo, 
                    destinoId: Number(formData.destinoId), 
                    estado: EstadoTransferencia.PENDIENTE, 
                    
                    cantidad: Number(formData.cantidad),
                    motivo: formData.motivo.trim() || undefined,
                };
                
                // 🎯 USO CORRECTO del hook de TRANSFERENCIA
                await createTransferencia(dataToSend);
                
                alert(`✅ Transferencia creada exitosamente desde Tienda ${inventario.tiendaId}.`);
                
                onClose();
            } catch (error) {
                alert("❌ Error al crear la transferencia.");
                console.error("Error en submit:", error);
            }
        }
    };

    // ----------------------------------------------------
    // RENDERIZADO
    // ----------------------------------------------------

    const isDisabled = isCreating || isLoadingSucursales;

    return (
        <div className={containerClasses}>
            <div className="cuerpoTransferenciaForm">
                <h2>Crear Transferencia (Desde Tienda)</h2>
                
                <p>📦 Producto: <strong>{inventario.producto.nombre}</strong> (ID: {inventario.productoId})</p>
                <p>🏪 Origen: Tienda <strong>{inventario.tiendaId}</strong> | Stock disponible: <strong style={{color: 'red'}}>{inventario.stock}</strong></p>

                <div className="formTransferencia">
                    <form onSubmit={handleSubmit}>
                        
                        <div className="form-row">
                            {/* TIPO DE DESTINO */}
                            <ComboBox1
                                label="Tipo de Destino *"
                                value={destinoTipo}
                                onChange={(val) => {
                                    setDestinoTipo(val as TipoDestinoTransferencia);
                                    handleChange("destinoId", ""); // Resetear ID al cambiar tipo
                                }}
                                options={destinoTipoOptions}
                                placeholder="Seleccione Tipo"
                                required
                                width={220}
                            />
                            
                            {/* ID DE DESTINO (Sucursal o Almacén) */}
                            {destinoTipo === TipoDestinoTransferencia.SUCURSAL ? (
                                <ComboBox1
                                    label="Sucursal Destino *"
                                    value={formData.destinoId}
                                    onChange={(val) => handleChange("destinoId", val)}
                                    options={sucursalOptions}
                                    placeholder={isLoadingSucursales ? "Cargando sucursales..." : "Seleccione Sucursal"}
                                    errorMessage={errors.destinoId}
                                    required
                                    disabled={isDisabled}
                                    width={220}
                                />
                            ) : (
                                <InputText1
                                    label="ID de Almacén Destino *"
                                    value={formData.destinoId}
                                    onChange={(val) => handleChange("destinoId", val)}
                                    errorMessage={errors.destinoId}
                                    required
                                    type="number"
                                    width={220}
                                />
                            )}
                        </div>

                        {/* CANTIDAD A TRANSFERIR */}
                        <InputText1
                            label={`Cantidad a Transferir (Máx: ${inventario.stock}) *`}
                            value={formData.cantidad}
                            onChange={(val) => handleChange("cantidad", val)}
                            errorMessage={errors.cantidad}
                            required
                            type="number"
                            min={1}
                            max={inventario.stock}
                            width={450}
                        />
                        
                        {/* MOTIVO */}
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
                            disabled={isDisabled}
                            style={{ marginTop: '20px' }}
                        >
                            {isCreating ? "Creando Transferencia..." : "Confirmar Transferencia"}
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

export default CrearTransferenciaDesdeInventarioForm;