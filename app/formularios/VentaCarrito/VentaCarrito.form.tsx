import React, { useState, useMemo, useEffect } from "react";
import InputText1 from "~/componentes/InputText1";
import Boton1 from "~/componentes/Boton1";
import ComboBox1 from "~/componentes/ComboBox1";
import { useVentas } from "~/hooks/useVentas";
import { useInventarioSucursal } from "~/hooks/useInventarioSucursal";
import { CreateVentaDto, CreateVentaItemDto, EstadoVenta, MetodoPago } from "~/models/ventas";
import { useSucursales } from "~/hooks/useSucursales";
import "./VentaCarrito.style.css"
import { usePedidos } from "~/hooks/usePedidos";
import { CarritoEstado } from "~/models/carrito";
// ----------------------------------------------------
// DTOs y Tipos Requeridos (ASUMIDOS)
// Debes asegurarte de que estas clases/interfaces existan en tus archivos de modelos
// ----------------------------------------------------

// Nota: Estos DTOs se asumen definidos en otro archivo (como '~/models/carrito')
// Solo se incluyen las interfaces necesarias para el tipado.

interface CarritoItemResponseDto {
    id: number;
    cantidad: number;
    productoId: number;
    precio: number;
    productoNombre?: string; 
    talla?: string;
}

interface CarritoResponseDto {
    id: number;
    clienteId: number;
    tiendaId: number;
    estado: any; // Usar CarritoEstado si está definido
    cliente?: string;
    telefono?: string;
    direccion?: string;
    notas?: string;
    precio: number;
    createdAt: Date;
    items: CarritoItemResponseDto[];
    usuario: any; // Usar UsuarioRes si está definido
}

interface SucursalResponseDto { 
    id: number;
    nombre: string;
    direccion: string;
}

// --- Tipos Locales ---
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
    sucursalId: string; 
}

interface CrearVentaFormProps {
    visible: boolean;
    onClose: () => void;
    // 🎯 Propiedad para recibir el carrito
    initialData: CarritoResponseDto | null; 
}


// Constantes y Opciones
const IMPUESTO_RATE = 0.13; 
const metodoPagoOptions = Object.values(MetodoPago).map(m => ({ value: m, label: m.replace('_', ' ') }));

// ----------------------------------------------------
// COMPONENTE PRINCIPAL
// ----------------------------------------------------
const CrearVentaCarritoForm: React.FC<CrearVentaFormProps> = ({ visible, onClose, initialData }) => {
    const { createVenta, isCreating, createError } = useVentas();

   const [estadoSeleccionado, setEstadoSeleccionado] = useState<CarritoEstado>(CarritoEstado.TODOS);
       
       const queryOptions = useMemo(() => ({
           tiendaId: 1,
           estadoFiltro: estadoSeleccionado,
       }), [estadoSeleccionado]);
    
    const { 
            
            completePedidoAsync, 
            
        } = usePedidos(queryOptions);
    
    const handleCompletePedido = async (id) => {
        if (window.confirm(`¿Está seguro de finalizar el Pedido #${id}?`)) {
            try {
                await completePedidoAsync(id);
                // La alerta se maneja con una notificación real en una app grande
            } catch (e) {
                alert(`Error al finalizar el Pedido #${id}.`);
            }
        }
    };

    
    // --- ESTADOS PRINCIPALES ---
    const [formData, setFormData] = useState<VentaFormState>({
        // Inicializa con datos del carrito o valores por defecto
        cliente: initialData?.cliente || "",
        telefono: initialData?.telefono || "",
        direccion: initialData?.direccion || "",
        metodoPago: MetodoPago.EFECTIVO,
        sucursalId: "", 
    });
    
    // El estado de los items ahora se inicializará en el useEffect
    const [ventaItems, setVentaItems] = useState<CreateVentaItemDto[]>([]);
    const [newItem, setNewItem] = useState<NewItemState>({
        selectedProductId: "",
        cantidad: "1",
        precioUnitario: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    // --- HOOKS DE DATOS ---
    const { sucursales = [], isLoading: isLoadingSucursales } = useSucursales(""); 

    const sucursalIdStr = formData.sucursalId;
    const sucursalIdNum = Number(sucursalIdStr);

    const options = useMemo(() => ({ sucursalId: sucursalIdNum }), [sucursalIdNum]);
    // El inventario depende de la sucursal seleccionada
    const { inventario = [], isLoading } = useInventarioSucursal(options); 

    // --- MANEJO DE OPCIONES Y SELECCIÓN ---

    const sucursalOptions = useMemo(() => {
        return (sucursales as SucursalResponseDto[]).map(s => ({
            value: String(s.id),
            label: `${s.nombre} (ID: ${s.id})`,
        }));
    }, [sucursales]);

    const productoOptions = useMemo(() => {
        return inventario.map(i => ({
            value: String(i.id), 
            label: `${i.producto.nombre} (Stock: ${i.stock}, Bs.${i.producto.precio})`,
        }));
    }, [inventario]);
    
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

    // ----------------------------------------------------
    // EFECTOS DE INICIALIZACIÓN Y CONTROL
    // ----------------------------------------------------

    // 🎯 1. EFECTO PARA INICIALIZAR DESDE EL CARRITO
    useEffect(() => {
        if (initialData) {
            // Mapear campos de cliente/contacto
            setFormData(prev => ({
                ...prev,
                cliente: initialData.cliente || prev.cliente,
                telefono: initialData.telefono || prev.telefono,
                direccion: initialData.direccion || prev.direccion,
            }));

            // Mapear CarritoItems a VentaItems
            const initialVentaItems: CreateVentaItemDto[] = initialData.items.map(item => ({
                productoId: item.productoId, 
                cantidad: item.cantidad,
                precio: item.precio,
                // Si CreateVentaItemDto tiene campo para talla, usarlo:
                // talla: item.talla,
            }));
            
            setVentaItems(initialVentaItems);
            
            setNewItem({ selectedProductId: "", cantidad: "1", precioUnitario: "" });
            
        } else {
             // Si no hay initialData, asegurar que los items estén vacíos para una venta normal
            setVentaItems([]);
        }
    }, [initialData]); 

    // 2. Resetea items y selección si la sucursal cambia (solo para ventas sin carrito inicial)
    useEffect(() => {
        if (!initialData) {
            setVentaItems([]);
            setNewItem({ selectedProductId: "", cantidad: "1", precioUnitario: "" });
        }
    }, [formData.sucursalId, initialData]); 

    // 3. Actualiza el precio unitario cuando se selecciona un producto
    useEffect(() => {
        if (selectedInventarioItem) {
            setNewItem(prev => ({ ...prev, precioUnitario: String(selectedInventarioItem.producto.precio) }));
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

        // 🚨 Verificar si el item ya está en la lista y actualizarlo o agregarlo
        const existingIndex = ventaItems.findIndex(i => i.productoId === item.productoId);
        
        const newItemDto: CreateVentaItemDto = {
            productoId: item.productoId,
            cantidad: cantidad,
            precio: precio,
        };
        
        if (existingIndex > -1) {
            // Si existe, actualizar la cantidad
            setVentaItems(prev => prev.map((i, idx) => 
                idx === existingIndex ? { ...i, cantidad: i.cantidad + cantidad } : i
            ));
        } else {
            // Si no existe, agregar uno nuevo
            setVentaItems(prev => [...prev, newItemDto]);
        }
        
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
        // Si viene de un carrito, permitimos que pase aunque no agregue más items
        if (!initialData && ventaItems.length === 0) newErrors.items = "Debe agregar al menos un ítem a la venta.";

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
                    tiendaId: 1, 
                    sucursalId: sucursalIdNum,
                    subtotal: subtotal,
                    impuestos: impuestos,
                    total: total,
                    items: ventaItems,
                    
                };
                
                await createVenta(dataToSend);
                
                alert(`✅ Venta registrada en Sucursal ${sucursalIdNum} por Bs.${total.toFixed(2)}.`);
                handleCompletePedido(initialData.id);
                
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
    const isClientDataDisabled = !!initialData || isDisabled; // Para bloquear campos de cliente si viene de carrito

    return (
        <div className={containerClasses}>
            <div className="cuerpoVentaForm">
                <h2>{initialData ? `Convertir Carrito #${initialData.id} a Venta` : "Registrar Nueva Venta"}</h2>
                
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

                            {/* 🚨 CAMPOS DE CLIENTE DESHABILITADOS SI VIENEN DEL CARRITO */}
                            <InputText1 
                                label="Cliente *" 
                                value={formData.cliente} 
                                onChange={(val) => handleFormChange("cliente", val)} 
                                errorMessage={errors.cliente} 
                                required 
                                width={450} 
                                disabled={isClientDataDisabled} 
                            />
                            <div className="form-row">
                                <InputText1 
                                    label="Teléfono" 
                                    value={formData.telefono} 
                                    onChange={(val) => handleFormChange("telefono", val)} 
                                    type="tel" 
                                    width={220} 
                                    disabled={isClientDataDisabled} 
                                />
                                <InputText1 
                                    label="Dirección" 
                                    value={formData.direccion} 
                                    onChange={(val) => handleFormChange("direccion", val)} 
                                    width={220} 
                                    disabled={isClientDataDisabled} 
                                />
                            </div>
                        </fieldset>

                        {/* --- SECCIÓN AGREGAR ÍTEMS (solo si no viene de carrito, o si se permite modificar) --- */}
                        <fieldset className="seccionItems" disabled={!formData.sucursalId}>
                            <legend>Agregar/Revisar Ítems (Desde Sucursal {formData.sucursalId || '...'})</legend>
                            
                            {/* Los ítems del carrito ya están cargados. Este bloque es para AGREGAR NUEVOS ITEMS */}
                            {!initialData && (
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
                                        disabled={true} // Se obtiene del producto
                                        width={120}
                                    />
                                    <Boton1 onClick={handleAddItem} type="button" disabled={isDisabled || !selectedInventarioItem} style={{ alignSelf: 'flex-end' }}>
                                        + Agregar
                                    </Boton1>
                                </div>
                            )}

                            {/* --- TABLA DE ÍTEMS AGREGADOS --- */}
                            {ventaItems.length > 0 ? (
                                <div className="tablaItemsVenta-container"> 
                                    <table className="tablaItemsVenta">
                                        <thead>
                                            <tr>
                                                <th style={{ textAlign: 'left' }}>Producto</th>
                                                <th style={{ width: '80px', textAlign: 'center' }}>Cantidad</th>
                                                <th style={{ width: '120px', textAlign: 'right' }}>Precio Unit.</th>
                                                <th style={{ width: '120px', textAlign: 'right' }}>Total</th>
                                                <th style={{ width: '100px', textAlign: 'center' }}></th> 
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ventaItems.map((item, index) => {
                                                // Intentar obtener el nombre del producto del inventario cargado
                                                const itemInventario = inventario.find(i => i.productoId === item.productoId);
                                                const itemInfo = itemInventario?.producto.nombre || `ID ${item.productoId}`;
                                                const totalItem = item.cantidad * item.precio;
                                                
                                                return (
                                                    <tr key={index}>
                                                        <td className="tablaItemsVenta-producto">
                                                            <strong>{itemInfo}</strong>
                                                        </td>
                                                        <td style={{ textAlign: 'center' }}>{item.cantidad}</td>
                                                        <td style={{ textAlign: 'right' }}>Bs.{item.precio.toFixed(2)}</td>
                                                        <td style={{ textAlign: 'right' }}>
                                                            <strong>Bs.{totalItem.toFixed(2)}</strong>
                                                        </td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            <Boton1 size="small" onClick={() => handleRemoveItem(index)} type="button" variant="danger">
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
                                <div>Impuestos ({IMPUESTO_RATE * 100}%): **Bs.{impuestos.toFixed(2)}**</div>
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

export default CrearVentaCarritoForm;