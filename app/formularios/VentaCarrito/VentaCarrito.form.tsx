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
import { useAlert } from "~/componentes/alerts/AlertContext";

// --- INTERFACES (Mantenemos las tuyas) ---
interface CarritoItemResponseDto {
    id: number;
    cantidad: number;
    productoId: number;
    precio: number;
    productoNombre?: string; 
    talla?: string; // ✅ Aseguramos que talla existe
}

interface CarritoResponseDto {
    id: number;
    clienteId: number;
    tiendaId: number;
    estado: any; 
    cliente?: string;
    telefono?: string;
    direccion?: string;
    notas?: string;
    precio: number;
    createdAt: Date;
    items: CarritoItemResponseDto[];
    usuario: any; 
}

interface SucursalResponseDto { 
    id: number;
    nombre: string;
    direccion: string;
}

interface NewItemState {
    selectedInventarioId: string; // ID del inventario
    selectedProductoId: string;
    talla: string;
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
    initialData: CarritoResponseDto | null; 
}

const IMPUESTO_RATE = 0; 
const metodoPagoOptions = Object.values(MetodoPago).map(m => ({ value: m, label: m.replace('_', ' ') }));

const CrearVentaCarritoForm: React.FC<CrearVentaFormProps> = ({ visible, onClose, initialData }) => {
    const { createVenta, isCreating, createError } = useVentas();
    const [estadoSeleccionado] = useState<CarritoEstado>(CarritoEstado.TODOS);
       
    const queryOptions = useMemo(() => ({
       tiendaId: 1,
       estadoFiltro: estadoSeleccionado,
    }), [estadoSeleccionado]);
    
    const { completePedidoAsync } = usePedidos(queryOptions);
    
    // --- ESTADOS ---
    const [formData, setFormData] = useState<VentaFormState>({
        cliente: "",
        telefono: "",
        direccion: "",
        metodoPago: MetodoPago.EFECTIVO,
        sucursalId: "", 
    });
    
    const [ventaItems, setVentaItems] = useState<CreateVentaItemDto[]>([]);
    
    // Estado para nuevo ítem (si permites agregar más cosas al pedido)
    const [newItem, setNewItem] = useState<NewItemState>({
        selectedInventarioId: "",
        selectedProductoId: "",
        talla: "",
        cantidad: "1",
        precioUnitario: "",
    });

    // Estado para tallas del producto seleccionado (para agregar nuevos items)
    const [tallasDisponibles, setTallasDisponibles] = useState<Record<string, number>>({});

    const [errors, setErrors] = useState<Record<string, string>>({});
    
    // --- HOOKS DE DATOS ---
    const { sucursales = [], isLoading: isLoadingSucursales } = useSucursales(""); 

    const sucursalIdNum = Number(formData.sucursalId);
    const options = useMemo(() => ({ sucursalId: sucursalIdNum }), [sucursalIdNum]);
    const { inventario = [], isLoading } = useInventarioSucursal(options); 

    // --- OPCIONES ---
    const sucursalOptions = useMemo(() => 
        (sucursales as SucursalResponseDto[]).map(s => ({
            value: String(s.id),
            label: `${s.nombre} (ID: ${s.id})`,
        }))
    , [sucursales]);

    const productoOptions = useMemo(() => 
        inventario.map(i => ({
            value: String(i.id), 
            label: `${i.producto.nombre} - Bs.${i.producto.precio}`,
        }))
    , [inventario]);
    
    const selectedInventarioItem = useMemo(() => {
        const id = Number(newItem.selectedInventarioId);
        return inventario.find(i => i.id === id);
    }, [inventario, newItem.selectedInventarioId]);

    // Opciones de talla para el nuevo item
    const tallaOptions = useMemo(() => 
        Object.entries(tallasDisponibles)
            .filter(([_, qty]) => qty > 0)
            .map(([talla, qty]) => ({ value: talla, label: `${talla} (Disp: ${qty})` }))
    , [tallasDisponibles]);

    // --- CÁLCULOS ---
    const { subtotal, impuestos, total } = useMemo(() => {
        const sub = ventaItems.reduce((acc, item) => acc + (item.cantidad * item.precio), 0);
        const tax = sub * IMPUESTO_RATE;
        const tot = sub + tax;
        return { subtotal: sub, impuestos: tax, total: tot };
    }, [ventaItems]);

    // ----------------------------------------------------
    // EFECTOS
    // ----------------------------------------------------

    // 1. Inicializar desde Carrito
    useEffect(() => {
        if (initialData) {
            // Llenar formulario y BLOQUEAR SU EDICIÓN (vía renderizado)
            setFormData({
                cliente: initialData.cliente || initialData.usuario?.nombre || "",
                telefono: initialData.telefono || "",
                direccion: initialData.direccion || "",
                metodoPago: MetodoPago.EFECTIVO, // Default
                // 🚨 ASUMIMOS: El carrito tiene un 'tiendaId' que mapea a una sucursal, 
                // o necesitas lógica extra si el carrito es de "Tienda" pero se despacha de "Sucursal".
                // Aquí uso tiendaId como sucursalId por simplicidad, ajústalo a tu lógica de negocio.
                sucursalId: String(initialData.tiendaId), 
            });

            // Mapear items asegurando la talla
            const initialItems: CreateVentaItemDto[] = initialData.items.map(item => ({
                productoId: item.productoId, 
                cantidad: item.cantidad,
                precio: Number(item.precio), // Asegurar número
                talla: item.talla || "UNICA", // ✅ IMPORTANTE: Rescatar la talla
            }));
            
            setVentaItems(initialItems);
        } else {
            // Reset si es venta nueva
            setVentaItems([]);
            setFormData(prev => ({...prev, cliente: "", sucursalId: ""}));
        }
    }, [initialData]); 

    // 2. Cargar Tallas al seleccionar producto (Para agregar extras)
    useEffect(() => {
        if (selectedInventarioItem) {
            try {
                const stockObj = typeof selectedInventarioItem.stock === 'string' 
                    ? JSON.parse(selectedInventarioItem.stock) 
                    : selectedInventarioItem.stock;
                setTallasDisponibles(stockObj || {});
                setNewItem(prev => ({ 
                    ...prev, 
                    selectedProductoId: String(selectedInventarioItem.productoId),
                    precioUnitario: String(selectedInventarioItem.producto.precio),
                    talla: ""
                }));
            } catch (e) { setTallasDisponibles({}); }
        } else {
            setTallasDisponibles({});
            setNewItem(prev => ({ ...prev, precioUnitario: "" }));
        }
    }, [selectedInventarioItem]);

    // ----------------------------------------------------
    // MANEJADORES
    // ----------------------------------------------------

    const handleFormChange = (field: keyof VentaFormState, value: string | MetodoPago) => {
        setFormData(prev => ({ ...prev, [field]: String(value) }));
    };

    const handleNewItemChange = (field: keyof NewItemState, value: string) => {
        setNewItem(prev => ({ ...prev, [field]: value }));
    };

   // Asegúrate de que `const { showAlert } = useAlert();` esté al inicio del componente

  const handleAddItem = () => {
    const cantidad = Number(newItem.cantidad);
    const precio = Number(newItem.precioUnitario);

    // 1. Validación de campos
    if (!newItem.selectedProductoId || !newItem.talla || isNaN(cantidad) || cantidad <= 0) {
      showAlert("Por favor, selecciona un producto, una talla y una cantidad válida.", "warning");
      return;
    }

    // 2. Validación de Stock
    const stockDisp = tallasDisponibles[newItem.talla] || 0;
    
    if (cantidad > stockDisp) {
      
      showAlert(`Stock insuficiente para la talla ${newItem.talla}. Solo hay ${stockDisp} unidades disponibles.`, "error");
      return;
    }

    // 3. Crear el DTO
    const newItemDto: CreateVentaItemDto = {
        productoId: Number(newItem.selectedProductoId),
        cantidad, 
        precio, 
        talla: newItem.talla
    };

    // 4. Actualizar estado
    // Nota: Aquí podrías agregar lógica para sumar cantidad si el ítem ya existe en la lista
    setVentaItems(prev => [...prev, newItemDto]);
    
    // 5. Resetear campos (dejamos el producto seleccionado, limpiamos talla y cantidad)
    setNewItem(prev => ({ ...prev, cantidad: "1", talla: "" }));
  };
    const handleRemoveItem = (index: number) => {
        if(initialData) return; // No permitir borrar items del pedido original si es estricto
        setVentaItems(prev => prev.filter((_, i) => i !== index));
    };

    // --- SUBMIT ---
    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.cliente.trim()) newErrors.cliente = "Cliente obligatorio.";
        if (!formData.sucursalId) newErrors.sucursalId = "Sucursal obligatoria.";
        if (ventaItems.length === 0) newErrors.items = "Sin ítems.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

   // 1. Asegúrate de tener el hook al inicio del componente
  const { showAlert } = useAlert();

  // ...

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validación del formulario
    if (validate()) {
      // 2. (Opcional pero recomendado) Validar stock global nuevamente aquí
      

      try {
        const dataToSend: CreateVentaDto = {
          cliente: formData.cliente.trim(),
          telefono: formData.telefono.trim() || undefined,
          direccion: formData.direccion.trim() || undefined,
          estado: EstadoVenta.CONFIRMADA, 
          metodoPago: formData.metodoPago,
          tiendaId: 1, 
          sucursalId: sucursalIdNum,
          subtotal, 
          impuestos, 
          total,
          items: ventaItems,
        };
        
        // 3. Crear la Venta
        await createVenta(dataToSend);
        
        // 4. Si viene de un carrito web, finalizar el pedido
        if (initialData) {
            await handleCompletePedido(initialData.id);
        }
        
        

        // 5. ÉXITO
        await showAlert(`Venta registrada con éxito desde Sucursal ${sucursalIdNum}.`, "success");
        
        onClose();

      } catch (error: any) {
        console.error("Error en submit:", error);
        const msg = error?.message || "No se pudo registrar la venta.";
        showAlert(msg, "error");
      }
    } else {
      // 6. Validación fallida
      showAlert("El formulario está incompleto. Por favor revisa los campos obligatorios.", "warning");
    }
  };

  const handleCompletePedido = async (id: number) => {
    try {
       await completePedidoAsync(id);
    } catch (e) {
       console.error("Error finalizando pedido:", e);
       // ⚠️ Advertencia: La venta se hizo, pero el estado web falló
       await showAlert("La venta se creó, pero hubo un error actualizando el estado del pedido web.", "warning");
    }
  };

    // ----------------------------------------------------
    // RENDER
    // ----------------------------------------------------
    const containerClasses = ["contenedorFormVenta", visible ? "visible" : "noVisible"].filter(Boolean).join(" ");
    const isDisabled = isCreating || isLoadingSucursales;
    const isReadOnly = !!initialData; // Bloquear edición de datos base si viene de pedido

    return (
        <div className={containerClasses}>
            <div className="cuerpoVentaForm">
                <Boton1 type="button" size="medium" variant="info" onClick={onClose}> Atrás </Boton1>

                

                <h2>{initialData ? `Finalizar Pedido #${initialData.id}` : "Nueva Venta"}</h2>
                
                <div className="formVenta">
                    <form onSubmit={handleSubmit}>
                        {/* DATOS CLIENTE */}
                        <fieldset className="seccionCliente">
                            <legend>Datos del Cliente</legend>
                            <div className="form-row">
                                <ComboBox1
                                    label="Sucursal *"
                                    value={formData.sucursalId}
                                    onChange={(val) => handleFormChange("sucursalId", val)}
                                    options={sucursalOptions}
                                    required
                                    disabled={isDisabled || isReadOnly} // 🔒 Bloqueado si es pedido
                                    width={220}
                                />
                                <ComboBox1
                                    label="Método de Pago"
                                    value={formData.metodoPago}
                                    onChange={(val) => handleFormChange("metodoPago", val as MetodoPago)}
                                    options={metodoPagoOptions}
                                    required
                                    width={220}
                                />
                            </div>
                            <InputText1 label="Cliente *" value={formData.cliente} onChange={(val) => handleFormChange("cliente", val)} disabled={isReadOnly} required width={450} />
                            <div className="form-row">
                                <InputText1 label="Teléfono" value={formData.telefono} onChange={(val) => handleFormChange("telefono", val)} disabled={isReadOnly} width={220} />
                                <InputText1 label="Dirección" value={formData.direccion} onChange={(val) => handleFormChange("direccion", val)} disabled={isReadOnly} width={220} />
                            </div>
                        </fieldset>

                       {initialData?.notas && (initialData.notas=="pagado"?
                        <div style={{backgroundColor:"#a9ff9eff"}}>{initialData.notas.toUpperCase()}</div>:
                        <div style={{backgroundColor:"#ffbebeff"}}>{initialData.notas.toUpperCase()}</div>
                       )}

                        {/* ITEMS DEL PEDIDO (Solo lectura si es pedido, o permitir agregar si lo deseas) */}
                        <fieldset className="seccionItems">
                            <legend>Detalle del Pedido</legend>
                            
                            {/* Si NO es pedido inicial, mostramos controles para agregar */}
                            {!initialData && (
                                <div className="form-row-items" style={{alignItems:'flex-end', gap:'10px'}}>
                                    <ComboBox1
                                        label="Producto"
                                        value={newItem.selectedInventarioId}
                                        onChange={(val) => handleNewItemChange("selectedInventarioId", val)}
                                        options={productoOptions}
                                        placeholder={isLoading ? "Cargando..." : "Buscar"}
                                        width={200}
                                    />
                                    <ComboBox1
                                        label="Talla"
                                        value={newItem.talla}
                                        onChange={(val) => handleNewItemChange("talla", val)}
                                        options={tallaOptions}
                                        placeholder="Talla"
                                        disabled={!newItem.selectedInventarioId}
                                        width={120}
                                    />
                                    <InputText1 label="Cant." value={newItem.cantidad} onChange={(val) => handleNewItemChange("cantidad", val)} type="number" width={80} />
                                    <Boton1 type="button" onClick={handleAddItem} disabled={!newItem.talla}>+</Boton1>
                                </div>
                            )}

                            {/* TABLA DE ÍTEMS */}
                            <div className="tablaItemsVenta-container" style={{marginTop:'15px'}}>
                                <table className="tablaItemsVenta">
                                    <thead>
                                        <tr>
                                            <th style={{textAlign:'left'}}>Producto</th>
                                            <th style={{textAlign:'center'}}>Talla</th>
                                            <th style={{textAlign:'center'}}>Cant.</th>
                                            <th style={{textAlign:'right'}}>Subtotal</th>
                                            {!initialData && <th></th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ventaItems.map((item, index) => {
                                            // Buscamos nombre en inventario o usamos el del pedido original si no se cargó inventario aún
                                            const nombre = inventario.find(i => i.productoId === item.productoId)?.producto.nombre 
                                                           || initialData?.items.find(i => i.productoId === item.productoId)?.productoNombre 
                                                           || `ID ${item.productoId}`;
                                            return (
                                                <tr key={index}>
                                                    <td>{nombre}</td>
                                                    <td style={{textAlign:'center'}}><span className="badge-talla">{item.talla}</span></td>
                                                    <td style={{textAlign:'center'}}>{item.cantidad}</td>
                                                    <td style={{textAlign:'right'}}>Bs.{(item.cantidad * item.precio).toFixed(2)}</td>
                                                    {!initialData && (
                                                        <td style={{textAlign:'center'}}>
                                                            <button type="button" onClick={() => handleRemoveItem(index)} style={{color:'red'}}>X</button>
                                                        </td>
                                                    )}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </fieldset>

                        {/* TOTALES */}
                        <div className="resumenTotales">
                            <div>Total a Pagar: <strong style={{fontSize:'1.3em', color:'#007bff'}}>Bs.{total.toFixed(2)}</strong></div>
                        </div>

                        <Boton1 type="submit" fullWidth size="large" disabled={isDisabled} style={{ marginTop: '20px' }}>
                            {isCreating ? "Procesando..." : "Confirmar Venta y Entregar"}
                        </Boton1>

                        {createError && <div className="error-alert">{createError.message}</div>}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CrearVentaCarritoForm;