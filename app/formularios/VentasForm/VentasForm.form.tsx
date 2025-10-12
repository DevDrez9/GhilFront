import React, { useState, useMemo, useEffect } from "react";
import InputText1 from "~/componentes/InputText1";
import Boton1 from "~/componentes/Boton1";
import ComboBox1 from "~/componentes/ComboBox1";
import { useVentas } from "~/hooks/useVentas";
import { useInventarioSucursal } from "~/hooks/useInventarioSucursal";
import { CreateVentaDto, CreateVentaItemDto, EstadoVenta, MetodoPago } from "~/models/ventas";
import { useSucursales } from "~/hooks/useSucursales";
import "./VentasForm.style.css"



// --- Tipos Asumidos ---
interface NewItemState {
    selectedProductId: string; // ID del registro de inventario (no productoId)
    cantidad: string;
    precioUnitario: string;
}

interface VentaFormState {
    cliente: string;
    telefono: string;
    direccion: string;
    metodoPago: MetodoPago;
    // 🎯 sucursalId es ahora el ID seleccionado del ComboBox
    sucursalId: string; 
}

interface CrearVentaFormProps {
    visible: boolean;
    onClose: () => void;
}

interface SucursalResponseDto { 
    id: number;
    nombre: string;
    direccion: string;
}

// Constantes y Opciones
const IMPUESTO_RATE = 0.13; // 13% de IVA/Impuesto (ajustar según necesidad)
const metodoPagoOptions = Object.values(MetodoPago).map(m => ({ value: m, label: m.replace('_', ' ') }));

const CrearVentaForm: React.FC<CrearVentaFormProps> = ({ visible, onClose }) => {
    const { createVenta, isCreating, createError } = useVentas();
    
    // --- ESTADOS PRINCIPALES ---
    const [formData, setFormData] = useState<VentaFormState>({
        cliente: "",
        telefono: "",
        direccion: "",
        metodoPago: MetodoPago.EFECTIVO,
        sucursalId: "", // Debe ser seleccionado del ComboBox
    });
    
    const [ventaItems, setVentaItems] = useState<CreateVentaItemDto[]>([]);
    const [newItem, setNewItem] = useState<NewItemState>({
        selectedProductId: "",
        cantidad: "1",
        precioUnitario: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    // --- HOOKS DE DATOS ---
    
    // 1. 🎯 Carga de Sucursales para el ComboBox
    const { sucursales = [], isLoading: isLoadingSucursales } = useSucursales(""); 

    // 2. 🎯 Carga de Inventario basada en la Sucursal seleccionada
    const sucursalIdStr = formData.sucursalId;
    const sucursalIdNum = Number(sucursalIdStr);

    // Usamos el hook de inventario. Nota: Tu API espera el ID como string, por eso pasamos sucursalIdStr
     const options = useMemo(() => ({ sucursalId: sucursalIdNum }), [sucursalIdNum]);
    const { inventario = [],  isLoading } = useInventarioSucursal(options); 

    // --- MANEJO DE OPCIONES Y SELECCIÓN ---

    // Opciones del ComboBox de Sucursales
    const sucursalOptions = useMemo(() => {
        return (sucursales as SucursalResponseDto[]).map(s => ({
            value: String(s.id),
            label: `${s.nombre} (ID: ${s.id})`,
        }));
    }, [sucursales]);

    // Opciones del ComboBox de Productos
    const productoOptions = useMemo(() => {
        // Mapea el inventario de la sucursal seleccionada
        return inventario.map(i => ({
            value: String(i.id), // ID del registro de inventario como valor
            label: `${i.producto.nombre} (Stock: ${i.stock}, Bs.${i.producto.precioUnitario})`,
        }));
    }, [inventario]);
    
    // Producto seleccionado del inventario
    const selectedInventarioItem = useMemo(() => {
        const id = Number(newItem.selectedProductId);
        return inventario.find(i => i.id === id);
    }, [inventario, newItem.selectedProductId]);

    // --- CÁLCULOS DE LA VENTA ---
    const { subtotal, impuestos, total } = useMemo(() => {
        const sub = ventaItems.reduce((acc, item) => acc + (item.cantidad * item.precio), 0);
        const tax = sub * IMPUESTO_RATE;
        const tot = sub + tax;
        return { subtotal: sub, impuestos: tax, total: tot };
    }, [ventaItems]);

    // --- EFECTOS ---
    // Resetea items y el producto seleccionado si la sucursal cambia
    useEffect(() => {
        setVentaItems([]);
        setNewItem({ selectedProductId: "", cantidad: "1", precioUnitario: "" });
    }, [formData.sucursalId]);

    // Actualiza el precio unitario cuando se selecciona un producto
    useEffect(() => {
        if (selectedInventarioItem) {
            setNewItem(prev => ({ ...prev, precioUnitario: String(selectedInventarioItem.producto.precioUnitario) }));
        } else {
            setNewItem(prev => ({ ...prev, precioUnitario: "" }));
        }
    }, [selectedInventarioItem]);

    // --- MANEJADORES ---
    const handleFormChange = (field: keyof VentaFormState, value: string | MetodoPago) => {
        setFormData(prev => ({ ...prev, [field]: String(value) }));
    };

    const handleNewItemChange = (field: keyof NewItemState, value: string) => {
        setNewItem(prev => ({ ...prev, [field]: value }));
    };

    // --- LÓGICA DE ÍTEMS ---
    const handleAddItem = () => {
        const item = selectedInventarioItem;
        const cantidad = Number(newItem.cantidad);
        const precio = Number(newItem.precioUnitario);

        if (!item || isNaN(cantidad) || cantidad <= 0 || isNaN(precio) || precio <= 0) {
            alert("Seleccione un producto y complete la cantidad/precio válidos.");
            return;
        }

        if (cantidad > item.stock) {
            alert(`Stock insuficiente. Máximo disponible: ${item.stock}.`);
            return;
        }

        // Crear el DTO del ítem
        const newItemDto: CreateVentaItemDto = {
            productoId: item.productoId,
            cantidad: cantidad,
            precio: precio,
        };

        setVentaItems(prev => [...prev, newItemDto]);
        // Resetear la selección
        setNewItem({ selectedProductId: "", cantidad: "1", precioUnitario: "" });
    };

    const handleRemoveItem = (index: number) => {
        setVentaItems(prev => prev.filter((_, i) => i !== index));
    };

    // --- VALIDACIÓN Y SUBMIT ---
    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        
        if (!formData.cliente.trim()) newErrors.cliente = "El nombre del cliente es obligatorio.";
        if (sucursalIdNum <= 0 || isNaN(sucursalIdNum)) newErrors.sucursalId = "Debe seleccionar una Sucursal.";
        if (ventaItems.length === 0) newErrors.items = "Debe agregar al menos un ítem a la venta.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            try {
                const dataToSend: CreateVentaDto = {
                    cliente: formData.cliente.trim(),
                    telefono: formData.telefono.trim() || undefined,
                    direccion: formData.direccion.trim() || undefined,
                    estado: ventaItems.length > 0 ? EstadoVenta.CONFIRMADA : EstadoVenta.PENDIENTE,
                    metodoPago: formData.metodoPago,
                    tiendaId: 1, // Asumo que tiendaId y sucursalId son iguales en este contexto
                    sucursalId: sucursalIdNum,
                    subtotal: subtotal,
                    impuestos: impuestos,
                    total: total,
                    items: ventaItems,
                };
                
                await createVenta(dataToSend);
                
                alert(`✅ Venta registrada en Sucursal ${sucursalIdNum} por Bs.${total.toFixed(2)}.`);
                onClose();
            } catch (error) {
                alert("❌ Error al crear la venta.");
                console.error("Error en submit:", error);
            }
        }
    };

    // ----------------------------------------------------
    // RENDERIZADO
    // ----------------------------------------------------
    const containerClasses = ["contenedorFormVenta", visible ? "visible" : "noVisible"].filter(Boolean).join(" ");
    const isDisabled = isCreating || isLoadingSucursales || isLoading ;

    return (
        <div className={containerClasses}>
            <div className="cuerpoVentaForm">
                <h2>Registrar Nueva Venta</h2>
                
                <div className="formVenta">
                    <form onSubmit={handleSubmit}>
                        
                        {/* --- SECCIÓN SUCURSAL, CLIENTE Y DETALLES --- */}
                        <fieldset className="seccionCliente">
                            <legend>Datos del Cliente y Sucursal</legend>
                            <div className="form-row">
                                {/* 🎯 COMBOBOX DE SUCURSALES */}
                                <ComboBox1
                                    label="Sucursal de Venta *"
                                    value={formData.sucursalId}
                                    onChange={(val) => handleFormChange("sucursalId", val)}
                                    options={sucursalOptions}
                                    placeholder={isLoadingSucursales ? "Cargando sucursales..." : "Seleccione Sucursal"}
                                    errorMessage={errors.sucursalId}
                                    required
                                    disabled={isLoadingSucursales || isCreating}
                                    width={220}
                                />
                                <ComboBox1
                                    label="Método de Pago"
                                    value={formData.metodoPago}
                                    onChange={(val) => handleFormChange("metodoPago", val as MetodoPago)}
                                    options={metodoPagoOptions}
                                    placeholder="Seleccione Método"
                                    required
                                    width={220}
                                />
                            </div>

                            <InputText1 label="Cliente *" value={formData.cliente} onChange={(val) => handleFormChange("cliente", val)} errorMessage={errors.cliente} required width={450} />
                            <div className="form-row">
                                <InputText1 label="Teléfono" value={formData.telefono} onChange={(val) => handleFormChange("telefono", val)} type="tel" width={220} />
                                <InputText1 label="Dirección" value={formData.direccion} onChange={(val) => handleFormChange("direccion", val)} width={220} />
                            </div>
                        </fieldset>

                        {/* --- SECCIÓN AGREGAR ÍTEMS --- */}
                        <fieldset className="seccionItems" disabled={!formData.sucursalId}>
                            <legend>Agregar Ítems (Desde Sucursal {formData.sucursalId || '...'})</legend>
                            <div className="form-row-items">
                                <ComboBox1
                                    label="Producto *"
                                    value={newItem.selectedProductId}
                                    onChange={(val) => handleNewItemChange("selectedProductId", val)}
                                    options={productoOptions}
                                    placeholder={isLoading ? "Cargando inventario..." : "Seleccione Producto"}
                                    required
                                    disabled={isDisabled || !formData.sucursalId}
                                    width={200}
                                />
                                <InputText1
                                    label="Cantidad *"
                                    value={newItem.cantidad}
                                    onChange={(val) => handleNewItemChange("cantidad", val)}
                                    type="number" min={1} required
                                    disabled={!selectedInventarioItem || isDisabled}
                                    width={100}
                                />
                                <InputText1
                                    label="Precio Unitario *"
                                    value={newItem.precioUnitario}
                                    onChange={(val) => handleNewItemChange("precioUnitario", val)}
                                    type="number" min={0.01} step="0.01" required
                                    disabled={!selectedInventarioItem || isDisabled}
                                    width={120}
                                />
                                <Boton1 onClick={handleAddItem} type="button" disabled={isDisabled || !selectedInventarioItem} style={{ alignSelf: 'flex-end' }}>
                                    + Agregar
                                </Boton1>
                            </div>
{/* --- TABLA DE ÍTEMS AGREGADOS (MEJORADO) --- */}
{ventaItems.length > 0 ? (
    <div className="tablaItemsVenta-container"> {/* Contenedor para manejar desbordamiento (scroll) */}
        <table className="tablaItemsVenta">
            <thead>
                <tr>
                    <th style={{ textAlign: 'left' }}>Producto</th>
                    <th style={{ width: '80px', textAlign: 'center' }}>Cantidad</th>
                    <th style={{ width: '120px', textAlign: 'right' }}>Precio Unit.</th>
                    <th style={{ width: '120px', textAlign: 'right' }}>Total</th>
                    <th style={{ width: '100px', textAlign: 'center' }}></th> {/* Columna de Acción */}
                </tr>
            </thead>
            <tbody>
                {ventaItems.map((item, index) => {
                    const itemInfo = inventario.find(i => i.productoId === item.productoId)?.producto.nombre || `ID ${item.productoId}`;
                    const totalItem = item.cantidad * item.precio;
                    
                    return (
                        <tr key={index}>
                            <td className="tablaItemsVenta-producto">
                                {/* Nombre del producto más destacado */}
                                <strong>{itemInfo}</strong>
                            </td>
                            <td style={{ textAlign: 'center' }}>{item.cantidad}</td>
                            <td style={{ textAlign: 'right' }}>Bs.{item.precio.toFixed(2)}</td>
                            <td style={{ textAlign: 'right' }}>
                                {/* Total del ítem en negrita */}
                                <strong>${totalItem.toFixed(2)}</strong>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                                <Boton1 size="small" onClick={() => handleRemoveItem(index)} type="button" variant="danger">
                                    {/* Cambié a variant="danger-text" para usar un botón más discreto dentro de la tabla */}
                                    Remover
                                </Boton1>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    </div>
) : (
    <p className="alerta-items">
        <span style={{ fontWeight: 'bold' }}>🛒 ¡Lista vacía!</span> Seleccione una Sucursal y agregue ítems. 
        {errors.items && <span style={{color: 'red', marginLeft: '10px'}}>({errors.items})</span>}
    </p>
)}
                        </fieldset>

                        {/* --- SECCIÓN TOTALES Y ENVÍO --- */}
                        <fieldset className="seccionTotales">
                            <legend>Resumen Final</legend>
                            <div className="resumenTotales">
                                <div>Subtotal: **Bs.{subtotal.toFixed(2)}**</div>
                                <div>Impuestos ({IMPUESTO_RATE * 100}%): **${impuestos.toFixed(2)}**</div>
                                <div>Total a Pagar: **Bs.{total.toFixed(2)}**</div>
                            </div>
                        </fieldset>
                        
                        <Boton1
                            type="submit"
                            fullWidth
                            size="large"
                            disabled={isDisabled || ventaItems.length === 0}
                            style={{ marginTop: '20px' }}
                        >
                            {isCreating ? "Registrando Venta..." : `Registrar Venta por Bs.${total.toFixed(2)}`}
                        </Boton1>

                        {createError && (
                            <div className="error-alert">Error al registrar: {createError.message}</div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CrearVentaForm;